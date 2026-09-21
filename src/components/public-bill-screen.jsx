"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, X } from "lucide-react";
import { ActivityRow } from "@/components/activity-row";
import { CreatedWithMoneyKit } from "@/components/created-with-moneykit";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { PageSpinner } from "@/components/page-spinner";
import { QrCodeBlock } from "@/components/qr-code-block";
import { UpiAppLogos } from "@/components/upi-app-logos";
import { Divider, SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";
import { capture, amountBucket } from "@/lib/analytics";
import { APP_NAME, PLAY_STORE_URL } from "@/lib/branding";
import { downloadPaySheetCard } from "@/lib/capture-pay-sheet";
import { entryTypeLabel, formatINR, resolveEntryWhen } from "@/lib/format";
import { collectableRupees } from "@/lib/ledger-math";
import { isPublicStatement, payAmountForPublicBill } from "@/lib/public-bill";
import { buildUpiPaymentUrl, isValidUpiId } from "@/lib/upi";

export function PublicBillScreen({ snapshot, loading = false }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (loading || !snapshot) return;
    capture("public_bill_viewed", {
      kind: isPublicStatement(snapshot) ? "statement" : "bill",
      has_upi: isValidUpiId(snapshot.business?.upiId),
    });
  }, [loading, snapshot]);

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center justify-center gap-2.5"
      >
        <MoneyKitLogo size={40} priority className="rounded-[0.9rem]" />
        <p className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
          {APP_NAME}
        </p>
      </a>
      {loading ? (
        <PageSpinner />
      ) : snapshot ? (
        isPublicStatement(snapshot) ? (
          <PublicStatementBody snapshot={snapshot} />
        ) : (
          <PublicBillBody snapshot={snapshot} />
        )
      ) : (
        <SoftCard className="p-6 text-center">
          <p className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("publicBill.invalid")}
          </p>
        </SoftCard>
      )}
    </div>
  );
}

