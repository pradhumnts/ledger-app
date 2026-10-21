"use client";

import { flushSync } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";

const MOBILE = "(max-width: 56.24rem)";

/**
 * Service description. On a phone, two lines show and "...Read More" opens the
 * rest with a short height animation. Wider screens show the whole note.
 */
export function ExpandableNote({ children, className = "" }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text || open) return undefined;

    const measure = () => {
      if (!window.matchMedia(MOBILE).matches) {
        setOverflows(false);
        return;
      }
      const width = text.clientWidth;
      if (!width) return;
      const probe = text.cloneNode(true);
      probe.style.cssText = [
        "position:absolute",
        "visibility:hidden",
        "pointer-events:none",
        "height:auto",
        "max-height:none",
        "overflow:visible",
        "display:block",
        "-webkit-line-clamp:unset",
        "-webkit-box-orient:unset",
        `width:${width}px`,
      ].join(";");
      text.parentElement.appendChild(probe);
      const full = probe.offsetHeight;
      probe.remove();
      setOverflows(full > text.offsetHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  function expand(event) {
    event.preventDefault();
    event.stopPropagation();
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) {
      setOpen(true);
      return;
    }
    const start = box.getBoundingClientRect().height;
    box.style.height = `${start}px`;
    box.style.overflow = "hidden";
    flushSync(() => setOpen(true));
    const end = text.scrollHeight;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      box.style.height = "";
      box.style.overflow = "";
      return;
    }
    box.getBoundingClientRect();
    box.style.transition = "height 480ms cubic-bezier(0.22, 1, 0.36, 1)";
    box.style.height = `${end}px`;
    const done = (ev) => {
      if (ev.target !== box || ev.propertyName !== "height") return;
      box.style.height = "";
      box.style.overflow = "";
      box.style.transition = "";
      box.removeEventListener("transitionend", done);
    };
    box.addEventListener("transitionend", done);
  }

  return (
    <div className="relative mt-2">
      <div ref={boxRef}>
        <p
          ref={textRef}
          className={`${className} ${open ? "" : "line-clamp-2 md:line-clamp-none"}`}
        >
          {children}
        </p>
      </div>
      {overflows && !open ? (
        <button
          type="button"
          onClick={expand}
          className="absolute right-0 bottom-0 bg-linear-to-r from-transparent to-s-paper to-[42%] pl-10 text-[0.93rem] leading-relaxed font-medium whitespace-nowrap text-s-accent md:hidden"
        >
          ...Read More
        </button>
      ) : null}
    </div>
  );
}
