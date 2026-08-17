"use client";

import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME } from "@/lib/branding";
import { isInstalledApp } from "@/lib/installed-app";

/** Back link for legal pages — settings in app, landing in browser. */
export function useLegalBack() {
  const { ready, settings } = useApp();
  const { t } = useTranslation();
  const onboarded = ready && Boolean(settings?.onboardingComplete);

  if (onboarded) {
    return { href: "/settings", label: t("settings.title") };
  }

  if (typeof window !== "undefined" && isInstalledApp()) {
    return { href: "/", label: t("nav.home") };
  }

  return { href: "/?landing=1", label: APP_NAME };
}

/** Whether the user has finished onboarding (in-app settings context). */
export function useLegalInApp() {
  const { ready, settings } = useApp();
  return ready && Boolean(settings?.onboardingComplete);
}
