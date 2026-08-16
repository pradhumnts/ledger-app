export function isInstalledApp() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.navigator.standalone === true) return true;
  if (String(document.referrer || "").startsWith("android-app://")) return true;
  return false;
}
