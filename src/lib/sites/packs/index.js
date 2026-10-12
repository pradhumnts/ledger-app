import architecture from "./architecture.js";
import beauty from "./beauty.js";
import education from "./education.js";
import events from "./events.js";
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
 * and `events` are not offered in onboarding; a shop gets them only when its type
 * is set to one directly.
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
  education,
  events,
  architecture,
};

export function getPack(businessType) {
  return PACKS[String(businessType || "").trim()] || general;
}
