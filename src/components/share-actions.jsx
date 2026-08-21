"use client";

import { FileText, Loader2, MessageSquare } from "lucide-react";
import { useBusyAction } from "@/hooks/use-busy-action";
import { useTranslation } from "@/hooks/use-translation";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { prefetchPdfEngine } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function ActionButton({
  active,
  disabled,
  onClick,
  className,
  icon,
  iconSize,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={active}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-[opacity,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {active ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

export function ShareActions({
  onWhatsApp,
  onSMS,
  onPDF,
  className,
  size = "default",
}) {
  const { t } = useTranslation();
  const { busy, busyKey, run } = useBusyAction();
  const isCompact = size === "compact";
  const hasPdf = typeof onPDF === "function";

  useEffect(() => {
    if (hasPdf) prefetchPdfEngine();
  }, [hasPdf]);
  const tight = isCompact || hasPdf;
  const iconSize = tight ? "size-3.5" : "size-4";
  const sizeClass = tight ? "h-11 px-2 text-xs" : "h-12 px-4 text-sm";

  return (
    <div
      className={cn(
        "grid gap-2.5",
        hasPdf ? "grid-cols-3" : "grid-cols-2",
        className
      )}
    >
      {hasPdf ? (
        <ActionButton
          active={busyKey === "pdf"}
          disabled={busy}
          onClick={() => run(onPDF, "pdf")}
          icon={<FileText className={iconSize} />}
          iconSize={iconSize}
          className={cn(
            sizeClass,
            "bg-[var(--forest)] text-white hover:opacity-90 dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          )}
        >
          {t("common.pdf")}
        </ActionButton>
      ) : null}
      <ActionButton
        active={busyKey === "sms"}
        disabled={busy}
        onClick={() => run(onSMS, "sms")}
        icon={<MessageSquare className={iconSize} />}
        iconSize={iconSize}
        className={cn(
          sizeClass,
          "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-white/12 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
        )}
      >
        {t("common.sms")}
      </ActionButton>
      <ActionButton
        active={busyKey === "whatsapp"}
        disabled={busy}
        onClick={() => run(onWhatsApp, "whatsapp")}
        icon={
          <WhatsAppIcon className={tight ? "size-3.5" : "size-[18px]"} />
        }
        iconSize={iconSize}
        className={cn(sizeClass, "bg-[#25D366] text-white hover:opacity-90")}
      >
        {t("common.whatsapp")}
      </ActionButton>
    </div>
  );
}
