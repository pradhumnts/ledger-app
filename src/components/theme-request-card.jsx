"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function ThemeRequestCard({ active, variant = "qr", className }) {
  const { t } = useTranslation();
  const isQr = variant === "qr";

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border-2 border-dashed border-zinc-200/90 bg-gradient-to-br from-white via-zinc-50/80 to-[#eef3ea] p-6 text-center shadow-[0_18px_40px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
      >
        <div className="absolute -top-10 -right-8 size-28 rounded-full bg-[var(--lime)]/25 blur-2xl dark:bg-[var(--lime)]/10" />
        <div className="absolute -bottom-12 -left-6 size-32 rounded-full bg-[var(--forest)]/10 blur-2xl dark:bg-[var(--forest)]/20" />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-[var(--forest)]/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-800">
          <Sparkles className="size-6 text-[var(--forest)] dark:text-[var(--lime)]" />
        </div>

        <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--forest)] uppercase dark:text-[var(--lime)]">
          {isQr ? t("themeRequest.qrCustom") : t("themeRequest.billCustom")}
        </p>
        <p className="mt-2 max-w-[11rem] text-base leading-snug font-semibold text-zinc-900 dark:text-white">
          {t("themeRequest.needTheme")}
        </p>
        <p className="mt-2 max-w-[12.5rem] text-[13px] leading-relaxed text-zinc-500">
          {isQr ? t("themeRequest.qrBody") : t("themeRequest.billBody")}
        </p>

        <div className="mt-5 flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-1.5 rounded-full bg-[var(--forest)]/25 dark:bg-[var(--lime)]/30"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
