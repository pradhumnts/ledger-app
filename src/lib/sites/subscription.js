import {
  appleOriginalId,
  appleToken,
  appStoreConfig,
  fromAppleSubscription,
  getAppleSubscription,
  verifyAppleTransaction,
} from "@/lib/app-store-api";
import {
  acknowledgePlaySubscription,
  getPlaySubscription,
  playBillingConfig,
} from "@/lib/play-developer-api";
import { activeGrant } from "@/lib/referrals/grants";
import { appleSitePlan } from "@/lib/sites/apple-plans";
import { planTier } from "@/lib/sites/plan-tiers";
import { onSubscriptionSaved } from "@/lib/referrals/store";
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
    offerId: item.offerDetails?.offerId || null,
    startTime: subscription.startTime || null,
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

/** `apple`: `{ environment }` for App Store rows; Play rows leave the columns at their defaults. */
function rowFrom(userId, purchaseToken, play, apple = null) {
  const row = {
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
  if (apple) {
    row.provider = "apple";
    row.store_environment = apple.environment || null;
  }
  return row;
}

/** Referral rewards must never block a purchase or renewal from being saved. */
async function trackReferral(admin, userId, purchaseToken, play) {
  try {
    await onSubscriptionSaved(admin, { userId, purchaseToken, play });
  } catch (error) {
    console.error("referral tracking failed", error);
  }
}

async function saveVerified(admin, userId, purchaseToken, play, apple = null) {
  if (!play.acknowledged && ACCESS_STATES.has(play.state)) {
    await acknowledgePlaySubscription(play.productId, purchaseToken).catch(() => {});
  }
  const row = rowFrom(userId, purchaseToken, play, apple);
  const { error } = await admin
    .from("site_subscriptions")
    .upsert(row, { onConflict: "purchase_token" });
  if (error) throw new SubscriptionError("save");
  await trackReferral(admin, userId, purchaseToken, play);
  return row;
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

  return saveVerified(admin, userId, purchaseToken, play);
}

/**
 * Store a token we have never seen, found through a Play notification: a plan
 * switch (the replaced token is ours) or a purchase that finished after the app
 * closed (the app sends the shop's user id as the obfuscated account id).
 * Returns the saved row, or null when the token isn't ours to claim.
 */
export async function claimPlaySubscription(admin, purchaseToken) {
  if (!playBillingConfig().configured) return null;

  let play;
  try {
    play = fromPlay(await getPlaySubscription(purchaseToken));
  } catch {
    return null;
  }
  if (!sitePlanIds().has(play.productId)) return null;
  if (play.state === "SUBSCRIPTION_STATE_PENDING") return null;

  let userId = "";
  if (play.linkedPurchaseToken) {
    const { data: replaced } = await admin
      .from("site_subscriptions")
      .select("user_id")
      .eq("purchase_token", play.linkedPurchaseToken)
      .maybeSingle();
    userId = replaced?.user_id || "";
  }
  if (userId && play.accountId && play.accountId !== userId) return null;
  userId = userId || play.accountId;
  if (!userId) return null;

  try {
    return await saveVerified(admin, userId, purchaseToken, play);
  } catch {
    return null;
  }
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
    await trackReferral(admin, row.user_id, row.purchase_token, play);
    return next;
  } catch {
    return row;
  }
}

