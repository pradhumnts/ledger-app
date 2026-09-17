"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { AdminLogoutButton } from "@/components/admin/admin-ui";
import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/businesses", label: "Shops" },
  { href: "/admin/purchases", label: "Purchases" },
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
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-8 md:h-16 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <MoneyKitLogo size={28} />
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-950">
                  {APP_NAME} Admin
                </p>
                <span className="hidden items-center gap-1 rounded-full bg-[var(--forest)]/8 px-2 py-0.5 text-[11px] font-semibold text-[var(--forest)] sm:inline-flex">
                  <Shield className="size-3" strokeWidth={2.5} />
                  Admin
                </span>
              </div>
            </div>
            <AdminLogoutButton className="shrink-0 md:hidden" />
          </div>
          <nav
            className="flex items-center gap-1 overflow-x-auto pb-0.5 md:flex-1"
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
          <AdminLogoutButton className="hidden shrink-0 md:inline-flex" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
