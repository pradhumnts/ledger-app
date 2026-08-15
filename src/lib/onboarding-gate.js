export const ONBOARDING_COOKIE = "mk_onboarded";

export function persistOnboardingGate(complete) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (complete) {
    document.cookie = `${ONBOARDING_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    return;
  }
  document.cookie = `${ONBOARDING_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
