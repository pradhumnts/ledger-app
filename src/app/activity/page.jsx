"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ActivityRow } from "@/components/activity-row";
import { SoftCard, Divider } from "@/components/ui-kit";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { formatDateHeader } from "@/lib/format";
import { groupEntriesByDate, recentActivity } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const { customers, entries } = useApp();
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [customerId, setCustomerId] = useState("all");

  const filters = useMemo(
    () => [
      { id: "all", label: t("activity.filterAll") },
      { id: "got", label: t("activity.filterGot") },
      { id: "gave", label: t("activity.filterGave") },
      { id: "invoice", label: t("activity.filterBills") },
    ],
    [t]
  );

  const filtered = useMemo(() => {
    let list = recentActivity(entries, customers, 200);
    if (filter !== "all") list = list.filter((e) => e.type === filter);
    if (customerId !== "all") {
      list = list.filter((e) => e.customerId === customerId);
    }
    return list;
  }, [entries, customers, filter, customerId]);

  const groups = useMemo(() => groupEntriesByDate(filtered), [filtered]);

  return (
    <>
      <PageHeader title={t("activity.title")} subtitle={t("activity.subtitle")} />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97]",
              filter === item.id
                ? "border-[var(--forest)] bg-[var(--forest)] text-white dark:border-[var(--lime)] dark:bg-[var(--lime)] dark:text-[var(--forest)]"
                : "border-zinc-200 bg-white text-zinc-500 dark:border-white/12 dark:bg-[var(--card)] dark:text-zinc-400"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <p className="mb-1.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
          {t("activity.customerLabel")}
        </p>
        <div className="relative">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="h-12 w-full appearance-none rounded-full border border-zinc-200 bg-white px-4 pr-10 text-sm font-medium text-zinc-900 outline-none dark:border-white/12 dark:bg-[var(--card)] dark:text-white"
          >
            <option value="all">{t("activity.allCustomers")}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {groups.length === 0 ? (
        <SoftCard className="px-4 py-12 text-center">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {t("activity.noActivity")}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {t("activity.noActivityHint")}
          </p>
        </SoftCard>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                {formatDateHeader(group.date, language)}
              </p>
              <SoftCard>
                {group.items.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 ? <Divider /> : null}
                    <ActivityRow
                      href={`/customers/${item.customerId}/entry/${item.id}`}
                      title={item.customer?.name || t("common.customer")}
                      amount={item.amount}
                      type={item.type}
                      date={item.date}
                      nameForInitials={item.customer?.name}
                    />
                  </div>
                ))}
              </SoftCard>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
