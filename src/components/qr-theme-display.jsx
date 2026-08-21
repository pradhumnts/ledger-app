"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCodeBlock } from "@/components/qr-code-block";
import { formatINR, formatINRPlain, initials } from "@/lib/format";
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  layoutQrPoster,
  pickTop,
  posStyle,
  preloadQrFontHrefs,
  resolveQrThemeStyle,
} from "@/lib/qr-theme-styles";
import { cn } from "@/lib/utils";

function useThemeFonts(hrefs = []) {
  const hrefKey = hrefs.filter(Boolean).join("|");
  useEffect(() => {
    preloadQrFontHrefs(hrefKey ? hrefKey.split("|") : []);
  }, [hrefKey]);
}

const MOVE_EASE = "top 380ms cubic-bezier(0.22, 1, 0.36, 1)";

const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const TOP_MARGIN = 8;

/**
 * Fits the poster board over its host box.
 *
 * The board always covers the host, so the crop lands on the artwork rather
 * than on the layout. On short screens the crop is nudged upwards so the QR and
 * UPI id stay clear of whatever the page overlays at the bottom.
 */
function usePosterFit({ contentTop, contentBottom, bottomInset }) {
  const hostRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });

  useBeforePaint(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;

      const scale = Math.max(width / POSTER_WIDTH, height / POSTER_HEIGHT);
      const boardHeight = POSTER_HEIGHT * scale;
      const topEdge = (contentTop / 100) * boardHeight;
      const bottomEdge = (contentBottom / 100) * boardHeight;

      let y = (height - boardHeight) / 2;
      if (topEdge + y < TOP_MARGIN) y = TOP_MARGIN - topEdge;
      const bottomLimit = height - bottomInset;
      if (bottomEdge + y > bottomLimit) y = bottomLimit - bottomEdge;
      y = Math.min(0, Math.max(y, height - boardHeight));

      const next = { scale, x: (width - POSTER_WIDTH * scale) / 2, y };
      setFit((prev) =>
        Math.abs(prev.scale - next.scale) > 0.0005 ||
        Math.abs(prev.x - next.x) > 0.5 ||
        Math.abs(prev.y - next.y) > 0.5
          ? next
          : prev
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [contentTop, contentBottom, bottomInset]);

  return [hostRef, fit];
}

/** Splits a name across the lines a theme designed for, never more. */
function splitIntoLines(name, maxLines) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxLines) return words;

  const lines = Array.from({ length: maxLines }, () => []);
  words.forEach((word, index) => {
    const slot = Math.min(
      maxLines - 1,
      Math.floor((index * maxLines) / words.length)
    );
    lines[slot].push(word);
  });
  return lines.map((line) => line.join(" ")).filter(Boolean);
}

/**
 * Keeps a line of poster text on one line by scaling it down when it is wider
 * than the space the theme reserves for it, so long names never run into the
 * amount or the QR below.
 */
function FitText({ children, className, style, minScale = 0.5 }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(1);

  const fit = useCallback(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const available = box.clientWidth;
    const natural = text.offsetWidth;
    if (!available || !natural) return;
    const next =
      natural > available ? Math.max(minScale, available / natural) : 1;
    setScale((prev) => (Math.abs(prev - next) > 0.004 ? next : prev));
  }, [minScale]);

  useBeforePaint(fit);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    // Watching the text too catches the reflow when a theme's web font swaps in.
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(text);
    const fonts = document.fonts;
    fonts?.addEventListener?.("loadingdone", fit);
    fonts?.ready?.then(fit).catch(() => {});

    return () => {
      observer.disconnect();
      fonts?.removeEventListener?.("loadingdone", fit);
    };
  }, [fit]);

  // Flex centring keeps an oversized line centred while it is measured; text
  // that overflows an inline box would be pushed to one side instead.
  return (
    <span
      ref={boxRef}
      className={cn("flex min-w-0 justify-center", className)}
      style={style}
    >
      <span
        ref={textRef}
        className="shrink-0 whitespace-nowrap"
        style={
          scale < 1
            ? { transform: `scale(${scale})`, transformOrigin: "center" }
            : undefined
        }
      >
        {children}
      </span>
    </span>
  );
}

