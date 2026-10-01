import { corsJson, corsPreflight } from "@/lib/api-cors";
import { isUpiId } from "@/lib/referrals/rules";
import { ReferralError, requestShopPayout, shopReferralSummary } from "@/lib/referrals/store";
import { siteRequest } from "@/lib/sites/api";

export const runtime = "nodejs";

const ERROR_STATUS = { nothingReady: 409, belowMinimum: 409, save: 500 };

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** Ask for the shop's cleared referral cash to be sent to this UPI ID. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  const upiId = String(body?.upiId || "").trim();
  if (!isUpiId(upiId)) return corsJson(request, { error: "upi" }, { status: 400 });

  try {
    const payout = await requestShopPayout(admin, user.id, upiId);
    return corsJson(request, { payout, referral: await shopReferralSummary(admin, user.id) });
  } catch (error) {
    const code = error instanceof ReferralError ? error.code : "save";
    return corsJson(request, { error: code }, { status: ERROR_STATUS[code] || 400 });
  }
}
