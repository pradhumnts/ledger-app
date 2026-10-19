/**
 * Sample Google reviews and Instagram posts for `/site-preview` demos.
 * Live shops still use their own Google listing and connected Instagram.
 */
import { APP_SITE_URL } from "@/lib/branding";

/** MoneyKit's public Instagram (shown on template demos only). */
export const DEMO_INSTAGRAM_USERNAME = "moneykitapp";

/**
 * A sample Google listing's rating + reviews, so demos show the section
 * without calling Places. Links open Google Maps search for the sample shop.
 */
export function demoGoogleReviews() {
  return {
    placeId: "demo",
    name: "Sample Salon",
    rating: 4.8,
    count: 128,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=salon%20Mumbai",
    reviewUrl: "https://www.google.com/maps/search/?api=1&query=salon%20Mumbai",
    reviews: [
      {
        author: "Ananya Mehta",
        authorUrl: "",
        photo: "",
        rating: 5,
        text: "Loved the bridal makeup trial. They took time to understand the outfit and jewellery, and the finish lasted the whole day.",
        when: "2 months ago",
      },
      {
        author: "Riya Sharma",
        authorUrl: "",
        photo: "",
        rating: 5,
        text: "Clean parlour, gentle staff, and honest pricing. Facial and cleanup left my skin glowing for the weekend.",
        when: "a month ago",
      },
      {
        author: "Kavita Jain",
        authorUrl: "",
        photo: "",
        rating: 4,
        text: "Booked party makeup on WhatsApp and they confirmed quickly. Soft glam look, exactly what I asked for.",
        when: "3 weeks ago",
      },
      {
        author: "Neha Kapoor",
        authorUrl: "",
        photo: "",
        rating: 5,
        text: "Mehendi for my sister's wedding was beautiful. Intricate work, on time, and very patient with the bridal party.",
        when: "4 months ago",
      },
      {
        author: "Pooja Verma",
        authorUrl: "",
        photo: "",
        rating: 5,
        text: "Regular customer for threading and cleanup. Always on time and the place feels welcoming every visit.",
        when: "5 months ago",
      },
    ],
  };
}

/** Nine square posts so the Instagram grid fills evenly (3×3). */
export function demoInstagramFeed(images = []) {
  const pics = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, 9);
  const fallback = [
    "/landing/landing-shop.jpg",
    "/landing/landing-whatsapp.jpg",
    "/landing/landing-upi.jpg",
    "/landing/landing-ledger.jpg",
    "/landing/landing-market.jpg",
    "/landing/landing-kirana.jpg",
    "/moneykit-logo.webp",
    "/og-previews/classic.png",
    "/og-previews/minimal.png",
  ];
  while (pics.length < 9) pics.push(fallback[pics.length % fallback.length]);

  const username = DEMO_INSTAGRAM_USERNAME;
  return {
    username,
    profileUrl: `https://www.instagram.com/${username}/`,
    posts: pics.slice(0, 9).map((image, index) => ({
      id: `demo-ig-${index + 1}`,
      image: String(image).startsWith("http") ? String(image) : `/${String(image).replace(/^\/+/, "")}`,
      url: `https://www.instagram.com/${username}/`,
      caption: `${APP_SITE_URL.replace(/^https?:\/\//, "")} — bills, UPI and your shop website`,
      type: "image",
    })),
  };
}

/** Gallery (and cover) images from a demo site doc, for the sample Instagram grid. */
export function demoInstagramImages(doc) {
  const gallery = doc?.sections?.gallery?.images || [];
  const hero = doc?.sections?.hero?.image;
  const about = doc?.sections?.about?.image;
  return [...gallery, hero, about].filter(Boolean);
}
