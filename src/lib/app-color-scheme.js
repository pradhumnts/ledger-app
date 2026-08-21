import { BACKGROUND_COLOR } from "@/lib/branding";

export const DARK_BACKGROUND_COLOR = "#090b0a";
const SPLASH_ATTR = "data-splash";
/** Keep in sync with STORAGE_KEY in src/lib/store.js */
const PREFS_STORAGE_KEY = "ledger-app-v1";

function upsertMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

/**
 * Match Android chrome (status/nav icons) to the in-app theme, and tell Chrome
 * we already support light+dark so it must not auto-invert the page.
 */
export function applyAppColorScheme(theme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.style.colorScheme = dark ? "dark" : "light";
  // Always advertise both so Android Chrome Force Dark will not invert us.
  upsertMeta("color-scheme", "light dark");
  upsertMeta("supported-color-schemes", "light dark");

  const chrome = dark ? DARK_BACKGROUND_COLOR : BACKGROUND_COLOR;
  const splashOn = root.getAttribute(SPLASH_ATTR) === "1";
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    if (meta.hasAttribute("media")) {
      meta.remove();
      return;
    }
    meta.setAttribute("data-app-color", chrome);
    if (!splashOn) meta.setAttribute("content", chrome);
  });
}

/** Runs in <head> before paint so React hydration cannot flash the wrong scheme. */
export const APP_COLOR_SCHEME_BOOT_SCRIPT = `(function(){try{var theme="light";try{var raw=localStorage.getItem(${JSON.stringify(PREFS_STORAGE_KEY)});if(raw){var s=JSON.parse(raw);if(s&&s.settings&&s.settings.theme==="dark")theme="dark"}}catch(e){}var dark=theme==="dark";var root=document.documentElement;root.classList.toggle("dark",dark);root.setAttribute("data-theme",dark?"dark":"light");root.style.colorScheme=dark?"dark":"light";function upsert(name,content){var metas=document.querySelectorAll('meta[name="'+name+'"]');var i;if(!metas.length){var m=document.createElement("meta");m.setAttribute("name",name);m.setAttribute("content",content);(document.head||root).appendChild(m);return}for(i=0;i<metas.length;i++)metas[i].setAttribute("content",content)}upsert("color-scheme","light dark");upsert("supported-color-schemes","light dark")}catch(e){}})();`;
