"use client";

import { getBillTheme } from "@/lib/bill-themes";
import {
  entryTypeLabel,
  formatBillNumber,
  formatEntryDate,
  formatEntryDateTime,
  formatINR,
  resolveEntryWhen,
} from "@/lib/format";
import { normalizeLanguage, translate } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** In-app previews stay English so labels match PDF share. */
const DEFAULT_BILL_LANG = "en";

function billCopy({ entry, customer, business, language }) {
  const lang = normalizeLanguage(language || DEFAULT_BILL_LANG);
  const te = (key) => translate(lang, key);
  const typeLabel = entryTypeLabel(entry.type, lang);
  const billNo = formatBillNumber(entry);
  const when = resolveEntryWhen(entry);
  const dateLabel = formatEntryDateTime(when, lang);
  const shortDate = formatEntryDate(when, lang);
  const amount = formatINR(entry.amount);
  const signedAmount = amount;
  const itemName =
    entry.description?.trim() ||
    (entry.type === "got"
      ? te("entry.paid")
      : entry.type === "invoice"
        ? te("entry.bill")
        : typeLabel);
  const remainingDue = Number(entry.due);
  const isGot = entry.type === "got";
  const showDue =
    Number.isFinite(remainingDue) &&
    remainingDue > 0 &&
    (isGot ||
      (entry.type === "invoice" && remainingDue !== Number(entry.amount)));
  const shop = business.name?.trim() || te("home.yourBusiness");
  const details = [business.phone, business.address].filter(Boolean).join(" · ");

  return {
    typeLabel,
    billNo,
    dateLabel,
    shortDate,
    amount,
    signedAmount,
    itemName,
    shop,
    details,
    customer,
    isGot,
    dueAmount: formatINR(remainingDue),
    showDue,
    totalLabel: isGot ? te("entry.paid") : te("entry.total"),
    lines: [{ name: itemName, amount }],
    kicker:
      entry.type === "invoice"
        ? te("entry.bill")
        : isGot
          ? te("entry.payment")
          : entry.type === "due" || entry.type === "gave"
            ? te("entry.due")
            : te("entry.receipt"),
  };
}

function statementCopy({ customer, business, statement, language }) {
  const lang = normalizeLanguage(language || DEFAULT_BILL_LANG);
  const te = (key) => translate(lang, key);
  const balance = Number(statement?.balance) || 0;
  const billed = Number(statement?.billed) || 0;
  const due = Number(statement?.due) || 0;
  const latest = statement?.entries?.[0];
  const shop = business?.name?.trim() || te("home.yourBusiness");
  const details = [business?.phone, business?.address]
    .filter(Boolean)
    .join(" · ");
  const totalLabel =
    balance > 0
      ? te("common.toCollect")
      : balance < 0
        ? te("common.toPay")
        : te("common.settled");

  return {
    typeLabel: te("publicBill.allBills"),
    billNo: "",
    dateLabel: latest ? formatEntryDateTime(resolveEntryWhen(latest), lang) : "",
    shortDate: latest ? formatEntryDate(resolveEntryWhen(latest), lang) : "",
    amount: formatINR(billed),
    signedAmount: formatINR(Math.abs(balance)),
    itemName: te("entry.billed"),
    lines: [{ name: te("entry.billed"), amount: formatINR(billed) }],
    shop,
    details,
    customer,
    isGot: balance > 0,
    dueAmount: formatINR(due),
    showDue: true,
    totalLabel,
    kicker: te("publicBill.allBills"),
  };
}

function lineItems(copy) {
  return copy.lines?.length
    ? copy.lines
    : [{ name: copy.itemName, amount: copy.amount }];
}

function RemainingDue({ copy, t, className, valueClassName }) {
  if (!copy.showDue) return null;
  return (
    <div className={cn("mt-3 flex items-center justify-between", className)}>
      <p className="text-xs font-medium text-zinc-500">{t("entry.due")}</p>
      <p
        className={cn(
          "text-base font-semibold tabular-nums text-[var(--mint)]",
          valueClassName
        )}
      >
        {copy.dueAmount}
      </p>
    </div>
  );
}

