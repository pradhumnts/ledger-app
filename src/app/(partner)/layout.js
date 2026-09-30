import { Geist } from "next/font/google";
import { APP_ICON_SVG, APP_SITE_URL, BACKGROUND_COLOR } from "@/lib/branding";
import "../(app)/globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(APP_SITE_URL),
  title: "MoneyKit Partners",
  description: "Track installs, subscriptions and payouts from your MoneyKit referral code.",
  icons: { icon: APP_ICON_SVG },
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: BACKGROUND_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function PartnerLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} min-h-full bg-[#f4f5f3] font-sans text-[#0a0a0a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
