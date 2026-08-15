import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureShopUser } from "@/lib/supabase/ensure-shop-user";
import { toE164India } from "@/lib/supabase/phone";
import { validateOtp, validateRequiredPhone } from "@/lib/validation";
import { msg91VerifyOtp } from "@/lib/msg91";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service role is not configured on the server." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const phoneError = validateRequiredPhone(body.phone);
  const otpError = validateOtp(body.otp);
  if (phoneError || otpError || !body.reqId) {
    return NextResponse.json(
      { error: phoneError || otpError || "Missing verification request." },
      { status: 400 }
    );
  }

  try {
    await msg91VerifyOtp(body.reqId, body.otp);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "That code didn't work." },
      { status: 400 }
    );
  }

  const e164 = toE164India(body.phone);
  let shopUser;
  try {
    shopUser = await ensureShopUser(admin, body.phone);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not create shop user." },
      { status: 400 }
    );
  }

  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: shopUser.email,
  });
  if (link.error || !link.data?.properties?.hashed_token) {
    return NextResponse.json(
      { error: link.error?.message || "Could not start a session." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    hashed_token: link.data.properties.hashed_token,
    user: {
      id: shopUser.userId || link.data.user?.id || null,
      phone: e164,
    },
  });
}
