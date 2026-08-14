import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/app-provider";
import { AppShell } from "@/components/app-shell";
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
  title: "Ledger — Simple billing for India",
  description:
    "Super simple customer khata, bills, and activity for Indian businesses.",
  applicationName: "Ledger",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ledger",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b301f" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0f0d" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased`}
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
