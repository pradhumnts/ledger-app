import { corsJson, corsPreflight } from "@/lib/api-cors";
import { claimReferral, ReferralError } from "@/lib/referrals/store";
import { siteRequest } from "@/lib/sites/api";

export const runtime = "nodejs";

const ERROR_STATUS = { invalid: 404, self: 400, locked: 409, save: 500 };

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** Attach a referral code (typed, or from the Play install link) to the signed-in shop. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  try {
    const referredBy = await claimReferral(admin, user, {
      code: body.code,
      source: body.source === "link" ? "link" : "typed",
    });
    return corsJson(request, { referredBy });
  } catch (error) {
    const code = error instanceof ReferralError ? error.code : "save";
    return corsJson(request, { error: code }, { status: ERROR_STATUS[code] || 400 });
  }
}
