"use client";

import { useEffect } from "react";
import { Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCodeBlock } from "@/components/qr-code-block";
import { formatINR, formatINRPlain, initials } from "@/lib/format";
import { posStyle, pickTop, preloadQrFontHrefs, resolveQrThemeStyle } from "@/lib/qr-theme-styles";
import { cn } from "@/lib/utils";

function useThemeFonts(hrefs = []) {
  const hrefKey = hrefs.filter(Boolean).join("|");
  useEffect(() => {
    preloadQrFontHrefs(hrefKey ? hrefKey.split("|") : []);
  }, [hrefKey]);
}

const MOVE_EASE = "top 380ms cubic-bezier(0.22, 1, 0.36, 1)";

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
    const words = name.trim().split(/\s+/).filter(Boolean);
    return (
      <div className="absolute z-10 w-[92%] text-center" style={baseStyle}>
        {words.map((word, index) => {
          const wordCfg = cfg.wordStyles?.[index] || {};
          const text = (wordCfg.uppercase ?? cfg.uppercase) ? word.toUpperCase() : word;

          if (wordCfg.letterColors?.length) {
            return (
              <span key={`${word}-${index}`} className="block">
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
              </span>
            );
          }

          return (
            <span
              key={`${word}-${index}`}
              className="block"
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
            </span>
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
      <span className="block">{line1Text}</span>
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
              className="h-px w-10"
              style={{ background: cfg.line2LineColor || cfg.line2Color }}
            />
            {line2Display}
            <span
              className="h-px w-10"
              style={{ background: cfg.line2LineColor || cfg.line2Color }}
            />
          </span>
        ) : (
          <span
            className="block"
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
          </span>
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
    "absolute z-10 inline-flex max-w-full items-center justify-center gap-1.5 truncate";
  const copyIcon = cfg.hideCopyIcon ? null : (
    <Copy className="size-3.5 shrink-0 opacity-50" />
  );
  const resolvedTop = top ?? cfg.top;

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
        <span className="truncate">{renderUpiLabel(upiId, cfg)}</span>
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
        <span className="truncate">{renderUpiLabel(upiId, cfg)}</span>
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
      <span className="truncate">{renderUpiLabel(upiId, cfg)}</span>
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

  return (
    <div
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
      <div
        className={cn(
          "relative w-full",
          fullScreen || preview ? "h-full" : "aspect-[853/1844]"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
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

        {cfg.businessName.stacked ? (
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
            {businessName}
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
            className="absolute z-10 w-full text-center tabular-nums"
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
            {cfg.amount.prefixColor ? (
              <>
                <span style={{ color: cfg.amount.prefixColor }}>₹</span>
                {formatINRPlain(amountValue)}
              </>
            ) : (
              formatINR(amountValue)
            )}
          </p>
        ) : null}

        <div
          className="absolute z-10 overflow-hidden"
          style={{
            ...posStyle(pickTop(cfg.qr, showAmount)),
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
              top={pickTop(cfg.upi, showAmount)}
            />
            {copied ? (
              <p
                className="absolute z-10 w-full text-center"
                style={{
                  ...posStyle(pickTop(cfg.copied, showAmount)),
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
            className="absolute z-10 w-[84%] truncate text-center"
            style={{
              ...posStyle(pickTop(cfg.upi, showAmount), {
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
            {renderUpiLabel(upiId, cfg.upi)}
          </p>
        )}
      </div>
    </div>
  );
}
