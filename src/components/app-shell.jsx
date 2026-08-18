"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { rememberPath } from "@/lib/nav-memory";
import { BottomNav } from "@/components/bottom-nav";
import { MarketingLanding } from "@/components/marketing-landing";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { SaveErrorToast } from "@/components/save-error-toast";
import { SplashScreen } from "@/components/splash-screen";
import { useLandingGate } from "@/context/landing-gate";
import { isPublicLegalPath } from "@/lib/onboarding-gate";
import { cn } from "@/lib/utils";

export function AppShell({ children }) {
  const pathname = usePathname();
  const { showLanding } = useLandingGate();
  const isPay = pathname === "/pay";
  const isPayLink = pathname === "/p";
  const isOnboarding = pathname === "/onboarding";
  const isLegalPage = isPublicLegalPath(pathname);
  const isThemePage =
    pathname === "/settings/qr-theme" || pathname === "/settings/bill-theme";
  const fullBleed = isPay || isPayLink || isOnboarding || isThemePage;

  useEffect(() => {
    if (isPayLink) return;
    rememberPath(pathname);
  }, [pathname, isPayLink]);

  useEffect(() => {
    const blockZoom = (event) => event.preventDefault();
    document.addEventListener("gesturestart", blockZoom);
    document.addEventListener("gesturechange", blockZoom);
    document.addEventListener("gestureend", blockZoom);
    return () => {
      document.removeEventListener("gesturestart", blockZoom);
      document.removeEventListener("gesturechange", blockZoom);
      document.removeEventListener("gestureend", blockZoom);
    };
  }, []);

  return (
    <>
      {showLanding ? <MarketingLanding /> : null}
      <SplashScreen />
      {showLanding ? null : (
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
            {!isOnboarding && !isPayLink && !isLegalPage ? <BottomNav /> : null}
          </div>
          <SaveErrorToast />
        </OnboardingGuard>
      )}
    </>
  );
}
