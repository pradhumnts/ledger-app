"use client";

import Link from "next/link";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME } from "@/lib/branding";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("about.title")}
        subtitle={t("about.subtitle")}
        backHref="/settings"
        backLabel={t("settings.title")}
      />

      <SoftCard className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <MoneyKitLogo variant="badge" badgeSize="md" />
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            {APP_NAME}
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {t("about.body")}
        </p>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:bg-[var(--well)]">
          {t("about.version")}
        </div>
        <div className="flex flex-wrap gap-4 border-t border-zinc-100 pt-4 dark:border-white/[0.08]">
          <Link
            href="/account-deletion"
            className="text-sm font-medium text-[var(--forest)] dark:text-[var(--lime)]"
          >
            {t("legal.deletionTitle")}
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-[var(--forest)] dark:text-[var(--lime)]"
          >
            {t("legal.privacyTitle")}
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium text-[var(--forest)] dark:text-[var(--lime)]"
          >
            {t("legal.termsTitle")}
          </Link>
        </div>
      </SoftCard>
    </>
  );
}
