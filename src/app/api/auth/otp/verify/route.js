import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { ensureShopUser } from "@/lib/supabase/ensure-shop-user";
import { toE164India } from "@/lib/supabase/phone";
import { validateOtp, validateRequiredPhone } from "@/lib/validation";
import { msg91VerifyOtp } from "@/lib/msg91";
import {
  PLAY_REVIEW_REQ_ID,
  isPlayReviewLogin,
} from "@/lib/play-review-auth";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return corsJson(
      request,
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
    return corsJson(
      request,
      { error: phoneError || otpError || "Missing verification request." },
      { status: 400 }
    );
  }

  try {
    if (isPlayReviewLogin(body.phone, body.otp)) {
      if (body.reqId !== PLAY_REVIEW_REQ_ID) {
        return corsJson(request, { error: "That code didn't work." }, { status: 400 });
      }
    } else {
      await msg91VerifyOtp(body.reqId, body.otp);
    }
  } catch (error) {
    return corsJson(
      request,
      { error: error.message || "That code didn't work." },
      { status: 400 }
    );
  }

  const e164 = toE164India(body.phone);
  let shopUser;
  try {
    shopUser = await ensureShopUser(admin, body.phone);
  } catch (error) {
    return corsJson(
      request,
      { error: error.message || "Could not create shop user." },
      { status: 400 }
    );
  }

  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: shopUser.email,
  });
  if (link.error || !link.data?.properties?.hashed_token) {
    return corsJson(
      request,
      { error: link.error?.message || "Could not start a session." },
      { status: 400 }
    );
  }

  return corsJson(request, {
    hashed_token: link.data.properties.hashed_token,
    user: {
      id: shopUser.userId || link.data.user?.id || null,
      phone: e164,
    },
  });
}
