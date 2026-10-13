"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  FREE_FEATURES,
  WEBSITE_PLANS,
  formatRupees,
  monthsFree,
} from "@/lib/landing-pricing";
import { cn } from "@/lib/utils";
import { installHref } from "./primitives";

const YEARLY_SAVING = monthsFree(WEBSITE_PLANS[0]);

function PeriodToggle({ yearly, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      className="relative inline-flex rounded-full bg-white p-1.5 shadow-[0_10px_30px_-12px_rgba(11,48,31,0.25)] ring-1 ring-black/5"
    >
      {[
        { value: false, label: "Monthly" },
        { value: true, label: "Yearly" },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={yearly === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-200",
            yearly === option.value ? "bg-forest text-white" : "text-zinc-600 hover:text-zinc-950",
          )}
        >
          {option.label}
          {option.value ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                yearly ? "bg-lime text-forest" : "bg-lime-soft text-forest",
              )}
            >
              {YEARLY_SAVING} months free
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function FeatureList({ items, dark = false }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-snug">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
              dark ? "bg-lime text-forest" : "bg-lime-soft text-forest",
            )}
          >
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span className={dark ? "text-white/85" : "text-zinc-700"}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Price({ amount, suffix, note, dark }) {
  return (
    <div className="mt-6">
      <p className="flex items-baseline gap-1.5">
        <span className={cn("text-5xl font-semibold tracking-[-0.04em] tabular-nums", dark ? "text-white" : "text-zinc-950")}>
          {amount}
        </span>
        <span className={cn("text-[15px] font-medium", dark ? "text-white/60" : "text-zinc-500")}>{suffix}</span>
      </p>
      <p className={cn("mt-1.5 h-5 text-sm", dark ? "text-lime" : "text-mint")}>{note}</p>
    </div>
  );
}

function CardButton({ children, dark }) {
  return (
    <a
      href={installHref("web-pricing")}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition-[translate,background-color] duration-200 hover:-translate-y-0.5",
        dark ? "bg-lime text-forest" : "bg-zinc-950 text-white hover:bg-black",
      )}
    >
      {children}
    </a>
  );
}

function PlanCard({ plan, yearly }) {
  const dark = Boolean(plan.featured);
  const amount = yearly ? plan.yearly : plan.monthly;
  const perMonth = Math.round(plan.yearly / 12);
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[2rem] p-7 sm:p-8",
        dark
          ? "bg-forest text-white shadow-[0_40px_80px_-30px_rgba(11,48,31,0.7)] lg:-my-4 lg:py-12"
          : "border border-black/[0.06] bg-white shadow-[0_20px_60px_-30px_rgba(11,48,31,0.25)]",
      )}
    >
      {dark ? (
        <>
          <div aria-hidden className="lp-grid pointer-events-none absolute inset-0 rounded-[2rem] opacity-70" />
          <p className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-lime px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-forest shadow-lg">
            <Sparkles className="size-3.5" /> Most popular
          </p>
        </>
      ) : null}
      <div className="relative flex flex-1 flex-col">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        <p className={cn("mt-1 text-sm", dark ? "text-white/65" : "text-zinc-500")}>{plan.tagline}</p>
        <Price
          dark={dark}
          amount={formatRupees(amount)}
          suffix={yearly ? "/year" : "/month"}
          note={yearly ? `Just ${formatRupees(perMonth)} a month` : `Or ${formatRupees(plan.yearly)} a year`}
        />
        <div className={cn("my-7 h-px", dark ? "bg-white/10" : "bg-zinc-100")} />
        {plan.lead ? (
          <p className={cn("mb-3 text-sm font-semibold", dark ? "text-lime" : "text-zinc-950")}>{plan.lead}</p>
        ) : null}
        <FeatureList items={plan.features} dark={dark} />
        <div className="mt-auto">
          <CardButton dark={dark}>Start your website</CardButton>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative overflow-hidden bg-paper py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(200,232,106,0.35),transparent_65%)] blur-2xl"
      />
      <div className="relative mx-auto max-w-6xl px-5">
        <div data-reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-forest/[0.07] px-3 py-1 text-xs font-semibold tracking-wide text-forest">
            <span className="size-1.5 rounded-full bg-mint" /> Pricing
          </p>
          <h2 className="mt-4 text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-zinc-950 sm:text-5xl">
            Billing is free.{" "}
            <span className="inline-block font-display font-normal tracking-normal text-mint italic">
              Websites from less than a{" "}
              <span className="relative isolate inline-block whitespace-nowrap px-[0.08em] text-forest">
                <span
                  aria-hidden
                  className="lp-mark absolute inset-x-[-0.12em] bottom-[0.06em] -z-10 h-[0.5em] -rotate-[1.5deg] rounded-[0.2em] bg-lime"
                />
                cold coffee
              </span>{" "}
              a day.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-zinc-600 sm:text-lg">
            Use MoneyKit for bills, dues and UPI at no cost. Add a website when you’re ready to grow.
          </p>
          <div className="mt-8">
            <PeriodToggle yearly={yearly} onChange={setYearly} />
          </div>
        </div>

        <div data-reveal className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <div className="flex flex-col rounded-[2rem] border border-black/[0.06] bg-white/70 p-7 shadow-[0_20px_60px_-30px_rgba(11,48,31,0.2)] sm:p-8">
            <h3 className="text-lg font-semibold">MoneyKit app</h3>
            <p className="mt-1 text-sm text-zinc-500">Everything to bill and get paid.</p>
            <Price amount="₹0" suffix="forever" note="No card needed" />
            <div className="my-7 h-px bg-zinc-100" />
            <FeatureList items={FREE_FEATURES} />
            <div className="mt-auto">
              <CardButton>Download free</CardButton>
            </div>
          </div>
          {WEBSITE_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} yearly={yearly} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-500">
          Website plans are subscriptions paid inside the app through Google Play. Cancel anytime from Google Play.
        </p>
      </div>
    </section>
  );
}
