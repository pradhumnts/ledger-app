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
  const positive = type === "got";

  const content = (
    <>
      <Avatar className="size-11 border border-zinc-100 dark:border-zinc-700">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {initials(nameForInitials || title)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-zinc-950 dark:text-white">
          {title}
        </p>
        <p className="truncate text-sm text-zinc-500">
          {date ? formatEntryDateTime(date, language) : subtitle || ""}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "text-[15px] font-semibold tabular-nums",
            positive ? "text-[var(--mint)]" : "text-zinc-950 dark:text-white"
          )}
        >
          {positive ? "+" : "-"}
          {formatINR(amount)}
        </p>
        {positive ? (
          <p className="text-xs font-medium text-[var(--mint)]">
            {t("common.income")}
          </p>
        ) : null}
      </div>
    </>
  );

  const classes =
    "flex items-center gap-3 px-4 py-3.5 transition-[background-color,transform] duration-200 ease-out hover:bg-zinc-50/80 active:scale-[0.995] dark:hover:bg-zinc-800/50";

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
