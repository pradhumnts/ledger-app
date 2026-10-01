import {
  deferPlaySubscription,
  getPlaySubscription,
  playBillingConfig,
} from "@/lib/play-developer-api";
import { activeSubscription, refreshPlaySubscription, sitePlanIds } from "@/lib/sites/subscription";
import { lastGrantEnd } from "./grants";
import { addMonths } from "./rules";
import { ReferralError } from "./store";

const RENEWING_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);

function siteLineItem(play) {
  const ids = sitePlanIds();
  const items = play.lineItems || [];
  return items.find((line) => ids.has(line.productId)) || items[0] || {};
}

/**
 * One free website month (the bill challenge): a renewing Play plan's next
 * charge moves back a month, otherwise a month of website access starting
 * after any paid time or grant already running.
 */
export async function giveFreeMonth(admin, userId) {
  const sub = playBillingConfig().configured ? await activeSubscription(admin, userId) : null;
  let notBefore = 0;
  if (sub) {
    const play = await getPlaySubscription(sub.purchase_token);
    const expiry = siteLineItem(play).expiryTime;
    if (expiry && RENEWING_STATES.has(String(play.subscriptionState || ""))) {
      await deferPlaySubscription(sub.product_id, sub.purchase_token, expiry, addMonths(expiry, 1));
      await refreshPlaySubscription(admin, sub);
      return "play_defer";
    }
    if (expiry) notBefore = new Date(expiry).getTime();
  }
  const start = Math.max(Date.now(), notBefore, await lastGrantEnd(admin, userId));
  const { error } = await admin.from("site_access_grants").insert({
    user_id: userId,
    starts_at: new Date(start).toISOString(),
    ends_at: addMonths(start, 1).toISOString(),
  });
  if (error) throw new ReferralError("save");
  return "grant";
}
