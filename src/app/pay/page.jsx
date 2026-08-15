"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, Copy, Palette, QrCode } from "lucide-react";
import { FieldError } from "@/components/field-error";
import { QrThemeDisplay } from "@/components/qr-theme-display";
import { SoftCard } from "@/components/ui-kit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/app-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useTranslation } from "@/hooks/use-translation";
import { initials } from "@/lib/format";
import { getQrTheme, isQrThemeUnlocked, QR_THEMES } from "@/lib/qr-themes";
import { PAY_CHROME, resolveQrThemeStyle } from "@/lib/qr-theme-styles";
import { sampleImageTopColor } from "@/lib/theme-color";
import { buildUpiPaymentUrl } from "@/lib/upi";
import { cn } from "@/lib/utils";
import { fieldInvalidClass } from "@/lib/validation";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

const MAX_PAY_AMOUNT = 100000;

function PayHeader({ t }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <Link
        href="/"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/95 text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:text-zinc-950"
        aria-label={t("pay.backHome")}
      >
        <ChevronLeft className="size-5" />
      </Link>
      <Link
        href="/settings/qr-theme"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/95 text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:text-zinc-950"
        aria-label={t("pay.changeTheme")}
      >
        <Palette className="size-4" />
      </Link>
    </div>
  );
}

