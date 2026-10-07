/**
 * Offer banners (Standard plan), `doc.offers` from the app:
 * `[{ id, theme, badge, title, text, ends: "YYYY-MM-DD" | "", button, hidden }]`.
 * Themes mirror the app's src/lib/offer-banners.js.
 */

export const OFFER_THEMES = {
  forest: { bg: "#0b301f", ink: "#ffffff", accent: "#c8e86a", accentInk: "#0b301f" },
  festive: { bg: "#7a1f2b", ink: "#fff6e5", accent: "#f2c14e", accentInk: "#4a1018" },
  sunset: { bg: "#e8582c", ink: "#ffffff", accent: "#fff1c2", accentInk: "#9c3412" },
  ocean: { bg: "#123a63", ink: "#ffffff", accent: "#7fd3f7", accentInk: "#0b2540" },
  rose: { bg: "#f9dbe1", ink: "#5c1a2b", accent: "#c2335b", accentInk: "#ffffff" },
  sunshine: { bg: "#ffd84d", ink: "#2b2200", accent: "#2b2200", accentInk: "#ffd84d" },
  night: { bg: "#17171c", ink: "#ffffff", accent: "#e8c372", accentInk: "#17171c" },
  mint: { bg: "#dff3e6", ink: "#0b301f", accent: "#1f8a4c", accentInk: "#ffffff" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function offerTheme(id) {
  return OFFER_THEMES[id] || OFFER_THEMES.forest;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** "2026-10-15" → "15 Oct" */
export function formatOfferDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]}` : "";
}

/** Offers that are on, have words and haven't ended. */
export function visibleOffers(doc, now = today()) {
  const offers = Array.isArray(doc?.offers) ? doc.offers : [];
  return offers.filter(
    (offer) =>
      offer &&
      !offer.hidden &&
      (text(offer.badge) || text(offer.title) || text(offer.text)) &&
      !(offer.ends && offer.ends < now)
  );
}
