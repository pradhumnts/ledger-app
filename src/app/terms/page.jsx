"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLegalBack, useLegalInApp } from "@/hooks/use-legal-back";
import { useTranslation } from "@/hooks/use-translation";
import { TERMS_OF_SERVICE } from "@/lib/legal-content";

export default function TermsPage() {
  const { t } = useTranslation();
  const back = useLegalBack();
  const inApp = useLegalInApp();

  const relatedLinks = [
    { href: "/privacy", label: t("legal.privacyTitle") },
    ...(inApp ? [{ href: "/settings/about", label: t("about.title") }] : []),
  ];

  return (
    <LegalDocument
      title={t("legal.termsTitle")}
      subtitle={t("legal.termsSubtitle")}
      backHref={back.href}
      backLabel={back.label}
      effectiveDate={TERMS_OF_SERVICE.effectiveDate}
      lastUpdatedLabel={t("legal.lastUpdated")}
      englishNotice={t("legal.englishNotice")}
      intro={TERMS_OF_SERVICE.intro}
      sections={TERMS_OF_SERVICE.sections}
      relatedLinks={relatedLinks}
    />
  );
}
