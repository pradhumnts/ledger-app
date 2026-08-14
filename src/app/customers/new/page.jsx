"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError } from "@/components/field-error";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { SoftCard } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer } = useApp();
  const { t } = useTranslation();
  const { errors, clearField, showErrors } = useFieldErrors();
  const { submitting, start, stop } = useSubmitting();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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

    const customer = addCustomer({ name, phone });
    router.replace(`/customers/${customer.id}`);
  }

  return (
    <>
      <PageHeader
        title={t("customerNew.title")}
        subtitle={t("customerNew.subtitle")}
        backHref="/"
        backLabel={t("common.back")}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={submitting}>
          <div className="space-y-2">
            <Label htmlFor="name">{t("customerNew.name")}</Label>
            <Input
              id="name"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
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
            {t("customerNew.save")}
          </SubmitButton>
        </form>
      </SoftCard>
    </>
  );
}
