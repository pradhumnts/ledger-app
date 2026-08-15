"use client";

import { useEffect } from "react";

/** Paints the browser/OS chrome (iOS status bar included) while a screen is open. */
export function useThemeColor(color) {
  useEffect(() => {
    if (!color) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    if (!metas.length) return;

    const previous = [...metas].map((meta) => meta.getAttribute("content"));
    metas.forEach((meta) => meta.setAttribute("content", color));

    return () => {
      metas.forEach((meta, index) => {
        if (previous[index] != null) meta.setAttribute("content", previous[index]);
      });
    };
  }, [color]);
}
