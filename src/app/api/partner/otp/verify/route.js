import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { msg91VerifyOtp } from "@/lib/msg91";
import {
  PARTNER_COOKIE,
  checkOtpTicket,
  partnerCookieOptions,
  partnerSessionToken,
} from "@/lib/referrals/partner-session";
import { affiliateByPhone } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { indianMobileDigits } from "@/lib/supabase/phone";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "notConfigured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const phone = indianMobileDigits(body.phone);
  const reqId = String(body.reqId || "");
  const otp = String(body.otp || "").replace(/\D/g, "");

  if (!reqId || otp.length < 4 || !checkOtpTicket(body.ticket, phone, reqId)) {
    return NextResponse.json({ error: "otp" }, { status: 400 });
  }
  try {
    await msg91VerifyOtp(reqId, otp);
  } catch {
    return NextResponse.json({ error: "otp" }, { status: 400 });
  }

  const affiliate = await affiliateByPhone(admin, phone);
  if (!affiliate) return NextResponse.json({ error: "notPartner" }, { status: 404 });

  const store = await cookies();
  store.set(PARTNER_COOKIE, partnerSessionToken(affiliate.id), partnerCookieOptions());
  return NextResponse.json({ ok: true });
}
