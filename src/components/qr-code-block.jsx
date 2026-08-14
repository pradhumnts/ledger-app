"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

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
    cornersSquare: "dot",
    cornersDot: "dot",
  },
};

export function QrCodeBlock({
  value,
  fg = "#18181b",
  bg = "#ffffff",
  style = "square",
  className = "",
}) {
  const ref = useRef(null);
  const qrRef = useRef(null);
  const shape = QR_SHAPES[style] || QR_SHAPES.square;

  useEffect(() => {
    if (!ref.current) return;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "svg",
        data: value,
        margin: 0,
        qrOptions: { errorCorrectionLevel: "M" },
        dotsOptions: { color: fg, type: shape.dots },
        cornersSquareOptions: { color: fg, type: shape.cornersSquare },
        cornersDotOptions: { color: fg, type: shape.cornersDot },
        backgroundOptions: { color: bg },
      });
      qrRef.current.append(ref.current);
    } else {
      qrRef.current.update({
        data: value,
        dotsOptions: { color: fg, type: shape.dots },
        cornersSquareOptions: { color: fg, type: shape.cornersSquare },
        cornersDotOptions: { color: fg, type: shape.cornersDot },
        backgroundOptions: { color: bg },
      });
    }
  }, [value, fg, bg, shape.cornersDot, shape.cornersSquare, shape.dots]);

  return (
    <div
      ref={ref}
      className={`[&_svg]:h-auto [&_svg]:w-full ${className}`}
      aria-hidden={!value}
    />
  );
}
