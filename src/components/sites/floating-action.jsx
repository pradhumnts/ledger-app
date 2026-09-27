"use client";

import { useEffect, useState } from "react";

/**
 * A floating link that gets `data-visible` only while none of the elements in
 * `hideOver` (space-separated ids, at least one must exist) are mid-screen.
 */
export function FloatingAction({ href, label, hideOver = "", className, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = hideOver
      .split(/\s+/)
      .map((id) => id && document.getElementById(id))
      .filter(Boolean);
    if (!targets.length || !("IntersectionObserver" in window)) return undefined;

    const onScreen = new Set();
    // Only the middle band of the screen counts, so a sliver at the edge doesn't hide it.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0);
      },
      { rootMargin: "-30% 0px -30% 0px" },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [hideOver]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      data-visible={visible ? "" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