function PayWithUpi({ business, amount, kind = "bill" }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const hasUpi = isValidUpiId(business?.upiId);
  const businessName = String(business?.name || "").trim();
  const due = Number(amount);
  const hasDue = Number.isFinite(due) && due > 0;
  if (!hasUpi || !hasDue) return null;

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => {
          capture("upi_pay_tapped", {
            kind,
            amount_bucket: amountBucket(amount),
          });
          setOpen(true);
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-5 text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
      >
        {businessName
          ? t("publicBill.payBusiness", { name: businessName })
          : t("publicBill.pay")}
      </button>
      {open ? (
        <PublicPaySheet
          business={business}
          amount={amount}
          kind={kind}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function PublicPaySheet({ business, amount, kind, onClose }) {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const name = String(business?.name || "").trim();
  const phone = String(business?.phone || "").trim();
  const due = Number(amount);
  const hasAmount = Number.isFinite(due) && due > 0;
  const paymentUrl = buildUpiPaymentUrl({
    upiId: business?.upiId,
    name: name || undefined,
    amount: hasAmount ? due : undefined,
  });
  const actionCount = Number(Boolean(phone)) + Number(Boolean(paymentUrl));

  function requestClose() {
    if (leaving) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) {
      onClose();
      return;
    }
    setLeaving(true);
  }

  useEffect(() => {
    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      htmlOverflow: documentElement.style.overflow,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      documentElement.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => onClose(), 200);
    return () => window.clearTimeout(timer);
  }, [leaving, onClose]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leaving, onClose]);

  async function copyPhone() {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(true);
      window.setTimeout(() => setCopiedPhone(false), 1800);
      capture("public_pay_copied", { field: "phone", kind });
    } catch {
      // ignore
    }
  }

  async function downloadQr() {
    if (!paymentUrl || downloading || !cardRef.current) return;
    setDownloading(true);
    try {
      const slug = (name || "moneykit")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
      await downloadPaySheetCard(
        cardRef.current,
        `${slug || "moneykit"}-upi-qr.png`
      );
      capture("public_pay_qr_downloaded", {
        kind,
        amount_bucket: amountBucket(amount),
      });
    } catch {
      // ignore — keep sheet open so they can retry / scan
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className={`pay-sheet-backdrop fixed inset-0 z-50 flex h-dvh max-h-dvh flex-col overflow-hidden overscroll-none bg-[var(--app-bg)]${
        leaving ? " pay-sheet-leaving" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={
        name
          ? t("publicBill.payBusiness", { name })
          : t("publicBill.payScanHint")
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-[radial-gradient(ellipse_at_top,rgba(11,48,31,0.1),transparent_72%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(200,232,106,0.1),transparent_72%)]"
      />

      <div className="relative z-10 flex shrink-0 justify-end px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={requestClose}
          aria-label={t("publicBill.close")}
          className="flex size-10 items-center justify-center rounded-full border border-black/[0.04] bg-white/90 text-zinc-600 backdrop-blur-sm transition-colors hover:text-zinc-950 dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
        >
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3.5 overflow-x-hidden overflow-y-auto overscroll-contain px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="pay-sheet-rise pay-sheet-d2 w-full max-w-sm">
          <div ref={cardRef} className="px-1 pb-1 pt-0.5">
            <div className="flex flex-col items-center gap-3.5">
              <div className="flex items-center gap-2.5">
                <div
                  data-pay-sheet-logo
                  className="size-9 overflow-hidden rounded-[0.85rem] bg-white"
                >
                  <MoneyKitLogo size={36} className="size-9 rounded-[0.85rem]" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-tight text-zinc-950 dark:text-white">
                    {APP_NAME}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {t("publicBill.payScanHint")}
                  </p>
                </div>
              </div>

              <div className="w-full text-center">
                {name ? (
                  <h2 className="text-[1.25rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
                    {name}
                  </h2>
                ) : null}
                {phone ? (
                  <p
                    className={`text-[14px] font-medium tabular-nums tracking-tight text-zinc-500 dark:text-zinc-400 ${
                      name ? "mt-1" : ""
                    }`}
                  >
                    {phone}
                  </p>
                ) : null}
                {hasAmount ? (
                  <p
                    className={`font-semibold tracking-tight text-zinc-950 dark:text-white ${
                      name || phone ? "mt-2" : ""
                    } text-[2rem] leading-none tabular-nums sm:text-[2.25rem]`}
                  >
                    {formatINR(due)}
                  </p>
                ) : null}
              </div>

              <div className="w-full max-w-[13.25rem]">
                <div className="rounded-[1.5rem] border border-black/[0.04] bg-white p-3.5 dark:border-white/10 dark:bg-zinc-950">
                  {paymentUrl ? (
                    <QrCodeBlock value={paymentUrl} className="w-full" />
                  ) : null}
                </div>
                <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-[var(--lime)]/80" />
              </div>
            </div>
          </div>
        </div>

        {actionCount > 0 ? (
          <div
            className={`pay-sheet-rise pay-sheet-d4 grid w-full max-w-sm gap-2.5 ${
              actionCount > 1 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {phone ? (
              <button
                type="button"
                onClick={copyPhone}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-3 text-[13px] font-semibold text-white transition-[transform,opacity] active:scale-[0.98] dark:bg-[var(--lime)] dark:text-[var(--forest)]"
              >
                {copiedPhone ? (
                  <>
                    <Check className="size-4 shrink-0" strokeWidth={2.5} />
                    {t("publicBill.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="size-4 shrink-0" strokeWidth={2} />
                    {t("publicBill.copyPhone")}
                  </>
                )}
              </button>
            ) : null}
            {paymentUrl ? (
              <button
                type="button"
                onClick={downloadQr}
                disabled={downloading}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-black/[0.06] bg-white px-3 text-[13px] font-semibold text-zinc-950 transition-[transform,opacity] active:scale-[0.98] disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              >
                <Download className="size-4 shrink-0" strokeWidth={2} />
                {downloading
                  ? t("publicBill.downloadingQr")
                  : t("publicBill.downloadQr")}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="pay-sheet-rise pay-sheet-d5 w-full max-w-sm">
          <UpiAppLogos
            className="mt-0"
            openApps
            phone={phone}
            kind={kind}
            hint={t("publicBill.openUpiAppHint")}
            actionLabel={t("publicBill.openUpiAppAction")}
          />
        </div>
      </div>
    </div>
  );
}

function PublicBillBody({ snapshot }) {
  const { entry, customer, business, themeId } = snapshot;
  return (
    <>
      <EntryBillPreview
        entry={entry}
        customer={customer}
        business={business}
        themeId={themeId}
      />
      <PayWithUpi
        business={business}
        amount={payAmountForPublicBill(entry)}
        kind="bill"
      />
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}

function PublicStatementBody({ snapshot }) {
  const { language } = useTranslation();
  const { customer, business, entries = [], balance, billed, themeId } =
    snapshot;
  const due = collectableRupees(balance);

  return (
    <>
      <EntryBillPreview
        customer={customer}
        business={business}
        themeId={themeId}
        statement={{
          balance,
          billed,
          due,
          entries,
        }}
      />

      <PayWithUpi
        business={business}
        amount={due}
        kind="statement"
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
              />
            </div>
          ))}
        </SoftCard>
      ) : null}
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}
