import { revalidatePath } from "next/cache";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import { loadSiteForUser } from "@/lib/sites/store";
import {
  recordAppleSubscription,
  recordPlaySubscription,
  siteAccess,
  SubscriptionError,
} from "@/lib/sites/subscription";

export const runtime = "nodejs";

const ERROR_STATUS = {
  notConfigured: 503,
  otherAccount: 409,
  save: 500,
};

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/**
 * Store a purchase (when sent) and return the shop's publish access:
 * a Play purchase token, or with `store: "apple"` a signed App Store transaction.
 * `move: true` (the shop confirmed it) moves one bought on another MoneyKit account here.
 */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  const purchaseToken = String(body.purchaseToken || "").trim();
  const move = body.move === true;
  if (purchaseToken) {
    try {
      if (body.store === "apple") {
        await recordAppleSubscription(admin, {
          userId: user.id,
          signedTransaction: purchaseToken,
          move,
        });
      } else {
        await recordPlaySubscription(admin, { userId: user.id, purchaseToken, move });
      }
    } catch (error) {
      const known = error instanceof SubscriptionError;
      const code = known ? error.code : "notVerified";
      return corsJson(
        request,
        { ...(known ? error.extra : {}), error: code },
        { status: ERROR_STATUS[code] || 400 }
      );
    }
  }

  const access = await siteAccess(admin, user);
  if (purchaseToken && access.active) {
    const site = await loadSiteForUser(admin, user.id);
    if (site?.slug && site.status === "live") revalidatePath(`/sites/${site.slug}`);
  }
  return corsJson(request, { access });
}
