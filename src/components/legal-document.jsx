import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SoftCard } from "@/components/ui-kit";

/**
 * @param {{
 *   title: string,
 *   subtitle: string,
 *   backHref?: string,
 *   backLabel: string,
 *   effectiveDate: string,
 *   lastUpdatedLabel: string,
 *   englishNotice?: string,
 *   intro: string[],
 *   sections: { title: string, body: string[] }[],
 *   relatedLinks?: { href: string, label: string }[],
 * }} props
 */
export function LegalDocument({
  title,
  subtitle,
  backHref = "/settings",
  backLabel,
  effectiveDate,
  lastUpdatedLabel,
  englishNotice,
  intro,
  sections,
  relatedLinks = [],
}) {
  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        backReplace
        backLabel={backLabel}
      />

      <SoftCard className="space-y-6 p-5">
        <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
          {lastUpdatedLabel}: {effectiveDate}
        </p>

        {englishNotice ? (
          <p className="rounded-2xl bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-500 dark:bg-[var(--well)]">
            {englishNotice}
          </p>
        ) : null}

        <div className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
              {section.title}
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {section.body.map((item) => (
                <li key={item.slice(0, 48)}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        {relatedLinks.length > 0 ? (
          <div className="flex flex-wrap gap-3 border-t border-zinc-100 pt-4 dark:border-white/[0.08]">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--forest)] dark:text-[var(--lime)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </SoftCard>
    </>
  );
}
