"use client";

import { cn } from "@/lib/utils";

/** Portrait poster ratio (~853×1844). */
export const QR_POSTER_RATIO = 1844 / 853;

export const QR_CAROUSEL_CARD_W = 226;

export function qrCarouselCardSize(stageWidth = 390, maxHeight = 520) {
  const widthCap = Math.min(QR_CAROUSEL_CARD_W, Math.round(stageWidth * 0.46));
  let width = widthCap;
  let height = Math.round(width * QR_POSTER_RATIO);
  const heightCap = Math.max(220, maxHeight);
  if (height > heightCap) {
    height = heightCap;
    width = Math.round(height / QR_POSTER_RATIO);
  }
  return { width, height };
}

export function QrThemePreviewCard({ theme, active }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-zinc-100 shadow-[0_18px_40px_rgba(0,0,0,0.12)]",
        active && "shadow-[0_24px_50px_rgba(0,0,0,0.16)]"
      )}
    >
      {theme.free ? (
        <span className="absolute top-3 right-3 z-20 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm">
          Free
        </span>
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={theme.preview}
        alt={`${theme.name} theme preview`}
        className="h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}
