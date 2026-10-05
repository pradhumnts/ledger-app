/**
 * App Store website plans (one subscription group). Apple has no base plans,
 * so each billing period is its own product. The referral products carry the
 * 10% first-year introductory offer that Play gives through `referral-10`.
 * `tier`: "website" (₹149 / ₹1,499) or "pro" (₹249 / ₹2,499).
 */
export const APPLE_SITE_PLANS = {
  website_monthly: { yearly: false, referral: false, tier: "website" },
  website_yearly: { yearly: true, referral: false, tier: "website" },
  website_yearly_referral: { yearly: true, referral: true, tier: "website" },
  website_pro_monthly: { yearly: false, referral: false, tier: "pro" },
  website_pro_yearly: { yearly: true, referral: false, tier: "pro" },
  website_pro_yearly_referral: { yearly: true, referral: true, tier: "pro" },
};

export function appleSitePlan(productId) {
  return APPLE_SITE_PLANS[String(productId || "")] || null;
}