function InvoiceBill({ copy, t }) {
  return (
    <article className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_24px_50px_rgba(11,48,31,0.12)]">
      <header className="bg-[var(--forest)] px-5 py-5 text-white">
        <p className="text-[11px] font-medium tracking-[0.18em] text-[var(--lime)] uppercase">
          {copy.kicker}
        </p>
        <p className="mt-1 text-xl font-semibold tracking-tight">{copy.shop}</p>
        {copy.details ? (
          <p className="mt-1 text-xs text-white/70">{copy.details}</p>
        ) : null}
        {copy.billNo ? (
          <p className="mt-3 text-xs text-white/60">
            {t("entry.billNo")} · {copy.billNo}
          </p>
        ) : null}
      </header>

      <div className="px-5 py-5">
        <p className="text-[11px] tracking-wide text-zinc-400 uppercase">
          {t("entry.billedTo")}
        </p>
        <p className="mt-1 text-base font-semibold text-zinc-950">
          {copy.customer.name}
        </p>
        {copy.customer.phone ? (
          <p className="text-sm text-zinc-500">{copy.customer.phone}</p>
        ) : null}

        <div className="mt-5 border-t border-zinc-100 pt-4">
          <div className="mb-2 flex justify-between text-[11px] tracking-wide text-zinc-400 uppercase">
            <span>{t("entry.particulars")}</span>
            <span>{t("entry.amountDue")}</span>
          </div>
          <div className="space-y-2">
            {lineItems(copy).map((line) => (
              <div
                key={line.name}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span className="min-w-0 leading-relaxed text-zinc-700">
                  {line.name}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-zinc-950">
                  {line.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between rounded-2xl bg-[#f4f5f3] px-4 py-3">
          <div>
            <p className="text-xs font-medium text-zinc-500">{copy.totalLabel}</p>
            {copy.dateLabel ? (
              <p className="mt-0.5 text-xs text-zinc-400">{copy.dateLabel}</p>
            ) : null}
          </div>
          <p
            className={cn(
              "text-[1.75rem] leading-none font-semibold tracking-tight tabular-nums",
              copy.isGot ? "text-[var(--mint)]" : "text-zinc-950"
            )}
          >
            {copy.signedAmount}
          </p>
        </div>
        {copy.showDue ? (
          <RemainingDue copy={copy} t={t} className="px-1" />
        ) : null}
      </div>
    </article>
  );
}

function MinimalBill({ copy, t }) {
  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-zinc-900 bg-white shadow-[0_24px_50px_rgba(0,0,0,0.08)]">
      <header className="border-b border-zinc-900 px-5 py-5">
        <p className="text-[11px] tracking-[0.22em] text-zinc-400 uppercase">
          {copy.kicker}
        </p>
        <p className="mt-2 text-[1.65rem] font-semibold tracking-tight text-zinc-950">
          {copy.shop}
        </p>
        {copy.details ? (
          <p className="mt-1 text-xs text-zinc-500">{copy.details}</p>
        ) : null}
      </header>
      <div className="px-5 py-5">
        <div className="mb-5 flex items-start justify-between gap-4 text-sm text-zinc-500">
          <div>
            <p className="font-medium text-zinc-950">{copy.customer.name}</p>
            {copy.customer.phone ? <p>{copy.customer.phone}</p> : null}
          </div>
          {copy.shortDate ? (
            <p className="shrink-0 text-right">{copy.shortDate}</p>
          ) : null}
        </div>
        <div className="border-y border-dashed border-zinc-300 py-4 space-y-2">
          {lineItems(copy).map((line) => (
            <div
              key={line.name}
              className="flex justify-between gap-4 text-sm text-zinc-800"
            >
              <span className="min-w-0 leading-relaxed">{line.name}</span>
              <span className="shrink-0 tabular-nums">{line.amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between">
          <span className="text-xs tracking-wide text-zinc-400 uppercase">
            {copy.totalLabel}
          </span>
          <span
            className={cn(
              "text-[2rem] leading-none font-semibold tracking-tight tabular-nums",
              copy.isGot ? "text-[var(--mint)]" : "text-zinc-950"
            )}
          >
            {copy.signedAmount}
          </span>
        </div>
        <RemainingDue copy={copy} t={t} />
        {copy.billNo ? (
          <p className="mt-4 text-xs text-zinc-400">
            {t("entry.billNo")} {copy.billNo}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ColorfulBill({ copy, t }) {
  return (
    <article
      className="overflow-hidden rounded-[1.6rem] text-white shadow-[0_24px_50px_rgba(49,46,129,0.28)]"
      style={{
        background:
          "linear-gradient(160deg, #1e1b4b 0%, #4338ca 48%, #ea580c 128%)",
      }}
    >
      <div className="relative px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/65 uppercase">
          {copy.kicker}
        </p>
        <p className="mt-2 text-xl font-semibold tracking-tight">{copy.shop}</p>
        {copy.details ? (
          <p className="mt-1 text-xs text-white/65">{copy.details}</p>
        ) : null}

        <div className="mt-5 rounded-2xl bg-white/12 p-4">
          <p className="text-[11px] text-white/65">{t("entry.billedTo")}</p>
          <p className="mt-1 font-semibold">{copy.customer.name}</p>
          <div className="mt-4 space-y-2 border-t border-white/15 pt-3 text-sm">
            {lineItems(copy).map((line) => (
              <div key={line.name} className="flex justify-between gap-4">
                <span className="min-w-0 text-white/85">{line.name}</span>
                <span className="shrink-0 tabular-nums">{line.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[11px] text-white/65">{copy.totalLabel}</p>
          <p className="mt-1 text-[2.35rem] leading-none font-semibold tracking-tight tabular-nums">
            {copy.signedAmount}
          </p>
          {copy.showDue ? (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-white/65">{t("entry.due")}</p>
              <p className="text-base font-semibold tabular-nums text-white">
                {copy.dueAmount}
              </p>
            </div>
          ) : null}
          {copy.dateLabel ? (
            <p className="mt-3 text-xs text-white/55">{copy.dateLabel}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function TicketBill({ copy, t }) {
  return (
    <article className="overflow-hidden rounded-[1.6rem] bg-[#17120c] text-[#f6ead2] shadow-[0_24px_50px_rgba(0,0,0,0.28)]">
      <div className="p-5">
        <div className="rounded-[1.25rem] border border-dashed border-[#d4a84b]/55 bg-[#211a12] px-5 py-6">
          <p className="text-center text-[11px] font-semibold tracking-[0.28em] text-[#d4a84b] uppercase">
            {copy.kicker}
          </p>
          <p className="mt-3 text-center text-xl font-semibold tracking-tight">
            {copy.shop}
          </p>
          <p className="mt-1 text-center text-sm text-[#f6ead2]/70">
            {copy.customer.name}
          </p>
          <div className="my-4 border-t border-dashed border-[#d4a84b]/35" />
          {lineItems(copy).map((line) => (
            <p
              key={line.name}
              className="text-center text-sm leading-relaxed text-[#f6ead2]/85"
            >
              {line.name} · {line.amount}
            </p>
          ))}
          <p className="mt-5 text-center text-[11px] tracking-wide text-[#f6ead2]/50 uppercase">
            {copy.totalLabel}
          </p>
          <p className="mt-1 text-center text-[2.4rem] leading-none font-semibold tracking-tight text-[#d4a84b] tabular-nums">
            {copy.signedAmount}
          </p>
          {copy.showDue ? (
            <p className="mt-3 text-center text-sm text-[#f6ead2]/75">
              {t("entry.due")} {copy.dueAmount}
            </p>
          ) : null}
          {copy.dateLabel ? (
            <p className="mt-4 text-center text-xs text-[#f6ead2]/55">
              {copy.dateLabel}
            </p>
          ) : null}
          {copy.billNo ? (
            <p className="mt-3 text-center font-mono text-[11px] tracking-[0.22em] text-[#f6ead2]/40">
              {copy.billNo}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ReceiptBill({ copy, t }) {
  return (
    <article className="mx-auto w-[92%] bg-[#f4ead6] text-[#2c2118] shadow-[0_24px_50px_rgba(61,44,30,0.16)] [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),96%_100%,92%_calc(100%-12px),88%_100%,84%_calc(100%-12px),80%_100%,76%_calc(100%-12px),72%_100%,68%_calc(100%-12px),64%_100%,60%_calc(100%-12px),56%_100%,52%_calc(100%-12px),48%_100%,44%_calc(100%-12px),40%_100%,36%_calc(100%-12px),32%_100%,28%_calc(100%-12px),24%_100%,20%_calc(100%-12px),16%_100%,12%_calc(100%-12px),8%_100%,4%_calc(100%-12px),0_100%)]">
      <div className="px-5 py-6 font-mono">
        <p className="text-center text-sm font-bold tracking-wide uppercase">
          {copy.shop}
        </p>
        {copy.details ? (
          <p className="mt-1 text-center text-[10px] text-[#2c2118]/70">
            {copy.details}
          </p>
        ) : null}
        <p className="mt-3 text-center text-[10px] tracking-[0.18em] uppercase">
          {copy.billNo ? t("entry.thankYou") : copy.kicker}
        </p>
        {copy.shortDate || copy.billNo ? (
          <p className="mt-3 text-center text-[11px]">
            {[copy.shortDate, copy.billNo].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <div className="my-3 border-t border-dashed border-[#2c2118]/40" />
        {lineItems(copy).map((line) => (
          <div key={line.name} className="flex justify-between gap-3 text-[12px]">
            <span className="min-w-0 uppercase">{line.name}</span>
            <span className="shrink-0 tabular-nums">{line.amount}</span>
          </div>
        ))}
        <div className="my-3 border-t border-dashed border-[#2c2118]/40" />
        <div className="flex justify-between text-sm font-bold">
          <span>{copy.totalLabel.toUpperCase()}</span>
          <span className="tabular-nums">{copy.signedAmount}</span>
        </div>
        {copy.showDue ? (
          <div className="mt-2 flex justify-between text-[12px]">
            <span className="uppercase">{t("entry.due")}</span>
            <span className="tabular-nums">{copy.dueAmount}</span>
          </div>
        ) : null}
        <p className="mt-4 text-center text-[11px]">{copy.customer.name}</p>
        <p className="mt-3 text-center text-[10px] tracking-[0.35em]">
          ================
        </p>
      </div>
    </article>
  );
}

function StatementBill({ copy, t }) {
  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_24px_50px_rgba(30,41,59,0.1)]">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            {copy.kicker}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{copy.shop}</p>
          {copy.details ? (
            <p className="mt-0.5 text-xs text-slate-500">{copy.details}</p>
          ) : null}
        </div>
        <div className="text-right text-xs text-slate-500">
          {copy.billNo ? <p>{copy.billNo}</p> : null}
          {copy.shortDate ? <p>{copy.shortDate}</p> : null}
        </div>
      </header>
      <div className="px-5 py-5">
        <p className="text-[11px] tracking-wide text-slate-400 uppercase">
          {t("entry.billedTo")}
        </p>
        <p className="mt-1 font-semibold text-slate-950">{copy.customer.name}</p>
        {copy.customer.phone ? (
          <p className="text-sm text-slate-500">{copy.customer.phone}</p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[1fr_auto] bg-slate-800 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-white uppercase">
            <span>{t("entry.particulars")}</span>
            <span>{t("entry.amountDue")}</span>
          </div>
          {lineItems(copy).map((line) => (
            <div
              key={line.name}
              className="grid grid-cols-[1fr_auto] gap-3 px-3.5 py-3 text-sm"
            >
              <span className="min-w-0 leading-relaxed text-slate-600">
                {line.name}
              </span>
              <span className="shrink-0 tabular-nums text-slate-950">
                {line.amount}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <span className="text-sm text-slate-400">{copy.totalLabel}</span>
          <span
            className={cn(
              "text-[1.85rem] leading-none font-semibold tracking-tight tabular-nums",
              copy.isGot ? "text-[var(--mint)]" : "text-slate-950"
            )}
          >
            {copy.signedAmount}
          </span>
        </div>
        <RemainingDue copy={copy} t={t} />
      </div>
    </article>
  );
}

export function EntryBillPreview({
  entry,
  customer,
  business,
  themeId,
  statement,
  language = DEFAULT_BILL_LANG,
}) {
  const lang = normalizeLanguage(language);
  const t = (key) => translate(lang, key);
  const copy = statement
    ? statementCopy({ customer, business, statement, language: lang })
    : billCopy({
        entry,
        customer,
        business,
        language: lang,
      });
  const theme = getBillTheme(themeId);

  const props = { copy, t };

  switch (theme.style) {
    case "minimal":
      return <MinimalBill {...props} />;
    case "colorful":
      return <ColorfulBill {...props} />;
    case "ticket":
      return <TicketBill {...props} />;
    case "receipt":
      return <ReceiptBill {...props} />;
    case "statement":
      return <StatementBill {...props} />;
    case "invoice":
    default:
      return <InvoiceBill {...props} />;
  }
}
