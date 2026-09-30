import { NextResponse } from "next/server";
import { msg91SendOtp } from "@/lib/msg91";
import { otpTicket } from "@/lib/referrals/partner-session";
import { affiliateByPhone } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { indianMobileDigits } from "@/lib/supabase/phone";

export const runtime = "nodejs";

/** Text a login code, only to numbers registered as MoneyKit partners. */
export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "notConfigured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const phone = indianMobileDigits(body.phone);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "phone" }, { status: 400 });
  }
  if (!(await affiliateByPhone(admin, phone))) {
    return NextResponse.json({ error: "notPartner" }, { status: 404 });
  }

  try {
    const { reqId } = await msg91SendOtp(phone);
    return NextResponse.json({ reqId, ticket: otpTicket(phone, reqId) });
  } catch {
    return NextResponse.json({ error: "sendFailed" }, { status: 400 });
  }
}
