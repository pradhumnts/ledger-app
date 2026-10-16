"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { cn } from "@/lib/utils";

const QR_SHAPES = {
  square: {
    dots: "square",
    cornersSquare: "square",
    cornersDot: "square",
  },
  rounded: {
    dots: "rounded",
    cornersSquare: "extra-rounded",
    cornersDot: "dot",
  },
  dots: {
    dots: "dots",
    cornersSquare: "extra-rounded",
    cornersDot: "dot",
  },
};

/** Brand-colored wallet (trial); same tight crop as the monochrome mark. */
function MoneyKitMark({ className }) {
  return (
    <svg viewBox="210 200 620 620" className={className} aria-hidden>
      <path
        fill="#062D1A"
        d="M290.19 324.63C269.69 324.63 253.29 341.03 253.29 361.53V731.35C253.29 777.27 290.19 814.17 336.11 814.17H703.47C749.39 814.17 786.29 777.27 786.29 731.35V361.53C786.29 341.03 769.89 324.63 749.39 324.63H290.19Z"
      />
      <path
        fill="#062D1A"
        d="M359.89 209.83H679.69C706.75 209.83 728.89 231.97 728.89 259.03V291.83C718.23 287.73 706.75 285.27 694.45 285.27H345.13C332.83 285.27 322.17 287.73 311.51 291.83V259.03C311.51 231.97 332.83 209.83 359.89 209.83Z"
      />
      <path
        fill="#C1F07F"
        stroke="#fff"
        strokeWidth="16.4"
        strokeLinejoin="round"
        d="M336.93 298.39H701.83C729.71 298.39 751.85 320.53 751.85 348.41V392.69C737.91 385.31 722.33 381.21 705.93 381.21H332.83C316.43 381.21 300.85 385.31 286.91 392.69V348.41C286.91 320.53 309.05 298.39 336.93 298.39Z"
      />
      <path fill="#fff" d="M448.45 484.53H591.13L577.19 523.07H462.39L448.45 484.53Z" />
      <path
        fill="#fff"
        d="M476.33 536.19H573.09V551.77L523.07 564.07C516.51 565.71 514.87 571.45 519.79 577.19L573.91 637.05H541.93L476.33 591.13V536.19Z"
      />
    </svg>
  );
}

export const QrCodeBlock = forwardRef(function QrCodeBlock(
  { value, fg = "#18181b", bg = "#ffffff", style = "square", className = "" },
  ref
) {
  const containerRef = useRef(null);
  const qrRef = useRef(null);
  const shape = QR_SHAPES[style] || QR_SHAPES.square;
  const moduleBg = !bg || bg === "transparent" ? "transparent" : bg;

  useImperativeHandle(ref, () => ({
    async download(filename = "moneykit-qr") {
      if (!qrRef.current || !value) return false;
      await qrRef.current.download({
        name: filename,
        extension: "png",
      });
      return true;
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: 720,
        height: 720,
        type: "svg",
        data: value,
        margin: 0,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { color: fg, type: shape.dots },
        cornersSquareOptions: { color: fg, type: shape.cornersSquare },
        cornersDotOptions: { color: fg, type: shape.cornersDot },
        backgroundOptions: { color: moduleBg },
      });
      qrRef.current.append(containerRef.current);
    } else {
      qrRef.current.update({
        data: value,
        dotsOptions: { color: fg, type: shape.dots },
        cornersSquareOptions: { color: fg, type: shape.cornersSquare },
        cornersDotOptions: { color: fg, type: shape.cornersDot },
        backgroundOptions: { color: moduleBg },
      });
    }
  }, [value, fg, moduleBg, shape.cornersDot, shape.cornersSquare, shape.dots]);

  return (
    <div
      className={cn("ph-no-capture relative", className)}
      aria-hidden={!value}
    >
      <div ref={containerRef} className="[&_svg]:h-auto [&_svg]:w-full" />
      {value ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            data-poster-qr-logo="true"
            className="flex size-[22%] items-center justify-center p-[10%]"
          >
            <MoneyKitMark className="size-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
});
