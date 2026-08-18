export const INSTALLED_APP_ATTR = "data-installed-app";

/** Runs before React so the installed app never paints the marketing landing. */
export const INSTALLED_APP_BOOT_SCRIPT = `(function(){try{if(new URLSearchParams(location.search).get("landing")==="1")return;var app=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.matchMedia("(display-mode: minimal-ui)").matches||window.navigator.standalone===true||String(document.referrer||"").startsWith("android-app://");if(app)document.documentElement.setAttribute("${INSTALLED_APP_ATTR}","1")}catch(e){}})();`;

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
