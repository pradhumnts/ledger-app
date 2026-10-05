/**
 * App Store website plans (one subscription group). Apple has no base plans,
 * so each billing period is its own product. The referral products carry the
 * 10% first-year introductory offer that Play gives through `referral-10`.
 * `tier`: "basic" (₹149 / ₹1,499) or "standard" (₹249 / ₹2,499).
 */
export const APPLE_SITE_PLANS = {
  website_monthly: { yearly: false, referral: false, tier: "basic" },
  website_yearly: { yearly: true, referral: false, tier: "basic" },
  website_yearly_referral: { yearly: true, referral: true, tier: "basic" },
  website_standard_monthly: { yearly: false, referral: false, tier: "standard" },
  website_standard_yearly: { yearly: true, referral: false, tier: "standard" },
  website_standard_yearly_referral: { yearly: true, referral: true, tier: "standard" },
};

export function appleSitePlan(productId) {
  return APPLE_SITE_PLANS[String(productId || "")] || null;
}
