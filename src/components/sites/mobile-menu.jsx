"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const DEFAULT_TRIGGER =
  "grid size-11 shrink-0 place-items-center rounded-full border border-s-line text-s-brand transition hover:bg-s-brand hover:text-s-bg md:hidden";

/** Keep in sync with the `.s-menu[data-state="closing"]` animation in sites.css. */
const CLOSE_MS = 420;

export function MobileMenu({
  name,
  links,
  cta,
  ctaIcon = null,
  triggerClassName = DEFAULT_TRIGGER,
}) {
  const [state, setState] = useState("closed");
  const [origin, setOrigin] = useState("");
  const closeTimer = useRef(0);

  const close = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setState("closing");
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setState("closed"), reduced ? 0 : CLOSE_MS);
  }, []);

  useEffect(() => {
    if (state !== "open") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [state, close]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMenu = (event) => {
    clearTimeout(closeTimer.current);
    const box = event.currentTarget.getBoundingClientRect();
    setOrigin(`${box.left + box.width / 2}px ${box.top + box.height / 2}px`);
    setState("open");
  };

  const external = cta?.href?.startsWith("http");

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={state === "open"}
        onClick={openMenu}
        className={triggerClassName}
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </button>

      {state !== "closed" ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-state={state}
          style={origin ? { "--menu-origin": origin } : undefined}
          className="s-menu fixed inset-0 z-50 flex flex-col bg-s-brand text-s-paper md:hidden"
        >
          <div className="s-menu-top s-wrap flex h-[4.75rem] items-center justify-between gap-4">
            <span className="s-serif truncate text-[1.6rem]">{name}</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="s-menu-close grid size-11 shrink-0 place-items-center rounded-full border border-s-paper/20 transition hover:bg-s-paper/10"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="s-wrap flex flex-1 flex-col justify-center">
            {links.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                style={{ "--i": index }}
                className="s-menu-item group flex items-baseline gap-5 border-b border-s-paper/10 py-5"
              >
                <span className="s-eyebrow text-s-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="s-serif text-[2.9rem] leading-none transition group-hover:translate-x-1">
                  {link.label}
                </span>
              </a>
            ))}
          </nav>

          {cta?.href ? (
            <div
              style={{ "--i": links.length }}
              className="s-menu-item s-wrap pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
            >
              <a
                href={cta.href}
                onClick={close}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="s-btn s-btn-primary w-full"
              >
                {ctaIcon}
                {cta.label}
                <ArrowRight className="s-arrow size-4" />
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
