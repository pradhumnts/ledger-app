"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ShareActions } from "@/components/share-actions";
import { SoftCard } from "@/components/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import {
  entryTypeLabel,
  formatEntryDateTime,
  formatINR,
  initials,
} from "@/lib/format";
import { exportEntryPdf } from "@/lib/pdf";
import { buildEntryMessage, openSMS, openWhatsApp } from "@/lib/share";
import { cn } from "@/lib/utils";

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

  const isGot = entry.type === "got";
  const typeLabel = entryTypeLabel(entry.type, language);

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
        <Link
          href={`/customers/${customer.id}`}
          className="inline-flex items-center gap-0.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ChevronLeft className="size-4" />
          {customer.name}
        </Link>
      </div>

      <SoftCard className="mb-5 overflow-hidden p-5">
        <div className="mb-4 flex items-start gap-3">
          <Avatar className="size-11 shrink-0 border border-black/5 dark:border-white/10">
            <AvatarFallback className="bg-[var(--forest)] text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-500">{typeLabel}</p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {formatEntryDateTime(entry.date, language)}
            </p>
          </div>
        </div>

        <p
          className={cn(
            "text-[2.5rem] font-semibold tracking-tight tabular-nums",
            isGot
              ? "text-[var(--mint)]"
              : "text-zinc-950 dark:text-white"
          )}
        >
          {isGot ? "+" : "-"}
          {formatINR(entry.amount)}
        </p>

        {entry.description ? (
          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="mb-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">
              {t("common.description")}
            </p>
            <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-200">
              {entry.description}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">
            {t("common.noDescription")}
          </p>
        )}
      </SoftCard>

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
