"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { IndianRupee } from "lucide-react";
import { CreatedWithMoneyKit } from "@/components/created-with-moneykit";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import {
  decodePublicBill,
  payAmountForPublicBill,
} from "@/lib/public-bill";
import { buildUpiPaymentUrl, isValidUpiId } from "@/lib/upi";

function PublicBillView() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const snapshot = useMemo(
    () => decodePublicBill(searchParams.get("d") || ""),
    [searchParams]
  );

  if (!snapshot) {
    return (
      <SoftCard className="p-6 text-center">
        <p className="text-base font-semibold text-zinc-950 dark:text-white">
          {t("publicBill.invalid")}
        </p>
      </SoftCard>
    );
  }

  const { entry, customer, business, themeId } = snapshot;
  const payAmount = payAmountForPublicBill(entry);
  const upiUrl = isValidUpiId(business.upiId)
    ? buildUpiPaymentUrl({
        upiId: business.upiId,
        name: business.name,
        amount: payAmount,
      })
    : "";

  return (
    <>
      <EntryBillPreview
        entry={entry}
        customer={customer}
        business={business}
        themeId={themeId}
      />
      {upiUrl ? (
        <a
          href={upiUrl}
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--forest)] text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
        >
          <IndianRupee className="size-4" />
          {t("publicBill.pay")}
        </a>
      ) : null}
      <div className="mt-6 flex justify-center">
        <CreatedWithMoneyKit />
      </div>
    </>
  );
}

export default function PublicBillPage() {
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
      <Suspense
        fallback={
          <p className="text-center text-sm text-zinc-500">
            {t("common.loading")}
          </p>
        }
      >
        <PublicBillView />
      </Suspense>
    </div>
  );
}
