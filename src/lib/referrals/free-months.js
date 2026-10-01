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

/** Claim one ready month so two requests can't spend it twice. */
async function takeReadyMonth(admin, userId) {
  const { data: next } = await admin
    .from("referral_rewards")
    .select("id")
    .eq("user_id", userId)
    .eq("kind", "free_month")
    .eq("status", "ready")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!next) return null;
  const { data } = await admin
    .from("referral_rewards")
    .update({ status: "applying" })
    .eq("id", next.id)
    .eq("status", "ready")
    .select("id, months")
    .maybeSingle();
  return data || null;
}

async function releaseMonth(admin, id) {
  await admin.from("referral_rewards").update({ status: "ready" }).eq("id", id);
}

async function markUsed(admin, id, via) {
  await admin
    .from("referral_rewards")
    .update({ status: "used", used_via: via, used_at: new Date().toISOString() })
    .eq("id", id);
}

async function grantMonth(admin, userId, reward, notBefore = 0) {
  const start = Math.max(Date.now(), notBefore, await lastGrantEnd(admin, userId));
  const { error } = await admin.from("site_access_grants").insert({
    user_id: userId,
    starts_at: new Date(start).toISOString(),
    ends_at: addMonths(start, reward.months || 1).toISOString(),
    reward_id: reward.id,
  });
  if (error) throw new ReferralError("save");
  await markUsed(admin, reward.id, "grant");
}

function siteLineItem(play) {
  const ids = sitePlanIds();
  const items = play.lineItems || [];
  return items.find((line) => ids.has(line.productId)) || items[0] || {};
}

/**
 * Spend ready months on the shop's Play plan: a renewing plan's next charge
 * moves back a month; a cancelled plan gets a month of access after it ends.
 * Returns how many months were used.
 */
export async function applyFreeMonths(admin, userId) {
  if (!playBillingConfig().configured) return 0;
  const sub = await activeSubscription(admin, userId);
  if (!sub) return 0;

  let used = 0;
  for (let i = 0; i < 24; i += 1) {
    const reward = await takeReadyMonth(admin, userId);
    if (!reward) break;
    try {
      const play = await getPlaySubscription(sub.purchase_token);
      const expiry = siteLineItem(play).expiryTime;
      const state = String(play.subscriptionState || "");
      if (!expiry) throw new Error("noExpiry");
      if (RENEWING_STATES.has(state)) {
        await deferPlaySubscription(
          sub.product_id,
          sub.purchase_token,
          expiry,
          addMonths(expiry, reward.months || 1)
        );
        await markUsed(admin, reward.id, "play_defer");
      } else {
        await grantMonth(admin, userId, reward, new Date(expiry).getTime());
      }
      used += 1;
    } catch {
      await releaseMonth(admin, reward.id);
      break;
    }
  }
  if (used) await refreshPlaySubscription(admin, sub);
  return used;
}

/**
 * One free month outside the referral bank (the bill challenge): a renewing
 * Play plan's next charge moves back a month, otherwise a month of website
 * access starting after any paid time or grant already running.
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

/** "Use a free month" for a shop without a Play plan: publish access for a month. */
export async function spendFreeMonth(admin, userId) {
  if (await activeSubscription(admin, userId)) {
    const used = await applyFreeMonths(admin, userId);
    if (!used) throw new ReferralError("tryLater");
    return { via: "play" };
  }
  const reward = await takeReadyMonth(admin, userId);
  if (!reward) throw new ReferralError("noMonths");
  try {
    await grantMonth(admin, userId, reward);
  } catch (error) {
    await releaseMonth(admin, reward.id);
    throw error;
  }
  return { via: "grant" };
}
