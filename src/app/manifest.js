import {
  APP_DESCRIPTION,
  APP_ICON_192,
  APP_ICON_512,
  APP_ICON_SVG,
  APP_NAME,
  APP_SHORT_NAME,
  BACKGROUND_COLOR,
  PLAY_PACKAGE_NAME,
  THEME_COLOR,
} from "@/lib/branding";

export default function manifest() {
  const playPackage =
    process.env.NEXT_PUBLIC_PLAY_PACKAGE_NAME || PLAY_PACKAGE_NAME;

  return {
    id: "/",
    name: `${APP_NAME} — Simple billing for India`,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
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
    ],
    shortcuts: [
      {
        name: "Customers",
        short_name: "Customers",
        url: "/customers",
      },
      {
        name: "Receive payment",
        short_name: "Pay QR",
        url: "/pay",
      },
      {
        name: "Create bill",
        short_name: "Bill",
        url: "/invoice/new",
      },
    ],
  };
}
