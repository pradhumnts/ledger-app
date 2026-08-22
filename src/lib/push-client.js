import { REMINDERS_ENABLED } from "@/lib/reminders-enabled";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const ENABLED_KEY = "mk_push_enabled";
const PROMPT_DISMISSED_KEY = "mk_push_prompt_dismissed";

function vapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function notificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export function remindersOptedIn() {
  try {
    return window.localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRemindersOptedIn(on) {
  try {
    if (on) window.localStorage.setItem(ENABLED_KEY, "1");
    else window.localStorage.removeItem(ENABLED_KEY);
  } catch {
    // Private mode can block storage.
  }
}

export function remindersPromptDismissed() {
  try {
    return window.localStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissRemindersPrompt() {
  try {
    window.localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
}

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return data.session.access_token;
  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || "";
}

async function getWorkerRegistration() {
  if (!pushSupported()) return null;
  if (process.env.NODE_ENV === "development") {
    try {
      return await navigator.serviceWorker.register("/push-sw.js");
    } catch {
      return null;
    }
  }
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    try {
      return await navigator.serviceWorker.register("/push-sw.js");
    } catch {
      return null;
    }
  }
}

async function authHeaders() {
  const token = await getAccessToken();
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-MoneyKit-Access-Token": token,
  };
}

export async function enableReminders() {
  if (!REMINDERS_ENABLED) return { ok: false, reason: "disabled" };
  if (!pushSupported()) return { ok: false, reason: "unsupported" };
  if (!vapidPublicKey()) return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: permission === "denied" ? "denied" : "dismissed" };
  }

  const registration = await getWorkerRegistration();
  if (!registration?.pushManager) return { ok: false, reason: "no_worker" };

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey()),
  });
  const headers = await authHeaders();
  if (!headers) return { ok: false, reason: "signed_out" };

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers,
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) return { ok: false, reason: "save_failed" };

  setRemindersOptedIn(true);
  dismissRemindersPrompt();
  return { ok: true };
}

export async function disableReminders() {
  setRemindersOptedIn(false);
  if (!pushSupported()) return { ok: true };

  let endpoint = "";
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    endpoint = subscription?.endpoint || "";
    await subscription?.unsubscribe();
  } catch {
    // Still drop the server row when we can.
  }

  const headers = await authHeaders();
  if (!headers) return { ok: true };
  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ endpoint }),
  }).catch(() => {});
  return { ok: true };
}

/** Re-save the subscription if the shop already allowed notifications. */
export async function syncRemindersSubscription() {
  if (!REMINDERS_ENABLED) return;
  if (!pushSupported() || !remindersOptedIn()) return;
  if (Notification.permission !== "granted") return;
  if (!vapidPublicKey()) return;

  const registration = await getWorkerRegistration();
  if (!registration?.pushManager) return;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey()),
    });
  }
  const headers = await authHeaders();
  if (!headers) return;
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers,
    body: JSON.stringify(subscription.toJSON()),
  }).catch(() => {});
}

export async function requestReminderTest(kind) {
  const headers = await authHeaders();
  if (!headers) return { ok: false, reason: "signed_out", sent: 0 };
  const response = await fetch("/api/push/test", {
    method: "POST",
    headers,
    body: JSON.stringify({ kind }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      sent: 0,
      reason: payload.error || "test_failed",
    };
  }
  return payload;
}
