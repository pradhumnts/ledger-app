"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  MessageCircle,
  Pencil,
  Phone,
  Share2,
} from "lucide-react";
import { ActivityRow } from "@/components/activity-row";
import { BackLink } from "@/components/back-link";
import { ShareActions } from "@/components/share-actions";
import { SoftCard, Divider } from "@/components/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import {
  entryTypeLabel,
  formatDateHeader,
  formatINR,
  initials,
} from "@/lib/format";
import {
  buildCustomerStatementMessage,
  openSMS,
  shareOnWhatsApp,
} from "@/lib/share";
import { exportCustomerStatementPdf } from "@/lib/pdf";
import {
  customerBalance,
  customerTotals,
  entriesForCustomer,
  groupEntriesByDate,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { rememberCustomerOrigin } from "@/lib/nav-memory";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { ready, getCustomer, entries, business, settings } = useApp();
  const { t, language } = useTranslation();
  const customer = getCustomer(id);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (id) rememberCustomerOrigin(id, `/customers/${id}`);
  }, [id]);

  const history = useMemo(
    () => entriesForCustomer(entries, id),
    [entries, id]
  );
  const balance = useMemo(
    () => customerBalance(entries, id),
    [entries, id]
  );

  const groups = useMemo(
    () => groupEntriesByDate(history),
    [history]
  );

  const totals = useMemo(
    () => customerTotals(entries, id),
    [entries, id]
  );

  if (!ready) {
    return <p className="text-sm text-zinc-500">{t("common.loading")}</p>;
  }

  if (!customer) {
    return (
      <>
        <p className="mb-4 text-sm text-zinc-500">{t("customers.notFound")}</p>
        <Link href="/customers" className="text-sm font-medium text-[var(--forest)]">
          {t("customers.backToCustomers")}
        </Link>
      </>
    );
  }

  async function shareAll(channel) {
    const text = buildCustomerStatementMessage({
      customer,
      entries: history,
      balance,
      business,
      language,
    });
    if (channel === "sms") {
      openSMS({ phone: customer.phone, text });
      return;
    }

    await shareOnWhatsApp({
      phone: customer.phone,
      text,
    });
  }

  async function exportAllPdf() {
    await exportCustomerStatementPdf({
      customer,
      entries: history,
      balance,
      totals,
      business,
      billThemeId: settings.billTheme,
    });
  }

  const balanceLabel =
    balance === 0
      ? t("common.settled")
      : balance > 0
        ? t("common.toCollect")
        : t("common.toPay");

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <BackLink
          fallback="/customers"
          nestedPrefix={`/customers/${id}/`}
          originForCustomerId={id}
        >
          {t("common.back")}
        </BackLink>
        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex size-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/12 dark:bg-[var(--card)] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
            aria-label={t("customers.edit")}
          >
            <Pencil className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/12 dark:bg-[var(--card)] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
            aria-label={t("customers.shareAll")}
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>

      <SoftCard className="mb-8 overflow-hidden p-5">
        <div className="mb-5 flex items-start gap-3.5">
          <Avatar className="size-14 shrink-0 border border-black/5 shadow-sm dark:border-white/10">
            <AvatarFallback className="bg-[var(--forest)] text-lg font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="truncate text-[1.35rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
              {customer.name}
            </h1>
            {customer.phone ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                <Phone className="size-3.5 shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-400">
                {t("customers.noPhone")}
              </p>
            )}
          </div>
        </div>

        <p className="mb-1 text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {balanceLabel}
        </p>
        <p
          className={cn(
            "mb-5 text-[2.35rem] font-semibold tracking-tight tabular-nums",
            balance > 0
              ? "text-[var(--mint)]"
              : "text-zinc-950 dark:text-white"
          )}
        >
          {balance === 0 ? formatINR(0) : formatINR(Math.abs(balance))}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-zinc-50 px-3.5 py-3 dark:bg-[var(--well)]">
            <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
              {t("entry.billed")}
            </div>
            <p className="text-base font-semibold tabular-nums text-zinc-950 dark:text-white">
              {formatINR(totals.billed)}
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 px-3.5 py-3 dark:bg-[var(--well)]">
            <div className="mb-1 flex items-center gap-1 text-xs text-zinc-500">
              {t("entry.due")}
            </div>
            <p className="text-base font-semibold tabular-nums text-[var(--mint)]">
              {formatINR(Math.max(0, totals.due))}
            </p>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-white/[0.08]">
            <p className="mb-1 text-sm font-semibold text-zinc-950 dark:text-white">
              {t("customers.shareAll")}
            </p>
            <p className="mb-3 text-xs text-zinc-500">
              {t("customers.shareAllHint")}
            </p>
            <ShareActions
              size="compact"
              onWhatsApp={() => shareAll("whatsapp")}
              onSMS={() => shareAll("sms")}
              onPDF={exportAllPdf}
            />
          </div>
        ) : null}
      </SoftCard>

      <div className="mb-3">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
          {t("customers.history")}
        </h2>
        {history.length > 0 ? (
          <p className="mt-0.5 text-sm text-zinc-500">
            {t("customers.historyHint")}
          </p>
        ) : null}
      </div>

      {history.length === 0 ? (
        <SoftCard className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-[var(--well)]">
            <MessageCircle className="size-5 text-zinc-300" />
          </div>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t("customers.noEntries")}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {t("customers.noEntriesHint")}
          </p>
        </SoftCard>
      ) : (
        <div className="space-y-5 pb-28">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                {formatDateHeader(group.date, language)}
              </p>
              <SoftCard>
                {group.items.map((entry, index) => (
                  <div key={entry.id}>
                    {index > 0 ? <Divider /> : null}
                    <ActivityRow
                      href={`/customers/${customer.id}/entry/${entry.id}`}
                      title={entryTypeLabel(entry.type, language)}
                      amount={entry.amount}
                      type={entry.type}
                      date={entry.date}
                      nameForInitials={customer.name}
                    />
                  </div>
                ))}
              </SoftCard>
            </div>
          ))}
        </div>
      )}

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("customers.shareAllDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("customers.shareAllDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <ShareActions
            onWhatsApp={async () => {
              await shareAll("whatsapp");
              setShareOpen(false);
            }}
            onSMS={() => {
              shareAll("sms");
              setShareOpen(false);
            }}
            onPDF={async () => {
              await exportAllPdf();
              setShareOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="page-enter-skip pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <Link
          href={`/invoice/new?customerId=${customer.id}`}
          className="pointer-events-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(11,48,31,0.28)] transition-[opacity,transform] duration-200 ease-out hover:opacity-90 active:scale-[0.98] dark:bg-[var(--lime)] dark:text-[var(--forest)] dark:shadow-[0_8px_30px_rgba(200,232,106,0.22)]"
        >
          <FileText className="size-4" />
          {t("home.createBill")}
        </Link>
      </div>
    </>
  );
}
