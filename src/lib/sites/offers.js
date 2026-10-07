/**
 * Offer banners (Standard plan), `doc.offers` from the app:
 * `[{ id, theme, badge, title, text, ends: "YYYY-MM-DD" | "", button, hidden }]`.
 * Themes and limits mirror the app's src/lib/offer-banners.js.
 */

export const OFFERS_TIER = "standard";
export const OFFER_MAX = 3;
export const OFFER_BUTTONS = ["whatsapp", "call", "none"];
const LIMITS = { badge: 14, title: 40, text: 120 };

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
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ID = /^[a-z0-9-]{1,40}$/;

export function offerTheme(id) {
  return OFFER_THEMES[id] || OFFER_THEMES.forest;
}

function clip(value, max) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max).trim() : "";
}

function validDate(value) {
  const match = typeof value === "string" ? value.match(DATE) : null;
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toISOString().slice(0, 10) === value ? value : "";
}

/** Today's date in India, where every shop is, so offers end at the shop's midnight. */
export function indiaToday(now = new Date()) {
  return new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

/** "2026-10-15" → "15 Oct" */
export function formatOfferDate(value) {
  const match = String(value || "").match(DATE);
  return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]}` : "";
}

/** Validate the app's offers: known themes and buttons, clipped text, no blank banners. */
export function cleanOffers(input) {
  if (!Array.isArray(input)) return [];
  const ids = new Set();
  const offers = [];
  for (const item of input) {
    if (offers.length >= OFFER_MAX) break;
    if (!item || typeof item !== "object") continue;
    const offer = {
      id: "",
      theme: OFFER_THEMES[item.theme] ? item.theme : "forest",
      badge: clip(item.badge, LIMITS.badge),
      title: clip(item.title, LIMITS.title),
      text: clip(item.text, LIMITS.text),
      ends: validDate(item.ends),
      button: OFFER_BUTTONS.includes(item.button) ? item.button : "whatsapp",
      hidden: item.hidden === true,
    };
    if (!offer.badge && !offer.title && !offer.text) continue;
    let id = typeof item.id === "string" && ID.test(item.id) ? item.id : `offer-${offers.length + 1}`;
    for (let n = 2; ids.has(id); n += 1) id = `offer-${offers.length + n}`;
    ids.add(id);
    offer.id = id;
    offers.push(offer);
  }
  return offers;
}

/** Sample offers for the demo preview; `theme` recolours the first one. */
export function demoOffers(theme) {
  return [
    {
      id: "demo-1",
      theme: OFFER_THEMES[theme] ? theme : "festive",
      badge: "20% OFF",
      title: "Festival sale",
      text: "On all services this week",
      ends: "",
      button: "whatsapp",
    },
    {
      id: "demo-2",
      theme: "night",
      badge: "₹100 OFF",
      title: "First visit offer",
      text: "For new customers, on any service",
      ends: "",
      button: "call",
    },
  ];
}

/** Offers that are on, have words and haven't ended. */
export function visibleOffers(doc, today = indiaToday()) {
  return cleanOffers(doc?.offers).filter(
    (offer) => !offer.hidden && !(offer.ends && offer.ends < today)
  );
}
