"use client";

import Link from "next/link";
import {
  CalendarDays,
  Eye,
  FileText,
  IndianRupee,
  QrCode,
  UserPlus,
} from "lucide-react";
import { ActivityRow } from "@/components/activity-row";
import { SoftCard, Divider } from "@/components/ui-kit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import {
  formatINR,
  greetingForNow,
  initials,
} from "@/lib/format";
import {
  customerBalance,
  recentActivity,
  summarizeEntries,
} from "@/lib/store";

export default function HomePage() {
  const { ready, customers, entries, business } = useApp();
  const { t, language } = useTranslation();
  const summary = summarizeEntries(entries);
  const activity = recentActivity(entries, customers, 8);
  const toCollect = customers.reduce((sum, c) => {
    const bal = customerBalance(entries, c.id);
    return bal > 0 ? sum + bal : sum;
  }, 0);
  const totalToday = summary.todayIn + summary.todayOut;
  const totalMonth = summary.monthIn + summary.monthOut;

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.85rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
            {greetingForNow(new Date(), language)}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{t("home.moneyToday")}</p>
        </div>
        <Link
          href="/pay"
          className="flex size-16 items-center justify-center rounded-[1.25rem] border border-black/5 bg-white shadow-sm transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.98] dark:border-white/[0.12] dark:bg-[var(--card)]"
          aria-label={t("home.showPaymentQr")}
        >
          <QrCode className="size-8 text-[var(--forest)] dark:text-[var(--lime)]" />
        </Link>
      </div>

      <SoftCard className="mb-8 p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <Avatar className="size-8">
            {business.logo ? (
              <AvatarImage src={business.logo} alt={business.name || "Logo"} />
            ) : null}
            <AvatarFallback className="bg-[var(--forest)] text-xs text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
              {initials(business.name || "LB")}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {business.name || t("home.yourBusiness")}
          </p>
          <Eye className="size-4 text-zinc-400" />
        </div>

        <p className="mb-1 text-sm font-medium text-zinc-500">
          {t("home.totalToday")}
        </p>
        <p className="mb-5 text-[2.75rem] leading-none font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
          {ready ? formatINR(totalToday) : "—"}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-4 py-3 text-sm font-semibold text-white transition-[opacity,transform] duration-200 ease-out hover:opacity-90 active:scale-[0.98] dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          >
            <UserPlus className="size-4" />
            {t("home.addCustomer")}
          </Link>
          <Link
            href="/invoice/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lime)] px-4 py-3 text-sm font-semibold text-[var(--forest)] transition-[opacity,transform,box-shadow] duration-200 ease-out hover:opacity-90 active:scale-[0.98] dark:bg-white/[0.06] dark:text-[var(--lime)] dark:ring-1 dark:ring-[var(--lime)]/45"
          >
            <FileText className="size-4" />
            {t("home.createBill")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-zinc-50 px-3.5 py-3.5 dark:bg-[var(--well)]">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.06]">
                <IndianRupee className="size-3.5 text-zinc-700 dark:text-zinc-200" strokeWidth={2.25} />
              </div>
              <p className="text-xs font-medium leading-tight text-zinc-500">
                {t("home.totalDueToday")}
              </p>
            </div>
            <p className="text-xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
              {formatINR(toCollect)}
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 px-3.5 py-3.5 dark:bg-[var(--well)]">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.06]">
                <CalendarDays className="size-3.5 text-zinc-700 dark:text-zinc-200" strokeWidth={2.25} />
              </div>
              <p className="text-xs font-medium leading-tight text-zinc-500">
                {t("home.totalThisMonth")}
              </p>
            </div>
            <p className="text-xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
              {formatINR(totalMonth)}
            </p>
          </div>
        </div>
      </SoftCard>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
          {t("home.recentActivity")}
        </h2>
        <Link
          href="/activity"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          {t("home.seeDetails")}
        </Link>
      </div>

      <SoftCard>
        {!ready ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            {t("common.loading")}
          </p>
        ) : activity.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {t("home.noActivity")}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {t("home.noActivityHint")}
            </p>
          </div>
        ) : (
          activity.map((item, index) => (
            <div key={item.id}>
              {index > 0 ? <Divider /> : null}
              <ActivityRow
                href={`/customers/${item.customerId}`}
                title={
                  item.customer?.name ||
                  (item.type === "invoice"
                    ? t("common.bill")
                    : t("common.entry"))
                }
                amount={item.amount}
                type={item.type}
                date={item.date}
                nameForInitials={item.customer?.name}
              />
            </div>
          ))
        )}
      </SoftCard>
    </>
  );
}
