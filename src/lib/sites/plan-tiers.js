import { appleSitePlan } from "./apple-plans.js";

/**
 * Website plan tiers. "website" is ₹149 / ₹1,499; "pro" is ₹249 / ₹2,499 and
 * unlocks the extra features. Both are base plans of the one Play `website`
 * subscription, so a shop can move between them.
 */
export const SITE_TIERS = ["website", "pro"];

function proPlanIds() {
  return new Set(
    String(process.env.SITES_PRO_BASE_PLAN_IDS || "pro-monthly,pro-yearly")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

/** Tier of a Play base plan id, or of an App Store product id. */
export function planTier(basePlanId) {
  const id = String(basePlanId || "");
  const apple = appleSitePlan(id);
  if (apple) return apple.tier;
  return proPlanIds().has(id) ? "pro" : "website";
}
