import {
  APP_DESCRIPTION,
  APP_ICON_192,
  APP_ICON_512,
  APP_ICON_SVG,
  APP_NAME,
  APP_SHORT_NAME,
  BACKGROUND_COLOR,
  PLAY_PACKAGE_NAME,
  PLAY_STORE_URL,
} from "./branding.js";

export const SHOP_MANIFEST_PATH = "/manifests/shop";

const APP_ICONS = [
  {
    src: APP_ICON_SVG,
    sizes: "any",
    type: "image/svg+xml",
    purpose: "any",
  },
  {
    src: APP_ICON_192,
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: APP_ICON_512,
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: APP_ICON_512,
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

function playPackageName() {
  return process.env.NEXT_PUBLIC_PLAY_PACKAGE_NAME || PLAY_PACKAGE_NAME;
}

/** Marketing site identity — not an installable shop app. */
export function shopWebManifest() {
  const playPackage = playPackageName();
  const iarcRatingId = String(
    process.env.NEXT_PUBLIC_IARC_RATING_ID || ""
  ).trim();

  return {
    id: "/",
    lang: "en",
    dir: "ltr",
    name: `${APP_NAME} — Simple billing for India`,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "browser",
    display_override: ["browser"],
    background_color: BACKGROUND_COLOR,
    theme_color: BACKGROUND_COLOR,
    categories: ["business", "finance", "productivity"],
    ...(iarcRatingId ? { iarc_rating_id: iarcRatingId } : {}),
    prefer_related_applications: true,
    related_applications: playPackage
      ? [
          {
            platform: "play",
            id: playPackage,
            url: PLAY_STORE_URL,
          },
        ]
      : [],
    icons: APP_ICONS,
    shortcuts: [],
    screenshots: [
      {
        src: "/screenshots/home-screen.png",
        sizes: "941x1672",
        type: "image/png",
        form_factor: "narrow",
        label: "Home — today’s totals and recent activity",
      },
      {
        src: "/screenshots/customers.png",
        sizes: "941x1672",
        type: "image/png",
        form_factor: "narrow",
        label: "Customers and outstanding dues",
      },
      {
        src: "/screenshots/create-bill.png",
        sizes: "941x1672",
        type: "image/png",
        form_factor: "narrow",
        label: "Create a bill in seconds",
      },
      {
        src: "/screenshots/bill-track-collect.png",
        sizes: "941x1672",
        type: "image/png",
        form_factor: "narrow",
        label: "Track leftover due and collect",
      },
      {
        src: "/screenshots/themes.png",
        sizes: "941x1672",
        type: "image/png",
        form_factor: "narrow",
        label: "Bill and QR themes for your shop",
      },
    ],
  };
}

export function manifestResponse(manifest) {
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
