"use client";

import { cn } from "@/lib/utils";
import { isCatalogThemeFree } from "@/lib/theme-access";

export const BILL_CARD_RATIO = 352 / 232;
export const BILL_CAROUSEL_CARD_W = 232;

export function billCarouselCardSize(stageWidth = 390, maxHeight = 400) {
  const widthCap = Math.min(BILL_CAROUSEL_CARD_W, Math.round(stageWidth * 0.54));
  let width = widthCap;
  let height = Math.round(width * BILL_CARD_RATIO);
  const heightCap = Math.max(220, maxHeight);
  if (height > heightCap) {
    height = heightCap;
    width = Math.round(height / BILL_CARD_RATIO);
  }
  return { width, height };
}

const DEMO = {
  customer: "Rajesh Yogi",
  phone: "87400 74255",
  billNo: "BL-260814",
  date: "14 Aug 2026",
  items: [
    { name: "Design work", amount: "₹8,000" },
    { name: "Printing", amount: "₹2,500" },
    { name: "Delivery", amount: "₹2,000" },
  ],
  total: "₹12,500",
};

function PriceChip({ free, className }) {
  if (!free) return null;

  return (
    <span
      className={cn(
        "absolute top-3 right-3 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm",
        className
      )}
    >
      Free
    </span>
  );
}

function InvoicePreview({ businessName, free, active }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.16)]"
      )}
    >
      <PriceChip free={free} />
      <div className="bg-[var(--forest)] px-4 py-3 text-white">
        <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--lime)] uppercase">
          Bill
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight">
          {businessName}
        </p>
        <p className="mt-0.5 text-[11px] text-white/70">Bill · {DEMO.billNo}</p>
      </div>
      <div className="space-y-2.5 px-4 py-3">
        <div>
          <p className="text-[10px] tracking-wide text-zinc-400 uppercase">
            Billed to
          </p>
          <p className="text-sm font-semibold text-zinc-900">{DEMO.customer}</p>
          <p className="text-[11px] text-zinc-500">{DEMO.phone}</p>
        </div>
        <div className="space-y-1.5 border-t border-zinc-100 pt-2">
          {DEMO.items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="text-zinc-600">{item.name}</span>
              <span className="font-medium tabular-nums text-zinc-900">
                {item.amount}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
          <span className="text-xs font-medium text-zinc-500">Total</span>
          <span className="text-lg font-semibold tabular-nums text-zinc-950">
            {DEMO.total}
          </span>
        </div>
      </div>
    </div>
  );
}

function MinimalPreview({ businessName, free, active }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.35rem] border border-zinc-300 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.16)]"
      )}
    >
      <PriceChip free={free} />
      <div className="border-b border-zinc-900 px-4 py-4">
        <p className="text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
          Statement
        </p>
        <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
          {businessName}
        </p>
      </div>
      <div className="px-4 py-4">
        <div className="mb-4 flex justify-between text-[11px] text-zinc-500">
          <span>{DEMO.customer}</span>
          <span>{DEMO.date}</span>
        </div>
        <div className="space-y-2 border-y border-dashed border-zinc-300 py-3">
          {DEMO.items.map((item) => (
            <div
              key={item.name}
              className="flex justify-between text-xs text-zinc-800"
            >
              <span>{item.name}</span>
              <span className="tabular-nums">{item.amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-[11px] text-zinc-400">Amount due</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-zinc-950">
            {DEMO.total}
          </span>
        </div>
      </div>
    </div>
  );
}

function ColorfulPreview({ businessName, free, active }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.35rem] shadow-[0_18px_40px_rgba(0,0,0,0.16)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.2)]"
      )}
      style={{
        background:
          "linear-gradient(160deg, #312e81 0%, #4f46e5 42%, #f97316 120%)",
      }}
    >
      <PriceChip free={free} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_40%)]" />
      <div className="relative flex h-full flex-col p-4 text-white">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-white/70 uppercase">
          Color bill
        </p>
        <p className="mt-2 text-lg font-semibold tracking-tight">
          {businessName}
        </p>
        <div className="mt-4 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
          <p className="text-[11px] text-white/70">Customer</p>
          <p className="text-sm font-semibold">{DEMO.customer}</p>
          <div className="mt-3 space-y-1.5">
            {DEMO.items.slice(0, 2).map((item) => (
              <div
                key={item.name}
                className="flex justify-between text-[11px] text-white/85"
              >
                <span>{item.name}</span>
                <span className="tabular-nums">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-4">
          <p className="text-[11px] text-white/70">Total</p>
          <p className="text-[2rem] font-semibold tracking-tight tabular-nums">
            {DEMO.total}
          </p>
        </div>
      </div>
    </div>
  );
}

function TicketPreview({ businessName, free, active }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.35rem] bg-[#1a1420] shadow-[0_18px_40px_rgba(0,0,0,0.2)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.24)]"
      )}
    >
      <PriceChip free={free} />
      <div className="h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_12px,rgba(245,197,66,0.08)_12px,rgba(245,197,66,0.08)_13px)] p-4 text-[#f8efd4]">
        <div className="rounded-xl border border-dashed border-[#f5c542]/50 bg-[#241c2c] p-3">
          <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-[#f5c542] uppercase">
            Admit one · Bill
          </p>
          <p className="mt-3 text-center text-lg font-semibold tracking-tight">
            {businessName}
          </p>
          <p className="mt-1 text-center text-[11px] text-[#f8efd4]/65">
            {DEMO.customer}
          </p>
          <div className="my-3 border-t border-dashed border-[#f5c542]/35" />
          <div className="flex justify-between text-[11px]">
            <span>Seat · A12</span>
            <span>{DEMO.date}</span>
          </div>
          <p className="mt-4 text-center text-[10px] tracking-wide text-[#f8efd4]/55 uppercase">
            Amount
          </p>
          <p className="text-center text-[2rem] font-semibold tracking-tight text-[#f5c542] tabular-nums">
            {DEMO.total}
          </p>
          <p className="mt-2 text-center font-mono text-[10px] tracking-[0.2em] text-[#f8efd4]/45">
            ||||| {DEMO.billNo} |||||
          </p>
        </div>
      </div>
    </div>
  );
}

