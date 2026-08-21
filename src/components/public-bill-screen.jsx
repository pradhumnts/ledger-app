"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, IndianRupee, Languages } from "lucide-react";
import { ActivityRow } from "@/components/activity-row";
import { CreatedWithMoneyKit } from "@/components/created-with-moneykit";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { PageSpinner } from "@/components/page-spinner";
import { UpiAppLogos } from "@/components/upi-app-logos";
import { Divider, SoftCard } from "@/components/ui-kit";
import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import { entryTypeLabel, resolveEntryWhen } from "@/lib/format";
import { LANGUAGES, normalizeLanguage, translate } from "@/lib/i18n";
import { collectableRupees } from "@/lib/ledger-math";
import { isPublicStatement, payAmountForPublicBill } from "@/lib/public-bill";
import { buildUpiPaymentUrl, isValidUpiId } from "@/lib/upi";
import { cn } from "@/lib/utils";

const BILL_LANG_CHIPS = LANGUAGES.map((item) => ({
  id: item.id,
  label:
    item.id === "en" ? "English" : item.id === "hi" ? "हिन्दी" : "Hinglish",
}));

export function PublicBillScreen({ snapshot, loading = false }) {
  const [language, setLanguage] = useState("en");
  const t = useMemo(
    () => (key, vars) => translate(language, key, vars),
    [language]
  );

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <a
        href={APP_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center justify-center gap-2.5"
      >
        <MoneyKitLogo size={40} priority className="rounded-[0.9rem]" />
        <p className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
          {APP_NAME}
        </p>
      </a>
      <div className="flex flex-1 flex-col">
        {loading ? (
          <PageSpinner />
        ) : snapshot ? (
          isPublicStatement(snapshot) ? (
            <PublicStatementBody snapshot={snapshot} language={language} t={t} />
          ) : (
            <PublicBillBody snapshot={snapshot} language={language} t={t} />
          )
        ) : (
          <SoftCard className="p-6 text-center">
            <p className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("publicBill.invalid")}
            </p>
          </SoftCard>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <BillLanguageMenu
          language={language}
          onChange={setLanguage}
          label={t("publicBill.language")}
        />
      </div>
    </div>
  );
}

function BillLanguageMenu({ language, onChange, label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current =
    BILL_LANG_CHIPS.find((item) => item.id === language) || BILL_LANG_CHIPS[0];

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
      >
        <Languages className="size-3.5" />
        {current.label}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute bottom-full left-1/2 z-20 mb-2 min-w-[8.5rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-[0_12px_32px_rgba(11,48,31,0.12)] dark:border-white/12 dark:bg-zinc-900"
        >
          {BILL_LANG_CHIPS.map((item) => {
            const selected = item.id === language;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(normalizeLanguage(item.id));
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3.5 py-2 text-left text-[13px] font-medium",
                    selected
                      ? "text-[var(--forest)] dark:text-[var(--lime)]"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                  )}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function PayWithUpi({ business, amount, t }) {
  const upiUrl = isValidUpiId(business?.upiId)
    ? buildUpiPaymentUrl({
        upiId: business.upiId,
        name: business.name,
        amount,
      })
    : "";
  if (!upiUrl) return null;

  return (
    <div className="mt-5">
      <a
        href={upiUrl}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--forest)] text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
      >
        <IndianRupee className="size-4" />
        {t("publicBill.pay")}
      </a>
      <UpiAppLogos />
    </div>
  );
}

function PublicBillBody({ snapshot, language, t }) {
  const { entry, customer, business, themeId } = snapshot;
  return (
    <>
      <EntryBillPreview
        entry={entry}
        customer={customer}
        business={business}
        themeId={themeId}
        language={language}
      />
      <PayWithUpi
        business={business}
        amount={payAmountForPublicBill(entry)}
        t={t}
      />
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}

function PublicStatementBody({ snapshot, language, t }) {
  const { customer, business, entries = [], balance, billed, themeId } =
    snapshot;
  const due = collectableRupees(balance);

  return (
    <>
      <EntryBillPreview
        customer={customer}
        business={business}
        themeId={themeId}
        language={language}
        statement={{
          balance,
          billed,
          due,
          entries,
        }}
      />

      {entries.length > 0 ? (
        <SoftCard className="mt-4">
          {entries.map((entry, index) => (
            <div key={entry.id || `${entry.date}-${index}`}>
              {index > 0 ? <Divider /> : null}
              <ActivityRow
                title={entryTypeLabel(entry.type, language)}
                amount={entry.amount}
                type={entry.type}
                date={resolveEntryWhen(entry)}
                nameForInitials={customer?.name}
                language={language}
              />
            </div>
          ))}
        </SoftCard>
      ) : null}

      <PayWithUpi business={business} amount={due > 0 ? due : undefined} t={t} />
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}
