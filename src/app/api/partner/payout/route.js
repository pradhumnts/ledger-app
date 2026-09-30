import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PARTNER_COOKIE, readPartnerSession } from "@/lib/referrals/partner-session";
import { ReferralError, requestAffiliatePayout } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const UPI_ID = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/;

/** Ask for everything that has cleared the hold to be sent to this UPI ID. */
export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "notConfigured" }, { status: 503 });
  const store = await cookies();
  const affiliateId = readPartnerSession(store.get(PARTNER_COOKIE)?.value);
  if (!affiliateId) return NextResponse.json({ error: "signIn" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const upiId = String(body.upiId || "").trim();
  if (!UPI_ID.test(upiId)) return NextResponse.json({ error: "upi" }, { status: 400 });

  try {
    const payout = await requestAffiliatePayout(admin, affiliateId, upiId);
    return NextResponse.json({ payout });
  } catch (error) {
    const code = error instanceof ReferralError ? error.code : "save";
    return NextResponse.json({ error: code }, { status: code === "nothingReady" ? 409 : 500 });
  }
}
