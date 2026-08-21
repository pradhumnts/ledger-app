import { BACKGROUND_COLOR } from "@/lib/branding";

export const DARK_BACKGROUND_COLOR = "#090b0a";
const SPLASH_ATTR = "data-splash";
/** Keep in sync with STORAGE_KEY in src/lib/store.js */
const PREFS_STORAGE_KEY = "ledger-app-v1";

function schemeContent(theme) {
  return theme === "dark" ? "only dark" : "only light";
}

function upsertMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

/** Keep OS/browser auto-dark from inverting the page. Follow the in-app theme only. */
export function applyAppColorScheme(theme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = schemeContent(theme);
  upsertMeta("color-scheme", schemeContent(theme));
  upsertMeta("supported-color-schemes", dark ? "dark" : "light");

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

/** Runs before React so Chrome/WebView never sees an undeclared color scheme. */
export const APP_COLOR_SCHEME_BOOT_SCRIPT = `(function(){try{var theme="light";try{var raw=localStorage.getItem(${JSON.stringify(PREFS_STORAGE_KEY)});if(raw){var s=JSON.parse(raw);if(s&&s.settings&&s.settings.theme==="dark")theme="dark"}}catch(e){}var dark=theme==="dark";var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"only dark":"only light";function upsert(name,content){var metas=document.querySelectorAll('meta[name="'+name+'"]');if(!metas.length){var m=document.createElement("meta");m.setAttribute("name",name);m.setAttribute("content",content);(document.head||document.documentElement).appendChild(m);return}for(var i=0;i<metas.length;i++)metas[i].setAttribute("content",content)}upsert("color-scheme",dark?"only dark":"only light");upsert("supported-color-schemes",dark?"dark":"light")}catch(e){}})();`;
