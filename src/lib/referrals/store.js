import { APP_SITE_URL } from "@/lib/branding";
import {
  appleOriginalId,
  appStoreConfig,
  fromAppleSubscription,
  getAppleSubscription,
  isAppleToken,
} from "@/lib/app-store-api";
import { getPlaySubscription, playBillingConfig } from "@/lib/play-developer-api";
import { indianMobileDigits } from "@/lib/supabase/phone";
import {
  AFFILIATE_REWARD_PAISE,
  HOLD_DAYS,
  REFERRAL_DISCOUNT_PERCENT,
  SHOP_MIN_PAYOUT_PAISE,
  SHOP_REWARD_PAISE,
  holdUntil,
  isYearlyPlan,
  mapInBatches,
  maskName,
  normalizeCode,
  referralLink,
  shopCodeCandidate,
} from "./rules";

export class ReferralError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

// States where the shop has paid; the rest of subscriptionsv2 means no money kept.
const PAID_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
  "SUBSCRIPTION_STATE_CANCELED",
]);
const REFUNDED_STATES = new Set([
  "SUBSCRIPTION_STATE_EXPIRED",
  "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED",
]);

function nowIso() {
  return new Date().toISOString();
}

function userMobile(user) {
  const fromPhone = indianMobileDigits(user?.phone || "");
  if (fromPhone.length === 10) return fromPhone;
  const match = /^(\d{10})@phone\.moneykit\.app$/i.exec(String(user?.email || ""));
  return match ? match[1] : "";
}

async function businessNames(admin, userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return new Map();
  const { data } = await admin.from("businesses").select("user_id, name").in("user_id", ids);
  return new Map((data || []).map((row) => [row.user_id, String(row.name || "").trim()]));
}

/** An active code and who owns it, or null. `withLabel: false` skips the shop-name lookup. */
export async function findCode(admin, value, { withLabel = true } = {}) {
  const code = normalizeCode(value);
  if (!code) return null;
  const { data } = await admin
    .from("referral_codes")
    .select("code, affiliate_id, user_id, active, affiliates (name, phone, active)")
    .eq("code", code)
    .maybeSingle();
  if (!data?.active) return null;
  if (data.affiliate_id && !data.affiliates?.active) return null;
  let label = data.affiliates?.name || "";
  if (data.user_id && withLabel) {
    label = (await businessNames(admin, [data.user_id])).get(data.user_id) || "";
  }
  return {
    code: data.code,
    kind: data.affiliate_id ? "affiliate" : "shop",
    affiliateId: data.affiliate_id,
    userId: data.user_id,
    affiliatePhone: data.affiliates?.phone || "",
    label,
  };
}

/** The shop's own code, created from its business name the first time. */
export async function ensureShopCode(admin, userId) {
  const existing = async () => {
    const { data } = await admin
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .maybeSingle();
    return data?.code || "";
  };
  const found = await existing();
  if (found) return found;

  const name = (await businessNames(admin, [userId])).get(userId);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = shopCodeCandidate(name);
    const { error } = await admin.from("referral_codes").insert({ code, user_id: userId });
    if (!error) return code;
    if (error.code !== "23505") break;
    const raced = await existing();
    if (raced) return raced;
  }
  throw new ReferralError("save");
}

export async function logClick(admin, code) {
  await admin.from("referral_clicks").insert({ code });
}

async function hasYearlyPurchase(admin, userId) {
  const { data } = await admin
    .from("site_subscriptions")
    .select("base_plan_id")
    .eq("user_id", userId);
  return (data || []).some((row) => isYearlyPlan({ basePlanId: row.base_plan_id }));
}

/** The code this shop was referred with, or null. */
export async function referredBy(admin, userId) {
  const { data } = await admin
    .from("referrals")
    .select("code, status, source")
    .eq("referred_user_id", userId)
    .maybeSingle();
  if (!data) return null;
  const owner = await findCode(admin, data.code);
  return {
    code: data.code,
    label: owner?.label || "",
    kind: owner?.kind || "",
    locked: data.status !== "joined",
    status: data.status,
  };
}

/**
 * Attach a code to this shop. Links (install referrer) never replace a code
 * the shop already has; a typed code can, until the first yearly purchase.
 */
