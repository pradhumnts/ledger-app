import { NextResponse } from "next/server";
import { unlockDueRewards } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cronAuthorized } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily: release referral cash past its hold so affiliates and shops can ask for it. */
async function run(request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  try {
    const released = await unlockDueRewards(admin);
    return NextResponse.json({ ok: true, released });
  } catch {
    return NextResponse.json({ error: "referral job failed" }, { status: 500 });
  }
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
