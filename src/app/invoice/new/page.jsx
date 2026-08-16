"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Palette } from "lucide-react";
import { CustomerSearch } from "@/components/customer-search";
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
import { firstName, formatINR, toDateInputValue } from "@/lib/format";
import { customerBalance, findCustomerByPhone } from "@/lib/store";
import {
  collectableRupees,
  remainingAfterDeposit,
  rupeesToPaise,
} from "@/lib/ledger-math";
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateAmount,
  validateDate,
  validateDeposit,
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
  const [contactLocked, setContactLocked] = useState(false);

  useEffect(() => {
    if (!presetCustomer) return;
    setSelectedId(presetCustomer.id);
    setName(presetCustomer.name);
    setPhone(presetCustomer.phone || "");
  }, [presetCustomer]);

  const exactMatch = useMemo(() => {
    if (presetCustomer) return presetCustomer;
    const q = name.trim().toLowerCase();
    if (!q) return null;
    return customers.find((c) => c.name.toLowerCase() === q) || null;
  }, [customers, name, presetCustomer]);

  const phoneMatch = useMemo(
    () => (presetCustomer ? null : findCustomerByPhone(customers, phone)),
    [customers, phone, presetCustomer]
  );

  const resolvedCustomer =
    presetCustomer ||
    (selectedId ? customers.find((item) => item.id === selectedId) : null) ||
    phoneMatch ||
    exactMatch;

  const needsNewCustomer =
    !presetCustomer && Boolean(name.trim()) && !resolvedCustomer;

  const phoneAlreadyValid =
    Boolean(phone.trim()) && !validateOptionalPhone(phone);

  const previewCustomerId = resolvedCustomer?.id;
  const currentDue = previewCustomerId
    ? customerBalance(entries, previewCustomerId)
    : 0;
  const depositOwed = collectableRupees(currentDue);
  const depositDueReady = Boolean(ready && previewCustomerId);
  const amountLocked =
    kind === "due" && (!depositDueReady || depositOwed <= 0);
  const paidValue = Number(amount);
  const remainingAfter =
    Number.isFinite(paidValue) && paidValue > 0
      ? remainingAfterDeposit(depositOwed, paidValue)
      : depositOwed;

  function updateAmount(next) {
    if (kind === "due") {
      if (!depositDueReady) return;
      const num = Number(next);
      if (
        Number.isFinite(num) &&
        depositOwed > 0 &&
        rupeesToPaise(num) > rupeesToPaise(depositOwed)
      ) {
        setAmount(String(depositOwed));
        setField("amount", "validation.depositTooLarge");
        return;
      }
      setAmount(next);
      setField("amount", validateDeposit(next, depositOwed));
      return;
    }
    setAmount(next);
    clearField("amount");
    setField("due", validateDue(due, next));
  }

  function updateDue(next) {
    setDue(next);
    setField("due", validateDue(next, amount));
  }

  function pickCustomer(customer) {
    setSelectedId(customer.id);
    setContactLocked(false);
    setName(customer.name);
    setPhone(customer.phone || "");
    clearField("customer");
    clearField("phone");
    if (kind === "due") {
      setAmount("");
      clearField("amount");
    }
  }

  function pickPerson(person) {
    if (person.source === "contact") {
      const existing = findCustomerByPhone(customers, person.phone);
      if (existing) {
        pickCustomer(existing);
        return;
      }
      setSelectedId(null);
      setContactLocked(true);
      setName(person.name);
      setPhone(person.phone || "");
      clearField("customer");
      clearField("phone");
      return;
    }
    pickCustomer(person);
  }

  function onCustomerNameChange(next) {
    setName(next);
    setSelectedId(null);
    setContactLocked(false);
    clearField("customer");
    if (kind === "due") {
      setAmount("");
      clearField("amount");
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!start()) return;

    const next = collectErrors({
      amount:
        kind === "due"
          ? validateDeposit(amount, depositOwed)
          : validateAmount(amount),
      due: kind === "bill" ? validateDue(due, amount) : "",
      customer: presetCustomer ? "" : validateRequiredName(name),
      phone: needsNewCustomer ? validateOptionalPhone(phone) : "",
      date: validateDate(date),
    });
    if (!showErrors(next, { customer: "customer" })) {
      stop();
      return;
    }

    let customerId = resolvedCustomer?.id;
    if (kind === "due") {
      if (!customerId) {
        showErrors({ customer: "validation.nameRequired" });
        stop();
        return;
      }
      const previousDue = collectableRupees(
        customerBalance(entries, customerId)
      );
      const depositError = validateDeposit(amount, previousDue);
      if (depositError) {
        showErrors({ amount: depositError });
        stop();
        return;
      }
      addEntry({
        customerId,
        type: "got",
        amount: Number(amount),
        due: previousDue - Number(amount),
        description: description || t("entry.paid"),
        date,
      });
      router.replace("/");
      return;
    }

    if (!customerId) {
      const created = addCustomer({ name, phone });
      customerId = created.id;
    }

    const billed = Number(amount);
    const outstanding = due.trim() === "" ? 0 : Number(due);
    if (rupeesToPaise(outstanding) > rupeesToPaise(billed)) {
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

    router.replace("/");
  }

  const backHref = presetCustomer ? `/customers/${presetCustomer.id}` : "/";
  const backLabel = presetCustomer ? presetCustomer.name : t("common.back");
  const customerFirstName = firstName(presetCustomer?.name);
  const headerTitle = presetCustomer
    ? kind === "due"
      ? t("invoice.dueTitleForCustomer", { name: customerFirstName })
      : t("invoice.titleForCustomer", { name: customerFirstName })
    : kind === "due"
      ? t("invoice.dueTitle")
      : t("invoice.title");
  const headerSubtitle = presetCustomer
    ? kind === "due"
      ? t("invoice.dueSubtitleForCustomer")
      : t("invoice.subtitleForCustomer")
    : kind === "due"
      ? t("invoice.dueSubtitle")
      : t("invoice.subtitle");

  if (!ready) {
    return <p className="text-sm text-zinc-500">{t("common.loading")}</p>;
  }

  return (
    <>
      <PageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        backHref={backHref}
        backLabel={backLabel}
        action={
          kind === "bill" ? (
            <Link
              href="/settings/bill-theme"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              aria-label={t("invoice.changeTheme")}
            >
              <Palette className="size-4" />
            </Link>
          ) : null
        }
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={submitting}>
          <KindToggle
            kind={kind}
            onChange={(nextKind) => {
              setKind(nextKind);
              if (nextKind === "due") {
                setAmount("");
                clearField("amount");
              }
            }}
            t={t}
          />

          {kind === "due" && !presetCustomer ? (
            <CustomerSearch
              label={t("invoice.customer")}
              value={name}
              error={errors.customer}
              placeholder={t("invoice.customerPlaceholder")}
              customers={customers}
              selectedId={selectedId}
              includeContacts={false}
              onNameChange={onCustomerNameChange}
              onPick={pickPerson}
              t={t}
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="amount">
              {kind === "due" ? t("invoice.paid") : t("entry.amountRupee")}
            </Label>
            <Input
              id="amount"
              autoFocus={kind !== "due" || Boolean(presetCustomer)}
              inputMode="numeric"
              type="number"
              min="1"
              max={kind === "due" && depositDueReady ? depositOwed : undefined}
              step="1"
              value={amount}
              disabled={amountLocked}
              onChange={(e) => updateAmount(e.target.value)}
              placeholder="0"
              className={cn(
                "h-14 rounded-2xl text-2xl font-semibold tabular-nums",
                fieldInvalidClass(errors.amount),
                amountLocked && "opacity-55"
              )}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={
                errors.amount
                  ? "amount-error"
                  : kind === "due"
                    ? "deposit-due-hint"
                    : undefined
              }
            />
            <FieldError id="amount-error">
              {errors.amount
                ? t(errors.amount, { amount: formatINR(depositOwed) })
                : null}
            </FieldError>
            {kind === "due" && !errors.amount ? (
              <p id="deposit-due-hint" className="text-xs text-zinc-500">
                {!previewCustomerId
                  ? t("invoice.selectCustomerForDue")
                  : !depositDueReady
                    ? t("invoice.fetchingDue")
                    : depositOwed <= 0
                      ? t("invoice.nothingDue")
                      : `${t("invoice.currentDue", { amount: formatINR(depositOwed) })} ${
                          Number.isFinite(paidValue) && paidValue > 0
                            ? t("invoice.paidAfter", {
                                amount: formatINR(remainingAfter),
                              })
                            : t("invoice.paidHint")
                        }`}
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
                placeholder="0"
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

          {kind === "bill" && !presetCustomer ? (
            <CustomerSearch
              label={t("invoice.customer")}
              value={name}
              error={errors.customer}
              placeholder={t("invoice.customerPlaceholder")}
              customers={customers}
              selectedId={selectedId || (contactLocked ? "contact" : null)}
              onNameChange={onCustomerNameChange}
              onPick={pickPerson}
              t={t}
            />
          ) : null}

          {needsNewCustomer && kind === "bill" && !phoneAlreadyValid ? (
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

          <SubmitButton
            loading={submitting}
            loadingLabel={t("common.saving")}
            disabled={kind === "due" && amountLocked}
          >
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