export async function claimReferral(admin, user, { code, source = "typed" }) {
  const found = await findCode(admin, code);
  if (!found) throw new ReferralError("invalid");
  if (found.userId === user.id) throw new ReferralError("self");
  if (found.affiliatePhone && found.affiliatePhone === userMobile(user)) {
    throw new ReferralError("self");
  }

  const { data: current } = await admin
    .from("referrals")
    .select("code, status")
    .eq("referred_user_id", user.id)
    .maybeSingle();
  if (current?.code === found.code) return referredBy(admin, user.id);
  if (current && current.status !== "joined") throw new ReferralError("locked");
  if (current && source === "link") return referredBy(admin, user.id);
  if (await hasYearlyPurchase(admin, user.id)) throw new ReferralError("locked");

  const row = {
    code: found.code,
    affiliate_id: found.affiliateId,
    referrer_user_id: found.userId,
    source: source === "link" ? "link" : "typed",
  };
  if (current) {
    const { data, error } = await admin
      .from("referrals")
      .update(row)
      .eq("referred_user_id", user.id)
      .eq("status", "joined")
      .select("code")
      .maybeSingle();
    if (error) throw new ReferralError("save");
    if (!data) throw new ReferralError("locked");
  } else {
    const { error } = await admin
      .from("referrals")
      .insert({ ...row, referred_user_id: user.id });
    if (error?.code === "23505") return claimReferral(admin, user, { code, source });
    if (error) throw new ReferralError("save");
  }
  return referredBy(admin, user.id);
}

async function createRewards(admin, referral) {
  const base = {
    referred_user_id: referral.referred_user_id,
    hold_until: holdUntil(referral.subscribed_at),
    purchase_token: referral.purchase_token,
  };
  const rows = [];
  if (referral.affiliate_id) {
    rows.push({
      ...base,
      kind: "cash",
      affiliate_id: referral.affiliate_id,
      amount_paise: AFFILIATE_REWARD_PAISE,
    });
  }
  if (referral.referrer_user_id) {
    rows.push({
      ...base,
      kind: "cash",
      user_id: referral.referrer_user_id,
      amount_paise: SHOP_REWARD_PAISE,
    });
  }
  if (!rows.length) return;
  await admin
    .from("referral_rewards")
    .upsert(rows, { onConflict: "referred_user_id,kind", ignoreDuplicates: true });
}

async function qualifyReferral(admin, { userId, purchaseToken, play }) {
  if (!PAID_STATES.has(play.state) || !isYearlyPlan(play)) return;

  const { data: referral } = await admin
    .from("referrals")
    .select("*")
    .eq("referred_user_id", userId)
    .maybeSingle();
  if (!referral) return;

  let locked = referral;
  if (referral.status === "joined") {
    // A subscription moved between MoneyKit accounts qualifies one referral only.
    const { data: used } = await admin
      .from("referrals")
      .select("referred_user_id")
      .eq("purchase_token", purchaseToken)
      .neq("referred_user_id", userId)
      .limit(1);
    if (used?.length) return;
    const { data } = await admin
      .from("referrals")
      .update({
        status: "subscribed",
        purchase_token: purchaseToken,
        order_id: play.orderId,
        base_plan_id: play.basePlanId,
        offer_id: play.offerId || null,
        subscribed_at: play.startTime || nowIso(),
      })
      .eq("referred_user_id", userId)
      .eq("status", "joined")
      .select("*")
      .maybeSingle();
    if (!data) return;
    locked = data;
  }
  if (locked.status === "subscribed" && locked.purchase_token === purchaseToken) {
    await createRewards(admin, locked);
  }
}

/** Refunded or revoked inside the hold: the referrer earns nothing for it. */
export async function voidRewardsForToken(admin, purchaseToken, reason) {
  const { data } = await admin
    .from("referral_rewards")
    .update({ status: "void", void_reason: String(reason || "refunded").slice(0, 120) })
    .eq("purchase_token", purchaseToken)
    .eq("status", "held")
    .select("referred_user_id");
  const ids = [...new Set((data || []).map((row) => row.referred_user_id))];
  if (ids.length) {
    await admin
      .from("referrals")
      .update({ status: "void" })
      .in("referred_user_id", ids)
      .eq("status", "subscribed");
  }
  return ids.length;
}

/** Every stored or refreshed Play subscription passes through here. */
export async function onSubscriptionSaved(admin, { userId, purchaseToken, play }) {
  if (REFUNDED_STATES.has(play.state)) {
    await voidRewardsForToken(admin, purchaseToken, play.state);
    return;
  }
  await qualifyReferral(admin, { userId, purchaseToken, play });
}

