/**
 * Prices shown on the moneykitapp.com landing page. They mirror the store prices
 * in the shop app (`moneykit/src/lib/site-subscription.js`, `bill-themes.js`,
 * `qr-themes.js`); the stores charge their own live price, so keep these in step.
 */
export const FREE_FEATURES = [
  "Bills, customers and dues",
  "UPI payment QR for any UPI app",
  "Share bills on WhatsApp, SMS or PDF",
  "Daily reminders for unshared bills and old dues",
  "Type by speaking, in English or Hindi",
  "English, हिन्दी and Hinglish",
  "2 bill designs included",
];

export const WEBSITE_PLANS = [
  {
    id: "basic",
    name: "Website Basic",
    tagline: "Show your business on the internet.",
    monthly: 149,
    yearly: 1499,
    features: [
      "Your own website link to share anywhere",
      "2 designs, 4 colour themes each",
      "About, services and prices",
      "Photo gallery of up to 12 photos",
      "WhatsApp, call and directions buttons",
      "Instagram, Facebook and YouTube links",
      "Edit anytime from the app",
    ],
  },
  {
    id: "standard",
    name: "Website Standard",
    tagline: "Service pages, offers and Google reviews.",
    monthly: 249,
    yearly: 2499,
    featured: true,
    lead: "Everything in Basic, plus",
    features: [
      "A page of its own for your top service",
      "Up to 3 offer banners that hide when they end",
      "Your Google rating and reviews on your site",
      "A “Rate us on Google” link in every bill",
    ],
  },
];

/** Standard with more service pages is a plan of its own. */
export const SERVICE_PAGE_PLANS = [
  { pages: 4, monthly: 329, yearly: 3299 },
  { pages: 8, monthly: 389, yearly: 3899 },
];

export const ADD_ONS = [
  { name: "Bill designs", price: 20, note: "each, one-time · 2 are free" },
  { name: "QR poster themes", price: 40, note: "each, one-time · 11 to pick from" },
];

/** Months saved by paying yearly instead of monthly, rounded like the app's badge. */
export function monthsFree(plan) {
  return Math.max(0, Math.round((plan.monthly * 12 - plan.yearly) / plan.monthly));
}

export function formatRupees(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
