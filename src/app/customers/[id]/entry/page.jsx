"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateAmount,
  validateDate,
} from "@/lib/validation";

function EntryForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getCustomer, addEntry } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, showErrors } = useFieldErrors();
  const { submitting, start, stop } = useSubmitting();

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
    if (!customer) return;
    if (!start()) return;

    const next = collectErrors({
      amount: validateAmount(amount),
      date: validateDate(date),
    });
    if (!showErrors(next)) {
      stop();
      return;
    }

    addEntry({
      customerId: customer.id,
      type,
      amount: Number(amount),
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
        backReplace
        backLabel={customer.name}
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
              placeholder={t("entry.notePlaceholder")}
              className="rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{t("entry.date")}</Label>
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
            {t("entry.save")}
          </SubmitButton>
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