async function appleStillPaid(admin, purchaseToken) {
  if (!appStoreConfig().configured) return true;
  const { data: row } = await admin
    .from("site_subscriptions")
    .select("store_environment")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();
  try {
    const apple = await getAppleSubscription(
      appleOriginalId(purchaseToken),
      row?.store_environment
    );
    return !REFUNDED_STATES.has(fromAppleSubscription(apple).state);
  } catch {
    return null;
  }
}

/** true paid, false refunded, null when the store can't tell us right now. */
async function stillPaid(admin, purchaseToken) {
  if (isAppleToken(purchaseToken)) return appleStillPaid(admin, purchaseToken);
  if (!playBillingConfig().configured) return true;
  try {
    const play = await getPlaySubscription(purchaseToken);
    return !REFUNDED_STATES.has(String(play.subscriptionState || ""));
  } catch {
    return null;
  }
}

/** Release rewards whose hold has passed, re-checking each purchase with Google first. */
export async function unlockDueRewards(admin, { userId, affiliateId } = {}) {
  let query = admin
    .from("referral_rewards")
    .select("id, purchase_token")
    .eq("status", "held")
    .lte("hold_until", nowIso())
    .limit(200);
  if (userId) query = query.eq("user_id", userId);
  if (affiliateId) query = query.eq("affiliate_id", affiliateId);
  const { data } = await query;

  const byToken = new Map();
  for (const row of data || []) {
    byToken.set(row.purchase_token, [...(byToken.get(row.purchase_token) || []), row.id]);
  }
  const counts = await mapInBatches([...byToken], 8, async ([token, ids]) => {
    const paid = await stillPaid(admin, token);
    if (paid === false) {
      await voidRewardsForToken(admin, token, "refunded");
      return 0;
    }
    if (!paid) return 0;
    const { data: done } = await admin
      .from("referral_rewards")
      .update({ status: "ready" })
      .in("id", ids)
      .eq("status", "held")
      .select("id");
    return done?.length || 0;
  });
  return counts.reduce((sum, count) => sum + count, 0);
}

function inviteRow(row, names) {
  return {
    name: maskName(names.get(row.referred_user_id)) || "",
    joinedAt: row.created_at,
    subscribedAt: row.subscribed_at,
    status: row.status,
  };
}

/** Rupees per reward status; `due` is held money already past its hold, `nextReadyAt` the next to clear. */
function earningsFrom(rewards) {
  const now = nowIso();
  const earnings = { held: 0, ready: 0, requested: 0, paid: 0, due: 0, nextReadyAt: null };
  for (const reward of rewards || []) {
    const rupees = Math.round((reward.amount_paise || 0) / 100);
    if (reward.status === "held") {
      earnings.held += rupees;
      if (reward.hold_until <= now) earnings.due += rupees;
      if (!earnings.nextReadyAt || reward.hold_until < earnings.nextReadyAt) {
        earnings.nextReadyAt = reward.hold_until;
      }
    } else if (["ready", "requested", "paid"].includes(reward.status)) {
      earnings[reward.status] += rupees;
    }
  }
  return earnings;
}

function payoutRow(row) {
  return {
    id: row.id,
    amount: Math.round(row.amount_paise / 100),
    upiId: row.upi_id,
    status: row.status,
    reference: row.reference,
    note: row.note || "",
    requestedAt: row.requested_at,
    paidAt: row.paid_at,
  };
}

/** Everything the app's Refer & earn page shows. */
export async function shopReferralSummary(admin, userId) {
  const [code, { data: invites }, { data: rewards }, { data: payouts }, { data: business }, from] =
    await Promise.all([
      ensureShopCode(admin, userId),
      admin
        .from("referrals")
        .select("referred_user_id, status, created_at, subscribed_at")
        .eq("referrer_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("referral_rewards")
        .select("status, amount_paise, hold_until")
        .eq("user_id", userId)
        .eq("kind", "cash"),
      admin
        .from("affiliate_payouts")
        .select("id, amount_paise, upi_id, status, reference, note, requested_at, paid_at")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false })
        .limit(20),
      admin.from("businesses").select("upi_id").eq("user_id", userId).maybeSingle(),
      referredBy(admin, userId),
    ]);

  const list = invites || [];
  const names = await businessNames(admin, list.slice(0, 50).map((row) => row.referred_user_id));
  const payoutList = (payouts || []).map(payoutRow);

  return {
    code,
    link: referralLink(APP_SITE_URL, code),
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
    rewardRupees: SHOP_REWARD_PAISE / 100,
    minPayoutRupees: SHOP_MIN_PAYOUT_PAISE / 100,
    holdDays: HOLD_DAYS,
    referredBy: from,
    stats: {
      joined: list.length,
      subscribed: list.filter((row) => row.status === "subscribed").length,
    },
    earnings: earningsFrom(rewards),
    upiId: payoutList[0]?.upiId || business?.upi_id || "",
    payouts: payoutList,
    invites: list.slice(0, 50).map((row) => inviteRow(row, names)),
  };
}

