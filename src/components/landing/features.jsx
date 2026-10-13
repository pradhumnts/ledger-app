import Image from "next/image";
import { BellRing, FileText, Languages, Mic, QrCode, Send, UserPlus } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./primitives";

function Card({ className, children, delay = 0 }) {
  return (
    <div
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white p-7 shadow-[0_20px_60px_-30px_rgba(11,48,31,0.25)] sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardTitle({ icon: Icon, title, body, tone = "light" }) {
  return (
    <div className="relative z-10">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl",
          tone === "light" ? "bg-lime-soft text-forest" : "bg-lime text-forest",
        )}
      >
        <Icon className="size-5" strokeWidth={2.1} />
      </span>
      <h3
        className={cn(
          "mt-5 text-2xl font-semibold tracking-tight",
          tone === "light" ? "text-zinc-950" : "text-white",
        )}
      >
        {title}
      </h3>
      <p className={cn("mt-2 text-[15px] leading-relaxed", tone === "light" ? "text-zinc-600" : "text-white/70")}>
        {body}
      </p>
    </div>
  );
}

function BillMock() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem]">
      <div className="rotate-[2deg] rounded-[1.4rem] bg-white p-5 text-zinc-950 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-lime text-forest">
            <FileText className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide uppercase">Sharma Electricals</p>
            <p className="text-xs text-zinc-500">Bill #1048 · 17 Aug</p>
          </div>
        </div>
        <div className="my-4 border-t border-dashed border-zinc-200" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-500">Total</span>
          <span className="text-2xl font-semibold tabular-nums">₹3,850</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm text-zinc-500">Due</span>
          <span className="text-lg font-semibold text-mint tabular-nums">₹850</span>
        </div>
      </div>
      <div className="-mt-3 ml-auto flex w-max -rotate-[2deg] items-center gap-2.5 rounded-full bg-[#25d366] py-3 pr-5 pl-3 text-sm font-semibold text-white shadow-[0_20px_40px_-12px_rgba(37,211,102,0.6)]">
        <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
          <WhatsAppIcon className="size-4" />
        </span>
        Share on WhatsApp
      </div>
    </div>
  );
}

const UPI_APPS = [
  { src: "/google-pay.png", alt: "Google Pay" },
  { src: "/phone-pe.png", alt: "PhonePe" },
  { src: "/paytm.png", alt: "Paytm" },
];

