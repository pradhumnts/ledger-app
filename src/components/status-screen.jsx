import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatusScreen({
  icon,
  title,
  body,
  primary,
  secondary,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-h-[70dvh] flex-col items-center justify-center px-2 py-10 text-center",
        className
      )}
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[var(--forest)] text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
        {icon}
      </div>
      <h1 className="text-[1.45rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-[17.5rem] text-sm leading-relaxed text-zinc-500">
        {body}
      </p>
      <div className="mt-6 flex flex-col items-center gap-2.5">
        {primary}
        {secondary}
      </div>
    </div>
  );
}

export function StatusPrimaryButton({ onClick, href, children }) {
  const className =
    "inline-flex h-11 min-w-[10.5rem] items-center justify-center rounded-full bg-[var(--forest)] px-6 text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function StatusSecondaryLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--forest)] dark:text-[var(--lime)]"
    >
      {children}
    </Link>
  );
}
