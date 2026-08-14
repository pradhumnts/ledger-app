"use client";

import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";

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
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
            Ledger
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {t("about.body")}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-800/70">
          {t("about.version")}
        </div>
      </SoftCard>
    </>
  );
}
