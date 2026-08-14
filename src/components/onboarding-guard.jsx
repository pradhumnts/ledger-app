"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/app-provider";

export function OnboardingGuard({ children }) {
  const { ready, settings } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (!ready) return;
    if (!settings.onboardingComplete && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (settings.onboardingComplete && onOnboarding) {
      router.replace("/");
    }
  }, [ready, settings.onboardingComplete, onOnboarding, router]);

  return children;
}