function ReceiptPreview({ businessName, free, active }) {
  return (
    <div
      className={cn(
        "relative mx-auto h-full w-[88%] overflow-hidden rounded-sm bg-[#f7f3e8] shadow-[0_18px_40px_rgba(0,0,0,0.14)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.18)]"
      )}
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 10px), 96% 100%, 92% calc(100% - 10px), 88% 100%, 84% calc(100% - 10px), 80% 100%, 76% calc(100% - 10px), 72% 100%, 68% calc(100% - 10px), 64% 100%, 60% calc(100% - 10px), 56% 100%, 52% calc(100% - 10px), 48% 100%, 44% calc(100% - 10px), 40% 100%, 36% calc(100% - 10px), 32% 100%, 28% calc(100% - 10px), 24% 100%, 20% calc(100% - 10px), 16% 100%, 12% calc(100% - 10px), 8% 100%, 4% calc(100% - 10px), 0 100%)",
      }}
    >
      <PriceChip free={free} className="right-1 top-2" />
      <div className="px-3 py-4 font-mono text-[#2a2118]">
        <p className="text-center text-[11px] font-bold tracking-wide uppercase">
          {businessName}
        </p>
        <p className="mt-1 text-center text-[9px] text-[#2a2118]/70">
          *** THANK YOU ***
        </p>
        <p className="mt-3 text-center text-[9px]">
          {DEMO.date} · {DEMO.billNo}
        </p>
        <div className="my-2 border-t border-dashed border-[#2a2118]/40" />
        <div className="space-y-1 text-[10px]">
          {DEMO.items.map((item) => (
            <div key={item.name} className="flex justify-between gap-2">
              <span className="truncate">{item.name.toUpperCase()}</span>
              <span className="tabular-nums">{item.amount}</span>
            </div>
          ))}
        </div>
        <div className="my-2 border-t border-dashed border-[#2a2118]/40" />
        <div className="flex justify-between text-[11px] font-bold">
          <span>TOTAL</span>
          <span className="tabular-nums">{DEMO.total}</span>
        </div>
        <p className="mt-3 text-center text-[9px] text-[#2a2118]/60">
          {DEMO.customer}
        </p>
        <p className="mt-2 text-center text-[9px] tracking-[0.3em]">
          =================
        </p>
      </div>
    </div>
  );
}

function StatementPreview({ businessName, free, active }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.16)]"
      )}
    >
      <PriceChip free={free} />
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Statement
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {businessName}
          </p>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          <p>{DEMO.billNo}</p>
          <p>{DEMO.date}</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {["Gave", "Got", "Due"].map((label, i) => (
            <div
              key={label}
              className="rounded-lg bg-slate-50 px-2 py-2 text-center"
            >
              <p className="text-[9px] text-slate-400 uppercase">{label}</p>
              <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-800">
                {i === 2 ? "₹4,500" : i === 0 ? "₹12,500" : "₹8,000"}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <div className="grid grid-cols-[1fr_auto] bg-slate-800 px-2.5 py-1.5 text-[9px] font-semibold tracking-wide text-white uppercase">
            <span>Particulars</span>
            <span>Amt</span>
          </div>
          {DEMO.items.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-[1fr_auto] border-t border-slate-100 px-2.5 py-1.5 text-[10px]"
            >
              <span className="text-slate-600">{item.name}</span>
              <span className="tabular-nums text-slate-900">{item.amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs">
          <span className="text-slate-400">Balance</span>
          <span className="font-semibold tabular-nums text-slate-950">
            ₹4,500
          </span>
        </div>
      </div>
    </div>
  );
}

export function ThemePreviewCard({ theme, businessName, active }) {
  const props = { businessName, free: isCatalogThemeFree(theme), active };

  switch (theme.style) {
    case "minimal":
      return <MinimalPreview {...props} />;
    case "colorful":
      return <ColorfulPreview {...props} />;
    case "ticket":
      return <TicketPreview {...props} />;
    case "receipt":
      return <ReceiptPreview {...props} />;
    case "statement":
      return <StatementPreview {...props} />;
    case "invoice":
    default:
      return <InvoicePreview {...props} />;
  }
}
