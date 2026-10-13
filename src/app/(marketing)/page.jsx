import { RevealOnScroll } from "@/components/sites/reveal";
import { BusinessMarquee } from "@/components/landing/business-marquee";
import { FinalCta, SiteFooter } from "@/components/landing/closing";
import { FAQS, Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { LandingTracker } from "@/components/landing/landing-tracker";
import { Pricing } from "@/components/landing/pricing";
import { SiteHeader } from "@/components/landing/site-header";
import { ThemesShowcase } from "@/components/landing/themes-showcase";
import { WebsiteShowcase } from "@/components/landing/website-showcase";
import { APP_NAME, APP_SITE_URL, PLAY_STORE_URL } from "@/lib/branding";
import { WEBSITE_PLANS } from "@/lib/landing-pricing";
import { jsonLdScript } from "@/lib/sites/seo";

const TITLE = `${APP_NAME} — Bills, UPI payments & your own business website`;
const DESCRIPTION =
  "Free billing app for Indian shops and small businesses. Make bills, share them on WhatsApp, get paid with UPI, track dues and get your own website.";
const OG_IMAGE = { url: "/landing/og.jpg", width: 1200, height: 630, alt: APP_NAME };

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: APP_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
};

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    url: APP_SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Android",
    description: DESCRIPTION,
    installUrl: PLAY_STORE_URL,
    offers: [
      { "@type": "Offer", name: "MoneyKit app", price: "0", priceCurrency: "INR" },
      ...WEBSITE_PLANS.map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} (monthly)`,
        price: String(plan.monthly),
        priceCurrency: "INR",
      })),
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(STRUCTURED_DATA) }} />
      <SiteHeader />
      <main>
        <Hero />
        <BusinessMarquee />
        <Features />
        <WebsiteShowcase />
        <ThemesShowcase />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <RevealOnScroll />
      <LandingTracker />
    </>
  );
}
