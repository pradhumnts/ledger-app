export const ONBOARDING_COOKIE = "mk_onboarded";

export function isPublicLegalPath(pathname) {
  return (
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/account-deletion"
  );
}

/** Browser marketing site — landing, legal pages (not the signed-in shop app). */
export function isMarketingPath(pathname) {
  return pathname === "/" || isPublicLegalPath(pathname);
}

/** Public UPI pay page and shared bill links — no login. */
export function isPublicSharePath(pathname) {
  return (
    pathname === "/p" ||
    pathname === "/b" ||
    Boolean(pathname?.startsWith("/b/"))
  );
}

/** Customer websites (path mode) and the in-app website preview. */
export function isShopSitePath(pathname) {
  return (
    pathname === "/site-preview" ||
    Boolean(pathname?.startsWith("/sites/"))
  );
}

/** Referral short links (`/r/CODE`) and the affiliate partner page. */
export function isReferralPath(pathname) {
  return pathname === "/partner" || Boolean(pathname?.startsWith("/r/"));
}

/** Short install links (`/get`, `/get/bill`) and shops' review links (`/review/<place id>`). */
export function isAppLinkPath(pathname) {
  return (
    pathname === "/get" ||
    Boolean(pathname?.startsWith("/get/")) ||
    Boolean(pathname?.startsWith("/review/"))
  );
}

/** Printed QR stickers (`/q/CODE`) that open a shop's UPI payment or website. */
export function isStickerPath(pathname) {
  return Boolean(pathname?.startsWith("/q/"));
}

/**
 * Everything the website still serves. The shop app lives in the React Native
 * app now, so any other page (onboarding, customers, bills…) redirects to `/`.
 */
export function isWebAccessiblePath(pathname) {
  return (
    isMarketingPath(pathname) ||
    isPublicSharePath(pathname) ||
    isShopSitePath(pathname) ||
    isReferralPath(pathname) ||
    isAppLinkPath(pathname) ||
    isStickerPath(pathname)
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
