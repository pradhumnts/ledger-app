"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RevealOnScroll } from "@/components/sites/reveal";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { buildStarterSite } from "@/lib/sites/document";
import { getPack } from "@/lib/sites/packs";

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

function demoSite(params) {
  const packId = params.get("pack") || "photographer";
  const demo = getPack(packId).demo || {};
  const doc = buildStarterSite({
    business: {
      name: params.get("name") || demo.name || "Your Studio",
      phone: demo.phone || "9876543210",
      address: params.get("address") || demo.address || "Connaught Place, New Delhi",
      business_type: packId,
    },
    templateId: params.get("template") || undefined,
    paletteId: params.get("palette") || undefined,
  });
  if (demo.socials && doc.sections.socials) {
    doc.sections.socials = { ...doc.sections.socials, ...demo.socials };
  }
  return doc;
}

/**
 * In-app live preview. The app loads `/site-preview?embed=1` in a WebView and
 * pushes the draft with `window.__mkSite.setDoc(doc)` (or a postMessage of
 * `{ type: "doc", doc }`). Without `embed`, `?template=&pack=&palette=` shows a demo.
 */
export function PreviewClient() {
  const params = useSearchParams();
  const embedded = params.get("embed") === "1";
  const [doc, setDoc] = useState(() => (embedded ? null : demoSite(params)));

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
    // The app can hand the draft over before the page loads, saving a round trip.
    if (embedded && window.__mkInitialDoc) handle({ type: "doc", doc: window.__mkInitialDoc });
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
  }, [embedded]);

  if (!doc) return <div className="min-h-dvh bg-[#f6f1e7]" />;
  return (
    <>
      <SiteRenderer doc={doc} />
      {/* Only the static demo: the app swaps sections in later, which the one-time observer would miss. */}
      {embedded ? null : <RevealOnScroll />}
    </>
  );
}