function QrMock() {
  return (
    <div className="mt-7 flex items-center gap-4">
      <div className="grid size-28 shrink-0 grid-cols-7 gap-[3px] rounded-2xl bg-white p-3 shadow-[0_12px_30px_-12px_rgba(11,48,31,0.35)] ring-1 ring-black/5">
        {QR_CELLS.map((on, index) => (
          <span key={index} className={cn("rounded-[2px]", on ? "bg-forest" : "bg-transparent")} />
        ))}
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500">Scan with any UPI app</p>
        <div className="mt-2.5 flex items-center gap-2">
          {UPI_APPS.map((app) => (
            <span
              key={app.alt}
              className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5"
            >
              <Image src={app.src} alt={app.alt} width={24} height={24} className="size-6 object-contain" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// A 7×7 pattern that reads as a QR code at a glance.
const QR_CELLS = [
  1, 1, 1, 0, 1, 1, 1,
  1, 0, 1, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1,
  0, 1, 0, 1, 0, 1, 0,
  1, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1,
  1, 1, 1, 0, 1, 1, 0,
].map(Boolean);

const DUES = [
  { name: "Ritu Sharma", note: "2 bills", amount: "₹1,200" },
  { name: "Kiran Stores", note: "Since 12 Aug", amount: "₹4,250" },
  { name: "Ayaan Mobile", note: "1 bill", amount: "₹850" },
];

function DuesMock() {
  return (
    <div className="mt-7 space-y-2">
      {DUES.map((row) => (
        <div key={row.name} className="flex items-center gap-3 rounded-2xl bg-paper px-3.5 py-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-forest ring-1 ring-black/5">
            {row.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-zinc-900">{row.name}</p>
            <p className="text-xs text-zinc-500">{row.note}</p>
          </div>
          <p className="text-sm font-semibold text-amber-600 tabular-nums">{row.amount}</p>
        </div>
      ))}
      <p className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-xs font-medium text-lime">
        <BellRing className="size-3.5" /> Reminder at 3 PM: 3 old dues
      </p>
    </div>
  );
}

const WAVE = [10, 18, 30, 22, 38, 26, 44, 30, 20, 34, 24, 14, 28, 18, 10];

function VoiceMock() {
  return (
    <div className="mt-7 flex items-center gap-4 rounded-2xl bg-paper p-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
        <Mic className="size-5" />
      </span>
      <div className="flex h-11 flex-1 items-center gap-[3px]">
        {WAVE.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-full bg-mint/70"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function LanguagesMock() {
  return (
    <div className="mt-7 flex flex-wrap gap-2">
      {[
        { text: "Create bill", lang: "English" },
        { text: "बिल बनाएं", lang: "हिन्दी" },
        { text: "Bill banao", lang: "Hinglish" },
      ].map((item) => (
        <span key={item.lang} className="rounded-2xl bg-paper px-4 py-2.5">
          <span className="block text-[15px] font-semibold text-zinc-900">{item.text}</span>
          <span className="block text-[11px] font-medium text-zinc-500">{item.lang}</span>
        </span>
      ))}
    </div>
  );
}

const STEPS = [
  { icon: UserPlus, title: "Add a customer", body: "Just a name and phone, or pick from your contacts." },
  { icon: FileText, title: "Create the bill", body: "Amount, what's still due and a note. That's it." },
  { icon: Send, title: "Share and get paid", body: "Send it on WhatsApp with your UPI QR to pay." },
];

export function Features() {
  return (
    <section id="features" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Billing that keeps up with you"
          title="Everything your counter needs,"
          accent="nothing it doesn't."
          body="No accounting words, no setup. If you can send a WhatsApp message, you can run your shop's money on MoneyKit."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <Card className="border-0 bg-forest md:col-span-2">
            <div aria-hidden className="lp-grid absolute inset-0 opacity-60" />
            <div className="relative grid items-center gap-10 sm:grid-cols-[1fr_auto]">
              <CardTitle
                tone="dark"
                icon={FileText}
                title="Create. Share. Get paid."
                body="Make a bill in seconds and send it on WhatsApp, SMS or as a PDF. Your customer sees the total, what's due and a button to pay by UPI."
              />
              <BillMock />
            </div>
          </Card>

          <Card delay={80}>
            <CardTitle
              icon={QrCode}
              title="Get paid by UPI"
              body="Your own payment QR, ready to show at the counter or inside every bill. Money goes straight to your bank."
            />
            <QrMock />
          </Card>

          <Card>
            <CardTitle
              icon={BellRing}
              title="Never forget a due"
              body="See who owes you at a glance. MoneyKit reminds you about old dues and bills you haven't sent yet."
            />
            <DuesMock />
          </Card>

          <Card delay={80}>
            <CardTitle
              icon={Mic}
              title="Type by speaking"
              body="Too busy to type? Say the note or customer name in English or Hindi and MoneyKit writes it for you."
            />
            <VoiceMock />
          </Card>

          <Card delay={160}>
            <CardTitle
              icon={Languages}
              title="In your language"
              body="Use the whole app in English, Hindi, or the Hinglish you already speak at the counter."
            />
            <LanguagesMock />
          </Card>
        </div>

        <ol className="mt-16 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <li
              key={title}
              data-reveal
              style={{ "--reveal-delay": `${index * 100}ms` }}
              className="flex gap-4 rounded-3xl border border-black/[0.05] bg-white/60 p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-forest font-display text-xl text-lime italic">
                {index + 1}
              </span>
              <div>
                <p className="flex items-center gap-2 font-semibold text-zinc-950">
                  <Icon className="size-4 text-mint" /> {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
