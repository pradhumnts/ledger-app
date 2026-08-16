"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/app-provider";

export function OnboardingGuard({ children }) {
  const { ready, settings } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname === "/onboarding";
  const onPayLink = pathname === "/p";
  const onboarded = Boolean(settings?.onboardingComplete);
  const allowed =
    onPayLink || (ready && (onboarded ? !onOnboarding : onOnboarding));

  useEffect(() => {
    if (!ready || onPayLink) return;
    if (!onboarded && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (onboarded && onOnboarding) {
      router.replace("/");
    }
  }, [ready, onboarded, onOnboarding, onPayLink, router]);

  if (!allowed) {
    return (
      <div
        className="min-h-dvh bg-[var(--forest)]"
        aria-busy="true"
        aria-live="polite"
      />
    );
  }

  return children;
}
