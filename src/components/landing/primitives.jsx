import Image from "next/image";
import { cn } from "@/lib/utils";

/** Install link through `/get/{tag}`, which counts the tap and sends it to the right store. */
export function installHref(tag) {
  return `/get/${tag}`;
}

export function GooglePlayIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="#34A853" d="M3.6 1.8 13.4 12 3.6 22.2c-.4-.2-.6-.7-.6-1.2V3c0-.5.2-1 .6-1.2Z" />
      <path fill="#FBBC04" d="m16.8 8.6-3.4 3.4 3.4 3.4 3.8-2.2c.9-.5.9-1.9 0-2.4l-3.8-2.2Z" />
      <path fill="#4285F4" d="M3.6 1.8c.3-.2.8-.2 1.2 0l12 6.8-3.4 3.4L3.6 1.8Z" />
      <path fill="#EA4335" d="M13.4 12 3.6 22.2c.3.2.8.2 1.2 0l12-6.8-3.4-3.4Z" />
    </svg>
  );
}

/** "Get it on Google Play" button; `tag` keeps installs attributable per placement. */
export function PlayButton({ tag, tone = "light", className, label = "Get it on Google Play" }) {
  return (
    <a
      href={installHref(tag)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex h-14 items-center gap-3 rounded-2xl px-5 font-semibold transition-[translate,background-color,box-shadow] duration-200 hover:-translate-y-0.5 active:translate-y-0",
        tone === "light"
          ? "bg-white text-zinc-950 shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.24)]"
          : "bg-zinc-950 text-white shadow-[0_10px_30px_rgba(11,48,31,0.25)] hover:bg-black",
        className,
      )}
    >
      <GooglePlayIcon className="size-6 shrink-0" />
      <span className="flex flex-col items-start leading-none">
        <span
          className={cn(
            "text-[10px] font-medium tracking-wide uppercase",
            tone === "light" ? "text-zinc-500" : "text-white/60",
          )}
        >
          Free on Android
        </span>
        <span className="mt-1 text-[15px]">{label}</span>
      </span>
    </a>
  );
}

/** A phone bezel around an app screenshot (screens are 1206×2622). */
export function PhoneFrame({ src, alt, className, style, priority = false, sizes = "280px" }) {
  return (
    <div
      style={style}
      className={cn(
        "relative aspect-[1206/2622] rounded-[2.6rem] bg-zinc-950 p-[0.55rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-[2.1rem] bg-white">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
      </div>
    </div>
  );
}

export function Eyebrow({ children, tone = "dark", className }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tone === "dark" ? "bg-forest/[0.07] text-forest" : "bg-lime/15 text-lime",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone === "dark" ? "bg-mint" : "bg-lime")} />
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, accent, body, tone = "dark", align = "center", className }) {
  return (
    <div
      data-reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-xl items-start",
        className,
      )}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl",
          tone === "dark" ? "text-zinc-950" : "text-white",
        )}
      >
        {title}{" "}
        {accent ? (
          <span
            className={cn(
              "inline-block font-display font-normal tracking-normal italic",
              tone === "dark" ? "text-mint" : "text-lime",
            )}
          >
            {accent}
          </span>
        ) : null}
      </h2>
      {body ? (
        <p
          className={cn(
            "text-base leading-relaxed text-pretty sm:text-lg",
            tone === "dark" ? "text-zinc-600" : "text-white/70",
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
