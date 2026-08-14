"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { SplashScreen } from "@/components/splash-screen";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const pathname = usePathname();
  const isPay = pathname === "/pay";

  return (
    <>
      <SplashScreen />
      <div className="mx-auto min-h-dvh w-full max-w-md bg-[var(--app-bg)] text-foreground">
        <main className={cn(isPay ? "p-0" : "px-5 pb-32 pt-6")}>{children}</main>
        <BottomNav />
      </div>
    </>
  );
}
