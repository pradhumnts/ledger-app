import Link from "next/link";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { APP_NAME } from "@/lib/branding";
import { installHref } from "./primitives";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#website", label: "Website" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-forest-deep/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} home`}>
          <MoneyKitLogo size={34} priority className="rounded-[0.7rem]" />
          <span className="text-[17px] font-semibold tracking-tight text-white">{APP_NAME}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={installHref("web-nav")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-full bg-lime px-4 text-sm font-semibold text-forest transition-transform duration-200 hover:-translate-y-0.5"
        >
          Get the app
        </a>
      </div>
    </header>
  );
}
