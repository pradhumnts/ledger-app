/**
 * Best-effort deep links to open a specific UPI app from mobile web.
 * Opens the app (when installed) so the customer can send to a phone number.
 * Not guaranteed on every device/OS — Android Chrome is the main target.
 */

export const UPI_APP_LINKS = {
  gpay: {
    id: "gpay",
    label: "Google Pay",
    // Opens GPay’s UPI surface when possible (no prefilled pay).
    android: "intent://upi/#Intent;scheme=tez;package=com.google.android.apps.nbu.paisa.user;end",
    ios: "tez://upi/",
    fallback: "tez://upi/",
  },
  phonepe: {
    id: "phonepe",
    label: "PhonePe",
    android:
      "intent://home#Intent;scheme=phonepe;package=com.phonepe.app;end",
    ios: "phonepe://",
    fallback: "phonepe://",
  },
  paytm: {
    id: "paytm",
    label: "Paytm",
    android:
      "intent://cash_wallet#Intent;scheme=paytmmp;package=net.one97.paytm;end",
    ios: "paytmmp://",
    fallback: "paytmmp://",
  },
};

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
 * @returns {boolean} whether a navigation was attempted
 */
export function openUpiApp(appId) {
  const app = UPI_APP_LINKS[appId];
  if (!app || typeof window === "undefined") return false;

  let href = app.fallback;
  if (isAndroid()) href = app.android;
  else if (isIos()) href = app.ios;

  try {
    window.location.href = href;
    return true;
  } catch {
    return false;
  }
}
