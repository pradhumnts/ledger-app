"use client";

import Image from "next/image";
import gpaySrc from "../../public/google-pay.png";
import phonePeSrc from "../../public/phone-pe.png";
import paytmSrc from "../../public/paytm.png";
import upiSrc from "../../public/UPI-Logo.webp";
import { capture } from "@/lib/analytics";
import { openUpiApp } from "@/lib/upi-apps";
import { cn } from "@/lib/utils";

const LOGOS = [
  {
    id: "gpay",
    src: gpaySrc,
    alt: "Google Pay",
    short: "GPay",
    className: "size-7 rounded-md",
    openable: true,
  },
  {
    id: "phonepe",
    src: phonePeSrc,
    alt: "PhonePe",
    short: "PhonePe",
    className: "size-7 rounded-md",
    openable: true,
  },
  {
    id: "paytm",
    src: paytmSrc,
    alt: "Paytm",
    short: "Paytm",
    className: "size-8",
    openable: true,
  },
  {
    id: "upi",
    src: upiSrc,
    alt: "UPI",
    className: "h-5 w-[3.6rem]",
    openable: false,
  },
];

/**
 * @param {{
 *   className?: string,
 *   openApps?: boolean,
 *   phone?: string,
 *   kind?: string,
 *   hint?: string,
 * }} props
 */
export function UpiAppLogos({
  className,
  openApps = false,
  phone = "",
  kind = "bill",
  hint,
  actionLabel = "Tap to open",
}) {
  async function onOpenApp(appId) {
    const phoneText = String(phone || "").trim();
    if (phoneText) {
      try {
        await navigator.clipboard.writeText(phoneText);
      } catch {
        // App open still helps even if clipboard is blocked.
      }
    }
    capture("public_pay_app_opened", {
      app: appId,
      kind,
      has_phone: Boolean(phoneText),
    });
    openUpiApp(appId);
  }

  if (openApps) {
    const apps = LOGOS.filter((logo) => logo.openable);
    return (
      <div className={cn("w-full", className)}>
        {hint ? (
          <p className="mb-3 text-center text-[12px] font-semibold tracking-tight text-[var(--forest)] dark:text-[var(--lime)]">
            {hint}
          </p>
        ) : null}
        <div
          className="grid grid-cols-3 gap-2.5"
          aria-label="Open Google Pay, PhonePe, or Paytm"
        >
          {apps.map((logo) => (
            <button
              key={logo.id}
              type="button"
              onClick={() => onOpenApp(logo.id)}
              aria-label={`Open ${logo.alt}`}
              className="flex flex-col items-center gap-2 rounded-[1.25rem] border border-[var(--forest)]/15 bg-white px-2 py-3.5 shadow-[0_1px_0_rgba(11,48,31,0.04)] transition-[transform,background-color,border-color] active:scale-[0.97] dark:border-[var(--lime)]/25 dark:bg-zinc-950 dark:shadow-none"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--well)] dark:bg-zinc-900">
                <Image
                  src={logo.src}
                  alt=""
                  className={cn("shrink-0 object-contain", logo.className)}
                />
              </span>
              <span className="text-[11px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                {logo.short}
              </span>
              <span className="text-[10px] font-medium text-[var(--forest)] dark:text-[var(--lime)]">
                {actionLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("mt-4 flex items-center justify-center gap-5", className)}
      aria-label="Google Pay, PhonePe, Paytm, UPI"
    >
      {LOGOS.map((logo) => (
        <Image
          key={logo.id}
          src={logo.src}
          alt={logo.alt}
          className={cn("shrink-0 object-contain", logo.className)}
        />
      ))}
    </div>
  );
}
