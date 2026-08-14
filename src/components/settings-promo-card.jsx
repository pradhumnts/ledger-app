"use client";

import { CalendarDays, ChevronRight, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS = {
  globe: Globe,
  calendar: CalendarDays,
};

export function SettingsPromoCard({ plan, onSelect, className }) {
  const { t, websitePlanLabel } = useTranslation();
  const Icon = ICONS[plan.icon] || Globe;
  const isFeatured = plan.featured;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(plan)}
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.75rem] p-[1px] text-left transition-[transform,box-shadow] duration-300 ease-out active:scale-[0.985]",
        isFeatured
          ? "shadow-[0_20px_50px_rgba(11,48,31,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          : "shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-100 transition-opacity duration-300",
          isFeatured
            ? "bg-gradient-to-br from-[var(--lime)] via-[#d4ea7a] to-[#9ec86a]"
            : "bg-gradient-to-br from-[var(--forest)] via-[#1a4a32] to-[#0a2418]"
        )}
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-[calc(1.75rem-1px)] px-5 py-5",
          isFeatured
            ? "bg-gradient-to-br from-[#f8fbea] via-white to-[#eef6df] dark:from-zinc-950 dark:via-zinc-900 dark:to-[#1a2618]"
            : "bg-gradient-to-br from-[#0f3d28] via-[var(--forest)] to-[#082818] text-white"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className={cn(
              "absolute -top-16 -right-10 size-40 rounded-full blur-3xl",
              isFeatured
                ? "bg-[var(--lime)]/35 dark:bg-[var(--lime)]/15"
                : "bg-[var(--lime)]/15"
            )}
          />
          <div
            className={cn(
              "absolute -bottom-20 -left-8 size-44 rounded-full blur-3xl",
              isFeatured
                ? "bg-[var(--forest)]/10 dark:bg-[var(--forest)]/30"
                : "bg-white/5"
            )}
          />
          {isFeatured ? (
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rotate-12 rounded-full border border-[var(--forest)]/10 bg-[var(--lime)]/20 dark:border-[var(--lime)]/10" />
          ) : null}
        </div>

        <div className="relative flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm",
              isFeatured
                ? "border-[var(--forest)]/10 bg-white/80 text-[var(--forest)] dark:border-white/10 dark:bg-zinc-800/80 dark:text-[var(--lime)]"
                : "border-white/15 bg-white/10 text-[var(--lime)]"
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-lg font-semibold tracking-tight",
                isFeatured
                  ? "text-zinc-950 dark:text-white"
                  : "text-white"
              )}
            >
              {websitePlanLabel(plan.id, "title")}
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm leading-snug",
                isFeatured
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "text-white/75"
              )}
            >
              {websitePlanLabel(plan.id, "tagline")}
            </p>
          </div>

          <ChevronRight
            className={cn(
              "mt-1 size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5",
              isFeatured
                ? "text-zinc-300 dark:text-zinc-600"
                : "text-white/40"
            )}
          />
        </div>

        <div className="relative mt-5 flex items-end justify-between gap-3">
          <div>
            <p
              className={cn(
                "text-[11px] font-medium tracking-wide uppercase",
                isFeatured
                  ? "text-zinc-400"
                  : "text-white/55"
              )}
            >
              {t("common.startingAt")}
            </p>
            <p className="mt-0.5 flex items-baseline gap-1">
              <span
                className={cn(
                  "text-[1.75rem] leading-none font-semibold tracking-tight tabular-nums",
                  isFeatured
                    ? "text-zinc-950 dark:text-white"
                    : "text-white"
                )}
              >
                {formatINR(plan.price)}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isFeatured
                    ? "text-zinc-500"
                    : "text-white/60"
                )}
              >
                {t("common.perMonth")}
              </span>
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors duration-200",
              isFeatured
                ? "bg-[var(--forest)] text-white group-hover:bg-[var(--forest-soft)] dark:bg-[var(--lime)] dark:text-[var(--forest)] dark:group-hover:bg-[var(--lime)]/90"
                : "bg-white/15 text-white backdrop-blur-sm group-hover:bg-white/20"
            )}
          >
            {t("common.notifyMe")}
          </span>
        </div>
      </div>
    </button>
  );
}
