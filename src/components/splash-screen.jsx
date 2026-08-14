"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const MIN_MS = 900;
const FADE_MS = 450;

export function SplashScreen() {
  const { ready, settings } = useApp();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [phase, setPhase] = useState("visible");
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || !minElapsed || phase !== "visible") return;
    setPhase("hiding");
    const timer = window.setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [ready, minElapsed, phase]);

  if (pathname === "/onboarding") return null;
  if (!ready) return null;
  if (!settings.onboardingComplete) return null;

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--forest)]",
        phase === "hiding" && "splash-exit pointer-events-none"
      )}
      aria-hidden={phase === "hiding"}
    >
      <div className="pointer-events-none absolute -top-24 -left-20 size-[18rem] rounded-full bg-[var(--lime)]/25 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 size-[16rem] rounded-full bg-white/10 blur-[70px]" />

      <div className="relative px-8 text-center splash-enter">
        <div className="mx-auto mb-6 flex size-[5.5rem] items-center justify-center rounded-[1.75rem] bg-[var(--lime)] shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <Wallet className="size-9 text-[var(--forest)]" strokeWidth={2.1} />
        </div>
        <h1 className="text-[2.4rem] font-semibold tracking-tight text-white">
          Ledger
        </h1>
        <p className="mt-2 text-sm font-medium text-white/70">
          {t("splash.tagline")}
        </p>
      </div>
    </div>
  );
}
