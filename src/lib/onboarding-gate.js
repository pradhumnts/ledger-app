export const ONBOARDING_COOKIE = "mk_onboarded";

export function isPublicLegalPath(pathname) {
  return (
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/account-deletion"
  );
}

/** Public UPI pay page and shared bill links — no login. */
export function isPublicSharePath(pathname) {
  return pathname === "/p" || pathname === "/b";
}

/** Routes anyone can open without finishing onboarding. */
export function isUnauthedAllowedPath(pathname) {
  return (
    pathname === "/" ||
    pathname === "/onboarding" ||
    isPublicSharePath(pathname) ||
    isPublicLegalPath(pathname)
  );
}

export function persistOnboardingGate(complete) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (complete) {
    document.cookie = `${ONBOARDING_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    return;
  }
  document.cookie = `${ONBOARDING_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
