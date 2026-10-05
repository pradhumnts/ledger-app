import { appleSitePlan } from "./apple-plans.js";

/**
 * Plan tiers, lowest first: "basic" is ₹149 / ₹1,499 and "standard" is
 * ₹249 / ₹2,499 (a bigger "premium" may follow). All are base plans of the
 * one Play `website` subscription, so a shop can move between them.
 */
export const SITE_TIERS = ["basic", "standard"];

function standardPlanIds() {
  return new Set(
    String(process.env.SITES_STANDARD_BASE_PLAN_IDS || "standard-monthly,standard-yearly")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

/** Whether `tier` includes `min`'s features (a higher tier includes lower ones). */
export function tierAtLeast(tier, min) {
  const have = SITE_TIERS.indexOf(tier);
  return have >= 0 && have >= SITE_TIERS.indexOf(min);
}

/** Tier of a Play base plan id, or of an App Store product id. */
export function planTier(basePlanId) {
  const id = String(basePlanId || "");
  const apple = appleSitePlan(id);
  if (apple) return apple.tier;
  return standardPlanIds().has(id) ? "standard" : "basic";
}
