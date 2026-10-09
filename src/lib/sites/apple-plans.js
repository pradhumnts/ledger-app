/**
 * App Store website plans (one subscription group). Apple has no base plans,
 * so each billing period is its own product. The referral products carry the
 * 10% first-year introductory offer that Play gives through `referral-10`.
 * `tier`: "basic" (₹149 / ₹1,499) or "standard" (₹249 / ₹2,499). Standard with
 * more service pages is its own product, so the shop still pays one
 * subscription: 4 pages ₹329 / ₹3,299, 8 pages ₹389 / ₹3,899.
 */
export const APPLE_SITE_PLANS = {
  website_monthly: { yearly: false, referral: false, tier: "basic" },
  website_yearly: { yearly: true, referral: false, tier: "basic" },
  website_yearly_referral: { yearly: true, referral: true, tier: "basic" },
  website_standard_monthly: { yearly: false, referral: false, tier: "standard" },
  website_standard_yearly: { yearly: true, referral: false, tier: "standard" },
  website_standard_yearly_referral: { yearly: true, referral: true, tier: "standard" },
  website_standard4_monthly: { yearly: false, referral: false, tier: "standard", pages: 4 },
  website_standard4_yearly: { yearly: true, referral: false, tier: "standard", pages: 4 },
  website_standard8_monthly: { yearly: false, referral: false, tier: "standard", pages: 8 },
  website_standard8_yearly: { yearly: true, referral: false, tier: "standard", pages: 8 },
};

export function appleSitePlan(productId) {
  return APPLE_SITE_PLANS[String(productId || "")] || null;
}
