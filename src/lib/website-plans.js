export const WEBSITE_PLAN_PRICE = 149;
export const WEBSITE_BOOKING_PLAN_PRICE = 249;

export const WEBSITE_PLANS = [
  {
    id: "website",
    title: "Website",
    tagline: "Your shop online in days",
    price: WEBSITE_PLAN_PRICE,
    icon: "globe",
    accent: "forest",
  },
  {
    id: "website-booking",
    title: "Website + Booking",
    tagline: "Let customers book while you bill",
    price: WEBSITE_BOOKING_PLAN_PRICE,
    icon: "calendar",
    accent: "lime",
    featured: true,
  },
];
