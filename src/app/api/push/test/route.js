import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";
import { sendShopReminderTest } from "@/lib/reminder-jobs";
import { vapidConfig } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = new Set(["ping", "unshared", "old_due"]);

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin || !vapidConfig().configured) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  if (!user) {
    return NextResponse.json({ error: "Sign in to test reminders." }, { status: 401 });
  }

  const kind = String(body.kind || "ping");
  if (!KINDS.has(kind)) {
    return NextResponse.json({ error: "Unknown test." }, { status: 400 });
  }

  try {
    const result = await sendShopReminderTest(admin, user.id, kind);
    return NextResponse.json(result);
  } catch (error) {
    const missing = /schema cache|does not exist|PGRST/i.test(
      String(error?.message || error?.code || "")
    );
    return NextResponse.json(
      { error: missing ? "migration_missing" : "test_failed", sent: 0 },
      { status: missing ? 503 : 500 }
    );
  }
}
