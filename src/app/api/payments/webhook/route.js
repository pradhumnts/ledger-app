import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { markThemePaid } from "@/lib/supabase/unlock-theme";
import { isValidWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const type = String(event.event || "");
  if (type === "payment.failed") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await admin
        .from("theme_purchases")
        .update({ status: "failed" })
        .eq("razorpay_order_id", orderId)
        .eq("status", "created");
    }
    return NextResponse.json({ ok: true });
  }

  if (type !== "payment.captured" && type !== "order.paid") {
    return NextResponse.json({ ok: true });
  }

  const payment = event.payload?.payment?.entity || {};
  const order = event.payload?.order?.entity || {};
  const orderId = payment.order_id || order.id || "";
  const paymentId = payment.id || "";
  const notes = payment.notes || order.notes || {};

  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  const { data: purchase } = await admin
    .from("theme_purchases")
    .select("user_id, kind, theme_id, status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  const userId = purchase?.user_id || notes.user_id;
  const kind = purchase?.kind || notes.kind;
  const themeId = purchase?.theme_id || notes.theme_id;
  if (!userId || !kind || !themeId) {
    return NextResponse.json({ ok: true });
  }

  try {
    await markThemePaid(admin, {
      userId,
      kind,
      themeId,
      orderId,
      paymentId,
    });
  } catch {
    return NextResponse.json({ error: "unlock failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
