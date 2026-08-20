"use client";

import { FileText, Loader2, MessageSquare } from "lucide-react";
import { useBusyAction } from "@/hooks/use-busy-action";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
