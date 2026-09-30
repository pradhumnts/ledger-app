import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PARTNER_COOKIE } from "@/lib/referrals/partner-session";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  store.delete(PARTNER_COOKIE);
  return NextResponse.json({ ok: true });
}
