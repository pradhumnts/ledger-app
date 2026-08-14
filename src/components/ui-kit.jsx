import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SoftCard({ children, className = "" }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-black/[0.04] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-shadow duration-300 dark:border-white/[0.12] dark:bg-[var(--card)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ListRow({
  href,
  icon,
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className = "",
}) {
  const content = (
    <>
      {leading ? (
        <div className="shrink-0">{leading}</div>
      ) : icon ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-zinc-950 dark:text-white">
          {title}
        </p>
        {subtitle ? (
          <p className="truncate text-sm text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      {trailing ?? (
        <ChevronRight className="size-4 shrink-0 text-zinc-300 dark:text-zinc-500" />
      )}
    </>
  );

  const classes = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-[background-color,transform] duration-200 ease-out hover:bg-zinc-50/80 active:scale-[0.995] dark:hover:bg-white/[0.04]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export function Divider() {
  return <div className="mx-4 h-px bg-zinc-100 dark:bg-white/[0.08]" />;
}
