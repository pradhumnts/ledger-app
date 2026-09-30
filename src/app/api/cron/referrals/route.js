import { NextResponse } from "next/server";
import { applyFreeMonths } from "@/lib/referrals/free-months";
import { mapInBatches } from "@/lib/referrals/rules";
import { unlockDueRewards } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cronAuthorized } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily: release rewards past their hold, then add ready free months to Play plans. */
async function run(request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  try {
    const released = await unlockDueRewards(admin);
    const { data } = await admin
      .from("referral_rewards")
      .select("user_id")
      .eq("kind", "free_month")
      .eq("status", "ready")
      .limit(500);
    const users = [...new Set((data || []).map((row) => row.user_id))];
    const counts = await mapInBatches(users, 5, (userId) =>
      applyFreeMonths(admin, userId).catch(() => 0)
    );
    const applied = counts.reduce((sum, count) => sum + count, 0);
    return NextResponse.json({ ok: true, released, applied });
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
