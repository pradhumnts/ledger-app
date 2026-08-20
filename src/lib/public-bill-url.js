import { APP_SITE_URL } from "@/lib/branding";
import {
  buildLegacyPublicShareUrl,
  isPublicBillId,
  snapshotPublicShare,
} from "@/lib/public-bill";

function onCanonicalHost() {
  if (typeof window === "undefined") return false;
  try {
    return window.location.host === new URL(APP_SITE_URL).host;
  } catch {
    return false;
  }
}

async function tryGetAccessToken() {
  try {
    const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return "";
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  } catch {
    return "";
  }
}

function publicBillOrigin() {
  if (onCanonicalHost()) return APP_SITE_URL;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return APP_SITE_URL;
}

/**
 * Prefer a short /b/{id} link. Falls back to the encoded ?d= URL so share still
 * works if the API is down, offline, or the database is not migrated yet.
 */
export async function buildPublicBillUrl(args) {
  try {
    const snapshot = snapshotPublicShare(args);
    if (snapshot) {
      const headers = { "Content-Type": "application/json" };
      const token = await tryGetAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        headers["X-MoneyKit-Access-Token"] = token;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/public-bills", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...snapshot,
          accessToken: token || undefined,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
      const data = await response.json().catch(() => ({}));
      if (response.ok && isPublicBillId(data.id)) {
        return `${publicBillOrigin()}/b/${data.id}`;
      }
    }
  } catch {
    // fall through to encoded URL
  }
  return buildLegacyPublicShareUrl(args);
}
