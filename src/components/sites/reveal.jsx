"use client";

import { useEffect } from "react";

/**
 * Fades `[data-reveal]` blocks in as they scroll into view. Blocks already on
 * screen are marked visible before motion is switched on, so nothing flashes.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const element of document.querySelectorAll("[data-reveal]")) {
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        element.classList.add("is-visible");
      } else {
        observer.observe(element);
      }
    }
    root.classList.add("motion-ok");

    return () => {
      observer.disconnect();
      root.classList.remove("motion-ok");
    };
  }, []);

  return null;
}
