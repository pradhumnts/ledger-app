/**
 * App Store website plans (one subscription group). Apple has no base plans,
 * so each billing period is its own product. The referral product carries the
 * 10% first-year introductory offer that Play gives through `referral-10`.
 */
export const APPLE_SITE_PLANS = {
  website_monthly: { yearly: false, referral: false },
  website_yearly: { yearly: true, referral: false },
  website_yearly_referral: { yearly: true, referral: true },
};

export function appleSitePlan(productId) {
  return APPLE_SITE_PLANS[String(productId || "")] || null;
}
