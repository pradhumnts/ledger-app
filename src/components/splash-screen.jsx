"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

const MIN_MS = 900;
const FADE_MS = 450;

export function SplashScreen() {
  const { ready, settings } = useApp();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [phase, setPhase] = useState("visible");
  const [minElapsed, setMinElapsed] = useState(false);

  const blocking =
    !ready ||
    (pathname !== "/onboarding" &&
      pathname !== "/p" &&
      !settings?.onboardingComplete);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (blocking || !minElapsed || phase !== "visible") return;
    setPhase("hiding");
    const timer = window.setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [blocking, minElapsed, phase]);

  if (pathname === "/onboarding" && ready) return null;
  if (pathname === "/p") return null;
  if (!blocking && phase === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--forest)]",
        !blocking && phase === "hiding" && "splash-exit pointer-events-none"
      )}
      aria-hidden={!blocking && phase === "hiding"}
    >
      <div className="pointer-events-none absolute -top-24 -left-20 size-[18rem] rounded-full bg-[var(--lime)]/25 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 size-[16rem] rounded-full bg-white/10 blur-[70px]" />

      <div className="relative px-8 text-center splash-enter">
        <MoneyKitLogo
          variant="badge"
          badgeSize="xl"
          priority
          className="mx-auto mb-6 rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
        />
        <h1 className="text-[2.4rem] font-semibold tracking-tight text-white">
          {APP_NAME}
        </h1>
        <p className="mt-2 text-sm font-medium text-white/70">
          {t("splash.tagline")}
        </p>
      </div>
    </div>
  );
}
