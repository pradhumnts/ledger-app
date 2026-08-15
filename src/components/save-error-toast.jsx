"use client";

import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";

export function SaveErrorToast() {
  const { saveError, dismissSaveError } = useApp();
  const { t } = useTranslation();

  if (!saveError) return null;

  return (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-4 pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.5rem))]"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-[1.25rem] bg-zinc-950 px-4 py-3.5 text-white dark:bg-zinc-900">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/90">
          {t("storage.saveFailed")}
        </p>
        <button
          type="button"
          onClick={dismissSaveError}
          className="shrink-0 pt-0.5 text-sm font-semibold text-[var(--lime)]"
        >
          {t("storage.dismiss")}
        </button>
      </div>
    </div>
  );
}