/** Ask for every cleared ₹ to be sent to `upiId`; needs at least the minimum payout. */
export async function requestShopPayout(admin, userId, upiId) {
  await unlockDueRewards(admin, { userId });
  const { data, error } = await admin.rpc("request_shop_payout", {
    p_user: userId,
    p_upi: upiId,
    p_min_paise: SHOP_MIN_PAYOUT_PAISE,
  });
  if (error) throw new ReferralError("save");
  if (!data?.id) {
    const { data: ready } = await admin
      .from("referral_rewards")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", "cash")
      .eq("status", "ready")
      .limit(1);
    throw new ReferralError(ready?.length ? "belowMinimum" : "nothingReady");
  }
  return payoutRow(data);
}

async function countClicks(admin, codes, since) {
  if (!codes.length) return 0;
  let query = admin
    .from("referral_clicks")
    .select("id", { count: "exact", head: true })
    .in("code", codes);
  if (since) query = query.gte("created_at", since);
  const { count } = await query;
  return count || 0;
}

/** Stats for the affiliate web page. */
export async function affiliateSummary(admin, affiliateId) {
  const { data: affiliate } = await admin
    .from("affiliates")
    .select("id, name, phone, upi_id, active")
    .eq("id", affiliateId)
    .maybeSingle();
  if (!affiliate?.active) return null;

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: codeRows } = await admin
    .from("referral_codes")
    .select("code")
    .eq("affiliate_id", affiliateId)
    .eq("active", true)
    .order("created_at");
  const codes = (codeRows || []).map((row) => row.code);

  const [clicks, clicks30, { data: referrals }, { data: rewards }, { data: payouts }] =
    await Promise.all([
      countClicks(admin, codes),
      countClicks(admin, codes, since30),
      admin
        .from("referrals")
        .select("referred_user_id, status, created_at, subscribed_at")
        .eq("affiliate_id", affiliateId)
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("referral_rewards")
        .select("referred_user_id, status, amount_paise, hold_until")
        .eq("affiliate_id", affiliateId)
        .eq("kind", "cash"),
      admin
        .from("affiliate_payouts")
        .select("id, amount_paise, upi_id, status, reference, note, requested_at, paid_at")
        .eq("affiliate_id", affiliateId)
        .order("requested_at", { ascending: false })
        .limit(20),
    ]);

  const earnings = earningsFrom(rewards);
  const rewardByShop = new Map((rewards || []).map((reward) => [reward.referred_user_id, reward]));

  const list = referrals || [];
  const recent = list.slice(0, 50);
  const names = await businessNames(admin, recent.map((row) => row.referred_user_id));

  return {
    name: affiliate.name,
    upiId: affiliate.upi_id,
    codes: codes.map((code) => ({ code, link: referralLink(APP_SITE_URL, code) })),
    rewardRupees: AFFILIATE_REWARD_PAISE / 100,
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
    holdDays: HOLD_DAYS,
    stats: {
      clicks,
      clicks30,
      joined: list.length,
      subscribed: list.filter((row) => row.status === "subscribed").length,
    },
    earnings,
    referrals: recent.map((row) => {
      const reward = rewardByShop.get(row.referred_user_id);
      return {
        ...inviteRow(row, names),
        reward: reward ? reward.status : "",
        readyAt: reward?.status === "held" ? reward.hold_until : null,
      };
    }),
    payouts: (payouts || []).map(payoutRow),
  };
}

export async function affiliateByPhone(admin, phone) {
  const digits = indianMobileDigits(phone);
  if (digits.length !== 10) return null;
  const { data } = await admin
    .from("affiliates")
    .select("id, name, active")
    .eq("phone", digits)
    .maybeSingle();
  return data?.active ? data : null;
}

export async function requestAffiliatePayout(admin, affiliateId, upiId) {
  await unlockDueRewards(admin, { affiliateId });
  const { data, error } = await admin.rpc("request_affiliate_payout", {
    p_affiliate: affiliateId,
    p_upi: upiId,
  });
  if (error) throw new ReferralError("save");
  if (!data?.id) throw new ReferralError("nothingReady");
  return { id: data.id, amount: Math.round(data.amount_paise / 100) };
}
