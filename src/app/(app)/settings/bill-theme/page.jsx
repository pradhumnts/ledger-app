"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2, Lock } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { ThemePreviewCard, billCarouselCardSize } from "@/components/bill-theme-previews";
import { ThemeRequestCard } from "@/components/theme-request-card";
import {
  BILL_THEME_PRICE,
  BILL_THEMES,
  isBillThemeUnlocked,
} from "@/lib/bill-themes";
import {
  carouselCardStyle,
  carouselEdgeOffset,
  clampIndex,
  linearOffset,
} from "@/lib/theme-carousel";
import { useApp } from "@/context/app-provider";
import { useBusyAction } from "@/hooks/use-busy-action";
import { useTranslation } from "@/hooks/use-translation";
import { buyTheme } from "@/lib/buy-theme";
import { formatINR } from "@/lib/format";
import { requestCustomTheme } from "@/lib/share";
import { arePaidThemesFree } from "@/lib/theme-access";
import { cn } from "@/lib/utils";

const SIDE_PEEK = 18;
const STAGE_PAD = 12;
const REQUEST_INDEX = BILL_THEMES.length;
const CAROUSEL_COUNT = BILL_THEMES.length + 1;

export default function BillThemePage() {
  const router = useRouter();
  const { business, settings, setBillTheme, unlockBillTheme } = useApp();
  const { t, language, themeLabel } = useTranslation();
  const selectedId = settings.billTheme || "classic";
  const unlocked = settings.unlockedBillThemes || [];

  const initialIndex = Math.max(
    0,
    BILL_THEMES.findIndex((theme) => theme.id === selectedId)
  );
  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 390, height: 420 });
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const { busy: requesting, run: runRequest } = useBusyAction();
  const stageRef = useRef(null);
  const startX = useRef(0);

  useEffect(() => {
    const next = BILL_THEMES.findIndex((theme) => theme.id === selectedId);
    if (next >= 0) setIndex(next);
  }, [selectedId]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () =>
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isRequestCard = index === REQUEST_INDEX;
  const active = isRequestCard ? null : BILL_THEMES[index] || BILL_THEMES[0];
  const unlockedActive = active ? isBillThemeUnlocked(active, unlocked) : false;
  const isSelected = active ? active.id === selectedId : false;
  const { width: cardWidth, height: cardHeight } = billCarouselCardSize(
    stageSize.width,
    stageSize.height - STAGE_PAD * 2
  );
  const businessName = business.name?.trim() || t("home.yourBusiness");

  const activeName = active
    ? themeLabel("bill", active.id, "name")
    : "";
  const activeTagline = active
    ? themeLabel("bill", active.id, "tagline")
    : "";

  const buttonLabel = useMemo(() => {
    if (isRequestCard) return t("billTheme.requestButton");
    if (isSelected) return t("billTheme.selected");
    if (unlockedActive) return t("billTheme.choose");
    if (buying) return t("billTheme.buying");
    return t("billTheme.buy", { price: formatINR(BILL_THEME_PRICE) });
  }, [isRequestCard, isSelected, unlockedActive, buying, t]);

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
    () => carouselEdgeOffset(stageSize.width, cardWidth, SIDE_PEEK),
    [stageSize.width, cardWidth]
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

  async function onAction() {
    if (buying || requesting) return;
    if (isRequestCard) {
      runRequest(() =>
        requestCustomTheme({
          kind: "bill",
          businessName: business.name,
          language,
        })
      );
      return;
    }
    if (isSelected) return;
    if (unlockedActive) {
      setBillTheme(active.id);
      return;
    }
    setBuyError("");
    setBuying(true);
    try {
      await buyTheme({
        kind: "bill",
        themeId: active.id,
        name: business.name,
        contact: business.phone,
        onUnlocked: unlockBillTheme,
      });
    } catch (error) {
      if (String(error.message) !== "cancelled") {
        const key =
          error.message === "buyNeedLogin" ? "billTheme.buyNeedLogin" : "billTheme.buyFailed";
        setBuyError(t(key));
      }
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="theme-page relative isolate h-full min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="page-enter-skip pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--app-bg)] to-[#e9ece6] dark:from-zinc-950 dark:via-[var(--app-bg)] dark:to-black" />
        <div className="absolute -top-28 -left-24 size-[22rem] rounded-full bg-[var(--lime)]/30 blur-[90px] dark:bg-[var(--lime)]/10" />
        <div className="absolute top-1/3 -right-28 size-[20rem] rounded-full bg-[var(--forest)]/12 blur-[100px] dark:bg-[var(--lime)]/8" />
        <div className="absolute -bottom-32 left-1/4 size-[18rem] rounded-full bg-[#9ec2a8]/25 blur-[90px] dark:bg-[var(--forest)]/25" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
        <div className="shrink-0">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                  return;
                }
                router.replace("/settings");
              }}
              className="inline-flex size-10 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              aria-label={t("common.back")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <h1 className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("billTheme.title")}
            </h1>
          </div>

          <div className="text-center">
            <h2 className="text-[1.45rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("billTheme.pickTitle")}
            </h2>
            <p className="mx-auto mt-1 max-w-[19rem] text-sm leading-relaxed text-zinc-500">
              {t(
                arePaidThemesFree()
                  ? "billTheme.pickSubtitleFree"
                  : "billTheme.pickSubtitle"
              )}
            </p>
          </div>
        </div>

        <div
          ref={stageRef}
          className="relative mx-[-1.25rem] min-h-0 flex-1 overflow-hidden cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {BILL_THEMES.map((theme, i) => {
            const offset = linearOffset(i, index);
            if (Math.abs(offset) > 2) return null;

            return (
              <div
                key={theme.id}
                className="absolute left-1/2 origin-center will-change-transform"
                style={{
                  top: "50%",
                  marginTop: -cardHeight / 2,
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
                <ThemePreviewCard
                  theme={theme}
                  businessName={businessName}
                  active={offset === 0}
                />
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
                  top: "50%",
                  marginTop: -cardHeight / 2,
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
                <ThemeRequestCard variant="bill" active={offset === 0} />
              </div>
            );
          })()}
        </div>

        <div className="shrink-0 pt-2">
          <div className="mb-2.5 text-center">
            <p className="text-base font-semibold text-zinc-950 dark:text-white">
              {isRequestCard ? t("billTheme.requestTitle") : activeName}
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-sm text-zinc-500">
              {isRequestCard ? (
                t("billTheme.requestSubtitle")
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
            disabled={buying || requesting || (!isRequestCard && isSelected)}
            className={cn(
              "mx-auto flex h-12 w-[70%] items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-[opacity,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none",
              buying || requesting || (!isRequestCard && isSelected)
                ? "cursor-default bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                : unlockedActive || isRequestCard
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "bg-[var(--forest)] text-white dark:bg-[var(--lime)] dark:text-[var(--forest)]"
            )}
          >
            {isRequestCard ? (
              requesting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <WhatsAppIcon className="size-4" />
              )
            ) : !unlockedActive ? (
              <Lock className="size-4" />
            ) : null}
            {!isRequestCard && isSelected ? <Check className="size-4" /> : null}
            {buttonLabel}
          </button>
          {buyError ? (
            <p className="mt-2 text-center text-[12px] text-rose-600 dark:text-rose-400">
              {buyError}
            </p>
          ) : (
            <p className="mt-2 text-center text-[11px] text-zinc-400">
              {t("billTheme.swipeHint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
