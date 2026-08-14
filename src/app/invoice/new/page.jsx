"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { toDateInputValue } from "@/lib/format";
import { findCustomersByName } from "@/lib/store";

function InvoiceForm() {
  const router = useRouter();
  const { customers, addCustomer, addEntry } = useApp();
  const { t } = useTranslation();

  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toDateInputValue());
  const [selectedId, setSelectedId] = useState(null);

  const matches = useMemo(
    () => findCustomersByName(customers, name),
    [customers, name]
  );

  const exactMatch = useMemo(() => {
    const q = name.trim().toLowerCase();
    return customers.find((c) => c.name.toLowerCase() === q) || null;
  }, [customers, name]);

  const needsNewCustomer = name.trim() && !selectedId && !exactMatch;

  function pickCustomer(customer) {
    setSelectedId(customer.id);
    setName(customer.name);
    setPhone(customer.phone || "");
  }

  function onSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0 || !name.trim()) return;

    let customerId = selectedId || exactMatch?.id;
    if (!customerId) {
      const created = addCustomer({ name, phone });
      customerId = created.id;
    }

    addEntry({
      customerId,
      type: "invoice",
      amount: value,
      description: description || t("common.bill"),
      date,
    });

    router.replace(`/customers/${customerId}`);
  }

  return (
    <>
      <PageHeader
        title={t("invoice.title")}
        subtitle={t("invoice.subtitle")}
        backHref="/"
        backLabel={t("nav.home")}
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
            <Label htmlFor="customer">{t("invoice.customer")}</Label>
            <Input
              id="customer"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelectedId(null);
              }}
              placeholder={t("invoice.customerPlaceholder")}
              className="h-12 rounded-2xl"
              required
            />

            {matches.length > 0 && !selectedId ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                {matches.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => pickCustomer(customer)}
                    className="flex w-full items-center justify-between border-b border-zinc-100 px-4 py-3 text-left last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {customer.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {customer.phone || t("customers.noPhone")}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {needsNewCustomer ? (
              <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {t("invoice.newCustomerHint")}
                </p>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("customerNew.phone")}
                  className="h-11 rounded-xl bg-white dark:bg-zinc-900"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("entry.note")}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("invoice.notePlaceholder")}
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t("invoice.date")}</Label>
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
            {t("invoice.save")}
          </Button>
        </form>
      </SoftCard>
    </>
  );
}

export default function NewInvoicePage() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">{t("common.loading")}</p>}>
      <InvoiceForm />
    </Suspense>
  );
}
