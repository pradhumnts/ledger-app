import { NextResponse } from "next/server";
import { BILL_THEMES } from "@/lib/bill-themes";
import { QR_THEMES } from "@/lib/qr-themes";
import { adminThemeName } from "@/lib/admin-business";
import { getAdminSessionFromRequest } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

function matchingThemeIds(q) {
  const needle = q.toLowerCase();
  const ids = [];
  for (const theme of [...BILL_THEMES, ...QR_THEMES]) {
    if (
      theme.id.toLowerCase().includes(needle) ||
      theme.name.toLowerCase().includes(needle)
    ) {
      ids.push(theme.id);
    }
  }
  return [...new Set(ids)];
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

  const { searchParams } = request.nextUrl;
  const q = String(searchParams.get("q") || "").trim();
  const kind = String(searchParams.get("kind") || "all");
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let userIdsFilter = null;
  let themeIdsFilter = null;

  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    const [businessRes, themeIds] = await Promise.all([
      admin
        .from("businesses")
        .select("user_id")
        .ilike("name", `%${escaped}%`),
      Promise.resolve(matchingThemeIds(escaped)),
    ]);

    if (businessRes.error) {
      return NextResponse.json(
        { error: businessRes.error.message || "Could not load purchases." },
        { status: 500 }
      );
    }

    userIdsFilter = (businessRes.data || [])
      .map((row) => row.user_id)
      .filter(Boolean);
    themeIdsFilter = themeIds;

    if (!userIdsFilter.length && !themeIdsFilter.length) {
      return NextResponse.json({
        page,
        pageSize: PAGE_SIZE,
        total: 0,
        totalPages: 1,
        items: [],
      });
    }
  }

  let query = admin
    .from("theme_purchases")
    .select(
      "id, user_id, kind, theme_id, amount_paise, status, paid_at, created_at",
      { count: "exact" }
    )
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (kind === "bill" || kind === "qr") {
    query = query.eq("kind", kind);
  }

  if (q) {
    const parts = [];
    if (userIdsFilter?.length) {
      parts.push(`user_id.in.(${userIdsFilter.join(",")})`);
    }
    if (themeIdsFilter?.length) {
      parts.push(`theme_id.in.(${themeIdsFilter.join(",")})`);
    }
    if (parts.length) {
      query = query.or(parts.join(","));
    }
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not load purchases." },
      { status: 500 }
    );
  }

  const rows = data || [];
  const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
  let businessByUser = new Map();
  if (userIds.length) {
    const namesRes = await admin
      .from("businesses")
      .select("id, user_id, name")
      .in("user_id", userIds);
    if (namesRes.error) {
      return NextResponse.json(
        { error: namesRes.error.message || "Could not load purchases." },
        { status: 500 }
      );
    }
    businessByUser = new Map(
      (namesRes.data || []).map((row) => [
        row.user_id,
        { id: row.id, name: row.name || "Unnamed shop" },
      ])
    );
  }

  const total = count ?? 0;
  return NextResponse.json({
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    items: rows.map((row) => {
      const shop = businessByUser.get(row.user_id);
      return {
        id: row.id,
        kind: row.kind,
        themeId: row.theme_id,
        themeName: adminThemeName(row.kind, row.theme_id),
        amountPaise: row.amount_paise,
        paidAt: row.paid_at || row.created_at,
        businessId: shop?.id || null,
        businessName: shop?.name || "Unknown shop",
      };
    }),
  });
}
