import { CheckCheck, Globe, IndianRupee, Languages, ShieldCheck } from "lucide-react";
import { PhoneFrame, PlayButton } from "./primitives";

function FloatCard({ className, children }) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white/95 px-3.5 py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

const TRUST = [
  { icon: ShieldCheck, label: "Billing is free" },
  { icon: Languages, label: "English, हिन्दी & Hinglish" },
  { icon: IndianRupee, label: "Works with every UPI app" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-forest-deep text-white">
      <div aria-hidden className="lp-grid absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute top-[-20%] left-1/2 -z-10 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,138,76,0.55),transparent_62%)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute right-[-10%] bottom-[-30%] -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(200,232,106,0.18),transparent_65%)] blur-2xl"
      />

      <div className="mx-auto max-w-6xl px-5 pt-14 pb-0 sm:pt-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-lime/25 bg-lime/10 py-1.5 pr-4 pl-2 text-[13px] font-medium text-lime">
            <span className="lp-pulse-dot size-2 rounded-full bg-lime" />
            For shops &amp; small businesses across India
          </p>

          <h1 className="mt-6 text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.04em] text-balance sm:text-7xl">
            Bills, payments{" "}
            <span className="font-display font-normal tracking-normal text-lime italic">&amp; your own website.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-white/70 sm:text-lg">
            Make a bill in seconds, send it on WhatsApp, get paid with UPI and put your business
            online. One simple app, made for Indian businesses.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <PlayButton tag="web-hero" />
            <a
              href="#pricing"
              className="inline-flex h-14 items-center rounded-2xl border border-white/15 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.06]"
            >
              See pricing
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-white/60">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-4 text-lime" strokeWidth={2} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto mt-14 h-[25rem] max-w-4xl sm:mt-16 sm:h-[34rem]">
          <PhoneFrame
            src="/landing/app/bill.webp"
            alt="A bill ready to share on WhatsApp"
            sizes="(min-width: 640px) 240px, 160px"
            className="absolute top-16 left-[calc(50%-15.5rem)] hidden w-[13.5rem] -rotate-[8deg] opacity-90 sm:block md:left-[calc(50%-19rem)] md:w-[15rem]"
          />
          <PhoneFrame
            src="/landing/app/website.webp"
            alt="Your website editor in the app"
            sizes="(min-width: 640px) 240px, 160px"
            className="absolute top-16 right-[calc(50%-15.5rem)] hidden w-[13.5rem] rotate-[8deg] opacity-90 sm:block md:right-[calc(50%-19rem)] md:w-[15rem]"
          />
          <PhoneFrame
            src="/landing/app/home.webp"
            alt="MoneyKit home screen with today's total"
            priority
            sizes="(min-width: 640px) 300px, 230px"
            className="absolute top-0 left-1/2 z-10 w-[14.5rem] -translate-x-1/2 sm:w-[17.5rem]"
          />

          <FloatCard className="lp-float top-24 left-0 sm:top-40 sm:left-[4%] md:left-[2%]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-lime text-forest">
              <IndianRupee className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium text-zinc-500">Received via UPI</span>
              <span className="block text-base font-semibold text-zinc-950 tabular-nums">₹2,450</span>
            </span>
          </FloatCard>

          <FloatCard className="lp-float-slow top-52 right-0 sm:top-72 sm:right-[3%] md:right-[1%]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#25d366] text-white">
              <CheckCheck className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium text-zinc-500">Bill sent on WhatsApp</span>
              <span className="block text-[13px] font-semibold text-zinc-950">Meena Textiles · ₹3,850</span>
            </span>
          </FloatCard>

          <FloatCard className="lp-float top-6 right-2 hidden md:flex md:right-[6%]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-forest text-lime">
              <Globe className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium text-zinc-500">Your website is live</span>
              <span className="block text-[13px] font-semibold text-zinc-950">sharma-beauty.moneykit.site</span>
            </span>
          </FloatCard>

          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-t from-forest-deep via-forest-deep/80 to-transparent"
          />
        </div>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="relative z-30 -mt-px block h-10 w-full fill-paper sm:h-16"
      >
        <path d="M0 64V40C240 8 480 0 720 0s480 8 720 40v24H0Z" />
      </svg>
    </section>
  );
}
