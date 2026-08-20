"use client";

import { IndianRupee } from "lucide-react";
import { ActivityRow } from "@/components/activity-row";
import { CreatedWithMoneyKit } from "@/components/created-with-moneykit";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { Divider, SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import { entryTypeLabel, formatINR } from "@/lib/format";
import { collectableRupees } from "@/lib/ledger-math";
import { isPublicStatement, payAmountForPublicBill } from "@/lib/public-bill";
import { cn } from "@/lib/utils";
import { buildUpiPaymentUrl, isValidUpiId } from "@/lib/upi";

export function PublicBillScreen({ snapshot, loading = false }) {
  const { t } = useTranslation();

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
      {loading ? (
        <p className="text-center text-sm text-zinc-500">{t("common.loading")}</p>
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

function PayWithUpi({ business, amount }) {
  const { t } = useTranslation();
  const upiUrl = isValidUpiId(business?.upiId)
    ? buildUpiPaymentUrl({
        upiId: business.upiId,
        name: business.name,
        amount,
      })
    : "";
  if (!upiUrl) return null;
  return (
    <a
      href={upiUrl}
      className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--forest)] text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
    >
      <IndianRupee className="size-4" />
      {t("publicBill.pay")}
    </a>
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
      <PayWithUpi business={business} amount={payAmountForPublicBill(entry)} />
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}

function PublicStatementBody({ snapshot }) {
  const { t, language } = useTranslation();
  const { customer, business, entries = [], balance, billed } = snapshot;
  const due = collectableRupees(balance);
  const details = [business?.phone, business?.address].filter(Boolean).join(" · ");
  const balanceLabel =
    balance === 0
      ? t("common.settled")
      : balance > 0
        ? t("common.toCollect")
        : t("common.toPay");

  return (
    <>
      <SoftCard className="p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
          {t("publicBill.allBills")}
        </p>
        <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
          {business?.name || APP_NAME}
        </p>
        {details ? (
          <p className="mt-0.5 text-sm text-zinc-500">{details}</p>
        ) : null}

        <p className="mt-5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {t("entry.billedTo")}
        </p>
        <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
          {customer?.name || t("common.customer")}
        </p>
        {customer?.phone ? (
          <p className="mt-1 text-sm text-zinc-500">{customer.phone}</p>
        ) : null}

        <p className="mt-5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {balanceLabel}
        </p>
        <p
          className={cn(
            "mt-1 text-[2.35rem] font-semibold tracking-tight tabular-nums",
            balance > 0
              ? "text-[var(--mint)]"
              : "text-zinc-950 dark:text-white"
          )}
        >
          {formatINR(Math.abs(balance || 0))}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-zinc-50 px-3.5 py-3 dark:bg-[var(--well)]">
            <p className="mb-1 text-xs text-zinc-500">{t("entry.billed")}</p>
            <p className="text-base font-semibold tabular-nums text-zinc-950 dark:text-white">
              {formatINR(billed)}
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 px-3.5 py-3 dark:bg-[var(--well)]">
            <p className="mb-1 text-xs text-zinc-500">{t("entry.due")}</p>
            <p className="text-base font-semibold tabular-nums text-[var(--mint)]">
              {formatINR(due)}
            </p>
          </div>
        </div>
      </SoftCard>

      {entries.length > 0 ? (
        <SoftCard className="mt-4">
          {entries.map((entry, index) => (
            <div key={entry.id || `${entry.date}-${index}`}>
              {index > 0 ? <Divider /> : null}
              <ActivityRow
                title={entryTypeLabel(entry.type, language)}
                amount={entry.amount}
                type={entry.type}
                date={entry.date}
                nameForInitials={customer?.name}
              />
            </div>
          ))}
        </SoftCard>
      ) : null}

      <PayWithUpi business={business} amount={due > 0 ? due : undefined} />
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}
