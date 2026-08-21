"use client";

import { Suspense, useRef, useState } from "react";
import { BackLink } from "@/components/back-link";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { PageSpinner } from "@/components/page-spinner";
import { ShareActions } from "@/components/share-actions";
import { SoftCard } from "@/components/ui-kit";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { exportEntryPdf } from "@/lib/pdf";
import { shareBillImage } from "@/lib/share-bill-image";
import { buildEntryMessage, openSMS } from "@/lib/share";

function EntryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const customerId = params?.id;
  const entryId = params?.entryId;
  const fromHome = searchParams.get("from") === "home";
  const { ready, getCustomer, entries, business, settings } = useApp();
  const { t, language } = useTranslation();
  const billRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const customer = getCustomer(customerId);
  const entry = entries.find((item) => item.id === entryId);
  const customerHref = customer ? `/customers/${customer.id}` : "/customers";
  const backHref = fromHome ? "/" : customerHref;

  if (!ready) {
    return <PageSpinner />;
  }

  if (!customer || !entry || entry.customerId !== customer.id) {
    return (
      <>
        <p className="mb-4 text-sm text-zinc-500">{t("entry.notFound")}</p>
        <Link
          href={backHref}
          className="text-sm font-medium text-[var(--forest)]"
        >
          {fromHome ? t("nav.home") : t("entry.backToCustomer")}
        </Link>
      </>
    );
  }

  async function shareEntry(channel) {
    const text = await buildEntryMessage({
      entry,
      customer,
      business,
      language,
      themeId: settings.billTheme,
    });
    if (channel === "sms") {
      openSMS({ phone: customer.phone, text });
      return;
    }

    if (sharing) return;
    setSharing(true);
    try {
      await shareBillImage({
        element: billRef.current,
        text,
        entry,
        customer,
        language,
      });
    } finally {
      setSharing(false);
    }
  }

  async function exportPdf() {
    await exportEntryPdf({
      entry,
      customer,
      business,
      billThemeId: settings.billTheme,
    });
  }

  return (
    <>
      <div className="mb-5">
        <BackLink to={backHref}>
          {fromHome ? t("nav.home") : customer.name}
        </BackLink>
      </div>

      <div ref={billRef} className="mb-5 p-1">
        <EntryBillPreview
          entry={entry}
          customer={customer}
          business={business}
          themeId={settings.billTheme}
        />
      </div>

      <SoftCard className="p-5">
        <p className="mb-1 text-sm font-semibold text-zinc-950 dark:text-white">
          {t("entry.shareEntry")}
        </p>
        <p className="mb-4 text-sm text-zinc-500">
          {t("entry.shareEntryHint")}
        </p>
        <ShareActions
          onWhatsApp={() => shareEntry("whatsapp")}
          onSMS={() => shareEntry("sms")}
          onPDF={exportPdf}
        />
      </SoftCard>
    </>
  );
}

export default function EntryDetailRoute() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <EntryDetailPage />
    </Suspense>
  );
}
