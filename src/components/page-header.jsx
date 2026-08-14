import { BackLink } from "@/components/back-link";

export function PageHeader({
  title,
  subtitle,
  backHref,
  backReplace = false,
  backLabel = "Back",
  action,
}) {
  return (
    <header className="mb-6">
      {backHref ? (
        <BackLink
          fallback={backHref}
          to={backReplace ? backHref : undefined}
          className="mb-4 gap-1"
        >
          {backLabel}
        </BackLink>
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
