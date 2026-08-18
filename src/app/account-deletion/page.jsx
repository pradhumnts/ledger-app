"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLegalBack, useLegalInApp } from "@/hooks/use-legal-back";
import { useTranslation } from "@/hooks/use-translation";
import { ACCOUNT_DELETION } from "@/lib/legal-content";

export default function AccountDeletionPage() {
  const { t } = useTranslation();
  const back = useLegalBack();
  const inApp = useLegalInApp();

  const relatedLinks = [
    { href: "/privacy", label: t("legal.privacyTitle") },
    { href: "/terms", label: t("legal.termsTitle") },
    ...(inApp ? [{ href: "/settings/about", label: t("about.title") }] : []),
  ];

  return (
    <LegalDocument
      title={t("legal.deletionTitle")}
      subtitle={t("legal.deletionSubtitle")}
      backHref={back.href}
      backLabel={back.label}
      effectiveDate={ACCOUNT_DELETION.effectiveDate}
      lastUpdatedLabel={t("legal.lastUpdated")}
      englishNotice={t("legal.englishNotice")}
      intro={ACCOUNT_DELETION.intro}
      sections={ACCOUNT_DELETION.sections}
      relatedLinks={relatedLinks}
    />
  );
}
