"use client";

import { useEffect, useRef } from "react";

/**
 * A swipeable list with a progress bar under it. Whether it is a row at all is
 * up to `className`; the bar hides itself whenever the list can't scroll.
 */
export function GalleryRail({ className, barClassName = "", children, ...props }) {
  const railRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    const bar = barRef.current;
    if (!rail || !bar) return undefined;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = rail;
      const max = scrollWidth - clientWidth;
      bar.hidden = max <= 1;
      bar.style.setProperty("--rail-size", String(Math.min(1, clientWidth / scrollWidth)));
      bar.style.setProperty("--rail-progress", String(max > 0 ? scrollLeft / max : 0));
    };

    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <ul ref={railRef} className={className} {...props}>
        {children}
      </ul>
      <div ref={barRef} aria-hidden className={`sa-rail-bar ${barClassName}`}>
        <span />
      </div>
    </>
  );
}
