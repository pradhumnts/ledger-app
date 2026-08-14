import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  action,
}) {
  return (
    <header className="mb-6">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.85rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  );
}
