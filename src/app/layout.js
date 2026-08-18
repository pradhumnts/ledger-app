import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/app-provider";
import { LandingGateProvider } from "@/context/landing-gate";
import { AppShell } from "@/components/app-shell";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BACKGROUND_COLOR },
    { media: "(prefers-color-scheme: dark)", color: "#090b0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
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
