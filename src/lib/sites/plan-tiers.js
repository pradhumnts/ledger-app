import { appleSitePlan } from "./apple-plans.js";
import { STANDARD_SERVICE_PAGES } from "./service-pages.js";

/**
 * Plan tiers, lowest first: "basic" is ₹149 / ₹1,499 and "standard" is
 * ₹249 / ₹2,499 (a bigger "premium" may follow). All are base plans of the
 * one Play `website` subscription, so a shop can move between them. Standard
 * with 4 or 8 service pages is a Standard base plan of its own
 * (`standard4-*`, `standard8-*`).
 */
export const SITE_TIERS = ["basic", "standard"];

function standardPlanIds() {
  return new Set(
    String(
      process.env.SITES_STANDARD_BASE_PLAN_IDS ||
        "standard-monthly,standard-yearly,standard4-monthly,standard4-yearly,standard8-monthly,standard8-yearly"
    )
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

/** Service pages a plan includes: none on Basic, 1 on Standard, 4 or 8 on the bigger Standard plans. */
export function planPages(basePlanId) {
  const id = String(basePlanId || "");
  if (planTier(id) !== "standard") return 0;
  const apple = appleSitePlan(id);
  if (apple) return apple.pages || STANDARD_SERVICE_PAGES;
  const match = /^standard(\d+)-/.exec(id);
  return match ? Number(match[1]) : STANDARD_SERVICE_PAGES;
}
