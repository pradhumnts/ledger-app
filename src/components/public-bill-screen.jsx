"use client";

import { IndianRupee } from "lucide-react";
import { ActivityRow } from "@/components/activity-row";
import { CreatedWithMoneyKit } from "@/components/created-with-moneykit";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { Divider, SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import { entryTypeLabel } from "@/lib/format";
import { collectableRupees } from "@/lib/ledger-math";
import { isPublicStatement, payAmountForPublicBill } from "@/lib/public-bill";
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
  const { customer, business, entries = [], balance, billed, themeId } = snapshot;
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
