"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer } = useApp();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const customer = addCustomer({ name, phone });
    router.replace(`/customers/${customer.id}`);
  }

  return (
    <>
      <PageHeader
        title={t("customerNew.title")}
        subtitle={t("customerNew.subtitle")}
        backHref="/customers"
        backLabel={t("customers.title")}
      />

      <SoftCard className="p-5">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{t("customerNew.name")}</Label>
            <Input
              id="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("customerNew.namePlaceholder")}
              className="h-12 rounded-2xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("customerNew.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("customerNew.phonePlaceholder")}
              className="h-12 rounded-2xl"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[var(--forest)] text-base font-semibold text-white hover:bg-[var(--forest-soft)] dark:bg-[var(--lime)] dark:text-[var(--forest)] dark:hover:bg-[var(--lime)]/90"
          >
            {t("customerNew.save")}
          </Button>
        </form>
      </SoftCard>
    </>
  );
}
