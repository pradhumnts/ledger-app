"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { buildStarterSite } from "@/lib/sites/document";

function postToApp(message) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

/** Retries briefly: the app may ask to scroll before the pushed draft has rendered. */
function scrollToSection(section, attempt = 0) {
  const target = document.querySelector(`[data-section="${section}"]`);
  if (target) {
    target.scrollIntoView({ behavior: attempt ? "auto" : "smooth", block: "start" });
  } else if (attempt < 20) {
    setTimeout(() => scrollToSection(section, attempt + 1), 100);
  }
}

/**
 * In-app live preview. The app loads `/site-preview?embed=1` in a WebView and
 * pushes the draft with `window.__mkSite.setDoc(doc)` (or a postMessage of
 * `{ type: "doc", doc }`). Without `embed`, `?pack=&palette=` shows a demo.
 */
export function PreviewClient() {
  const params = useSearchParams();
  const embedded = params.get("embed") === "1";
  const [doc, setDoc] = useState(() =>
    embedded
      ? null
      : buildStarterSite({
          business: {
            name: params.get("name") || "Your Studio",
            phone: "9876543210",
            address: "Connaught Place, New Delhi",
            business_type: params.get("pack") || "photographer",
          },
          paletteId: params.get("palette") || undefined,
        })
  );

  useEffect(() => {
    const handle = (message) => {
      if (!message || typeof message !== "object") return;
      if (message.type === "doc" && message.doc && typeof message.doc === "object") {
        setDoc(message.doc);
      } else if (message.type === "scroll" && typeof message.section === "string") {
        scrollToSection(message.section);
      }
    };
    const onMessage = (event) => {
      try {
        handle(typeof event.data === "string" ? JSON.parse(event.data) : event.data);
      } catch {
        // Not ours.
      }
    };
    const onClick = (event) => {
      const link = event.target.closest?.("a[href]");
      const href = link?.getAttribute("href") || "";
      if (!link || href.startsWith("#")) return;
      event.preventDefault();
      postToApp({ type: "link", href: link.href });
    };

    window.__mkSite = {
      setDoc: (next) => handle({ type: "doc", doc: next }),
      scrollTo: (section) => handle({ type: "scroll", section }),
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    postToApp({ type: "ready" });

    return () => {
      delete window.__mkSite;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  if (!doc) return <div className="min-h-dvh bg-[#0f0e0d]" />;
  return <SiteRenderer doc={doc} />;
}
