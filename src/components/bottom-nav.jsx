"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Users } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { isPublicLegalPath } from "@/lib/onboarding-gate";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/customers", labelKey: "nav.customers", icon: Users },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const hidden =
    pathname?.startsWith("/customers/") ||
    pathname?.startsWith("/invoice/") ||
    pathname?.startsWith("/settings/") ||
    pathname === "/pay" ||
    pathname === "/p" ||
    isPublicLegalPath(pathname) ||
    pathname === "/onboarding";

  const isHidden = hidden && pathname !== "/settings";

  return (
    <nav
      className={cn(
        "nav-shell fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isHidden
          ? "pointer-events-none translate-y-3 opacity-0"
          : "translate-y-0 opacity-100"
      )}
    >
      <div className="flex items-center justify-between rounded-[1.75rem] border border-black/5 bg-white/95 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/[0.12] dark:bg-[#121714]/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
        {tabs.map(({ href, labelKey, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname?.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[11px] font-medium transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96]",
                active
                  ? "bg-[var(--forest)] text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-200"
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