function WrappingBusinessName({ name, cfg, top, maxLines = 2 }) {
  const displayName = cfg.uppercase ? name.toUpperCase() : name;
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  const lines = words.length > 1 ? splitIntoLines(displayName, maxLines) : [displayName];

  return (
    <div
      className="absolute z-10 w-[88%] text-center"
      style={{
        ...posStyle(top ?? cfg.top),
        fontFamily: cfg.fontFamily,
        fontSize: cfg.fontSize,
        fontWeight: cfg.fontWeight,
        color: cfg.color,
        letterSpacing: cfg.letterSpacing,
        lineHeight: cfg.lineHeight,
        fontStyle: cfg.fontStyle,
        textShadow: cfg.textShadow,
        transition: MOVE_EASE,
      }}
    >
      {lines.map((line, index) => (
        <FitText key={`${line}-${index}`} className="w-full">
          {line}
        </FitText>
      ))}
    </div>
  );
}

function StackedBusinessName({ name, cfg, top }) {
  const baseStyle = {
    ...posStyle(top ?? cfg.top),
    fontFamily: cfg.fontFamily,
    fontSize: cfg.fontSize,
    fontWeight: cfg.fontWeight,
    color: cfg.color,
    letterSpacing: cfg.letterSpacing,
    lineHeight: cfg.lineHeight,
    fontStyle: cfg.fontStyle,
    textShadow: cfg.textShadow,
    transition: MOVE_EASE,
  };

  if (cfg.stackedWords) {
    const words = splitIntoLines(name, cfg.wordStyles?.length || 3);
    return (
      <div className="absolute z-10 w-[92%] text-center" style={baseStyle}>
        {words.map((word, index) => {
          const wordCfg = cfg.wordStyles?.[index] || {};
          const text = (wordCfg.uppercase ?? cfg.uppercase) ? word.toUpperCase() : word;

          if (wordCfg.letterColors?.length) {
            return (
              <FitText key={`${word}-${index}`} className="w-full">
                {text.split("").map((char, charIndex) => (
                  <span
                    key={`${char}-${charIndex}`}
                    style={{
                      fontFamily: cfg.fontFamily,
                      color:
                        wordCfg.letterColors[charIndex] ||
                        wordCfg.color ||
                        cfg.color,
                      textShadow:
                        wordCfg.letterShadows?.[charIndex] ||
                        wordCfg.textShadow ||
                        cfg.textShadow,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </FitText>
            );
          }

          return (
            <FitText
              key={`${word}-${index}`}
              className="w-full"
              style={{
                fontFamily: cfg.fontFamily,
                color: wordCfg.color || cfg.color,
                fontSize: wordCfg.fontSize,
                fontWeight: wordCfg.fontWeight,
                letterSpacing: wordCfg.letterSpacing,
                textShadow: wordCfg.textShadow || cfg.textShadow,
              }}
            >
              {text}
            </FitText>
          );
        })}
      </div>
    );
  }

  const parts = name.trim().split(/\s+/);
  const line1 = parts[0] || name;
  const line2 = parts.slice(1).join(" ");
  const line1Text = cfg.uppercase ? line1.toUpperCase() : line1;
  const line2Text = (cfg.line2Uppercase ?? cfg.uppercase) ? line2.toUpperCase() : line2;
  const line2Display = line2
    ? `${cfg.line2Wrap?.prefix || ""}${line2Text}${cfg.line2Wrap?.suffix || ""}`
    : "";

  return (
    <div className="absolute z-10 w-[92%] text-center" style={baseStyle}>
      <FitText className="w-full">{line1Text}</FitText>
      {line2 ? (
        cfg.line2Lines ? (
          <span
            className="mt-[0.35em] flex items-center justify-center gap-3"
            style={{
              fontFamily: cfg.line2FontFamily || cfg.fontFamily,
              fontSize: cfg.line2FontSize,
              fontWeight: cfg.line2FontWeight,
              letterSpacing: cfg.line2LetterSpacing,
              color: cfg.line2Color,
              fontStyle: cfg.line2FontStyle,
            }}
          >
            <span
              className="h-px w-10 shrink-0"
              style={{ background: cfg.line2LineColor || cfg.line2Color }}
            />
            <FitText className="min-w-0 flex-1">{line2Display}</FitText>
            <span
              className="h-px w-10 shrink-0"
              style={{ background: cfg.line2LineColor || cfg.line2Color }}
            />
          </span>
        ) : (
          <FitText
            className="w-full"
            style={{
              fontFamily: cfg.line2FontFamily || cfg.fontFamily,
              fontSize: cfg.line2FontSize,
              fontWeight: cfg.line2FontWeight,
              letterSpacing: cfg.line2LetterSpacing,
              color: cfg.line2Color,
              fontStyle: cfg.line2FontStyle,
              marginTop: cfg.line2FontSize ? "0.28em" : undefined,
            }}
          >
            {line2Display}
          </FitText>
        )
      ) : null}
    </div>
  );
}

function renderUpiLabel(upiId, cfg) {
  const label = cfg.lowercase ? upiId.toLowerCase() : upiId;

  if (cfg.highlightHandle) {
    const match = label.match(/^([^.]*\.)?([^.@]+)(@.+)$/);
    if (match) {
      return (
        <>
          {match[1] || ""}
          <span style={{ color: cfg.highlightColor || cfg.color }}>{match[2]}</span>
          {match[3]}
        </>
      );
    }
  }

  if (!cfg.highlight) return label;

  const idx = label.indexOf(cfg.highlight);
  if (idx === -1) return label;

  return (
    <>
      {label.slice(0, idx)}
      <span style={{ color: cfg.highlightColor || cfg.color }}>{cfg.highlight}</span>
      {label.slice(idx + cfg.highlight.length)}
    </>
  );
}

function UpiChip({ upiId, onCopy, style: cfg, fontFamily, top }) {
  const base =
    "absolute z-10 inline-flex max-w-full items-center justify-center gap-1.5";
  const copyIcon = cfg.hideCopyIcon ? null : (
    <Copy className="size-3.5 shrink-0 opacity-50" />
  );
  const resolvedTop = top ?? cfg.top;
  const label = (
    <FitText className="flex-1" minScale={0.62}>
      {renderUpiLabel(upiId, cfg)}
    </FitText>
  );

  if (cfg.variant === "plain") {
    return (
      <button
        type="button"
        onClick={onCopy}
        className={cn(base, "border-0 bg-transparent px-2")}
        style={{
          ...posStyle(resolvedTop, { maxWidth: cfg.maxWidth }),
          fontFamily,
          fontSize: cfg.fontSize,
          fontWeight: cfg.fontWeight,
          color: cfg.color,
          fontStyle: cfg.fontStyle,
          letterSpacing: cfg.letterSpacing,
          transition: MOVE_EASE,
        }}
      >
        {label}
        {copyIcon}
      </button>
    );
  }

  if (cfg.variant === "badge") {
    return (
      <button
        type="button"
        onClick={onCopy}
        className={cn(base, "rounded-lg px-3 py-1.5 shadow-sm")}
        style={{
          ...posStyle(resolvedTop, { maxWidth: cfg.maxWidth }),
          fontFamily,
          fontSize: cfg.fontSize,
          fontWeight: cfg.fontWeight,
          color: cfg.color,
          background: cfg.bg,
          transition: MOVE_EASE,
        }}
      >
        {label}
        {copyIcon ?? <Copy className="size-3.5 shrink-0 opacity-70" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(base, "rounded-full px-3 py-1.5 shadow-sm backdrop-blur-sm")}
      style={{
        ...posStyle(resolvedTop, { maxWidth: cfg.maxWidth }),
        fontFamily,
        fontSize: cfg.fontSize,
        fontWeight: cfg.fontWeight,
        color: cfg.color,
        background: cfg.bg,
        transition: MOVE_EASE,
      }}
    >
      {label}
      {copyIcon ?? <Copy className="size-3.5 shrink-0 opacity-60" />}
    </button>
  );
}

export function QrThemeDisplay({
  theme,
  business,
  businessName,
  upiId,
  paymentUrl,
  amount,
  copied,
  onCopyUpi,
  className,
  interactive = true,
  preview = false,
  fullScreen = false,
  bottomInset = 0,
  boardRef = null,
}) {
  const cfg = resolveQrThemeStyle(theme.id);
  useThemeFonts([
    cfg.fontHref,
    cfg.businessNameFontHref,
    cfg.line2FontHref,
    cfg.amountFontHref,
    cfg.upiFontHref,
  ]);

  const amountValue = Number(amount);
  const showAmount = cfg.amount.show && Number.isFinite(amountValue) && amountValue > 0;

  // Both layouts are measured so the board sits still while an amount is typed.
  const idleLayout = layoutQrPoster(cfg, false);
  const amountLayout = layoutQrPoster(cfg, true);
  const layout = showAmount ? amountLayout : idleLayout;
  const [hostRef, fit] = usePosterFit({
    contentTop: Math.min(idleLayout.contentTop, amountLayout.contentTop),
    contentBottom: Math.max(idleLayout.contentBottom, amountLayout.contentBottom),
    bottomInset,
  });

  return (
    <div
      ref={hostRef}
      className={cn(
        fullScreen
          ? "relative h-dvh w-full overflow-hidden"
          : preview
            ? "relative h-full w-full overflow-hidden"
            : "relative mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.14)]",
        className
      )}
      style={{ fontFamily: cfg.fontFamily }}
    >
      {!fullScreen && !preview ? (
        <div className="pointer-events-none aspect-[853/1844] w-full" />
      ) : null}

      <div
        ref={boardRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: POSTER_WIDTH,
          height: POSTER_HEIGHT,
          transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-poster-bg="true"
          src={theme.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />

        {cfg.logo.show ? (
          <div
            className="absolute z-10"
            style={posStyle(pickTop(cfg.logo, showAmount), {
              transform: "translateX(-50%)",
              transition: MOVE_EASE,
            })}
          >
            <Avatar
              className="data-[size=default]:size-12"
              style={{
                width: cfg.logo.size,
                height: cfg.logo.size,
                boxShadow: cfg.logo.ring ? `0 0 0 ${cfg.logo.ring}` : undefined,
              }}
            >
              {business.logo ? (
                <AvatarImage src={business.logo} alt={businessName} />
              ) : null}
              <AvatarFallback className="bg-[var(--forest)] text-sm font-semibold text-white">
                {initials(businessName)}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : null}

        {cfg.businessName.wrapLines ? (
          <WrappingBusinessName
            name={businessName}
            cfg={{
              ...cfg.businessName,
              fontFamily: cfg.businessNameFontFamily || cfg.fontFamily,
            }}
            top={pickTop(cfg.businessName, showAmount)}
            maxLines={cfg.businessName.wrapLines}
          />
        ) : cfg.businessName.stacked ? (
          <StackedBusinessName
            name={businessName}
            cfg={{
              ...cfg.businessName,
              fontFamily: cfg.businessNameFontFamily || cfg.fontFamily,
              line2FontFamily: cfg.line2FontFamily,
            }}
            top={pickTop(cfg.businessName, showAmount)}
          />
        ) : (
          <p
            className="absolute z-10 w-[88%] text-center"
            style={{
              ...posStyle(pickTop(cfg.businessName, showAmount)),
              fontFamily: cfg.businessNameFontFamily || cfg.fontFamily,
              fontSize: cfg.businessName.fontSize,
              fontWeight: cfg.businessName.fontWeight,
              color: cfg.businessName.color,
              letterSpacing: cfg.businessName.letterSpacing,
              lineHeight: cfg.businessName.lineHeight,
              textTransform: cfg.businessName.uppercase ? "uppercase" : undefined,
              transition: MOVE_EASE,
            }}
          >
            <FitText className="w-full">{businessName}</FitText>
          </p>
        )}

        {cfg.divider?.show ? (
          cfg.divider.variant === "flourish" ? (
            <div
              className="absolute z-10 flex items-center gap-2"
              style={{
                ...posStyle(pickTop(cfg.divider, showAmount)),
                width: cfg.divider.width,
                transition: MOVE_EASE,
              }}
            >
              <span
                className="h-px flex-1"
                style={{ background: cfg.divider.color }}
              />
              <span
                className="size-[5px] shrink-0 rotate-45"
                style={{ background: cfg.divider.color }}
              />
              <span
                className="h-px flex-1"
                style={{ background: cfg.divider.color }}
              />
            </div>
          ) : (
            <div
              className="absolute z-10"
              style={{
                ...posStyle(pickTop(cfg.divider, showAmount)),
                width: cfg.divider.width,
                height: cfg.divider.height,
                background: cfg.divider.color,
                transition: MOVE_EASE,
              }}
            />
          )
        ) : null}

        {cfg.scanHint.show ? (
          <p
            className="absolute z-10 w-full text-center"
            style={{
              ...posStyle(cfg.scanHint.top),
              fontSize: cfg.scanHint.fontSize,
              fontWeight: cfg.scanHint.fontWeight,
              color: cfg.scanHint.color,
              letterSpacing: cfg.scanHint.letterSpacing,
              textTransform: cfg.scanHint.uppercase ? "uppercase" : undefined,
            }}
          >
            {cfg.scanHint.text}
          </p>
        ) : null}

        {cfg.amount.show && showAmount ? (
          <p
            className="absolute z-10 w-[86%] text-center tabular-nums"
            style={{
              ...posStyle(pickTop(cfg.amount, showAmount), {
                transform: "translateX(-50%) translateY(0)",
              }),
              fontFamily: cfg.amountFontFamily,
              fontSize: cfg.amount.fontSize,
              fontWeight: cfg.amount.fontWeight,
              color: cfg.amount.color,
              fontStyle: cfg.amount.fontStyle,
              letterSpacing: cfg.amount.letterSpacing,
              textShadow: cfg.amount.textShadow,
              transition: MOVE_EASE,
              animation:
                "qr-amount-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <FitText className="w-full">
              {cfg.amount.prefixColor ? (
                <>
                  <span style={{ color: cfg.amount.prefixColor }}>₹</span>
                  {formatINRPlain(amountValue)}
                </>
              ) : (
                formatINR(amountValue)
              )}
            </FitText>
          </p>
        ) : null}

        <div
          className="absolute z-10 overflow-hidden"
          style={{
            ...posStyle(layout.qrTop),
            width: cfg.qr.width,
            padding: cfg.qr.padding,
            borderRadius: cfg.qr.borderRadius,
            background: cfg.qr.bg,
            boxShadow: cfg.qr.shadow,
            transition: MOVE_EASE,
          }}
        >
          <QrCodeBlock
            value={paymentUrl}
            fg={cfg.qr.fg}
            bg={cfg.qr.bg}
            style={cfg.qr.style}
          />
        </div>

        {interactive ? (
          <>
            <UpiChip
              upiId={upiId}
              onCopy={onCopyUpi}
              style={cfg.upi}
              fontFamily={cfg.upiFontFamily}
              top={layout.upiTop}
            />
            {copied ? (
              <p
                className="absolute z-10 w-full text-center"
                style={{
                  ...posStyle(layout.copiedTop),
                  fontFamily: cfg.upiFontFamily,
                  fontSize: cfg.copied.fontSize,
                  fontWeight: cfg.copied.fontWeight,
                  color: cfg.copied.color,
                  transition: MOVE_EASE,
                }}
              >
                UPI ID copied
              </p>
            ) : null}
          </>
        ) : (
          <p
            className="absolute z-10 w-[84%] text-center"
            style={{
              ...posStyle(layout.upiTop, {
                maxWidth: cfg.upi.maxWidth,
              }),
              fontFamily: cfg.upiFontFamily,
              fontSize: cfg.upi.fontSize,
              fontWeight: cfg.upi.fontWeight,
              color: cfg.upi.color,
              fontStyle: cfg.upi.fontStyle,
              letterSpacing: cfg.upi.letterSpacing,
              textTransform: cfg.upi.lowercase ? "lowercase" : undefined,
              transition: MOVE_EASE,
            }}
          >
            <FitText className="w-full" minScale={0.62}>
              {renderUpiLabel(upiId, cfg.upi)}
            </FitText>
          </p>
        )}
      </div>
    </div>
  );
}
