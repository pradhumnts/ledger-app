"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { formatINR, toDateInputValue } from "@/lib/format";
import { customerBalance, findCustomersByName } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateAmount,
  validateDate,
  validateDue,
  validateOptionalPhone,
  validateRequiredName,
} from "@/lib/validation";

function KindToggle({ kind, onChange, t }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-zinc-100 p-1 dark:bg-white/[0.06]">
      {[
        { id: "bill", label: t("invoice.kindBill") },
        { id: "due", label: t("invoice.kindDue") },
      ].map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "h-10 rounded-full text-sm font-semibold transition-colors",
            kind === item.id
              ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-zinc-500"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, customers, entries, addCustomer, addEntry, getCustomer } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, setField, showErrors } = useFieldErrors();
  const { submitting, start, stop } = useSubmitting();

  const presetId = searchParams.get("customerId");
  const presetCustomer = presetId ? getCustomer(presetId) : null;
  const isDue = searchParams.get("kind") === "due";

  const [kind, setKind] = useState(isDue ? "due" : "bill");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [name, setName] = useState(presetCustomer?.name || "");
  const [phone, setPhone] = useState(presetCustomer?.phone || "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toDateInputValue());
  const [selectedId, setSelectedId] = useState(presetCustomer?.id || null);

  useEffect(() => {
    if (!presetCustomer) return;
    setSelectedId(presetCustomer.id);
    setName(presetCustomer.name);
    setPhone(presetCustomer.phone || "");
  }, [presetCustomer]);

  const matches = useMemo(
    () => (presetCustomer ? [] : findCustomersByName(customers, name)),
    [customers, name, presetCustomer]
  );

  const exactMatch = useMemo(() => {
    if (presetCustomer) return presetCustomer;
    const q = name.trim().toLowerCase();
    return customers.find((c) => c.name.toLowerCase() === q) || null;
  }, [customers, name, presetCustomer]);

  const needsNewCustomer =
    !presetCustomer &&
    Boolean(name.trim()) &&
    !selectedId &&
    !exactMatch &&
    matches.length === 0;

  const previewCustomerId = presetCustomer?.id || selectedId || exactMatch?.id;
  const currentDue = previewCustomerId
    ? customerBalance(entries, previewCustomerId)
    : 0;
  const paidValue = Number(amount);
  const remainingAfter =
    Number.isFinite(paidValue) && paidValue > 0
      ? Math.max(0, currentDue - paidValue)
      : currentDue;

  function updateAmount(next) {
    setAmount(next);
    clearField("amount");
    if (kind === "bill") setField("due", validateDue(due, next));
  }

  function updateDue(next) {
    setDue(next);
    setField("due", validateDue(next, amount));
  }

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
      due: kind === "bill" ? validateDue(due, amount) : "",
      customer: presetCustomer ? "" : validateRequiredName(name),
      phone: needsNewCustomer ? validateOptionalPhone(phone) : "",
      date: validateDate(date),
    });
    if (!showErrors(next, { customer: "customer" })) {
      stop();
      return;
    }

    let customerId = presetCustomer?.id || selectedId || exactMatch?.id;
    if (!customerId) {
      const created = addCustomer({ name, phone });
      customerId = created.id;
    }

    const billed = Number(amount);
    if (kind === "bill") {
      const outstanding = due.trim() === "" ? billed : Number(due);
      if (outstanding > billed) {
        showErrors({ due: "validation.dueTooLarge" });
        stop();
        return;
      }
      addEntry({
        customerId,
        type: "invoice",
        amount: billed,
        due: outstanding,
        description: description || t("common.bill"),
        date,
      });
    } else {
      const previousDue = customerBalance(entries, customerId);
      addEntry({
        customerId,
        type: "got",
        amount: billed,
        due: Math.max(0, previousDue - billed),
        description: description || t("entry.paid"),
        date,
      });
    }

    router.replace("/");
  }

  const backHref = presetCustomer ? `/customers/${presetCustomer.id}` : "/";
  const backLabel = presetCustomer ? presetCustomer.name : t("common.back");

  if (!ready) {
    return <p className="text-sm text-zinc-500">{t("common.loading")}</p>;
  }

  return (
    <>
      <PageHeader
        title={kind === "due" ? t("invoice.dueTitle") : t("invoice.title")}
        subtitle={
          presetCustomer
            ? presetCustomer.name
            : kind === "due"
              ? t("invoice.dueSubtitle")
              : t("invoice.subtitle")
        }
        backHref={backHref}
        backLabel={backLabel}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={submitting}>
          <KindToggle kind={kind} onChange={setKind} t={t} />

          <div className="space-y-2">
            <Label htmlFor="amount">
              {kind === "due" ? t("invoice.paid") : t("entry.amountRupee")}
            </Label>
            <Input
              id="amount"
              autoFocus
              inputMode="numeric"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => updateAmount(e.target.value)}
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
            {kind === "due" && !errors.amount ? (
              <p className="text-xs text-zinc-500">
                {t("invoice.paidHint")}
                {previewCustomerId &&
                Number.isFinite(paidValue) &&
                paidValue > 0
                  ? ` ${t("invoice.paidAfter", { amount: formatINR(remainingAfter) })}`
                  : ""}
              </p>
            ) : null}
          </div>

          {kind === "bill" ? (
            <div className="space-y-2">
              <Label htmlFor="due" className="w-full justify-between">
                {t("invoice.due")}
                <span className="font-normal text-zinc-400">{t("common.optional")}</span>
              </Label>
              <Input
                id="due"
                inputMode="numeric"
                type="number"
                min="0"
                max={amount || undefined}
                step="1"
                value={due}
                onChange={(e) => updateDue(e.target.value)}
                placeholder={amount.trim() ? amount : t("invoice.dueFullAmount")}
                className={cn(
                  "h-12 rounded-2xl text-lg font-semibold tabular-nums",
                  fieldInvalidClass(errors.due)
                )}
                aria-invalid={Boolean(errors.due)}
                aria-describedby={
                  errors.due ? "due-error" : "due-hint"
                }
              />
              <FieldError id="due-error">
                {errors.due ? t(errors.due) : null}
              </FieldError>
              {!errors.due ? (
                <p id="due-hint" className="text-xs text-zinc-500">
                  {t("invoice.dueHint")}
                </p>
              ) : null}
            </div>
          ) : null}

          {presetCustomer ? null : (
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
          )}

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
              placeholder={
                kind === "due"
                  ? t("entry.notePlaceholder")
                  : t("invoice.notePlaceholder")
              }
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
            {kind === "due" ? t("invoice.saveDue") : t("invoice.save")}
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
