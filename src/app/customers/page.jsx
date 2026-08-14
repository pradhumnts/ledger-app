"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SoftCard, ListRow, Divider } from "@/components/ui-kit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { formatINR, initials } from "@/lib/format";
import { customerBalance } from "@/lib/store";
import { useMemo, useState } from "react";

export default function CustomersPage() {
  const { customers, entries } = useApp();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .map((c) => ({
        ...c,
        balance: customerBalance(entries, c.id),
      }))
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          String(c.phone || "").includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, entries, query]);

  return (
    <>
      <PageHeader
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        action={
          <Link
            href="/customers/new"
            className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--forest)] text-white transition-transform duration-200 ease-out active:scale-95 dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("customers.searchPlaceholder")}
          className="h-12 rounded-2xl border-zinc-200 bg-white pl-10 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <SoftCard>
        {list.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {customers.length === 0
                ? t("customers.noCustomers")
                : t("customers.noMatches")}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {customers.length === 0
                ? t("customers.noCustomersHint")
                : t("customers.noMatchesHint")}
            </p>
            {customers.length === 0 ? (
              <Link
                href="/customers/new"
                className="mt-4 inline-flex rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
              >
                {t("customers.addCustomer")}
              </Link>
            ) : null}
          </div>
        ) : (
          list.map((customer, index) => (
            <div key={customer.id}>
              {index > 0 ? <Divider /> : null}
              <ListRow
                href={`/customers/${customer.id}`}
                leading={
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {initials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                }
                title={customer.name}
                subtitle={
                  customer.balance === 0
                    ? customer.phone || t("common.settled")
                    : customer.balance > 0
                      ? `${t("common.toCollect")} · ${formatINR(customer.balance)}`
                      : `${t("common.toPay")} · ${formatINR(Math.abs(customer.balance))}`
                }
              />
            </div>
          ))
        )}
      </SoftCard>
    </>
  );
}
