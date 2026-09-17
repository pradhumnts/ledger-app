"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Receipt, Shield } from "lucide-react";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { AdminLogoutButton } from "@/components/admin/admin-ui";
import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Shops", icon: Building2 },
  { href: "/admin/purchases", label: "Purchases", icon: Receipt },
];

function navActive(pathname, href) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }) {
  const pathname = usePathname();
  const onLogin =
    pathname === "/admin/login" || pathname === "/admin/login/";

  if (onLogin) {
    return children;
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MoneyKitLogo size={26} />
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold tracking-tight text-zinc-950 sm:text-[15px]">
                {APP_NAME} Admin
              </p>
              <span className="hidden items-center gap-1 rounded-full bg-[var(--forest)]/8 px-2 py-0.5 text-[11px] font-semibold text-[var(--forest)] sm:inline-flex">
                <Shield className="size-3" strokeWidth={2.5} />
                Admin
              </span>
            </div>
          </div>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Admin"
          >
            {NAV.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    active
                      ? "bg-[var(--forest)] text-white"
                      : "text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-950"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <AdminLogoutButton className="shrink-0 px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 pt-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:px-8 sm:pt-8 md:pb-10">
        {children}
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.06] bg-white/95 px-2 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        aria-label="Admin"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-0.5">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-semibold transition-colors",
                  active
                    ? "bg-[var(--forest)]/8 text-[var(--forest)]"
                    : "text-zinc-400"
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.85} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
