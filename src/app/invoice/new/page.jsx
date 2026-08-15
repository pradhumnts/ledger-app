"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError } from "@/components/field-error";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { SoftCard } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceField } from "@/components/voice-field";
import { useApp } from "@/context/app-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { useSubmitting } from "@/hooks/use-submitting";
import { useTranslation } from "@/hooks/use-translation";
import { toDateInputValue } from "@/lib/format";
import { findCustomersByName } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateAmount,
  validateDate,
  validateOptionalPhone,
  validateRequiredName,
} from "@/lib/validation";

function InvoiceForm() {
  const router = useRouter();
  const { customers, addCustomer, addEntry } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, showErrors } = useFieldErrors();
  const { submitting, start, stop } = useSubmitting();

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

  const needsNewCustomer =
    Boolean(name.trim()) && !selectedId && !exactMatch && matches.length === 0;

  function pickCustomer(customer) {
    setSelectedId(customer.id);
    setName(customer.name);
    setPhone(customer.phone || "");
    clearField("customer");
    clearField("phone");
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!start()) return;

    const next = collectErrors({
      amount: validateAmount(amount),
      customer: validateRequiredName(name),
      phone: needsNewCustomer ? validateOptionalPhone(phone) : "",
      date: validateDate(date),
    });
    if (!showErrors(next, { customer: "customer" })) {
      stop();
      return;
    }

    let customerId = selectedId || exactMatch?.id;
    if (!customerId) {
      const created = addCustomer({ name, phone });
      customerId = created.id;
    }

    addEntry({
      customerId,
      type: "invoice",
      amount: Number(amount),
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
        backLabel={t("common.back")}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={submitting}>
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
              onChange={(e) => {
                setAmount(e.target.value);
                clearField("amount");
              }}
              placeholder="0"
              className={cn(
                "h-14 rounded-2xl text-2xl font-semibold tabular-nums",
                fieldInvalidClass(errors.amount)
              )}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            <FieldError id="amount-error">
              {errors.amount ? t(errors.amount) : null}
            </FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">{t("invoice.customer")}</Label>
            <VoiceField
              id="customer"
              kind="name"
              value={name}
              onValueChange={(next) => {
                setName(next);
                setSelectedId(null);
                clearField("customer");
              }}
              placeholder={t("invoice.customerPlaceholder")}
              className={cn(
                "h-12 rounded-2xl",
                fieldInvalidClass(errors.customer)
              )}
              aria-invalid={Boolean(errors.customer)}
              aria-describedby={errors.customer ? "customer-error" : undefined}
            />
            <FieldError id="customer-error">
              {errors.customer ? t(errors.customer) : null}
            </FieldError>

            {matches.length > 0 && !selectedId ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/12 dark:bg-[var(--card)]">
                {matches.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => pickCustomer(customer)}
                    className="flex w-full items-center justify-between border-b border-zinc-100 px-4 py-3 text-left last:border-b-0 hover:bg-zinc-50 dark:border-white/[0.08] dark:hover:bg-white/[0.04]"
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
          </div>

          {needsNewCustomer ? (
            <div className="space-y-2">
              <Label htmlFor="phone" className="w-full justify-between">
                {t("customerNew.phone")}
                <span className="font-normal text-zinc-400">{t("common.optional")}</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearField("phone");
                }}
                placeholder={t("customerNew.phonePlaceholder")}
                className={cn(
                  "h-12 rounded-2xl",
                  fieldInvalidClass(errors.phone)
                )}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              <FieldError id="phone-error">
                {errors.phone ? t(errors.phone) : null}
              </FieldError>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="description" className="w-full justify-between">
              {t("entry.note")}
              <span className="font-normal text-zinc-400">{t("common.optional")}</span>
            </Label>
            <VoiceField
              id="description"
              kind="text"
              multiline
              value={description}
              onValueChange={setDescription}
              placeholder={t("invoice.notePlaceholder")}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t("invoice.date")}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                clearField("date");
              }}
              className={cn("h-12 rounded-2xl", fieldInvalidClass(errors.date))}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "date-error" : undefined}
            />
            <FieldError id="date-error">
              {errors.date ? t(errors.date) : null}
            </FieldError>
          </div>

          <SubmitButton loading={submitting} loadingLabel={t("common.saving")}>
            {t("invoice.save")}
          </SubmitButton>
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
