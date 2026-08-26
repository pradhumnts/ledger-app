import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Fire-and-forget: ops email after onboarding, not at OTP. */
export function notifyOnboardingComplete(business = {}) {
  (async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = (await supabase?.auth.getSession()) || {};
    const token = data?.session?.access_token || "";
    if (!token) return;

    await fetch("/api/ops/onboarded", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-MoneyKit-Access-Token": token,
      },
      credentials: "include",
      body: JSON.stringify({
        name: business.name || "",
        phone: business.phone || "",
        address: business.address || "",
        type: business.type || "",
      }),
    });
  })().catch(() => {});
}
