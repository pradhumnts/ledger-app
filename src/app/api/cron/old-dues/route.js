import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendOldDueReminders } from "@/lib/reminder-jobs";
import { cronAuthorized, vapidConfig } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(request) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin || !vapidConfig().configured) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  try {
    const result = await sendOldDueReminders(admin);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "old due reminders failed" }, { status: 500 });
  }
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}
