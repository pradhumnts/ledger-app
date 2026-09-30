import { after } from "next/server";
import { msg91SendOtp } from "@/lib/msg91";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { pruneOtpRequests, rememberOtpRequest } from "@/lib/otp-requests";
import { PLAY_REVIEW_REQ_ID, isPlayReviewLogin } from "@/lib/play-review-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { indianMobileDigits, toE164India } from "@/lib/supabase/phone";
import { validateRequiredPhone } from "@/lib/validation";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const phoneError = validateRequiredPhone(body.phone);
  if (phoneError) {
    return corsJson(request, { error: phoneError }, { status: 400 });
  }

  if (isPlayReviewLogin(body.phone)) {
    return corsJson(request, {
      reqId: PLAY_REVIEW_REQ_ID,
      phone: toE164India(body.phone),
    });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return corsJson(
      request,
      { error: "Supabase service role is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const digits = indianMobileDigits(body.phone);
    const result = await msg91SendOtp(digits);
    await rememberOtpRequest(admin, result.reqId, digits);
    if (Math.random() < 0.05) after(() => pruneOtpRequests(admin));
    return corsJson(request, {
      reqId: result.reqId,
      phone: toE164India(body.phone),
    });
  } catch (error) {
    return corsJson(
      request,
      { error: error.message || "Could not send the SMS code." },
      { status: 400 }
    );
  }
}
