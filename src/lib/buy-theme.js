import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  isPlayBillingAvailable,
  listPlayPurchases,
  requestPlayPurchase,
} from "@/lib/play-billing";
import { playSkuFor, themeFromPlaySku } from "@/lib/theme-catalog";

let checkoutPromise = null;

function loadCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Checkout only runs in the browser."));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (checkoutPromise) return checkoutPromise;

  checkoutPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-razorpay-checkout]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Razorpay));
      existing.addEventListener("error", () =>
        reject(new Error("Could not load payment."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Could not load payment."));
    document.body.appendChild(script);
  });
  return checkoutPromise;
}

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("buyNeedLogin");

  const readToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  };

  let token = await readToken();
  if (token) return token;

  const { data } = await supabase.auth.refreshSession();
  token = data.session?.access_token || (await readToken());
  if (!token) throw new Error("buyNeedLogin");
  return token;
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-MoneyKit-Access-Token": token,
  };
}

export async function buyTheme({ kind, themeId, name, contact, onUnlocked }) {
  const accessToken = await getAccessToken();
  if (await isPlayBillingAvailable()) {
    return buyWithPlay({ kind, themeId, accessToken, onUnlocked });
  }
  return buyWithRazorpay({ kind, themeId, name, contact, accessToken, onUnlocked });
}

async function verifyPlayPurchase({ sku, purchaseToken, accessToken }) {
  const headers = authHeaders(accessToken);
  const verifyResponse = await fetch("/api/payments/verify-play", {
    method: "POST",
    headers,
    body: JSON.stringify({ sku, purchaseToken, accessToken }),
  });
  const payload = await verifyResponse.json().catch(() => ({}));
  if (verifyResponse.status === 401) throw new Error("buyNeedLogin");
  if (!verifyResponse.ok) {
    throw new Error(payload.error || "buyFailed");
  }
  return payload;
}

async function buyWithPlay({ kind, themeId, accessToken, onUnlocked }) {
  const sku = playSkuFor(kind, themeId);
  if (!sku) throw new Error("buyFailed");

  const pending = await requestPlayPurchase(sku);
  try {
    const payload = await verifyPlayPurchase({
      sku: pending.sku,
      purchaseToken: pending.purchaseToken,
      accessToken,
    });
    await pending.complete(true);
    onUnlocked?.(payload.themeId || themeId);
    return { ok: true, provider: "play" };
  } catch (error) {
    try {
      await pending.complete(false);
    } catch {
      // Ignore PaymentResponse complete errors.
    }
    throw error;
  }
}

export async function restorePlayPurchases({ onUnlocked } = {}) {
  if (!(await isPlayBillingAvailable())) return [];
  const accessToken = await getAccessToken();
  const purchases = await listPlayPurchases();
  const unlocked = [];
  for (const purchase of purchases) {
    const sku = purchase.itemId || purchase.sku || "";
    const purchaseToken = purchase.purchaseToken || "";
    const theme = themeFromPlaySku(sku);
    if (!theme || !purchaseToken) continue;
    try {
      const payload = await verifyPlayPurchase({ sku, purchaseToken, accessToken });
      onUnlocked?.(payload.kind || theme.kind, payload.themeId || theme.themeId);
      unlocked.push(payload);
    } catch {
      // Skip tokens Google or our server will not accept.
    }
  }
  return unlocked;
}

async function buyWithRazorpay({
  kind,
  themeId,
  name,
  contact,
  accessToken,
  onUnlocked,
}) {
  const headers = authHeaders(accessToken);
  const orderResponse = await fetch("/api/payments/create-order", {
    method: "POST",
    headers,
    body: JSON.stringify({ kind, themeId, accessToken }),
  });
  const order = await orderResponse.json().catch(() => ({}));
  if (orderResponse.status === 409 && order.alreadyOwned) {
    onUnlocked?.(themeId);
    return { alreadyOwned: true };
  }
  if (orderResponse.status === 401) {
    throw new Error("buyNeedLogin");
  }
  if (!orderResponse.ok) {
    throw new Error(order.error || "buyFailed");
  }

  const Razorpay = await loadCheckout();
  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "MoneyKit",
      description: order.description,
      order_id: order.orderId,
      prefill: {
        name: name || "",
        contact: String(contact || "").replace(/\D/g, "").slice(-10),
      },
      theme: { color: "#0b301f" },
      handler: async (response) => {
        try {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers,
            body: JSON.stringify({ ...response, accessToken }),
          });
          const payload = await verifyResponse.json().catch(() => ({}));
          if (verifyResponse.status === 401) {
            throw new Error("buyNeedLogin");
          }
          if (!verifyResponse.ok) {
            throw new Error(payload.error || "buyFailed");
          }
          onUnlocked?.(payload.themeId || themeId);
          resolve({ ok: true });
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("cancelled")),
      },
    });
    checkout.on("payment.failed", (failed) => {
      reject(new Error(failed?.error?.description || "buyFailed"));
    });
    checkout.open();
  });
}
