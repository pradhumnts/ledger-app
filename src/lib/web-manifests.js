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
  THEME_COLOR,
} from "./branding.js";

export const ADMIN_MANIFEST_PATH = "/manifests/admin";
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

const SHORTCUT_ICONS = [
  {
    src: APP_ICON_192,
    sizes: "192x192",
    type: "image/png",
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

/** Standalone admin dashboard PWA. */
export function adminWebManifest() {
  return {
    id: "/admin",
    lang: "en",
    dir: "ltr",
    name: `${APP_NAME} Admin`,
    short_name: "MK Admin",
    description: `Platform metrics and shop profiles for ${APP_NAME}.`,
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    categories: ["business", "productivity"],
    prefer_related_applications: false,
    related_applications: [],
    icons: APP_ICONS,
    shortcuts: [
      {
        name: "Overview",
        short_name: "Overview",
        url: "/admin",
        icons: SHORTCUT_ICONS,
      },
      {
        name: "Shops",
        short_name: "Shops",
        url: "/admin/businesses",
        icons: SHORTCUT_ICONS,
      },
      {
        name: "Purchases",
        short_name: "Purchases",
        url: "/admin/purchases",
        icons: SHORTCUT_ICONS,
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
