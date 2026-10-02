import { PLAY_STORE_URL } from "./branding.js";

/**
 * Short install links (`moneykitapp.com/get/bill`) used by the app's shares.
 * Each tag keeps the utm pair the app used before, so Play Console acquisition
 * reports stay continuous. Play only reports utm_source and utm_campaign.
 */
const TAGS = {
  bill: { source: "whatsapp", campaign: "bill" },
  receipt: { source: "whatsapp", campaign: "receipt" },
  statement: { source: "whatsapp", campaign: "statement" },
  invite: { source: "app_share", campaign: "invite" },
  pdf: { source: "bill_pdf", campaign: "footer" },
};

const TAG = /^[a-z0-9_-]{1,32}$/;

/** A known or new tag in canonical form, or "" for a bare `/get` (or junk). */
export function cleanAppLinkTag(raw) {
  const tag = String(raw || "").trim().toLowerCase();
  return TAG.test(tag) ? tag : "";
}

/** New tags (posters, Instagram…) work without a code change: the tag becomes the utm_source. */
export function appLinkPlayUrl(tag) {
  const { source, campaign } = TAGS[tag] || {
    source: tag || "link",
    campaign: tag ? "link" : "direct",
  };
  const referrer = `utm_source=${source}&utm_campaign=${campaign}`;
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(referrer)}`;
}