function sameAccount(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

/**
 * Check a signed App Store transaction from the iPhone app, read the
 * subscription's latest state from Apple and store it for this shop.
 */
export async function recordAppleSubscription(admin, { userId, signedTransaction }) {
  if (!appStoreConfig().configured) throw new SubscriptionError("notConfigured");

  let signed;
  try {
    signed = await verifyAppleTransaction(signedTransaction);
  } catch {
    throw new SubscriptionError("notVerified");
  }
  if (!appleSitePlan(signed.productId)) throw new SubscriptionError("notSitePlan");
  if (signed.appAccountToken && !sameAccount(signed.appAccountToken, userId)) {
    throw new SubscriptionError("otherAccount");
  }

  const purchaseToken = appleToken(signed.originalTransactionId);
  const { data: existing } = await admin
    .from("site_subscriptions")
    .select("user_id")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();
  if (existing && existing.user_id !== userId) throw new SubscriptionError("otherAccount");

  let play;
  try {
    play = fromAppleSubscription(
      await getAppleSubscription(signed.originalTransactionId, signed.environment)
    );
  } catch {
    throw new SubscriptionError("notVerified");
  }
  if (play.accountId && !sameAccount(play.accountId, userId)) {
    throw new SubscriptionError("otherAccount");
  }
  return saveVerified(admin, userId, purchaseToken, play, { environment: signed.environment });
}

/**
 * Store an App Store subscription we have never seen, found through a server
 * notification (the app sends the shop's user id as the appAccountToken).
 * Returns the saved row, or null when it isn't ours to claim.
 */
export async function claimAppleSubscription(admin, { originalTransactionId, environment }) {
  if (!appStoreConfig().configured || !originalTransactionId) return null;
  let play;
  try {
    play = fromAppleSubscription(await getAppleSubscription(originalTransactionId, environment));
  } catch {
    return null;
  }
  if (!appleSitePlan(play.productId) || !play.accountId) return null;
  try {
    return await saveVerified(admin, play.accountId, appleToken(originalTransactionId), play, {
      environment,
    });
  } catch {
    return null;
  }
}

async function refreshAppleSubscription(admin, row) {
  if (!appStoreConfig().configured) return row;
  try {
    const apple = await getAppleSubscription(
      appleOriginalId(row.purchase_token),
      row.store_environment
    );
    const play = fromAppleSubscription(apple);
    const next = rowFrom(row.user_id, row.purchase_token, play, {
      environment: apple.environment,
    });
    await admin
      .from("site_subscriptions")
      .update(next)
      .eq("purchase_token", row.purchase_token);
    await trackReferral(admin, row.user_id, row.purchase_token, play);
    return next;
  } catch {
    return row;
  }
}

/** Re-read a stored row from whichever store sold it. */
export async function refreshSubscription(admin, row) {
  return row?.provider === "apple"
    ? refreshAppleSubscription(admin, row)
    : refreshPlaySubscription(admin, row);
}

export async function activeSubscription(admin, userId) {
  const { data } = await admin
    .from("site_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: false, nullsFirst: false })
    .limit(5);
  // A plan switch leaves the old token's row looking active until Google expires it.
  const replaced = new Set((data || []).map((row) => row.linked_purchase_token).filter(Boolean));
  const rows = (data || []).filter((row) => !replaced.has(row.purchase_token));
  const active = rows.find((row) => isActiveRow(row));
  if (active) return active;

  // Renewals may not have reached us yet; ask the store before treating the shop as lapsed.
  const latest = rows[0];
  if (!latest || FINAL_STATES.has(latest.state)) return null;
  const fresh = await refreshSubscription(admin, latest);
  return isActiveRow(fresh) ? fresh : null;
}

function planSummary(row) {
  return {
    store: row.provider === "apple" ? "apple" : "play",
    productId: row.product_id,
    basePlanId: row.base_plan_id,
    tier: planTier(row.base_plan_id || row.product_id),
    expiresAt: row.expires_at,
    autoRenewing: Boolean(row.auto_renewing),
    state: row.state,
  };
}

/**
 * Whether this signed-in shop may publish, and why:
 * `free` (launch test mode), `owner` (allowlisted number), `play` (a paid
 * plan from either store; `store` says which) or `grant` (a free month,
 * e.g. from the bill challenge). `tier` is "basic" or "standard";
 * allowlisted numbers get the top tier.
 */
export async function siteAccess(admin, user) {
  if (isFreePublish()) return { active: true, source: "free", tier: "basic" };
  if (hasFreeAccess(user)) return { active: true, source: "owner", tier: "standard" };
  const [row, grant] = await Promise.all([
    activeSubscription(admin, user.id),
    activeGrant(admin, user.id),
  ]);
  if (row) return { active: true, source: "play", ...planSummary(row) };
  if (grant) {
    return {
      active: true,
      source: "grant",
      tier: "basic",
      expiresAt: grant.endsAt,
      autoRenewing: false,
    };
  }
  return { active: false, source: "", tier: "" };
}

/** Same check for a live site visit, where we only know the owner's id. */
export async function ownerHasSiteAccess(admin, userId) {
  if (isFreePublish()) return true;
  const [row, grant] = await Promise.all([
    activeSubscription(admin, userId),
    activeGrant(admin, userId),
  ]);
  if (row || grant) return true;
  if (!freePhones().size) return false;
  const { data } = await admin.auth.admin.getUserById(userId);
  return hasFreeAccess(data?.user);
}
