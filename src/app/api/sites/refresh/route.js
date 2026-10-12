import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { refreshAuthorized } from "@/lib/sites/refresh";
import { SERVICE_PAGE_IDS, servicePages } from "@/lib/sites/service-pages";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** The admin published a site: show it to visitors now, like a publish from the app. */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!refreshAuthorized(body, process.env.SUPABASE_SERVICE_ROLE_KEY || "")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: row } = await admin
    .from("sites")
    .select("slug, status, published")
    .eq("id", body.siteId)
    .maybeSingle();
  if (!row?.slug) return NextResponse.json({ error: "notFound" }, { status: 404 });

  revalidatePath(`/sites/${row.slug}`);
  for (const page of servicePages(row.published, SERVICE_PAGE_IDS.length)) {
    revalidatePath(`/sites/${row.slug}/${page.slug}`);
  }
  return NextResponse.json({ ok: true });
}
