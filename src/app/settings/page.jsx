"use client";

import {
  Building2,
  History,
  Info,
  Languages,
  Moon,
  Palette,
  QrCode,
  Share2,
  Sun,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsPromoCard } from "@/components/settings-promo-card";
import { SoftCard, ListRow, Divider } from "@/components/ui-kit";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGES } from "@/lib/i18n";
import { isQrThemeUnlocked, QR_THEMES } from "@/lib/qr-themes";
import { requestWebsitePlan, shareApp } from "@/lib/share";
import { WEBSITE_PLANS } from "@/lib/website-plans";

export default function SettingsPage() {
  const { settings, setTheme, business } = useApp();
  const { t, language, themeLabel, websitePlanLabel } = useTranslation();
  const dark = settings.theme === "dark";

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
          href="/settings/about"
          icon={<Info className="size-4" />}
          title={t("settings.about")}
          subtitle={t("settings.aboutSubtitle")}
        />
      </SoftCard>

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
    </>
  );
}
