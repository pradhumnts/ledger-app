import { appleOriginalId, extendAppleSubscription } from "@/lib/app-store-api";
import {
  deferPlaySubscription,
  getPlaySubscription,
  playBillingConfig,
} from "@/lib/play-developer-api";
import { activeSubscription, refreshSubscription, sitePlanIds } from "@/lib/sites/subscription";
import { lastGrantEnd } from "./grants";
import { addMonths } from "./rules";
import { ReferralError } from "./store";

const RENEWING_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);
const APPLE_FREE_MONTH_DAYS = 30;

function siteLineItem(play) {
  const ids = sitePlanIds();
  const items = play.lineItems || [];
  return items.find((line) => ids.has(line.productId)) || items[0] || {};
}

/** Push a renewing App Store plan's next charge back; false when Apple won't (two extensions a year). */
async function extendApple(admin, sub) {
  if (!sub.auto_renewing || !RENEWING_STATES.has(sub.state)) return false;
  try {
    await extendAppleSubscription(
      appleOriginalId(sub.purchase_token),
      sub.store_environment,
      APPLE_FREE_MONTH_DAYS
    );
  } catch (error) {
    console.error("apple free month extension failed", error);
    return false;
  }
  await refreshSubscription(admin, sub);
  return true;
}

/**
 * One free website month (the bill challenge): a renewing store plan's next
 * charge moves back a month, otherwise a month of website access starting
 * after any paid time or grant already running.
 */
export async function giveFreeMonth(admin, userId) {
  const sub = await activeSubscription(admin, userId);
  let notBefore = sub?.expires_at ? new Date(sub.expires_at).getTime() : 0;
  if (sub?.provider === "apple") {
    if (await extendApple(admin, sub)) return "apple_defer";
  } else if (sub && playBillingConfig().configured) {
    const play = await getPlaySubscription(sub.purchase_token);
    const expiry = siteLineItem(play).expiryTime;
    if (expiry && RENEWING_STATES.has(String(play.subscriptionState || ""))) {
      await deferPlaySubscription(sub.product_id, sub.purchase_token, expiry, addMonths(expiry, 1));
      await refreshSubscription(admin, sub);
      return "play_defer";
    }
    if (expiry) notBefore = new Date(expiry).getTime();
  }
  const start = Math.max(Date.now(), notBefore || 0, await lastGrantEnd(admin, userId));
  const { error } = await admin.from("site_access_grants").insert({
    user_id: userId,
    starts_at: new Date(start).toISOString(),
    ends_at: addMonths(start, 1).toISOString(),
  });
  if (error) throw new ReferralError("save");
  return "grant";
}
