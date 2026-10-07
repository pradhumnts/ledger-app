import architecture from "./architecture.js";
import beauty from "./beauty.js";
import eyeglasses from "./eyeglasses.js";
import fashion from "./fashion.js";
import fitness from "./fitness.js";
import general from "./general.js";
import jewellery from "./jewellery.js";
import mobiles from "./mobiles.js";
import photographer from "./photographer.js";
import restaurant from "./restaurant.js";
import salon from "./salon.js";

/**
 * Content packs by business type (ids from `business-types.js`). `architecture`
 * is not offered in onboarding; a shop gets it only when its type is set to it directly.
 */
const PACKS = {
  photographer,
  salon,
  beauty,
  fitness,
  jewellery,
  eyeglasses,
  mobiles,
  restaurant,
  fashion,
  architecture,
};

export function getPack(businessType) {
  return PACKS[String(businessType || "").trim()] || general;
}
