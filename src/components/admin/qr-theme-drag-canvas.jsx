"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QrCodeBlock } from "@/components/qr-code-block";
import {
  POSTER_HEIGHT,
  POSTER_WIDTH,
  catalogFontFaces,
  catalogFontHrefs,
  fontFaceCss,
  resolveCatalogStyle,
  setLayerTop,
  setQrWidth,
} from "@/lib/qr-theme-catalog";
import { layoutQrPoster, pickTop, preloadQrFontHrefs } from "@/lib/qr-theme-styles";
import { cn } from "@/lib/utils";

const LAYERS = [
  { id: "businessName", label: "Name" },
  { id: "amount", label: "Amount" },
  { id: "qr", label: "QR" },
  { id: "upi", label: "UPI" },
];

function percentFromEvent(clientY, boardRect) {
  const y = ((clientY - boardRect.top) / boardRect.height) * 100;
  return Math.min(92, Math.max(2, y));
}

/**
 * Live poster with draggable name / amount / QR / UPI layers.
 * Writes `top` or `topWithAmount` depending on `showAmount`.
 */
export function QrThemeDragCanvas({
  posterUrl,
  style,
  customFonts = [],
  showAmount,
  sampleName = "Shadow Beauty",
  sampleUpi = "shop@upi",
  sampleAmount = 500,
  selectedLayer,
  onSelectLayer,
  onChangeStyle,
}) {
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const [scale, setScale] = useState(1);
  const cfg = resolveCatalogStyle(style, customFonts);
  const layout = layoutQrPoster(cfg, showAmount);

  useEffect(() => {
    preloadQrFontHrefs(catalogFontHrefs(cfg));
    const faces = catalogFontFaces(cfg);
    if (!faces.length || typeof document === "undefined") return;
    const id = "qr-admin-font-faces";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = fontFaceCss(faces);
  }, [cfg]);

  useEffect(() => {
    const host = boardRef.current?.parentElement;
    if (!host) return;
    const measure = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      setScale(Math.min(width / POSTER_WIDTH, height / POSTER_HEIGHT));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const startDrag = useCallback(
    (layer, event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelectLayer?.(layer);
      const board = boardRef.current;
      if (!board) return;
      dragRef.current = { layer, pointerId: event.pointerId };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [onSelectLayer]
  );

  const onMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const top = percentFromEvent(event.clientY, rect);
      onChangeStyle?.((prev) => setLayerTop(prev, drag.layer, top, showAmount));
    },
    [onChangeStyle, showAmount]
  );

  const endDrag = useCallback((event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }, []);

  const onQrResize = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const board = boardRef.current;
      if (!board) return;
      const pointerId = event.pointerId;
      const move = (ev) => {
        if (ev.pointerId !== pointerId) return;
        const rect = board.getBoundingClientRect();
        const x = Math.abs(ev.clientX - (rect.left + rect.width / 2));
        const widthPct = (x * 2 * 100) / rect.width;
        onChangeStyle?.((prev) => setQrWidth(prev, widthPct));
      };
      const up = (ev) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [onChangeStyle]
  );

  const nameTop = pickTop(cfg.businessName, showAmount);
  const amountTop = pickTop(cfg.amount, showAmount);
  const upiTop = layout.upiTop;
  const qrTop = layout.qrTop;
  const qrWidth = cfg.qr?.width || "48%";

  return (
    <div className="relative flex h-full min-h-[28rem] w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-900/90">
      <div
        style={{
          width: POSTER_WIDTH * scale,
          height: POSTER_HEIGHT * scale,
        }}
        className="relative shadow-2xl"
      >
        <div
          ref={boardRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            transform: `scale(${scale})`,
          }}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-sm text-zinc-400">
              Upload a poster background
            </div>
          )}

          <Layer
            active={selectedLayer === "businessName"}
            label="Name"
            top={nameTop}
            onPointerDown={(e) => startDrag("businessName", e)}
          >
            <p
              className="max-w-[86%] text-center leading-tight"
              style={{
                fontFamily: cfg.businessNameFontFamily,
                fontSize: cfg.businessName?.fontSize,
                fontWeight: cfg.businessName?.fontWeight,
                color: cfg.businessName?.color,
                letterSpacing: cfg.businessName?.letterSpacing,
                textTransform: cfg.businessName?.uppercase ? "uppercase" : undefined,
                lineHeight: cfg.businessName?.lineHeight || 1.15,
              }}
            >
              {sampleName}
            </p>
          </Layer>

          {showAmount && cfg.amount?.show !== false ? (
            <Layer
              active={selectedLayer === "amount"}
              label="Amount"
              top={amountTop}
              onPointerDown={(e) => startDrag("amount", e)}
            >
              <p
                className="tabular-nums"
                style={{
                  fontFamily: cfg.amountFontFamily,
                  fontSize: cfg.amount?.fontSize,
                  fontWeight: cfg.amount?.fontWeight,
                  color: cfg.amount?.color,
                }}
              >
                {cfg.amount?.prefix || "₹"}
                {sampleAmount}
              </p>
            </Layer>
          ) : null}

          <Layer
            active={selectedLayer === "qr"}
            label="QR"
            top={qrTop}
            onPointerDown={(e) => startDrag("qr", e)}
          >
            <div
              className="relative bg-white p-2"
              style={{
                width: qrWidth,
                borderRadius: cfg.qr?.borderRadius || 16,
                boxShadow: cfg.qr?.shadow || "none",
                padding: cfg.qr?.padding ?? 10,
              }}
            >
              <div className="aspect-square w-full">
                <QrCodeBlock
                  value={`upi://pay?pa=${encodeURIComponent(sampleUpi)}&am=${sampleAmount}`}
                  fg={cfg.qr?.fg || "#111"}
                  bg={cfg.qr?.bg || "#fff"}
                  style={cfg.qr?.style || "square"}
                  className="h-full w-full"
                />
              </div>
              <button
                type="button"
                aria-label="Resize QR"
                onPointerDown={onQrResize}
                className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-[#c8e86a] shadow"
              />
            </div>
          </Layer>

          <Layer
            active={selectedLayer === "upi"}
            label="UPI"
            top={upiTop}
            onPointerDown={(e) => startDrag("upi", e)}
          >
            <p
              className={cn(
                "max-w-[86%] truncate px-3 py-1 text-center",
                cfg.upi?.variant === "pill" && "rounded-full"
              )}
              style={{
                fontFamily: cfg.upiFontFamily,
                fontSize: cfg.upi?.fontSize,
                fontWeight: cfg.upi?.fontWeight,
                color: cfg.upi?.color,
                background: cfg.upi?.variant === "pill" ? cfg.upi?.bg : undefined,
                textTransform: cfg.upi?.lowercase ? "lowercase" : undefined,
              }}
            >
              {sampleUpi}
            </p>
          </Layer>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => onSelectLayer?.(layer.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              selectedLayer === layer.id
                ? "bg-[#c8e86a] text-[#0b301f]"
                : "bg-black/50 text-white"
            )}
          >
            {layer.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Layer({ active, label, top, onPointerDown, children }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onPointerDown}
      className={cn(
        "absolute left-1/2 z-10 flex -translate-x-1/2 cursor-grab flex-col items-center active:cursor-grabbing",
        active && "z-20"
      )}
      style={{ top }}
    >
      <span
        className={cn(
          "mb-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          active ? "bg-[#c8e86a] text-[#0b301f]" : "bg-black/55 text-white/90"
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "rounded-lg outline-offset-2",
          active ? "outline outline-2 outline-[#c8e86a]" : "outline outline-1 outline-white/30"
        )}
      >
        {children}
      </div>
    </div>
  );
}
