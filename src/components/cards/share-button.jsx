"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/** Opens the phone's share sheet, or copies the link where there isn't one. */
export function ShareButton({ url, title, className, label = "Share card" }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <button type="button" onClick={share} aria-label={copied ? "Link copied" : label} className={className}>
      {copied ? <Check className="size-[18px]" /> : <Share2 className="size-[18px]" />}
    </button>
  );
}
