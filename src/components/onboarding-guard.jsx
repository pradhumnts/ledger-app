"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/app-provider";
import { isPublicLegalPath } from "@/lib/onboarding-gate";

export function OnboardingGuard({ children }) {
  const { ready, settings } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname === "/onboarding";
  const onPayLink = pathname === "/p";
  const onPublicLegal = isPublicLegalPath(pathname);
  const onboarded = Boolean(settings?.onboardingComplete);
  const allowed =
    onPayLink ||
    onPublicLegal ||
    (ready && (onboarded ? !onOnboarding : onOnboarding));

  useEffect(() => {
    if (!ready || onPayLink || onPublicLegal) return;
    if (!onboarded && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (onboarded && onOnboarding) {
      router.replace("/");
    }
  }, [ready, onboarded, onOnboarding, onPayLink, onPublicLegal, router]);

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
