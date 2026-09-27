"use client";

import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguagePage() {
  const { settings, setLanguage } = useApp();
  const { t } = useTranslation();
  const current = settings.language || "en";

  return (
    <>
      <div className="mb-5 flex items-center gap-2">
        <Link
          href="/settings"
          className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
          aria-label={t("settings.title")}
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("language.title")}
          </h1>
          <p className="text-sm text-zinc-500">{t("language.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-3">
        {LANGUAGES.map((lang) => {
          const selected = current === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-[1.75rem] border px-5 py-4 text-left transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.99]",
                selected
                  ? "border-[var(--forest)]/25 bg-white shadow-[0_10px_40px_rgba(11,48,31,0.08)] dark:border-[var(--lime)]/25 dark:bg-zinc-900"
                  : "border-black/[0.04] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-zinc-900"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-zinc-950 dark:text-white">
                  {t(lang.labelKey)}
                </p>
                <p className="mt-0.5 text-sm text-zinc-500">{t(lang.descKey)}</p>
              </div>
              {selected ? (
                <span className="flex size-8 items-center justify-center rounded-full bg-[var(--forest)] text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
                  <Check className="size-4" />
                </span>
              ) : (
                <span className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
