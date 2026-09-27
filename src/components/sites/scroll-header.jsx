"use client";

import { useEffect, useState } from "react";

/** A header that sits over a hero: gets `data-scrolled` once the page moves past `offset` px. */
export function ScrollHeader({ offset = 24, className, style, children }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [offset]);

  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      className={className}
      style={style}
    >
      {children}
    </header>
  );
}
