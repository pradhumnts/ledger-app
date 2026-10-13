import Link from "next/link";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { APP_NAME, APP_TAGLINE, SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/branding";
import { PhoneFrame, PlayButton } from "./primitives";

const WHATSAPP_URL = `https://wa.me/91${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
  "Hi MoneyKit team,\n\nI have a question about the app.",
)}`;

export function FinalCta() {
  return (
    <section className="bg-cream px-5 pb-24 sm:pb-32">
      <div
        data-reveal
        className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-forest px-7 pt-14 text-white sm:px-14 sm:pt-16 lg:pb-16"
      >
        <div aria-hidden className="lp-grid absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="absolute -top-1/2 right-[-10%] -z-10 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(200,232,106,0.28),transparent_65%)] blur-2xl"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-xl">
            <h2 className="text-[2.3rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
              Your next bill,{" "}
              <span className="font-display font-normal tracking-normal text-lime italic">done in seconds.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              Download MoneyKit free, add your first customer and send a bill before your chai gets cold.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <PlayButton tag="web-cta" />
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                <WhatsAppIcon className="size-5 text-[#25d366]" />
                Questions? Chat with us
              </a>
            </div>
          </div>
          <div className="relative mx-auto h-[20rem] w-[15rem] sm:h-[24rem] lg:h-[26rem] lg:w-[17rem]">
            <PhoneFrame
              src="/landing/app/tools.webp"
              alt="Tools for your business in MoneyKit"
              sizes="272px"
              className="absolute top-0 left-0 w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#website", label: "Website" },
      { href: "#pricing", label: "Pricing" },
      { href: "/site-preview?template=glow&pack=beauty", label: "Demo website" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/partner", label: "Partner program" },
      { href: WHATSAPP_URL, label: "WhatsApp support", external: true },
      { href: `mailto:${SUPPORT_EMAIL}`, label: SUPPORT_EMAIL },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-forest-deep pb-[max(2.5rem,env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto max-w-6xl px-5 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <MoneyKitLogo size={36} className="rounded-[0.75rem]" />
              <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              {APP_TAGLINE}. Bills, UPI payments and your own website, made for Indian businesses.
            </p>
          </div>
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold tracking-[0.16em] text-white/40 uppercase">{group.title}</p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-sm text-white/70 transition-colors hover:text-lime"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Made in India, for India.</p>
        </div>
      </div>
    </footer>
  );
}
