import {
  APP_DESCRIPTION,
  APP_ICON_192,
  APP_ICON_512,
  APP_ICON_SPLASH_192,
  APP_ICON_SPLASH_512,
  APP_ICON_SVG,
  APP_NAME,
  APP_SHORT_NAME,
  BACKGROUND_COLOR,
  PLAY_PACKAGE_NAME,
  THEME_COLOR,
} from "@/lib/branding";

const SHORTCUT_ICONS = [
  {
    src: APP_ICON_192,
    sizes: "192x192",
    type: "image/png",
  },
];

export default function manifest() {
  const playPackage =
    process.env.NEXT_PUBLIC_PLAY_PACKAGE_NAME || PLAY_PACKAGE_NAME;

  return {
    id: "/",
    lang: "en",
    dir: "ltr",
    name: `${APP_NAME} — Simple billing for India`,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait",
    // Android 12+ / TWA splash uses this behind the launcher icon.
    // Forest matches our web splash so users don't get a gray "huge logo" screen first.
    background_color: THEME_COLOR,
    // Default OS chrome (status + nav). Splash briefly switches this to forest via JS.
    theme_color: BACKGROUND_COLOR,
    categories: ["business", "finance", "productivity"],
    prefer_related_applications: false,
    related_applications: playPackage
      ? [
          {
            platform: "play",
            id: playPackage,
            url: `https://play.google.com/store/apps/details?id=${playPackage}`,
          },
        ]
      : [],
    icons: [
      {
        src: APP_ICON_SPLASH_192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_ICON_SPLASH_512,
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
    ],
    shortcuts: [
      {
        name: "Customers",
        short_name: "Customers",
        url: "/customers",
        icons: SHORTCUT_ICONS,
      },
      {
        name: "Receive payment",
        short_name: "Pay QR",
        url: "/pay",
        icons: SHORTCUT_ICONS,
      },
      {
        name: "Create bill",
        short_name: "Bill",
        url: "/invoice/new",
        icons: SHORTCUT_ICONS,
      },
    ],
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
