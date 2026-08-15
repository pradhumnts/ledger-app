"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { rememberPath } from "@/lib/nav-memory";
import { BottomNav } from "@/components/bottom-nav";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { SplashScreen } from "@/components/splash-screen";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const pathname = usePathname();
  const isPay = pathname === "/pay";
  const isOnboarding = pathname === "/onboarding";
  const isThemePage =
    pathname === "/settings/qr-theme" || pathname === "/settings/bill-theme";
  const fullBleed = isPay || isOnboarding || isThemePage;

  useEffect(() => {
    rememberPath(pathname);
  }, [pathname]);

  return (
    <>
      <SplashScreen />
      <OnboardingGuard>
        <div
          className={cn(
            "mx-auto min-h-dvh w-full max-w-md bg-[var(--app-bg)] text-foreground",
            isThemePage && "h-dvh overflow-hidden"
          )}
        >
          <main
            className={cn(
              fullBleed
                ? "p-0"
                : "px-5 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]",
              isThemePage && "h-full overflow-hidden"
            )}
          >
            {children}
          </main>
          {!isOnboarding ? <BottomNav /> : null}
        </div>
      </OnboardingGuard>
    </>
  );
}
