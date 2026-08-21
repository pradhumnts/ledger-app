import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/app-provider";
import { LandingGateProvider } from "@/context/landing-gate";
import { AppShell } from "@/components/app-shell";
import { APP_COLOR_SCHEME_BOOT_SCRIPT } from "@/lib/app-color-scheme";
import { INSTALLED_APP_BOOT_SCRIPT } from "@/lib/installed-app";
import {
  APP_APPLE_TOUCH_ICON,
  APP_DESCRIPTION,
  APP_ICON_SVG,
  APP_NAME,
  APP_SITE_URL,
  APP_TAGLINE,
  BACKGROUND_COLOR,
} from "@/lib/branding";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(APP_SITE_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: APP_ICON_SVG, type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: APP_APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }],
    shortcut: APP_ICON_SVG,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  // Advertise both so Android Chrome will not auto-invert a light shop UI.
  // JS sets the used scheme (light vs dark) from the in-app toggle.
  colorScheme: "light dark",
  themeColor: BACKGROUND_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: APP_COLOR_SCHEME_BOOT_SCRIPT }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{ __html: INSTALLED_APP_BOOT_SCRIPT }}
        />
        {process.env.NODE_ENV === "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js");`,
            }}
          />
        ) : null}
        <AppProvider>
          <LandingGateProvider>
            <AppShell>{children}</AppShell>
          </LandingGateProvider>
        </AppProvider>
      </body>
    </html>
  );
}