export default function PayPage() {
  const { business, settings } = useApp();
  const { t, themeLabel } = useTranslation();
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [copied, setCopied] = useState(false);

  const businessName = business.name?.trim() || t("pay.yourBusiness");
  const upiId = business.upiId?.trim() || "";
  const unlocked = settings.unlockedQrThemes || [];

  const theme = useMemo(() => {
    const selected = getQrTheme(settings.qrTheme);
    if (isQrThemeUnlocked(selected, unlocked)) return selected;
    return QR_THEMES.find((item) => unlocked.includes(item.id)) || null;
  }, [settings.qrTheme, unlocked]);

  const paymentUrl = useMemo(
    () =>
      buildUpiPaymentUrl({
        upiId,
        name: businessName,
        amount: amount.trim() || undefined,
      }),
    [upiId, businessName, amount]
  );

  const [posterTint, setPosterTint] = useState(null);
  useEffect(() => {
    if (!theme) {
      setPosterTint(null);
      return;
    }
    let active = true;
    sampleImageTopColor(theme.image).then((color) => {
      if (active) setPosterTint(color);
    });
    return () => {
      active = false;
    };
  }, [theme]);
  useThemeColor(posterTint);

  // The poster keeps its QR and UPI id clear of whatever this strip covers.
  const controlsRef = useRef(null);
  const [controlsHeight, setControlsHeight] = useState(0);
  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return;
    const measure = () => setControlsHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [theme, upiId]);

  function onAmountChange(raw) {
    if (raw === "" || raw == null) {
      setAmount("");
      setAmountError("");
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      setAmount("");
      setAmountError(t("validation.amountInvalid"));
      return;
    }
    if (value > MAX_PAY_AMOUNT) {
      setAmount(String(MAX_PAY_AMOUNT));
      setAmountError(t("validation.amountTooLarge"));
      return;
    }
    setAmountError("");
    setAmount(raw);
  }

  async function copyUpiId() {
    if (!upiId) return;
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  if (!upiId) {
    return (
      <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/12 dark:bg-[var(--card)]"
            aria-label={t("pay.backHome")}
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("pay.receivePayment")}
            </h1>
            <p className="text-sm text-zinc-500">{t("pay.showQrHint")}</p>
          </div>
        </div>

        <SoftCard className="p-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-[var(--well)]">
            <QrCode className="size-7" />
          </div>
          <p className="text-base font-semibold text-zinc-950 dark:text-white">
            {t("pay.addUpiFirst")}
          </p>
          <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-zinc-500">
            {t("pay.addUpiHint")}
          </p>
          <Link
            href="/settings/business"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--forest)] px-6 text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
          >
            {t("pay.addUpiButton")}
          </Link>
        </SoftCard>
      </div>
    );
  }

  if (theme) {
    const chrome = resolveQrThemeStyle(theme.id).chrome === "light" ? "light" : "dark";
    const styles = PAY_CHROME[chrome];
    const themeName = themeLabel("qr", theme.id, "name");
    return (
      <div className="relative h-dvh w-full overflow-hidden bg-black">
        <QrThemeDisplay
          theme={theme}
          business={business}
          businessName={businessName}
          upiId={upiId}
          paymentUrl={paymentUrl}
          amount={amount}
          copied={copied}
          onCopyUpi={copyUpiId}
          fullScreen
          bottomInset={controlsHeight}
        />

        <PayHeader t={t} />

        <div
          ref={controlsRef}
          className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))]"
        >
          <div className={styles.field}>
            <Input
              id="pay-amount"
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_PAY_AMOUNT}
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={t("pay.amountOptional")}
              className={cn(styles.input, fieldInvalidClass(amountError))}
              aria-invalid={Boolean(amountError)}
              aria-describedby={amountError ? "pay-amount-error" : undefined}
            />
          </div>
          <FieldError id="pay-amount-error" className="mt-2 text-center text-white/90">
            {amountError || null}
          </FieldError>
          <p className={styles.hint}>
            {t("pay.scanHint", { theme: themeName })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/12 dark:bg-[var(--card)]"
            aria-label={t("pay.backHome")}
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("pay.receivePayment")}
            </h1>
            <p className="text-sm text-zinc-500">{t("pay.showQrHint")}</p>
          </div>
        </div>
        <Link
          href="/settings/qr-theme"
          className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/12 dark:bg-[var(--card)]"
          aria-label={t("pay.changeTheme")}
        >
          <Palette className="size-4" />
        </Link>
      </div>

      <SoftCard className="overflow-hidden p-0">
        <div className="border-b border-black/5 bg-gradient-to-b from-zinc-50 to-white px-6 py-7 text-center dark:border-white/[0.08] dark:from-[#161c18] dark:to-[var(--card)]">
          <Avatar className="mx-auto mb-3 size-14 data-[size=default]:size-14">
            {business.logo ? (
              <AvatarImage src={business.logo} alt={businessName} />
            ) : null}
            <AvatarFallback className="bg-[var(--forest)] text-base font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]">
              {initials(businessName)}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold text-zinc-950 dark:text-white">
            {businessName}
          </p>
          <button
            type="button"
            onClick={copyUpiId}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-[var(--well)] dark:text-zinc-200"
          >
            {upiId}
            <Copy className="size-3.5 opacity-60" />
          </button>
          {copied ? (
            <p className="mt-1.5 text-xs text-[var(--forest)] dark:text-[var(--lime)]">
              {t("pay.upiCopied")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-center px-6 py-8">
          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/12 dark:bg-white">
            <QRCode
              value={paymentUrl}
              size={220}
              level="M"
              bgColor="#ffffff"
              fgColor="#18181b"
            />
          </div>
          <Link
            href="/settings/qr-theme"
            className="mt-5 text-sm font-medium text-[var(--forest)] dark:text-[var(--lime)]"
          >
            {t("pay.pickTheme")}
          </Link>
        </div>
      </SoftCard>

      <SoftCard className="mt-5 p-4">
        <Input
          id="pay-amount"
          type="number"
          inputMode="decimal"
          min="0"
          max={MAX_PAY_AMOUNT}
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={t("pay.amountOptional")}
          className={cn(
            "h-12 rounded-2xl text-center text-lg font-semibold tabular-nums",
            fieldInvalidClass(amountError)
          )}
          aria-invalid={Boolean(amountError)}
          aria-describedby={amountError ? "pay-amount-error" : undefined}
        />
        <FieldError id="pay-amount-error" className="mt-2 text-center">
          {amountError || null}
        </FieldError>
      </SoftCard>
    </div>
  );
}
