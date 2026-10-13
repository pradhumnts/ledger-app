import {
  ArrowRight,
  BellRing,
  FileText,
  Landmark,
  Languages,
  Mic,
  QrCode,
  ShieldCheck,
} from "lucide-react";
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

const QR_SIZE = 21;
const QR_FINDERS = [
  [0, 0],
  [14, 0],
  [0, 14],
];

// Decorative only: seeded noise around real-looking finder squares, never a scannable code.
const QR_MODULES = (() => {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const nearFinder = (x, y) =>
    QR_FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);

  const modules = [];
  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (!nearFinder(x, y) && random() > 0.5) modules.push([x, y]);
    }
  }
  return modules;
})();

function QrGraphic({ className }) {
  return (
    <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} className={className} aria-hidden>
      {QR_FINDERS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" rx="1.6" className="fill-forest" />
          <rect x={x + 1} y={y + 1} width="5" height="5" rx="1" className="fill-white" />
          <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.7" className="fill-forest" />
        </g>
      ))}
      {QR_MODULES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width="0.84" height="0.84" rx="0.25" className="fill-forest" />
      ))}
    </svg>
  );
}

function QrMock() {
  return (
    <div className="mt-7">
      <div className="flex items-start">
        <div className="flex w-[5.5rem] shrink-0 flex-col items-center gap-2 text-center">
          <span className="rounded-xl bg-white p-1.5 shadow-[0_8px_20px_-10px_rgba(11,48,31,0.4)] ring-1 ring-black/5">
            <QrGraphic className="size-16" />
          </span>
          <span className="text-xs leading-tight font-semibold text-zinc-900">Your QR</span>
        </div>

        <div className="flex h-[4.75rem] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-1">
          <span className="text-[11px] leading-tight font-medium text-zinc-500">Any UPI app</span>
          <span className="relative flex w-full items-center">
            <span className="h-0 flex-1 border-t-2 border-dotted border-forest/25" />
            <ArrowRight className="-ml-1 size-3.5 shrink-0 text-forest/50" strokeWidth={2.6} />
            <span aria-hidden className="lp-pay-dot absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-mint" />
          </span>
        </div>

        <div className="flex w-[5.5rem] shrink-0 flex-col items-center gap-2 text-center">
          <span className="flex size-[4.75rem] items-center justify-center rounded-xl bg-forest text-lime shadow-[0_8px_20px_-10px_rgba(11,48,31,0.6)]">
            <Landmark className="size-7" strokeWidth={1.8} />
          </span>
          <span className="text-xs leading-tight font-semibold text-zinc-900">Your bank</span>
        </div>
      </div>

      <p className="mt-5 flex gap-2 text-xs leading-relaxed text-zinc-600">
        <ShieldCheck className="mt-px size-4 shrink-0 text-mint" />
        <span>
          <span className="font-semibold text-zinc-900">MoneyKit is not a payment app.</span> Your money never passes
          through us.
        </span>
      </p>
    </div>
  );
}

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

const LANGUAGES = ["English", "हिन्दी", "Hinglish"];

// Strings come from the app's own translations, in LANGUAGES order.
const LANGUAGE_COPY = {
  title: ["New bill", "नया बिल", "Naya bill"],
  customer: ["Customer", "ग्राहक", "Customer"],
  amount: ["Amount", "राशि", "Amount"],
  create: ["Create bill", "बिल बनाएं", "Bill banao"],
  share: ["Share on WhatsApp", "WhatsApp पर भेजें", "WhatsApp par bhejo"],
};

// Merges a language into the previous one when the text is identical, so it holds instead of blinking.
function languageLayers(values) {
  const first = values.findIndex((value, index) => value !== values[(index + 2) % 3]);
  if (first === -1) return [{ text: values[0], start: 0, long: false, coversFirst: true }];

  const layers = [];
  for (let step = 0; step < 3; step += 1) {
    const index = (first + step) % 3;
    const layer = layers.at(-1);
    if (layer && layer.text === values[index]) {
      layer.long = true;
      layer.coversFirst ||= index === 0;
    } else {
      layers.push({ text: values[index], start: index, long: false, coversFirst: index === 0 });
    }
  }
  return layers.sort((a, b) => b.coversFirst - a.coversFirst);
}

function Translated({ values }) {
  const layers = languageLayers(values);
  if (layers.length === 1) return values[0];

  return (
    <span className="inline-grid">
      {layers.map((layer) => (
        <span
          key={layer.start}
          className={cn("col-start-1 row-start-1", layer.long ? "lp-lang-long" : "lp-lang")}
          style={{ "--lang-start": layer.start }}
        >
          {layer.text}
        </span>
      ))}
    </span>
  );
}

function LanguagesMock() {
  return (
    <div aria-hidden className="mt-7">
      <div className="relative grid grid-cols-3 rounded-full bg-paper p-1 text-center text-[13px] font-semibold text-zinc-700">
        <span className="lp-lang-tab absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-white shadow-[0_4px_12px_-4px_rgba(11,48,31,0.25)] ring-1 ring-black/5" />
        {LANGUAGES.map((language) => (
          <span key={language} className="relative py-2">
            {language}
          </span>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-paper p-4">
        <p className="text-[15px] font-semibold text-zinc-950">
          <Translated values={LANGUAGE_COPY.title} />
        </p>
        <div className="mt-3 space-y-2">
          {[
            { label: LANGUAGE_COPY.customer, value: "Ritu Sharma" },
            { label: LANGUAGE_COPY.amount, value: "₹1,200" },
          ].map((row) => (
            <div
              key={row.value}
              className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-black/5"
            >
              <span className="text-xs font-medium text-zinc-500">
                <Translated values={row.label} />
              </span>
              <span className="text-sm font-semibold text-zinc-900 tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 text-center text-[13px] font-semibold">
          <span className="rounded-xl bg-forest px-2 py-2.5 text-lime">
            <Translated values={LANGUAGE_COPY.create} />
          </span>
          <span className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25d366] px-2 py-2.5 text-white">
            <WhatsAppIcon className="size-3.5 shrink-0" />
            <Translated values={LANGUAGE_COPY.share} />
          </span>
        </div>
      </div>
    </div>
  );
}

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
              body="Show your own UPI QR at the counter or inside every bill. Customers pay with the UPI app they already use."
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
      </div>
    </section>
  );
}
