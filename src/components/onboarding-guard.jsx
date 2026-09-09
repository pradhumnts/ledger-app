"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/app-provider";
import {
  isAdminPath,
  isPublicLegalPath,
  isPublicSharePath,
} from "@/lib/onboarding-gate";

export function OnboardingGuard({ children }) {
  const { ready, settings } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname === "/onboarding";
  const onPublicShare = isPublicSharePath(pathname);
  const onPublicLegal = isPublicLegalPath(pathname);
  const onAdmin = isAdminPath(pathname);
  const onboarded = Boolean(settings?.onboardingComplete);
  const allowed =
    onPublicShare ||
    onPublicLegal ||
    onAdmin ||
    (ready && (onboarded ? !onOnboarding : onOnboarding));

  useEffect(() => {
    if (!ready || onPublicShare || onPublicLegal || onAdmin) return;
    if (!onboarded && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (onboarded && onOnboarding) {
      router.replace("/");
    }
  }, [
    ready,
    onboarded,
    onOnboarding,
    onPublicShare,
    onPublicLegal,
    onAdmin,
    router,
  ]);

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
