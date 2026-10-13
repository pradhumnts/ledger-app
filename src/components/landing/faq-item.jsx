"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqItem({ question, answer, style }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    // RevealOnScroll adds `is-visible` imperatively, so this element's className must never change.
    <div data-reveal style={style}>
      <div
        className={cn(
          "rounded-3xl border border-black/[0.06] bg-white px-6 transition-shadow duration-300",
          open
            ? "shadow-[0_20px_50px_-25px_rgba(11,48,31,0.35)]"
            : "shadow-[0_10px_40px_-25px_rgba(11,48,31,0.25)]",
        )}
      >
        <h3>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-answer`}
            onClick={() => setOpen((value) => !value)}
            className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-zinc-950"
          >
            {question}
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition-[rotate,background-color,color] duration-300 ease-out",
                open ? "rotate-45 bg-forest text-lime" : "bg-paper text-forest",
              )}
            >
              <Plus className="size-4" strokeWidth={2.4} />
            </span>
          </button>
        </h3>
        <div
          id={`${id}-answer`}
          role="region"
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <p
              className={cn(
                "pb-6 text-[15px] leading-relaxed text-zinc-600 transition-[opacity,translate] duration-300 motion-reduce:transition-none",
                open ? "translate-y-0 opacity-100 delay-75" : "-translate-y-1 opacity-0",
              )}
            >
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
