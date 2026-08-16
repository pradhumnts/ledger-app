import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";
import { markThemePaid } from "@/lib/supabase/unlock-theme";
import { isValidPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Payments are not configured on the server." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to buy this theme." },
      { status: 401 }
    );
  }

  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");
  const signature = String(body.razorpay_signature || "");
  if (
    !isValidPaymentSignature({
      orderId,
      paymentId,
      signature,
    })
  ) {
    return NextResponse.json({ error: "Could not confirm that payment." }, { status: 400 });
  }

  const { data: purchase, error } = await admin
    .from("theme_purchases")
    .select("user_id, kind, theme_id, status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (error || !purchase || purchase.user_id !== user.id) {
    return NextResponse.json({ error: "Could not find that order." }, { status: 400 });
  }

  try {
    const unlocked = await markThemePaid(admin, {
      userId: purchase.user_id,
      kind: purchase.kind,
      themeId: purchase.theme_id,
      orderId,
      paymentId,
    });
    return NextResponse.json({ ok: true, ...unlocked });
  } catch (unlockError) {
    return NextResponse.json(
      { error: unlockError.message || "Could not unlock that theme." },
      { status: 400 }
    );
  }
}
