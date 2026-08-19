"use client";

import Link from "next/link";
import {
  CalendarDays,
  Eye,
  FileText,
  Home,
  IndianRupee,
  MessageCircle,
  QrCode,
  Receipt,
  Settings,
  Store,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { APP_NAME, APP_TAGLINE, SUPPORT_WHATSAPP } from "@/lib/branding";
import { openWhatsApp } from "@/lib/share";
import { cn } from "@/lib/utils";

const TAGS = ["#Shopkeepers", "#Salons", "#Clinics", "#Tutors", "#Retail"];

const MARQUEE_TOP = [
  { kind: "image", src: "/landing/landing-kirana.jpg", alt: "Kirana shop" },
  { kind: "icon", icon: FileText, label: "Create bill", tone: "lime" },
  {
    kind: "scene",
    title: "Collect due",
    amount: "₹2,400",
    className: "from-[#0b301f] via-[#1f8a4c] to-[#c8e86a]",
  },
  { kind: "image", src: "/landing/landing-upi.jpg", alt: "UPI payment" },
  { kind: "icon", icon: QrCode, label: "UPI QR", tone: "forest" },
  { kind: "image", src: "/landing/landing-whatsapp.jpg", alt: "Share on WhatsApp" },
  { kind: "icon", icon: MessageCircle, label: "Send bill", tone: "mint" },
];

const MARQUEE_BOTTOM = [
  { kind: "icon", icon: Wallet, label: "Deposit due", tone: "mint" },
  { kind: "image", src: "/landing/landing-shop.jpg", alt: "Local shop" },
  {
    kind: "scene",
    title: "Today’s bills",
    amount: "₹12,500",
    className: "from-[#0b301f] to-[#c8e86a]",
  },
  { kind: "icon", icon: Users, label: "Customers", tone: "lime" },
  { kind: "image", src: "/landing/landing-market.jpg", alt: "Market stall" },
  { kind: "icon", icon: Store, label: "Your shop", tone: "forest" },
  { kind: "image", src: "/landing/landing-ledger.jpg", alt: "Writing a bill" },
  { kind: "icon", icon: Receipt, label: "Shop receipt", tone: "mint" },
];

const DEMO_ACTIVITY = [
  { name: "Rajesh Yogi", amount: "₹8,000", type: "bill" },
  { name: "Ananya", amount: "₹2,500", type: "paid" },
  { name: "Kiran Stores", amount: "₹1,200", type: "due" },
];

function toneClasses(tone) {
  if (tone === "forest") {
    return "bg-[var(--forest)] text-[var(--lime)]";
  }
  if (tone === "mint") {
    return "bg-[#e8f6ee] text-[var(--mint)]";
  }
  return "bg-[var(--lime)] text-[var(--forest)]";
}

const CARD_SHELL =
  "h-[7.15rem] w-[7.15rem] shrink-0 rounded-[1.35rem] shadow-[0_10px_24px_rgba(11,48,31,0.12)] sm:h-[7.6rem] sm:w-[7.6rem]";

function MarqueeCard({ card }) {
  if (card.kind === "image") {
    return (
      <div className={CARD_SHELL}>
        <div className="size-full overflow-hidden rounded-[1.35rem]">
          <img
            src={card.src}
            alt={card.alt}
            className="size-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  if (card.kind === "scene") {
    return (
      <div className={CARD_SHELL}>
        <div
          className={cn(
            "relative size-full overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-3 text-white",
            card.className
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_42%)]" />
          <p className="relative text-[10px] font-medium text-white/80">{card.title}</p>
          <p className="relative mt-5 text-lg font-semibold tracking-tight">{card.amount}</p>
        </div>
      </div>
    );
  }

  const Icon = card.icon;
  return (
    <div
      className={cn(
        CARD_SHELL,
        "flex flex-col items-center justify-center border border-black/[0.04] bg-white"
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl",
          toneClasses(card.tone)
        )}
      >
        <Icon className="size-5" strokeWidth={2.1} />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-zinc-800">{card.label}</p>
    </div>
  );
}

function MarqueeRow({ cards, reverse = false }) {
  return (
    <div className={cn("flex w-max", reverse ? "mk-marquee-reverse" : "mk-marquee")}>
      {[0, 1].map((copy) => (
        <div key={copy} className="flex items-center gap-2.5 pr-2.5">
          {cards.map((card, index) => (
            <div
              key={`${copy}-${card.alt || card.label || card.title}-${index}`}
              className={index % 2 === 0 ? "-translate-y-1.5" : "translate-y-1.5"}
            >
              <MarqueeCard card={card} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PhoneHomePreview() {
  return (
    <div className="relative mx-auto h-[34rem] w-[17.4rem] sm:h-[38rem] sm:w-[19.2rem]">
      <div className="absolute inset-0 rounded-[2.6rem] bg-zinc-800 shadow-[0_40px_80px_rgba(11,48,31,0.22)]" />
      <div className="absolute inset-[3px] overflow-hidden rounded-[2.4rem] bg-[#f4f5f3] text-zinc-950">
        <div className="mx-auto mt-2 h-[1.15rem] w-[5.5rem] rounded-full bg-zinc-900" />
        <div className="h-full overflow-hidden px-3.5 pt-3 pb-14">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[1.35rem] leading-tight font-semibold tracking-tight">
                Good evening.
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500">Your money today.</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm">
              <QrCode className="size-5 text-[var(--forest)]" />
            </div>
          </div>

          <div className="mt-3 rounded-[1.35rem] border border-black/[0.04] bg-white p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-[var(--forest)] text-[10px] font-bold text-white">
                MB
              </div>
              <p className="text-[11px] font-medium text-zinc-700">Meera’s Boutique</p>
              <Eye className="size-3 text-zinc-400" />
            </div>
            <p className="text-[11px] font-medium text-zinc-500">Total today</p>
            <p className="mt-0.5 text-[1.85rem] leading-none font-semibold tracking-tight tabular-nums">
              ₹12,500
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <div className="inline-flex items-center justify-center gap-1 rounded-full bg-[var(--forest)] py-2 text-[10px] font-semibold text-white">
                <UserPlus className="size-3" />
                Customer
              </div>
              <div className="inline-flex items-center justify-center gap-1 rounded-full bg-[var(--lime)] py-2 text-[10px] font-semibold text-[var(--forest)]">
                <FileText className="size-3" />
                Create bill
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className="rounded-xl bg-zinc-50 px-2.5 py-2">
                <div className="mb-1 flex items-center gap-1 text-[9px] text-zinc-500">
                  <IndianRupee className="size-2.5" />
                  Due today
                </div>
                <p className="text-sm font-semibold tabular-nums">₹4,200</p>
              </div>
              <div className="rounded-xl bg-zinc-50 px-2.5 py-2">
                <div className="mb-1 flex items-center gap-1 text-[9px] text-zinc-500">
                  <CalendarDays className="size-2.5" />
                  This month
                </div>
                <p className="text-sm font-semibold tabular-nums">₹86,400</p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] font-semibold text-zinc-950">Recent activity</p>
          <div className="mt-1.5 overflow-hidden rounded-[1.2rem] border border-black/[0.04] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            {DEMO_ACTIVITY.map((row, index) => (
              <div
                key={row.name}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2",
                  index > 0 && "border-t border-zinc-100"
                )}
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-semibold text-zinc-600">
                  {row.name.slice(0, 1)}
                </div>
                <p className="min-w-0 flex-1 truncate text-[11px] font-semibold">
                  {row.name}
                </p>
                <p
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    row.type === "paid" ? "text-[var(--mint)]" : "text-zinc-950"
                  )}
                >
                  {row.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-2 bottom-2">
          <div className="flex items-center justify-between rounded-[1.2rem] border border-black/5 bg-white/95 px-1.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: Users, label: "Customers" },
              { icon: Settings, label: "Settings" },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5",
                  active && "bg-[var(--forest)] text-white"
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                <span className={cn("text-[8px] font-medium", !active && "text-zinc-400")}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketingLanding() {

  return (
    <div className="marketing-landing fixed inset-0 z-[200] isolate overflow-x-clip overflow-y-auto bg-[#f3f4f1] text-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.95),transparent_70%)]"
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.05] bg-white/90 py-1.5 pl-1.5 pr-4 shadow-[0_8px_24px_rgba(11,48,31,0.06)] backdrop-blur-sm">
            <MoneyKitLogo size={32} priority className="rounded-[0.9rem]" />
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight">{APP_NAME}</p>
              <p className="text-[11px] font-medium text-zinc-500">{APP_TAGLINE}</p>
            </div>
          </div>
        </header>

        <h1 className="mx-auto mt-7 max-w-[22rem] text-center text-[1.85rem] leading-[1.15] font-semibold tracking-tight sm:max-w-[28rem] sm:text-[2.35rem]">
          Keep bills, dues and UPI QR simple for your shop.
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-500">
          Used by shopkeepers to collect faster.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-200/80 px-2.5 py-1 text-[11px] font-medium text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="relative mt-8 flex min-h-[22rem] flex-1 items-center justify-center sm:min-h-[26rem]">
          <div
            className="pointer-events-none absolute inset-x-[-24%] top-1/2 flex -translate-y-1/2 flex-col gap-3 overflow-hidden py-10"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <MarqueeRow cards={MARQUEE_TOP} />
            <MarqueeRow cards={MARQUEE_BOTTOM} reverse />
          </div>
          <div className="relative z-10">
            <PhoneHomePreview />
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-4 max-w-md text-center">
          <p className="text-sm font-medium text-zinc-700">
            ★ Built for Indian shops · UPI ready
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Add customers, create bills in seconds, track leftover due, and share over
            WhatsApp — using the apps already on your phone.
          </p>
          <div className="mx-auto mt-5 max-w-xs">
            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white"
            >
              Get it on Android
            </button>
            <button
              type="button"
              onClick={() =>
                openWhatsApp({
                  phone: SUPPORT_WHATSAPP,
                  text: "Hi MoneyKit team,\n\nPlease notify me when the Android app is on the Play Store.",
                })
              }
              className="mt-2 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
            >
              Coming soon — notify me on WhatsApp
            </button>
          </div>
          <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-zinc-400">
            <Link href="/privacy" className="transition-colors hover:text-zinc-700">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="transition-colors hover:text-zinc-700">
              Terms of Service
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
