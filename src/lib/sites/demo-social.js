/**
 * Sample Google reviews and Instagram posts for `/site-preview` demos.
 * Live shops still use their own Google listing and connected Instagram.
 */
import { APP_SITE_URL } from "@/lib/branding";

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

/**
 * Demo Instagram section: the pack's own photos (not a live Instagram API
 * feed). Username follows the demo shop's socials handle when set.
 */
export function demoInstagramFeed(doc) {
  const gallery = doc?.sections?.gallery?.images || [];
  const hero = doc?.sections?.hero?.image;
  const about = doc?.sections?.about?.image;
  const pics = [...gallery, hero, about].filter(Boolean);
  const fallback = [
    "/landing/landing-shop.jpg",
    "/landing/landing-whatsapp.jpg",
    "/landing/landing-upi.jpg",
    "/landing/landing-ledger.jpg",
    "/landing/landing-market.jpg",
    "/landing/landing-kirana.jpg",
  ];
  while (pics.length < 9) pics.push(fallback[pics.length % fallback.length]);

  const fromDoc = String(doc?.sections?.socials?.instagram || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "")
    .replace(/\/.*$/, "");
  const username = fromDoc || "moneykitapp";

  return {
    username,
    profileUrl: `https://www.instagram.com/${username}/`,
    posts: pics.slice(0, 9).map((image, index) => ({
      id: `demo-ig-${index + 1}`,
      image: String(image).startsWith("http") ? String(image) : `/${String(image).replace(/^\/+/, "")}`,
      url: `https://www.instagram.com/${username}/`,
      caption: `${APP_SITE_URL.replace(/^https?:\/\//, "")} — sample Instagram for this demo`,
      type: "image",
    })),
  };
}
