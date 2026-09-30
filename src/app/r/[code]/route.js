import { after } from "next/server";
import { PLAY_STORE_URL } from "@/lib/branding";
import { findCode, logClick } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * moneykitapp.com/r/RAHUL → the Play listing with `ref=RAHUL` in the install
 * referrer, which the app reads on first launch. Unknown codes still land on Play.
 */
export async function GET(_request, { params }) {
  const { code: raw } = await params;
  const admin = getSupabaseAdmin();
  const found = admin
    ? await findCode(admin, raw, { withLabel: false }).catch(() => null)
    : null;
  if (!found) return Response.redirect(PLAY_STORE_URL, 302);

  after(() => logClick(admin, found.code).catch(() => {}));
  const referrer = `ref=${found.code}&utm_source=referral&utm_campaign=${found.kind}`;
  return Response.redirect(`${PLAY_STORE_URL}&referrer=${encodeURIComponent(referrer)}`, 302);
}
