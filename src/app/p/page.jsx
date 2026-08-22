"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, IndianRupee } from "lucide-react";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { PageSpinner } from "@/components/page-spinner";
import { SoftCard } from "@/components/ui-kit";
import { useTranslation } from "@/hooks/use-translation";
import { capture, amountBucket } from "@/lib/analytics";
import { APP_NAME } from "@/lib/branding";
import { formatINR } from "@/lib/format";
import { buildUpiPaymentUrl, isValidUpiId } from "@/lib/upi";
import { rupeesToPaise } from "@/lib/supabase/money";

function PayLinkForm() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const openedRef = useRef(false);

  const pa = String(searchParams.get("pa") || "").trim();
  const pn = String(searchParams.get("pn") || "").trim();
  const am = String(searchParams.get("am") || "").trim();
  const valid = isValidUpiId(pa);
  const amountPaise = rupeesToPaise(am);
  const amount = amountPaise > 0 ? amountPaise / 100 : 0;

  const upiUrl = useMemo(
    () =>
      valid
        ? buildUpiPaymentUrl({
            upiId: pa,
            name: pn,
            amount: amount || undefined,
          })
        : "",
    [valid, pa, pn, amount]
  );

  useEffect(() => {
    if (!upiUrl || openedRef.current) return;
    openedRef.current = true;
    capture("pay_link_opened", { amount_bucket: amountBucket(amount) });
    const timer = window.setTimeout(() => {
      window.location.href = upiUrl;
    }, 350);
    return () => window.clearTimeout(timer);
  }, [upiUrl, amount]);

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(pa);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const title = pn
    ? t("payLink.title", { name: pn })
    : t("payLink.fallbackTitle");

  if (!valid) {
    return (
      <SoftCard className="p-6 text-center">
        <p className="text-base font-semibold text-zinc-950 dark:text-white">
          {t("payLink.invalid")}
        </p>
      </SoftCard>
    );
  }

  return (
    <SoftCard className="p-6">
      <p className="text-center text-sm text-zinc-500">{APP_NAME}</p>
      <h1 className="mt-1 text-center text-[1.65rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
        {title}
      </h1>
      {amount > 0 ? (
        <p className="mt-3 text-center text-[2.1rem] font-semibold tabular-nums text-[var(--mint)]">
          {formatINR(amount)}
        </p>
      ) : null}
      <p className="mt-2 text-center text-sm text-zinc-500">{pa}</p>
      <p className="mt-4 text-center text-xs text-zinc-400">{t("payLink.hint")}</p>

      <a
        href={upiUrl}
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--forest)] text-sm font-semibold text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
      >
        <IndianRupee className="size-4" />
        {t("payLink.openApp")}
      </a>
      <button
        type="button"
        onClick={copyUpi}
        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 dark:border-white/12 dark:bg-white/[0.06] dark:text-white"
      >
        <Copy className="size-4" />
        {copied ? t("payLink.copied") : t("payLink.copy")}
      </button>
    </SoftCard>
  );
}

export default function PayLinkPage() {
  return (
    <div className="flex min-h-dvh flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mb-8 flex justify-center">
        <MoneyKitLogo size={44} priority />
      </div>
      <Suspense fallback={<PageSpinner />}>
        <PayLinkForm />
      </Suspense>
    </div>
  );
}
