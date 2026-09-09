import { NextResponse } from "next/server";
import {
  adminBusinessTypeLabel,
  resolveBusinessLogoUrl,
} from "@/lib/admin-business";
import { getAdminSessionFromRequest } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

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
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("businesses")
    .select(
      "id, user_id, name, phone, address, logo_path, upi_id, business_type, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    query = query.or(
      `name.ilike.%${escaped}%,phone.ilike.%${escaped}%,business_type.ilike.%${escaped}%`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not load businesses." },
      { status: 500 }
    );
  }

  const rows = data || [];
  const userIds = rows.map((row) => row.user_id).filter(Boolean);

  let onboardedByUser = new Map();
  if (userIds.length) {
    const settingsRes = await admin
      .from("settings")
      .select("user_id, onboarding_complete")
      .in("user_id", userIds);
    if (settingsRes.error) {
      return NextResponse.json(
        { error: settingsRes.error.message || "Could not load businesses." },
        { status: 500 }
      );
    }
    onboardedByUser = new Map(
      (settingsRes.data || []).map((row) => [
        row.user_id,
        Boolean(row.onboarding_complete),
      ])
    );
  }

  const logoUrls = await Promise.all(
    rows.map((row) => resolveBusinessLogoUrl(admin, row.logo_path))
  );

  const total = count ?? 0;
  return NextResponse.json({
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    items: rows.map((row, index) => ({
      id: row.id,
      name: row.name || "Unnamed shop",
      phone: row.phone || "",
      address: row.address || "",
      upiId: row.upi_id || "",
      businessType: row.business_type || "",
      businessTypeLabel: adminBusinessTypeLabel(row.business_type),
      logoUrl: logoUrls[index] || null,
      onboarded: onboardedByUser.get(row.user_id) || false,
      createdAt: row.created_at,
    })),
  });
}
