"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import {
  dismissRemindersPrompt,
  enableReminders,
  notificationPermission,
  pushSupported,
  remindersPromptDismissed,
  syncRemindersSubscription,
} from "@/lib/push-client";

export function PushReminderListener() {
  const router = useRouter();
  const { ready, userId, settings } = useApp();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event) => {
      const url = event.data?.url;
      if (event.data?.type !== "moneykit-notification-click" || !url) return;
      try {
        const parsed = new URL(url, window.location.origin);
        router.push(`${parsed.pathname}${parsed.search}`);
      } catch {
        window.location.assign(url);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  useEffect(() => {
    if (!ready || !userId || !settings?.onboardingComplete) return;
    syncRemindersSubscription().catch(() => {});
  }, [ready, userId, settings?.onboardingComplete]);

  return null;
}

export function PushReminderPrompt() {
  const pathname = usePathname();
  const { ready, userId, entries, settings } = useApp();
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !userId || !settings?.onboardingComplete) return;
    if (pathname !== "/") return;
    if (!pushSupported() || remindersPromptDismissed()) return;
    if (notificationPermission() !== "default") return;
    const hasBill = (entries || []).some((entry) => entry.type === "invoice");
    if (!hasBill) return;
    setShowPrompt(true);
  }, [ready, userId, settings?.onboardingComplete, pathname, entries]);

  if (!showPrompt) return null;

  async function allow() {
    if (busy) return;
    setBusy(true);
    try {
      await enableReminders();
    } finally {
      setBusy(false);
      setShowPrompt(false);
    }
  }

  function later() {
    dismissRemindersPrompt();
    setShowPrompt(false);
  }

  return (
    <SoftCard className="mb-5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200">
          <Bell className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-zinc-950 dark:text-white">
            {t("notify.promptTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            {t("notify.promptBody")}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={allow}
              className="h-9 rounded-full bg-[var(--forest)] px-4 text-sm font-semibold text-white disabled:opacity-50 dark:bg-[var(--lime)] dark:text-[var(--forest)]"
            >
              {busy ? t("common.loading") : t("notify.allow")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={later}
              className="h-9 rounded-full px-3 text-sm font-semibold text-zinc-500"
            >
              {t("notify.later")}
            </button>
          </div>
        </div>
      </div>
    </SoftCard>
  );
}
