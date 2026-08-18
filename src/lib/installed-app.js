import { THEME_COLOR } from "@/lib/branding";

export const INSTALLED_APP_ATTR = "data-installed-app";
export const SPLASH_CHROME_ATTR = "data-splash";

/** Runs before React so the installed app never paints the marketing landing. */
export const INSTALLED_APP_BOOT_SCRIPT = `(function(){try{if(new URLSearchParams(location.search).get("landing")==="1")return;var app=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.matchMedia("(display-mode: minimal-ui)").matches||window.navigator.standalone===true||String(document.referrer||"").startsWith("android-app://");if(!app)return;var root=document.documentElement;root.setAttribute("${INSTALLED_APP_ATTR}","1");root.setAttribute("${SPLASH_CHROME_ATTR}","1");document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){if(!m.getAttribute("data-app-color"))m.setAttribute("data-app-color",m.getAttribute("content")||"");m.setAttribute("content","${THEME_COLOR}")})}catch(e){}})();`;

export function isInstalledApp() {
  if (typeof window === "undefined") return false;
  if (document.documentElement.getAttribute(INSTALLED_APP_ATTR) === "1") {
    return true;
  }
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return true;
  if (window.navigator.standalone === true) return true;
  if (String(document.referrer || "").startsWith("android-app://")) return true;
  return false;
}

export function markInstalledApp() {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(INSTALLED_APP_ATTR, "1");
}

export function setSplashChrome(active) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const metas = document.querySelectorAll('meta[name="theme-color"]');

  if (active) {
    root.setAttribute(SPLASH_CHROME_ATTR, "1");
    metas.forEach((meta) => {
      if (!meta.getAttribute("data-app-color")) {
        meta.setAttribute("data-app-color", meta.getAttribute("content") || "");
      }
      meta.setAttribute("content", THEME_COLOR);
    });
    return;
  }

  root.removeAttribute(SPLASH_CHROME_ATTR);
  metas.forEach((meta) => {
    const original = meta.getAttribute("data-app-color");
    if (original) meta.setAttribute("content", original);
  });
}
