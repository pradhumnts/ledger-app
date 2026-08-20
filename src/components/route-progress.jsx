"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

const RouteProgressContext = createContext({ start: () => {} });
const SHOW_AFTER_MS = 140;

export function useRouteProgress() {
  return useContext(RouteProgressContext);
}

function isInternalNav(anchor) {
  if (!anchor || (anchor.target && anchor.target !== "_self")) return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search
  );
}

export function RouteProgress({ children }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [show, setShow] = useState(false);
  const start = useCallback(() => setPending(true), []);
  const value = useMemo(() => ({ start }), [start]);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(false), 4000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  useEffect(() => {
    if (!pending) {
      setShow(false);
      return;
    }
    const timer = window.setTimeout(() => setShow(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [pending]);

  useEffect(() => {
    function onClick(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = event.target.closest?.("a[href]");
      if (!isInternalNav(anchor)) return;
      setPending(true);
    }

    function onPop() {
      setPending(true);
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return (
    <RouteProgressContext.Provider value={value}>
      {show ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-[max(0.7rem,env(safe-area-inset-top))] z-[90] flex justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex size-9 items-center justify-center rounded-full border border-black/5 bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#121714]/95">
            <Loader2 className="size-4 animate-spin text-[var(--forest)] dark:text-[var(--lime)]" />
          </div>
        </div>
      ) : null}
      {children}
    </RouteProgressContext.Provider>
  );
}
