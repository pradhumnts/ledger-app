import { Cormorant_Garamond, Geist } from "next/font/google";
import "./sites.css";

const sans = Geist({
  variable: "--font-site-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-site-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function SitesLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
