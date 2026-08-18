import { NextResponse } from "next/server";
import { msg91SendOtp } from "@/lib/msg91";
import { PLAY_REVIEW_REQ_ID, isPlayReviewLogin } from "@/lib/play-review-auth";
import { indianMobileDigits, toE164India } from "@/lib/supabase/phone";
import { validateRequiredPhone } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const phoneError = validateRequiredPhone(body.phone);
  if (phoneError) {
    return NextResponse.json({ error: phoneError }, { status: 400 });
  }

  if (isPlayReviewLogin(body.phone)) {
    return NextResponse.json({
      reqId: PLAY_REVIEW_REQ_ID,
      phone: toE164India(body.phone),
    });
  }

  try {
    const result = await msg91SendOtp(indianMobileDigits(body.phone));
    return NextResponse.json({
      reqId: result.reqId,
      phone: toE164India(body.phone),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not send the SMS code." },
      { status: 400 }
    );
  }
}
