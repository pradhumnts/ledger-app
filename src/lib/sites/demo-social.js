/**
 * Sample Google reviews and Instagram posts for `/site-preview` demos.
 * Live shops still use their own Google listing and connected Instagram.
 */
import { APP_SITE_URL } from "@/lib/branding";

/** Indian bridal/beauty close-ups from the beauty pack (circular avatars crop the face). */
const DEMO_REVIEWER_PHOTOS = [
  "/site-packs/beauty/bridal.webp",
  "/site-packs/beauty/eyes.webp",
  "/site-packs/beauty/south-bride.webp",
  "/site-packs/beauty/engagement.webp",
  "/site-packs/beauty/hairstyle.webp",
];

/**
 * Extra Instagram photos per pack so the grid isn't a copy of the gallery.
 * Drop files in `public/demo/instagram/{packId}/` to add more packs.
 */
const DEMO_INSTAGRAM_BY_PACK = {
  beauty: [
    // Makeup, tools and salon shots — not the same bridal set as the gallery.
    "/demo/instagram/beauty/2.jpg",
    "/demo/instagram/beauty/3.jpg",
    "/demo/instagram/beauty/4.jpg",
    "/demo/instagram/beauty/5.jpg",
    "/demo/instagram/beauty/6.jpg",
    "/demo/instagram/beauty/7.jpg",
    "/demo/instagram/beauty/8.jpg",
    "/site-packs/beauty/mehendi.webp",
    "/site-packs/beauty/about.webp",
  ],
};

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
        photo: DEMO_REVIEWER_PHOTOS[0],
        rating: 5,
        text: "Loved the bridal makeup trial. They took time to understand the outfit and jewellery, and the finish lasted the whole day.",
        when: "2 months ago",
      },
      {
        author: "Riya Sharma",
        authorUrl: "",
        photo: DEMO_REVIEWER_PHOTOS[1],
        rating: 5,
        text: "Clean parlour, gentle staff, and honest pricing. Facial and cleanup left my skin glowing for the weekend.",
        when: "a month ago",
      },
      {
        author: "Kavita Jain",
        authorUrl: "",
        photo: DEMO_REVIEWER_PHOTOS[2],
        rating: 4,
        text: "Booked party makeup on WhatsApp and they confirmed quickly. Soft glam look, exactly what I asked for.",
        when: "3 weeks ago",
      },
      {
        author: "Neha Kapoor",
        authorUrl: "",
        photo: DEMO_REVIEWER_PHOTOS[3],
        rating: 5,
        text: "Mehendi for my sister's wedding was beautiful. Intricate work, on time, and very patient with the bridal party.",
        when: "4 months ago",
      },
      {
        author: "Pooja Verma",
        authorUrl: "",
        photo: DEMO_REVIEWER_PHOTOS[4],
        rating: 5,
        text: "Regular customer for threading and cleanup. Always on time and the place feels welcoming every visit.",
        when: "5 months ago",
      },
    ],
  };
}

/**
 * Demo Instagram section (not a live Instagram API feed). Prefers a dedicated
 * photo set per pack; otherwise uses pack gallery/hero (same as before).
 */
export function demoInstagramFeed(doc) {
  const packId = String(doc?.packId || "");
  const dedicated = DEMO_INSTAGRAM_BY_PACK[packId] || [];
  const gallery = doc?.sections?.gallery?.images || [];
  const hero = doc?.sections?.hero?.image;
  const about = doc?.sections?.about?.image;
  const fromPack = [...gallery, hero, about]
    .map((image) => String(image || "").trim())
    .filter(Boolean);

  const source = dedicated.length ? dedicated : fromPack;
  if (!source.length) return null;

  const pics = [...source];
  while (pics.length < 9) pics.push(source[pics.length % source.length]);

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
      image: image.startsWith("http") ? image : `/${image.replace(/^\/+/, "")}`,
      url: `https://www.instagram.com/${username}/`,
      caption: `${APP_SITE_URL.replace(/^https?:\/\//, "")} — sample Instagram for this demo`,
      type: "image",
    })),
  };
}
