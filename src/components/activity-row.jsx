"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
import { formatEntryDateTime, formatINR, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ActivityRow({
  title,
  subtitle,
  amount,
  type,
  date,
  avatarUrl,
  nameForInitials,
  href,
}) {
  const { t, language } = useTranslation();
  const isPayment = type === "got";

  const content = (
    <>
      <Avatar className="size-11 border border-zinc-100 dark:border-white/10">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-200">
          {initials(nameForInitials || title)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="max-w-[85%] truncate text-[15px] font-semibold text-zinc-950 dark:text-white">
          {title}
        </p>
        <p className="truncate text-sm text-zinc-500">
          {date ? formatEntryDateTime(date, language) : subtitle || ""}
        </p>
      </div>

      <div className="shrink-0 pl-2 text-right">
        <p
          className={cn(
            "text-[15px] font-semibold tabular-nums",
            isPayment ? "text-[var(--mint)]" : "text-zinc-950 dark:text-white"
          )}
        >
          {formatINR(amount)}
        </p>
        {isPayment ? (
          <p className="text-xs font-medium text-[var(--mint)]">
            {t("entry.paid")}
          </p>
        ) : type === "due" || type === "gave" ? (
          <p className="text-xs font-medium text-zinc-400">{t("entry.due")}</p>
        ) : null}
      </div>
    </>
  );

  const classes =
    "flex items-center gap-3 px-4 py-3.5 transition-[background-color,transform] duration-200 ease-out hover:bg-zinc-50/80 active:scale-[0.995] dark:hover:bg-white/[0.04]";

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
