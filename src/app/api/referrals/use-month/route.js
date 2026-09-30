import { revalidatePath } from "next/cache";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { spendFreeMonth } from "@/lib/referrals/free-months";
import { ReferralError, shopReferralSummary } from "@/lib/referrals/store";
import { siteRequest } from "@/lib/sites/api";
import { loadSiteForUser } from "@/lib/sites/store";
import { siteAccess } from "@/lib/sites/subscription";

export const runtime = "nodejs";

const ERROR_STATUS = { noMonths: 409, tryLater: 503, save: 500 };

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** Spend one banked free month on website access. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user } = ctx;

  try {
    await spendFreeMonth(admin, user.id);
  } catch (error) {
    const code = error instanceof ReferralError ? error.code : "save";
    return corsJson(request, { error: code }, { status: ERROR_STATUS[code] || 400 });
  }

  const [access, referral, site] = await Promise.all([
    siteAccess(admin, user),
    shopReferralSummary(admin, user.id),
    loadSiteForUser(admin, user.id),
  ]);
  if (site?.slug && site.status === "live") revalidatePath(`/sites/${site.slug}`);
  return corsJson(request, { access, referral });
}
