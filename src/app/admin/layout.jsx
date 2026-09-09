"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { AdminLogoutButton } from "@/components/admin/admin-ui";
import { APP_NAME } from "@/lib/branding";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const onLogin =
    pathname === "/admin/login" || pathname === "/admin/login/";

  if (onLogin) {
    return children;
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <MoneyKitLogo size={28} />
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold tracking-tight text-zinc-950">
                {APP_NAME} Admin
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--forest)]/8 px-2 py-0.5 text-[11px] font-semibold text-[var(--forest)]">
                <Shield className="size-3" strokeWidth={2.5} />
                Admin
              </span>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-8 py-10">{children}</main>
    </div>
  );
}
