import { CheckCheck, Globe, IndianRupee, Languages, ShieldCheck } from "lucide-react";
import { PhoneFrame, PlayButton } from "./primitives";

const delay = (ms) => ({ "--enter-delay": `${ms}ms` });

function FloatCard({ className, float = "lp-float", enterDelay, children }) {
  return (
    <div className={`lp-enter-pop absolute z-20 ${className}`} style={delay(enterDelay)}>
      <div
        className={`${float} flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white/95 px-3.5 py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur`}
      >
        {children}
      </div>
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
          <p
            className="lp-enter inline-flex items-center gap-2.5 rounded-full border border-lime/25 bg-lime/10 py-1.5 pr-4 pl-2 text-[13px] font-medium text-lime"
            style={delay(0)}
          >
            <span className="lp-pulse-dot size-2 rounded-full bg-lime" />
            For shops &amp; small businesses across India
          </p>

          <h1 className="mt-6 text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.04em] text-balance sm:text-7xl">
            <span className="lp-enter inline-block" style={delay(120)}>
              Bills, payments
            </span>{" "}
            <span
              className="lp-enter inline-block font-display font-normal tracking-normal text-lime italic"
              style={delay(280)}
            >
              &amp; your own website.
            </span>
          </h1>

          <p
            className="lp-enter mt-6 max-w-xl text-base leading-relaxed text-pretty text-white/70 sm:text-lg"
            style={delay(440)}
          >
            Make a bill in seconds, send it on WhatsApp, get paid with UPI and put your business
            online. One simple app, made for Indian businesses.
          </p>

          <div className="lp-enter mt-8 flex flex-col items-center gap-3 sm:flex-row" style={delay(560)}>
            <PlayButton tag="web-hero" />
            <a
              href="#pricing"
              className="inline-flex h-14 items-center rounded-2xl border border-white/15 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.06]"
            >
              Get your website
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-white/60">
            {TRUST.map(({ icon: Icon, label }, index) => (
              <li key={label} className="lp-enter inline-flex items-center gap-1.5" style={delay(680 + index * 80)}>
                <Icon className="size-4 text-lime" strokeWidth={2} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto mt-14 h-[25rem] max-w-4xl sm:mt-16 sm:h-[34rem]">
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_58%,transparent_94%)]">
            <PhoneFrame
              src="/landing/app/bill.webp"
              alt="A bill ready to share on WhatsApp"
              sizes="(min-width: 640px) 240px, 160px"
              className="lp-enter-fan absolute top-16 left-[calc(50%-15.5rem)] hidden w-[13.5rem] -rotate-[8deg] opacity-90 sm:block md:left-[calc(50%-19rem)] md:w-[15rem]"
              style={{ ...delay(850), "--fan-x": "60%", "--fan-r": "8deg" }}
            />
            <PhoneFrame
              src="/landing/app/website.webp"
              alt="Your website editor in the app"
              sizes="(min-width: 640px) 240px, 160px"
              className="lp-enter-fan absolute top-16 right-[calc(50%-15.5rem)] hidden w-[13.5rem] rotate-[8deg] opacity-90 sm:block md:right-[calc(50%-19rem)] md:w-[15rem]"
              style={{ ...delay(850), "--fan-x": "-60%", "--fan-r": "-8deg" }}
            />
            <PhoneFrame
              src="/landing/app/home.webp"
              alt="MoneyKit home screen with today's total"
              priority
              sizes="(min-width: 640px) 300px, 230px"
              className="lp-enter-phone absolute top-0 left-1/2 z-10 w-[14.5rem] -translate-x-1/2 sm:w-[17.5rem]"
              style={delay(520)}
            />
          </div>

          <FloatCard className="top-24 left-0 sm:top-40 sm:left-[4%] md:left-[2%]" enterDelay={1150}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-lime text-forest">
              <IndianRupee className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium text-zinc-500">Received via UPI</span>
              <span className="block text-base font-semibold text-zinc-950 tabular-nums">₹2,450</span>
            </span>
          </FloatCard>

          <FloatCard
            className="top-52 right-0 sm:top-72 sm:right-[3%] md:right-[1%]"
            float="lp-float-slow"
            enterDelay={1350}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#25d366] text-white">
              <CheckCheck className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium text-zinc-500">Bill sent on WhatsApp</span>
              <span className="block text-[13px] font-semibold text-zinc-950">Meena Textiles · ₹3,850</span>
            </span>
          </FloatCard>

          <FloatCard className="top-6 right-2 hidden md:right-[6%] md:block" enterDelay={1550}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-forest text-lime">
              <Globe className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium text-zinc-500">Your website is live</span>
              <span className="block text-[13px] font-semibold text-zinc-950">sharma-beauty.moneykit.site</span>
            </span>
          </FloatCard>
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
