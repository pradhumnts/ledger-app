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
    className: "size-6 rounded-md",
    openable: true,
  },
  {
    id: "phonepe",
    src: phonePeSrc,
    alt: "PhonePe",
    className: "size-6 rounded-md",
    openable: true,
  },
  {
    id: "paytm",
    src: paytmSrc,
    alt: "Paytm",
    className: "size-7",
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
 * @param {{ className?: string, openApps?: boolean, phone?: string, kind?: string, hint?: string }} props
 */
export function UpiAppLogos({
  className,
  openApps = false,
  phone = "",
  kind = "bill",
  hint,
}) {
  async function onOpenApp(appId) {
    const text = String(phone || "").trim();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // App open still helps even if clipboard is blocked.
      }
    }
    capture("public_pay_app_opened", { app: appId, kind, has_phone: Boolean(text) });
    openUpiApp(appId);
  }

  return (
    <div>
      {openApps && hint ? (
        <p className="mb-3 text-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
      <div
        className={cn("mt-4 flex items-center justify-center gap-5", className)}
        aria-label="Google Pay, PhonePe, Paytm, UPI"
      >
        {LOGOS.map((logo) => {
          if (openApps && logo.openable) {
            return (
              <button
                key={logo.id}
                type="button"
                onClick={() => onOpenApp(logo.id)}
                aria-label={`Open ${logo.alt}`}
                className="flex size-11 items-center justify-center rounded-2xl border border-black/[0.04] bg-white transition-[transform,opacity] active:scale-95 dark:border-white/10 dark:bg-zinc-950"
              >
                <Image
                  src={logo.src}
                  alt=""
                  className={cn("shrink-0 object-contain", logo.className)}
                />
              </button>
            );
          }

          return (
            <Image
              key={logo.id}
              src={logo.src}
              alt={logo.alt}
              className={cn("shrink-0 object-contain", logo.className)}
            />
          );
        })}
      </div>
    </div>
  );
}
