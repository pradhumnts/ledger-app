import general from "./general.js";
import photographer from "./photographer.js";

/** Content packs by business type (ids from `business-types.js`). */
const PACKS = {
  photographer,
};

export function getPack(businessType) {
  return PACKS[String(businessType || "").trim()] || general;
}
