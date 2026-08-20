"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FieldError } from "@/components/field-error";
import { PageHeader } from "@/components/page-header";
import { PageSpinner } from "@/components/page-spinner";
import { SubmitButton } from "@/components/submit-button";
import { SoftCard } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceField } from "@/components/voice-field";
import { useApp } from "@/context/app-provider";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { useSubmitting } from "@/hooks/use-submitting";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import {
  collectErrors,
  fieldInvalidClass,
  validateOptionalPhone,
  validateRequiredName,
} from "@/lib/validation";

export default function EditCustomerPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { ready, getCustomer, updateCustomer } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, showErrors } = useFieldErrors();
  const { submitting, start, stop } = useSubmitting();
  const customer = getCustomer(id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!customer) return;
    setName(customer.name || "");
    setPhone(customer.phone || "");
  }, [customer]);

  if (!ready) {
    return <PageSpinner />;
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

  function onSubmit(e) {
    e.preventDefault();
    if (!start()) return;

    const next = collectErrors({
      name: validateRequiredName(name),
      phone: validateOptionalPhone(phone),
    });
    if (!showErrors(next)) {
      stop();
      return;
    }

    const updated = updateCustomer(customer.id, { name, phone });
    if (!updated) {
      stop();
      return;
    }
    router.replace(`/customers/${customer.id}`);
  }

  return (
    <>
      <PageHeader
        title={t("customerEdit.title")}
        subtitle={t("customerEdit.subtitle")}
        backHref={`/customers/${customer.id}`}
        backLabel={t("common.back")}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={submitting}>
          <div className="space-y-2">
            <Label htmlFor="name">{t("customerNew.name")}</Label>
            <VoiceField
              id="name"
              kind="name"
              autoFocus
              value={name}
              onValueChange={(next) => {
                setName(next);
                clearField("name");
              }}
              placeholder={t("customerNew.namePlaceholder")}
              className={cn("h-12 rounded-2xl", fieldInvalidClass(errors.name))}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            <FieldError id="name-error">
              {errors.name ? t(errors.name) : null}
            </FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("customerNew.phone")}</Label>
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
              className={cn("h-12 rounded-2xl", fieldInvalidClass(errors.phone))}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            <FieldError id="phone-error">
              {errors.phone ? t(errors.phone) : null}
            </FieldError>
          </div>
          <SubmitButton loading={submitting} loadingLabel={t("common.saving")}>
            {t("customerEdit.save")}
          </SubmitButton>
        </form>
      </SoftCard>
    </>
  );
}
