"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "next/navigation";
import { RevealOnScroll } from "@/components/sites/reveal";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { buildStarterSite, withSiteDefaults } from "@/lib/sites/document";
import { getPack } from "@/lib/sites/packs";
import {
  PREVIEW_NAV,
  demoServicePages,
  isServicePageId,
  servicePages,
} from "@/lib/sites/service-pages";

function postToApp(message) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

/** Match the `leave` and `enter` page animations in sites.css. */
const LEAVE_MS = 220;
const ENTER_MS = 800;

/** Retries briefly: the app may ask to scroll before the pushed draft has rendered. */
function scrollToTarget(selector, attempt = 0) {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView({ behavior: attempt ? "auto" : "smooth", block: "start" });
  } else if (attempt < 20) {
    setTimeout(() => scrollToTarget(selector, attempt + 1), 100);
  }
}

/** Scrolls past the stylesheet's smooth scrolling. Older WebViews reject "instant". */
function jump(scroll) {
  try {
    scroll("instant");
  } catch {
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    scroll("auto");
    root.style.scrollBehavior = "";
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
  if (params.get("pages") !== "0") {
    // Sample content comes from the pack the site actually shows (the template's, for "general").
    Object.assign(doc.sections, demoServicePages(getPack(withSiteDefaults(doc).packId)));
  }
  return doc;
}

/**
 * In-app live preview. The app loads `/site-preview?embed=1` in a WebView and
 * pushes the draft with `window.__mkSite.setDoc(doc)` (or a postMessage of
 * `{ type: "doc", doc }`). Without `embed`, `?template=&pack=&palette=` shows a
 * demo with sample service pages (`&pages=0` hides them, `&page=page1` opens one).
 *
 * Service pages switch in place: `#page=slug` links open one, `#home…` links go
 * back, and `__mkSite.showPage(id)` / a `scroll` to a page id opens it from the app.
 */
export function PreviewClient() {
  const params = useSearchParams();
  const embedded = params.get("embed") === "1";
  const [doc, setDoc] = useState(() => (embedded ? null : demoSite(params)));
  const [page, setPage] = useState(() => (embedded ? null : params.get("page")));
  const [phase, setPhase] = useState(null);
  const docRef = useRef(doc);
  const pageRef = useRef(page);

  useEffect(() => {
    docRef.current = doc;
    pageRef.current = page;
  });

  useEffect(() => {
    const pageIdForSlug = (slug) =>
      servicePages(withSiteDefaults(docRef.current)).find((item) => item.slug === slug)?.id ||
      null;

    // Fades the current view out, swaps it at the top while hidden, then brings
    // the new one in, so it reads as a page load rather than a scroll.
    let switchTimer = null;
    const switchTo = (id, selector = null) => {
      clearTimeout(switchTimer);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setPhase("leave");
      switchTimer = setTimeout(
        () => {
          jump((behavior) => window.scrollTo({ top: 0, behavior }));
          flushSync(() => {
            setPage(id);
            setPhase("enter");
          });
          const target = selector && document.querySelector(selector);
          if (target) jump((behavior) => target.scrollIntoView({ block: "start", behavior }));
          switchTimer = setTimeout(() => setPhase(null), ENTER_MS);
        },
        reduced ? 0 : LEAVE_MS,
      );
    };

    const showPage = (id) => {
      if (id === pageRef.current) window.scrollTo({ top: 0, behavior: "smooth" });
      else switchTo(id);
    };

    const showHome = (hash) => {
      const target = hash && hash !== "#top" ? hash : null;
      if (pageRef.current) switchTo(null, target);
      else if (target) scrollToTarget(target);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handle = (message) => {
      if (!message || typeof message !== "object") return;
      if (message.type === "doc" && message.doc && typeof message.doc === "object") {
        setDoc(message.doc);
      } else if (message.type === "scroll" && typeof message.section === "string") {
        if (isServicePageId(message.section)) {
          showPage(message.section);
        } else if (pageRef.current) {
          switchTo(null, `[data-section="${message.section}"]`);
        } else {
          scrollToTarget(`[data-section="${message.section}"]`);
        }
      } else if (message.type === "page") {
        if (typeof message.page === "string" && isServicePageId(message.page)) {
          showPage(message.page);
        } else {
          showHome("");
        }
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
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.startsWith(PREVIEW_NAV.pagePrefix)) {
        event.preventDefault();
        const id = pageIdForSlug(decodeURIComponent(href.slice(PREVIEW_NAV.pagePrefix.length)));
        if (id) showPage(id);
        return;
      }
      if (href.startsWith(PREVIEW_NAV.home)) {
        event.preventDefault();
        showHome(href.slice(PREVIEW_NAV.home.length));
        return;
      }
      if (href.startsWith("#")) return;
      event.preventDefault();
      postToApp({ type: "link", href: link.href });
    };

    window.__mkSite = {
      setDoc: (next) => handle({ type: "doc", doc: next }),
      scrollTo: (section) => handle({ type: "scroll", section }),
      showPage: (id) => handle({ type: "page", page: id }),
    };
    // The app can hand the draft over before the page loads, saving a round trip.
    if (embedded && window.__mkInitialDoc) handle({ type: "doc", doc: window.__mkInitialDoc });
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    postToApp({ type: "ready" });

    return () => {
      clearTimeout(switchTimer);
      delete window.__mkSite;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, [embedded]);

  if (!doc) return <div className="min-h-dvh bg-[#f6f1e7]" />;
  return (
    <>
      <div className="s-page" data-phase={phase || undefined}>
        <SiteRenderer doc={doc} withPages page={page} />
      </div>
      {/* Only the static demo: the app swaps sections in later, which the one-time observer would miss.
          Keyed by page so switching pages scans the new view. */}
      {embedded ? null : <RevealOnScroll key={page || "home"} />}
    </>
  );
}
