"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Lock, MessageCircle } from "lucide-react";
import { QrThemePreviewCard, qrCarouselCardSize } from "@/components/qr-theme-preview-card";
import { ThemeRequestCard } from "@/components/theme-request-card";
import {
  QR_THEME_PRICE,
  QR_THEMES,
  isQrThemeUnlocked,
} from "@/lib/qr-themes";
import {
  carouselCardStyle,
  carouselEdgeOffset,
  clampIndex,
  linearOffset,
} from "@/lib/theme-carousel";
import { useApp } from "@/context/app-provider";
import { useTranslation } from "@/hooks/use-translation";
import { formatINR } from "@/lib/format";
import { requestCustomTheme } from "@/lib/share";
import { cn } from "@/lib/utils";

const SIDE_PEEK = 48;
const STAGE_PAD = 28;
const REQUEST_INDEX = QR_THEMES.length;
const CAROUSEL_COUNT = QR_THEMES.length + 1;

export default function QrThemePage() {
  const { business, settings, setQrTheme, unlockQrTheme } = useApp();
  const { t, language, themeLabel } = useTranslation();
  const unlocked = settings.unlockedQrThemes || [];
  const selectedId = useMemo(() => {
    if (!settings.qrTheme) return null;
    const theme = QR_THEMES.find((item) => item.id === settings.qrTheme);
    return theme && isQrThemeUnlocked(theme, unlocked) ? theme.id : null;
  }, [settings.qrTheme, unlocked]);

  const initialIndex = useMemo(() => {
    if (selectedId) {
      const idx = QR_THEMES.findIndex((theme) => theme.id === selectedId);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [selectedId]);
  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [stageWidth, setStageWidth] = useState(390);
  const stageRef = useRef(null);
  const startX = useRef(0);

  useEffect(() => {
    if (!selectedId) return;
    const next = QR_THEMES.findIndex((theme) => theme.id === selectedId);
    if (next >= 0) setIndex(next);
  }, [selectedId]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isRequestCard = index === REQUEST_INDEX;
  const active = isRequestCard ? null : QR_THEMES[index] || QR_THEMES[0];
  const unlockedActive = active ? isQrThemeUnlocked(active, unlocked) : false;
  const isSelected = active ? active.id === selectedId : false;
  const { width: cardWidth, height: cardHeight } = qrCarouselCardSize(stageWidth);

  const activeName = active ? themeLabel("qr", active.id, "name") : "";
  const activeTagline = active ? themeLabel("qr", active.id, "tagline") : "";

  const buttonLabel = useMemo(() => {
    if (isRequestCard) return t("qrTheme.requestButton");
    if (isSelected) return t("qrTheme.selected");
    if (unlockedActive) return t("qrTheme.choose");
    return t("qrTheme.buy", { price: formatINR(QR_THEME_PRICE) });
  }, [isRequestCard, isSelected, unlockedActive, t]);

  function onPointerDown(event) {
    setDragging(true);
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging) return;
    setDragX(event.clientX - startX.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const threshold = 52;
    if (dragX <= -threshold) {
      setIndex((prev) => clampIndex(prev + 1, CAROUSEL_COUNT));
    } else if (dragX >= threshold) {
      setIndex((prev) => clampIndex(prev - 1, CAROUSEL_COUNT));
    }
    setDragX(0);
  }

  const edgeOffset = useMemo(
    () => carouselEdgeOffset(stageWidth, cardWidth, SIDE_PEEK),
    [stageWidth, cardWidth]
  );

  function cardStyle(offset) {
    return carouselCardStyle({
      offset,
      dragging,
      dragX,
      cardWidth,
      edgeOffset,
    });
  }

  function onAction() {
    if (isRequestCard) {
      requestCustomTheme({
        kind: "qr",
        businessName: business.name,
        language,
      });
      return;
    }
    if (isSelected) return;
    if (unlockedActive) {
      setQrTheme(active.id);
      return;
    }
    const ok = window.confirm(
      t("qrTheme.unlockConfirm", {
        name: activeName,
        price: QR_THEME_PRICE,
      })
    );
    if (ok) unlockQrTheme(active.id);
  }

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--app-bg)] to-[#e9ece6] dark:from-zinc-950 dark:via-[var(--app-bg)] dark:to-black" />
        <div className="absolute -top-28 -left-24 size-[22rem] rounded-full bg-[var(--lime)]/30 blur-[90px] dark:bg-[var(--lime)]/10" />
        <div className="absolute top-1/3 -right-28 size-[20rem] rounded-full bg-[var(--forest)]/12 blur-[100px] dark:bg-[var(--lime)]/8" />
        <div className="absolute -bottom-32 left-1/4 size-[18rem] rounded-full bg-[#9ec2a8]/25 blur-[90px] dark:bg-[var(--forest)]/25" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-md flex-col">
        <div className="shrink-0">
          <div className="mb-4 flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              aria-label={t("settings.title")}
            >
              <ChevronLeft className="size-5" />
            </Link>
            <h1 className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("qrTheme.title")}
            </h1>
          </div>

          <div className="text-center">
            <h2 className="text-[1.6rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("qrTheme.pickTitle")}
            </h2>
            <p className="mx-auto mt-1.5 max-w-[19rem] text-sm leading-relaxed text-zinc-500">
              {t("qrTheme.pickSubtitle", { price: formatINR(QR_THEME_PRICE) })}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div
            ref={stageRef}
            className="relative -mx-5 cursor-grab touch-none select-none active:cursor-grabbing"
            style={{ height: cardHeight + STAGE_PAD * 2 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {QR_THEMES.map((theme, i) => {
              const offset = linearOffset(i, index);
              if (Math.abs(offset) > 2) return null;

              return (
                <div
                  key={theme.id}
                  className="absolute left-1/2 origin-center will-change-transform"
                  style={{
                    top: STAGE_PAD,
                    width: cardWidth,
                    height: cardHeight,
                    transition: dragging
                      ? "none"
                      : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                    ...cardStyle(offset),
                  }}
                  onClick={() => {
                    if (!dragging && offset !== 0) setIndex(i);
                  }}
                >
                  <QrThemePreviewCard theme={theme} active={offset === 0} />
                </div>
              );
            })}

            {(() => {
              const offset = linearOffset(REQUEST_INDEX, index);
              if (Math.abs(offset) > 2) return null;

              return (
                <div
                  key="request-theme"
                  className="absolute left-1/2 origin-center will-change-transform"
                  style={{
                    top: STAGE_PAD,
                    width: cardWidth,
                    height: cardHeight,
                    transition: dragging
                      ? "none"
                      : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                    ...cardStyle(offset),
                  }}
                  onClick={() => {
                    if (!dragging && offset !== 0) setIndex(REQUEST_INDEX);
                  }}
                >
                  <ThemeRequestCard variant="qr" active={offset === 0} />
                </div>
              );
            })()}
          </div>
        </div>

        <div className="shrink-0 pt-2 pb-2">
          <div className="mb-4 text-center">
            <p className="text-base font-semibold text-zinc-950 dark:text-white">
              {isRequestCard ? t("qrTheme.requestTitle") : activeName}
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-sm text-zinc-500">
              {isRequestCard ? (
                t("qrTheme.requestSubtitle")
              ) : (
                <>
                  {!unlockedActive ? <Lock className="size-3.5" /> : null}
                  {activeTagline}
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[var(--mint)]">
                      <Check className="size-3.5" />
                      {t("common.active")}
                    </span>
                  ) : null}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onAction}
            disabled={!isRequestCard && isSelected}
            className={cn(
              "mx-auto flex h-12 w-[70%] items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-[opacity,transform] duration-200 active:scale-[0.98]",
              !isRequestCard && isSelected
                ? "cursor-default bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                : isRequestCard
                  ? "border border-[var(--forest)]/15 bg-white text-[var(--forest)] shadow-sm dark:border-[var(--lime)]/20 dark:bg-zinc-900 dark:text-[var(--lime)]"
                  : unlockedActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "bg-[var(--forest)] text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
            )}
          >
            {isRequestCard ? (
              <MessageCircle className="size-4" />
            ) : !unlockedActive ? (
              <Lock className="size-4" />
            ) : null}
            {!isRequestCard && isSelected ? <Check className="size-4" /> : null}
            {buttonLabel}
          </button>
          <p className="mt-3 text-center text-[11px] text-zinc-400">
            {t("qrTheme.swipeHint")}
          </p>
        </div>
      </div>
    </>
  );
}
