import { NextResponse } from "next/server";
import { InstagramError, refreshToken } from "@/lib/sites/instagram";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cronAuthorized } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH = 200;

/**
 * Daily: renew Instagram tokens older than a week (they last 60 days), and
 * forget the ones Instagram no longer accepts so the shop sees "Connect" again.
 */
async function run(request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const { data: rows, error } = await admin
    .from("site_instagram")
    .select("user_id, access_token")
    .lt("refreshed_at", new Date(Date.now() - REFRESH_AFTER_MS).toISOString())
    .order("refreshed_at", { ascending: true })
    .limit(BATCH);
  if (error) return NextResponse.json({ error: "instagram job failed" }, { status: 500 });

  let refreshed = 0;
  let removed = 0;
  for (const row of rows || []) {
    try {
      const next = await refreshToken(row.access_token);
      await admin
        .from("site_instagram")
        .update({ ...next, refreshed_at: new Date().toISOString() })
        .eq("user_id", row.user_id);
      refreshed += 1;
    } catch (err) {
      if (err instanceof InstagramError && err.code === "expired") {
        await admin.from("site_instagram").delete().eq("user_id", row.user_id);
        removed += 1;
      }
    }
  }
  return NextResponse.json({ ok: true, refreshed, removed });
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
