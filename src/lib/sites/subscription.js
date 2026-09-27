import {
  acknowledgePlaySubscription,
  getPlaySubscription,
  playBillingConfig,
} from "@/lib/play-developer-api";
import { indianMobileDigits } from "@/lib/supabase/phone";
import { isFreePublish } from "@/lib/sites/config";

// CANCELED only means auto-renew is off; the shop keeps its site until expiry.
const ACCESS_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
  "SUBSCRIPTION_STATE_CANCELED",
]);
const FINAL_STATES = new Set([
  "SUBSCRIPTION_STATE_EXPIRED",
  "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED",
]);

export class SubscriptionError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

/** Play subscription product ids that unlock publishing. */
export function sitePlanIds() {
  const ids = String(process.env.SITES_PLAY_PRODUCT_IDS || "website")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return new Set(ids);
}

function freePhones() {
  const list = String(process.env.SITES_FREE_PHONES || "").split(",");
  list.push(process.env.PLAY_REVIEW_PHONE || "");
  return new Set(
    list.map((value) => indianMobileDigits(value)).filter((digits) => digits.length === 10)
  );
}

function userMobile(user) {
  const fromPhone = indianMobileDigits(user?.phone || "");
  if (fromPhone.length === 10) return fromPhone;
  const match = /^(\d{10})@phone\.moneykit\.app$/i.exec(String(user?.email || ""));
  return match ? match[1] : "";
}

export function hasFreeAccess(user) {
  const mobile = userMobile(user);
  return Boolean(mobile) && freePhones().has(mobile);
}

function isActiveRow(row, now = Date.now()) {
  if (!row || !ACCESS_STATES.has(row.state) || !row.expires_at) return false;
  return new Date(row.expires_at).getTime() > now;
}

function fromPlay(subscription) {
  const ids = sitePlanIds();
  const items = subscription.lineItems || [];
  const item = items.find((line) => ids.has(line.productId)) || items[0] || {};
  return {
    productId: String(item.productId || ""),
    basePlanId: item.offerDetails?.basePlanId || null,
    expiresAt: item.expiryTime || null,
    autoRenewing: Boolean(item.autoRenewingPlan?.autoRenewEnabled),
    orderId: item.latestSuccessfulOrderId || subscription.latestOrderId || null,
    state: String(subscription.subscriptionState || ""),
    linkedPurchaseToken: subscription.linkedPurchaseToken || null,
    accountId: subscription.externalAccountIdentifiers?.obfuscatedExternalAccountId || "",
    acknowledged:
      subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
  };
}

function rowFrom(userId, purchaseToken, play) {
  return {
    purchase_token: purchaseToken,
    user_id: userId,
    product_id: play.productId,
    base_plan_id: play.basePlanId,
    state: play.state,
    expires_at: play.expiresAt,
    auto_renewing: play.autoRenewing,
    order_id: play.orderId,
    linked_purchase_token: play.linkedPurchaseToken,
  };
}

/** Check a purchase token with Google and store it for this shop. */
export async function recordPlaySubscription(admin, { userId, purchaseToken }) {
  if (!playBillingConfig().configured) throw new SubscriptionError("notConfigured");

  const { data: existing } = await admin
    .from("site_subscriptions")
    .select("user_id")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();
  if (existing && existing.user_id !== userId) throw new SubscriptionError("otherAccount");

  let play;
  try {
    play = fromPlay(await getPlaySubscription(purchaseToken));
  } catch {
    throw new SubscriptionError("notVerified");
  }
  if (!sitePlanIds().has(play.productId)) throw new SubscriptionError("notSitePlan");
  if (play.accountId && play.accountId !== userId) throw new SubscriptionError("otherAccount");
  if (play.state === "SUBSCRIPTION_STATE_PENDING") throw new SubscriptionError("pending");

  if (!play.acknowledged && ACCESS_STATES.has(play.state)) {
    await acknowledgePlaySubscription(play.productId, purchaseToken).catch(() => {});
  }

  const row = rowFrom(userId, purchaseToken, play);
  const { error } = await admin
    .from("site_subscriptions")
    .upsert(row, { onConflict: "purchase_token" });
  if (error) throw new SubscriptionError("save");
  return row;
}

/** Re-read a stored token from Google (renewals, cancellations, refunds). */
export async function refreshPlaySubscription(admin, row) {
  if (!row?.purchase_token || !playBillingConfig().configured) return row;
  try {
    const play = fromPlay(await getPlaySubscription(row.purchase_token));
    const next = rowFrom(row.user_id, row.purchase_token, play);
    await admin
      .from("site_subscriptions")
      .update(next)
      .eq("purchase_token", row.purchase_token);
    return next;
  } catch {
    return row;
  }
}

async function activeSubscription(admin, userId) {
  const { data } = await admin
    .from("site_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: false, nullsFirst: false })
    .limit(3);
  const rows = data || [];
  const active = rows.find((row) => isActiveRow(row));
  if (active) return active;

  // Renewals only reach us through Google; ask before treating the shop as lapsed.
  const latest = rows[0];
  if (!latest || FINAL_STATES.has(latest.state)) return null;
  const fresh = await refreshPlaySubscription(admin, latest);
  return isActiveRow(fresh) ? fresh : null;
}

function planSummary(row) {
  return {
    productId: row.product_id,
    basePlanId: row.base_plan_id,
    expiresAt: row.expires_at,
    autoRenewing: Boolean(row.auto_renewing),
    state: row.state,
  };
}

/**
 * Whether this signed-in shop may publish, and why:
 * `free` (launch test mode), `owner` (allowlisted number) or `play`.
 */
export async function siteAccess(admin, user) {
  if (isFreePublish()) return { active: true, source: "free" };
  if (hasFreeAccess(user)) return { active: true, source: "owner" };
  const row = await activeSubscription(admin, user.id);
  if (row) return { active: true, source: "play", ...planSummary(row) };
  return { active: false, source: "" };
}

/** Same check for a live site visit, where we only know the owner's id. */
export async function ownerHasSiteAccess(admin, userId) {
  if (isFreePublish()) return true;
  if (await activeSubscription(admin, userId)) return true;
  if (!freePhones().size) return false;
  const { data } = await admin.auth.admin.getUserById(userId);
  return hasFreeAccess(data?.user);
}
