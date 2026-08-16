"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { rememberPath } from "@/lib/nav-memory";
import { BottomNav } from "@/components/bottom-nav";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { SaveErrorToast } from "@/components/save-error-toast";
import { SplashScreen } from "@/components/splash-screen";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const pathname = usePathname();
  const isPay = pathname === "/pay";
  const isPayLink = pathname === "/p";
  const isOnboarding = pathname === "/onboarding";
  const isThemePage =
    pathname === "/settings/qr-theme" || pathname === "/settings/bill-theme";
  const fullBleed = isPay || isPayLink || isOnboarding || isThemePage;

  useEffect(() => {
    if (isPayLink) return;
    rememberPath(pathname);
  }, [pathname, isPayLink]);

  return (
    <>
      <SplashScreen />
      <OnboardingGuard>
        <div
          className={cn(
            "mx-auto min-h-dvh w-full max-w-md bg-[var(--app-bg)] text-foreground",
            (isPay || isThemePage) && "h-dvh overflow-hidden"
          )}
        >
          <main
            className={cn(
              fullBleed
                ? "p-0"
                : "px-5 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]",
              (isPay || isThemePage) && "h-full overflow-hidden"
            )}
          >
            {children}
          </main>
          {!isOnboarding && !isPayLink ? <BottomNav /> : null}
        </div>
        <SaveErrorToast />
      </OnboardingGuard>
    </>
  );
}
