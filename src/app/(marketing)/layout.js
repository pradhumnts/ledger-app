import { Geist, Instrument_Serif } from "next/font/google";
import { PostHogProvider } from "@/components/posthog-provider";
import {
  APP_APPLE_TOUCH_ICON,
  APP_ICON_SVG,
  APP_NAME,
  APP_SITE_URL,
  THEME_COLOR,
} from "@/lib/branding";
import "./landing.css";

const sans = Geist({
  variable: "--font-landing-sans",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-landing-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata = {
  metadataBase: new URL(APP_SITE_URL),
  applicationName: APP_NAME,
  icons: {
    icon: [
      { url: APP_ICON_SVG, type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: APP_APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }],
    shortcut: APP_ICON_SVG,
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: THEME_COLOR,
  colorScheme: "light",
};

export default function MarketingLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
