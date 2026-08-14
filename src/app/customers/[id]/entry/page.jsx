"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { toDateInputValue } from "@/lib/format";

function EntryForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getCustomer, addEntry } = useApp();
  const { t } = useTranslation();

  const id = params?.id;
  const customer = getCustomer(id);
  const typeParam = searchParams.get("type");
  const type = typeParam === "got" ? "got" : "gave";

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toDateInputValue());

  const title = useMemo(
    () =>
      type === "got" ? t("entry.addTitleGot") : t("entry.addTitleGave"),
    [type, t]
  );

  function onSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!customer || !value || value <= 0) return;
    addEntry({
      customerId: customer.id,
      type,
      amount: value,
      description,
      date,
    });
    router.replace(`/customers/${customer.id}`);
  }

  if (!customer) {
    return <p className="text-sm text-zinc-500">{t("customers.notFound")}</p>;
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={customer.name}
        backHref={`/customers/${customer.id}`}
        backLabel={customer.name}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("entry.amountRupee")}</Label>
            <Input
              id="amount"
              autoFocus
              inputMode="numeric"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-14 rounded-2xl text-2xl font-semibold tabular-nums"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("entry.note")}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("entry.notePlaceholder")}
              className="h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{t("entry.date")}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-2xl"
              required
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[var(--forest)] text-base font-semibold text-white hover:bg-[var(--forest-soft)] dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          >
            {t("entry.save")}
          </Button>
        </form>
      </SoftCard>
    </>
  );
}

export default function CustomerEntryPage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">{t("common.loading")}</p>}>
      <EntryForm />
    </Suspense>
  );
}
