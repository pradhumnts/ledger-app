"use client";

import { BackLink } from "@/components/back-link";
import { EntryBillPreview } from "@/components/entry-bill-preview";
import { ShareActions } from "@/components/share-actions";
import { SoftCard } from "@/components/ui-kit";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { exportEntryPdf } from "@/lib/pdf";
import { buildEntryMessage, openSMS, openWhatsApp } from "@/lib/share";

export default function EntryDetailPage() {
  const params = useParams();
  const customerId = params?.id;
  const entryId = params?.entryId;
  const { ready, getCustomer, entries, business, settings } = useApp();
  const { t, language } = useTranslation();

  const customer = getCustomer(customerId);
  const entry = entries.find((item) => item.id === entryId);

  if (!ready) {
    return <p className="text-sm text-zinc-500">{t("common.loading")}</p>;
  }

  if (!customer || !entry || entry.customerId !== customer.id) {
    return (
      <>
        <p className="mb-4 text-sm text-zinc-500">{t("entry.notFound")}</p>
        <Link
          href={customer ? `/customers/${customer.id}` : "/customers"}
          className="text-sm font-medium text-[var(--forest)]"
        >
          {t("entry.backToCustomer")}
        </Link>
      </>
    );
  }

  function shareEntry(channel) {
    const text = buildEntryMessage({ entry, customer, business, language });
    if (channel === "whatsapp") openWhatsApp({ phone: customer.phone, text });
    else openSMS({ phone: customer.phone, text });
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
        <BackLink to={`/customers/${customer.id}`}>
          {customer.name}
        </BackLink>
      </div>

      <div className="mb-5">
        <EntryBillPreview
          entry={entry}
          customer={customer}
          business={business}
          themeId={settings.billTheme}
          t={t}
          language={language}
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
