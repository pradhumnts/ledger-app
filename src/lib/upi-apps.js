import { buildUpiPayQuery } from "@/lib/upi";

/**
 * Best-effort deep links to open a specific UPI app from mobile web.
 * With a valid VPA (+ optional amount), uses Amazon-style app pay intents.
 * Without a VPA, opens the app only so the customer can pay to a phone number.
 * Not guaranteed on every device/OS — Android Chrome is the main target.
 */

const OPEN_ONLY = {
  gpay: {
    android:
      "intent://upi/#Intent;scheme=tez;package=com.google.android.apps.nbu.paisa.user;end",
    ios: "tez://upi/",
    fallback: "tez://upi/",
  },
  phonepe: {
    android: "intent://home#Intent;scheme=phonepe;package=com.phonepe.app;end",
    ios: "phonepe://",
    fallback: "phonepe://",
  },
  paytm: {
    android:
      "intent://cash_wallet#Intent;scheme=paytmmp;package=net.one97.paytm;end",
    ios: "paytmmp://",
    fallback: "paytmmp://",
  },
};

function payLinks(query) {
  return {
    gpay: {
      android: `intent://upi/pay?${query}#Intent;scheme=tez;package=com.google.android.apps.nbu.paisa.user;end`,
      ios: `tez://upi/pay?${query}`,
      fallback: `tez://upi/pay?${query}`,
    },
    phonepe: {
      android: `intent://pay?${query}#Intent;scheme=phonepe;package=com.phonepe.app;end`,
      ios: `phonepe://pay?${query}`,
      fallback: `phonepe://pay?${query}`,
    },
    paytm: {
      android: `intent://pay?${query}#Intent;scheme=paytmmp;package=net.one97.paytm;end`,
      ios: `paytmmp://pay?${query}`,
      fallback: `paytmmp://pay?${query}`,
    },
  };
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

/**
 * @param {'gpay'|'phonepe'|'paytm'} appId
 * @param {{ upiId?: string, name?: string, amount?: number }} [payment]
 * @returns {boolean} whether a navigation was attempted
 */
export function openUpiApp(appId, payment = {}) {
  if (typeof window === "undefined") return false;

  const query = buildUpiPayQuery({
    upiId: payment.upiId,
    name: payment.name,
    amount: payment.amount,
  });
  const links = query ? payLinks(query)[appId] : OPEN_ONLY[appId];
  if (!links) return false;

  let href = links.fallback;
  if (isAndroid()) href = links.android;
  else if (isIos()) href = links.ios;

  try {
    window.location.href = href;
    return true;
  } catch {
    return false;
  }
}
