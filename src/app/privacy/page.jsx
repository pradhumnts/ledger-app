"use client";

import { LegalDocument } from "@/components/legal-document";
import { useLegalBack, useLegalInApp } from "@/hooks/use-legal-back";
import { useTranslation } from "@/hooks/use-translation";
import { PRIVACY_POLICY } from "@/lib/legal-content";

export default function PrivacyPage() {
  const { t } = useTranslation();
  const back = useLegalBack();
  const inApp = useLegalInApp();

  const relatedLinks = [
    { href: "/terms", label: t("legal.termsTitle") },
    ...(inApp ? [{ href: "/settings/about", label: t("about.title") }] : []),
  ];

  return (
    <LegalDocument
      title={t("legal.privacyTitle")}
      subtitle={t("legal.privacySubtitle")}
      backHref={back.href}
      backLabel={back.label}
      effectiveDate={PRIVACY_POLICY.effectiveDate}
      lastUpdatedLabel={t("legal.lastUpdated")}
      englishNotice={t("legal.englishNotice")}
      intro={PRIVACY_POLICY.intro}
      sections={PRIVACY_POLICY.sections}
      relatedLinks={relatedLinks}
    />
  );
}
