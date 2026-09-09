import { NextResponse } from "next/server";
import {
  adminThemeName,
  resolveBusinessLogoUrl,
} from "@/lib/admin-business";
import { getAdminSessionFromRequest } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const RANGES = {
  today: 1,
  "7d": 7,
  "30d": 30,
};

function parseRange(value) {
  return RANGES[value] ? value : "30d";
}

function startOfUtcDay(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function addUtcDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toDayKey(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function themeName(kind, themeId) {
  return adminThemeName(kind, themeId);
}

function emptyBuckets(from, days) {
  const buckets = [];
  for (let i = 0; i < days; i += 1) {
    const key = toDayKey(addUtcDays(from, i));
    buckets.push({
      date: key,
      bills: 0,
      businesses: 0,
      revenuePaise: 0,
    });
  }
  return buckets;
}

function pctChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service role is not configured on the server." },
      { status: 503 }
    );
  }

  const range = parseRange(request.nextUrl.searchParams.get("range"));
  const days = RANGES[range];
  const now = new Date();
  const periodEnd = addUtcDays(startOfUtcDay(now), 1);
  const periodStart = addUtcDays(periodEnd, -days);
  const prevStart = addUtcDays(periodStart, -days);
  const sinceIso = periodStart.toISOString();
  const prevSinceIso = prevStart.toISOString();
  const periodEndIso = periodEnd.toISOString();

  const [
    businessesCountRes,
    billsCountRes,
    purchasesPaidRes,
    onboardedRes,
    businessesRecentWindowRes,
    billsRecentWindowRes,
    purchasesRecentWindowRes,
    recentBusinessesRes,
    recentPurchasesRes,
  ] = await Promise.all([
    admin.from("businesses").select("*", { count: "exact", head: true }),
    admin
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("kind", "invoice")
      .is("voided_at", null),
    admin
      .from("theme_purchases")
      .select("amount_paise, kind, theme_id, paid_at, created_at, status")
      .eq("status", "paid"),
    admin
      .from("settings")
      .select("*", { count: "exact", head: true })
      .eq("onboarding_complete", true),
    admin
      .from("businesses")
      .select("created_at")
      .gte("created_at", prevSinceIso)
      .lt("created_at", periodEndIso),
    admin
      .from("entries")
      .select("created_at")
      .eq("kind", "invoice")
      .is("voided_at", null)
      .gte("created_at", prevSinceIso)
      .lt("created_at", periodEndIso),
    admin
      .from("theme_purchases")
      .select("amount_paise, paid_at, created_at")
      .eq("status", "paid")
      .gte("created_at", prevSinceIso)
      .lt("created_at", periodEndIso),
    admin
      .from("businesses")
      .select("id, name, phone, business_type, logo_path, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("theme_purchases")
      .select(
        "id, user_id, kind, theme_id, amount_paise, status, paid_at, created_at"
      )
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const firstError =
    businessesCountRes.error ||
    billsCountRes.error ||
    purchasesPaidRes.error ||
    onboardedRes.error ||
    businessesRecentWindowRes.error ||
    billsRecentWindowRes.error ||
    purchasesRecentWindowRes.error ||
    recentBusinessesRes.error ||
    recentPurchasesRes.error;

  if (firstError) {
    return NextResponse.json(
      { error: firstError.message || "Could not load metrics." },
      { status: 500 }
    );
  }

  const paidPurchases = purchasesPaidRes.data || [];
  const themeRevenuePaise = paidPurchases.reduce(
    (sum, row) => sum + (Number(row.amount_paise) || 0),
    0
  );

  const periodStartMs = periodStart.getTime();
  const periodEndMs = periodEnd.getTime();
  const prevStartMs = prevStart.getTime();

  function inCurrent(iso) {
    const t = new Date(iso).getTime();
    return t >= periodStartMs && t < periodEndMs;
  }

  function inPrev(iso) {
    const t = new Date(iso).getTime();
    return t >= prevStartMs && t < periodStartMs;
  }

  const bizRows = businessesRecentWindowRes.data || [];
  const billRows = billsRecentWindowRes.data || [];
  const purchaseWindowRows = purchasesRecentWindowRes.data || [];

  const period = {
    businesses: bizRows.filter((r) => inCurrent(r.created_at)).length,
    bills: billRows.filter((r) => inCurrent(r.created_at)).length,
    themePurchases: purchaseWindowRows.filter((r) =>
      inCurrent(r.paid_at || r.created_at)
    ).length,
    themeRevenuePaise: purchaseWindowRows
      .filter((r) => inCurrent(r.paid_at || r.created_at))
      .reduce((sum, row) => sum + (Number(row.amount_paise) || 0), 0),
  };

  const previous = {
    businesses: bizRows.filter((r) => inPrev(r.created_at)).length,
    bills: billRows.filter((r) => inPrev(r.created_at)).length,
    themePurchases: purchaseWindowRows.filter((r) =>
      inPrev(r.paid_at || r.created_at)
    ).length,
    themeRevenuePaise: purchaseWindowRows
      .filter((r) => inPrev(r.paid_at || r.created_at))
      .reduce((sum, row) => sum + (Number(row.amount_paise) || 0), 0),
  };

  const seriesMap = new Map(
    emptyBuckets(periodStart, days).map((row) => [row.date, row])
  );

  for (const row of billRows) {
    if (!inCurrent(row.created_at)) continue;
    const key = toDayKey(row.created_at);
    const bucket = seriesMap.get(key);
    if (bucket) bucket.bills += 1;
  }
  for (const row of bizRows) {
    if (!inCurrent(row.created_at)) continue;
    const key = toDayKey(row.created_at);
    const bucket = seriesMap.get(key);
    if (bucket) bucket.businesses += 1;
  }
  for (const row of purchaseWindowRows) {
    const when = row.paid_at || row.created_at;
    if (!inCurrent(when)) continue;
    const key = toDayKey(when);
    const bucket = seriesMap.get(key);
    if (bucket) bucket.revenuePaise += Number(row.amount_paise) || 0;
  }

  const topThemeMap = new Map();
  for (const row of paidPurchases) {
    const key = `${row.kind}:${row.theme_id}`;
    const current = topThemeMap.get(key) || {
      kind: row.kind,
      themeId: row.theme_id,
      themeName: themeName(row.kind, row.theme_id),
      count: 0,
      revenuePaise: 0,
    };
    current.count += 1;
    current.revenuePaise += Number(row.amount_paise) || 0;
    topThemeMap.set(key, current);
  }

  const topThemes = [...topThemeMap.values()]
    .sort((a, b) => b.count - a.count || b.revenuePaise - a.revenuePaise)
    .slice(0, 6);

  const recentBusinessRows = recentBusinessesRes.data || [];
  const logoUrls = await Promise.all(
    recentBusinessRows.map((row) =>
      resolveBusinessLogoUrl(admin, row.logo_path)
    )
  );

  const recentPurchases = recentPurchasesRes.data || [];
  const purchaseUserIds = [
    ...new Set(recentPurchases.map((row) => row.user_id).filter(Boolean)),
  ];
  let businessByUser = new Map();
  if (purchaseUserIds.length) {
    const namesRes = await admin
      .from("businesses")
      .select("id, user_id, name")
      .in("user_id", purchaseUserIds);
    if (namesRes.error) {
      return NextResponse.json(
        { error: namesRes.error.message || "Could not load metrics." },
        { status: 500 }
      );
    }
    businessByUser = new Map(
      (namesRes.data || []).map((row) => [
        row.user_id,
        { id: row.id, name: row.name || "" },
      ])
    );
  }

  return NextResponse.json({
    range,
    totals: {
      businesses: businessesCountRes.count ?? 0,
      bills: billsCountRes.count ?? 0,
      themePurchases: paidPurchases.length,
      themeRevenuePaise,
      onboarded: onboardedRes.count ?? 0,
    },
    period: {
      ...period,
      change: {
        businesses: pctChange(period.businesses, previous.businesses),
        bills: pctChange(period.bills, previous.bills),
        themePurchases: pctChange(
          period.themePurchases,
          previous.themePurchases
        ),
        themeRevenuePaise: pctChange(
          period.themeRevenuePaise,
          previous.themeRevenuePaise
        ),
      },
    },
    series: [...seriesMap.values()],
    recentBusinesses: recentBusinessRows.map((row, index) => ({
      id: row.id,
      name: row.name || "Unnamed shop",
      phone: row.phone || "",
      businessType: row.business_type || "",
      logoUrl: logoUrls[index] || null,
      createdAt: row.created_at,
    })),
    recentPurchases: recentPurchases.map((row) => {
      const shop = businessByUser.get(row.user_id);
      return {
        id: row.id,
        kind: row.kind,
        themeId: row.theme_id,
        themeName: themeName(row.kind, row.theme_id),
        amountPaise: row.amount_paise,
        paidAt: row.paid_at || row.created_at,
        businessId: shop?.id || null,
        businessName: shop?.name || "Unknown shop",
      };
    }),
    topThemes,
  });
}
