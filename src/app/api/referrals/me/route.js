import { corsJson, corsPreflight } from "@/lib/api-cors";
import { ReferralError, shopReferralSummary, unlockDueRewards } from "@/lib/referrals/store";
import { siteRequest } from "@/lib/sites/api";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** The shop's code, who referred it, and what its invites have earned. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user } = ctx;

  try {
    let summary = await shopReferralSummary(admin, user.id);
    if (summary.earnings.due && (await unlockDueRewards(admin, { userId: user.id }))) {
      summary = await shopReferralSummary(admin, user.id);
    }
    return corsJson(request, { referral: summary });
  } catch (error) {
    const code = error instanceof ReferralError ? error.code : "failed";
    return corsJson(request, { error: code }, { status: 500 });
  }
}
