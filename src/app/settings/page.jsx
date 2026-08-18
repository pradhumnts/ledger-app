"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  History,
  Languages,
  LogOut,
  Moon,
  Palette,
  QrCode,
  Share2,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SettingsPromoCard } from "@/components/settings-promo-card";
import { SoftCard, ListRow, Divider } from "@/components/ui-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGES } from "@/lib/i18n";
import { isQrThemeUnlocked, QR_THEMES } from "@/lib/qr-themes";
import { requestWebsitePlan, shareApp } from "@/lib/share";
import { WEBSITE_PLANS } from "@/lib/website-plans";

export default function SettingsPage() {
  const { settings, setTheme, business, signOut } = useApp();
  const { t, language, themeLabel, websitePlanLabel } = useTranslation();
  const router = useRouter();
  const dark = settings.theme === "dark";
  const [logOutOpen, setLogOutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const billThemeSubtitle = themeLabel("bill", settings.billTheme || "classic", "name");

  const qrThemeSubtitle = (() => {
    const theme = settings.qrTheme
      ? QR_THEMES.find((item) => item.id === settings.qrTheme)
      : null;
    const unlocked = settings.unlockedQrThemes || [];
    if (theme && isQrThemeUnlocked(theme, unlocked)) {
      return themeLabel("qr", theme.id, "name");
    }
    return t("settings.qrThemeDefault");
  })();

  const currentLang = LANGUAGES.find((lang) => lang.id === language);
  const languageSubtitle = currentLang ? t(currentLang.labelKey) : t("language.english");

  async function confirmLogOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      router.replace("/onboarding");
    } finally {
      setLoggingOut(false);
      setLogOutOpen(false);
    }
  }

  return (
    <>
      <PageHeader title={t("settings.title")} />

      <SoftCard className="mb-5 overflow-hidden">
        <button
          type="button"
          onClick={() => shareApp(language)}
          className="relative w-full bg-[var(--forest)] px-5 py-5 text-left text-white transition-opacity hover:opacity-95 active:opacity-90"
        >
          <div className="pointer-events-none absolute -top-8 -right-6 size-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 left-10 size-24 rounded-full bg-white/5" />
          <div className="relative flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Share2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight text-white">
                {t("settings.shareTitle")}
              </p>
              <p className="mt-1 text-sm text-white/75">
                {t("settings.shareSubtitle")}
              </p>
            </div>
          </div>
        </button>
      </SoftCard>

      <SoftCard className="mb-0">
        <ListRow
          href="/settings/business"
          icon={<Building2 className="size-4" />}
          title={t("settings.businessProfile")}
          subtitle={business.name || t("settings.businessPlaceholder")}
        />
        <Divider />
        <ListRow
          href="/settings/history"
          icon={<History className="size-4" />}
          title={t("settings.history")}
          subtitle={t("settings.historySubtitle")}
        />
        <Divider />
        <ListRow
          href="/settings/bill-theme"
          icon={<Palette className="size-4" />}
          title={t("settings.billTheme")}
          subtitle={billThemeSubtitle}
        />
        <Divider />
        <ListRow
          href="/settings/qr-theme"
          icon={<QrCode className="size-4" />}
          title={t("settings.qrTheme")}
          subtitle={qrThemeSubtitle}
        />
        <Divider />
        <ListRow
          href="/settings/language"
          icon={<Languages className="size-4" />}
          title={t("settings.language")}
          subtitle={languageSubtitle}
        />
        <Divider />
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200">
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-zinc-950 dark:text-white">
              {t("settings.darkMode")}
            </p>
            <p className="text-sm text-zinc-500">
              {dark ? t("common.on") : t("common.off")}
            </p>
          </div>
          <Switch
            checked={dark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
        <Divider />
        <ListRow
          icon={<LogOut className="size-4" />}
          title={t("settings.logOut")}
          subtitle={t("settings.logOutSubtitle")}
          onClick={() => setLogOutOpen(true)}
        />
      </SoftCard>

      <Dialog open={logOutOpen} onOpenChange={setLogOutOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm rounded-[1.75rem] p-5"
        >
          <DialogHeader className="gap-2">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200">
              <LogOut className="size-5" />
            </div>
            <DialogTitle className="pt-1 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("settings.logOut")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-zinc-500">
              {t("settings.logOutConfirm")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => setLogOutOpen(false)}
              className="h-11 rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition-[opacity,transform] duration-200 active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={loggingOut}
              onClick={confirmLogOut}
              className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white transition-[opacity,transform] duration-200 active:scale-[0.98] disabled:opacity-50 dark:bg-[var(--lime)] dark:text-[var(--forest)]"
            >
              {loggingOut ? t("common.loading") : t("settings.logOut")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="my-6 flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-white/[0.08]" />
        <div className="shrink-0 text-center">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
            {t("settings.growOnline")}
          </p>
        </div>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-white/[0.08]" />
      </div>

      <div className="mb-5 space-y-3">
        {WEBSITE_PLANS.map((plan) => (
          <SettingsPromoCard
            key={plan.id}
            plan={plan}
            onSelect={(selected) =>
              requestWebsitePlan({
                planId: selected.id,
                planTitle: websitePlanLabel(selected.id, "title"),
                price: selected.price,
                businessName: business.name,
                language,
              })
            }
          />
        ))}
      </div>

      <footer className="mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-1 text-xs text-zinc-400">
        <Link
          href="/settings/about"
          className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {t("settings.about")}
        </Link>
        <span aria-hidden>·</span>
        <Link
          href="/privacy"
          className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {t("legal.privacyTitle")}
        </Link>
        <span aria-hidden>·</span>
        <Link
          href="/terms"
          className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {t("legal.termsTitle")}
        </Link>
      </footer>
    </>
  );
}
