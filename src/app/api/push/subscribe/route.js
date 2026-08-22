import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";
import { vapidConfig } from "@/lib/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function subscriptionFromBody(body) {
  const endpoint = String(body?.endpoint || "").trim();
  const p256dh = String(body?.keys?.p256dh || "").trim();
  const auth = String(body?.keys?.auth || "").trim();
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 2048) return null;
  if (p256dh.length < 20 || p256dh.length > 200) return null;
  if (auth.length < 8 || auth.length > 200) return null;
  return { endpoint, p256dh, auth };
}

export async function POST(request) {
  const admin = getSupabaseAdmin();
  const { configured } = vapidConfig();
  if (!admin || !configured) {
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
    return NextResponse.json({ error: "Sign in to enable reminders." }, { status: 401 });
  }

  const subscription = subscriptionFromBody(body);
  if (!subscription) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) {
    return NextResponse.json({ error: "Could not save subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
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
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const endpoint = String(body?.endpoint || "").trim();
  if (!endpoint) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);
  if (error) {
    return NextResponse.json({ error: "Could not remove subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
