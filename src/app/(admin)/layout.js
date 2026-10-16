import { Geist } from "next/font/google";
import {
  APP_APPLE_TOUCH_ICON,
  APP_ICON_SVG,
  APP_NAME,
  APP_SITE_URL,
} from "@/lib/branding";
import "../(app)/globals.css";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(APP_SITE_URL),
  title: {
    default: `Admin · ${APP_NAME}`,
    template: `%s · Admin · ${APP_NAME}`,
  },
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: APP_ICON_SVG, type: "image/svg+xml" }],
    apple: [{ url: APP_APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b301f",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-dvh bg-[#f4f5f3] font-sans text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
