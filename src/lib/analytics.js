import posthog from "posthog-js";
import { isAndroidDevice, isInstalledApp } from "@/lib/installed-app";

const OPENED_KEY = "mk_analytics_opened";
let started = false;

export function analyticsKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
}

export function analyticsSurface() {
  if (typeof window === "undefined") return "web";
  if (isInstalledApp()) return isAndroidDevice() ? "play" : "pwa";
  return "web";
}

export function amountBucket(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "none";
  if (n <= 100) return "1_100";
  if (n <= 500) return "101_500";
  if (n <= 2000) return "501_2000";
  if (n <= 10000) return "2001_10000";
  return "10000_plus";
}

function ready() {
  return typeof window !== "undefined" && Boolean(analyticsKey()) && started;
}

export function initAnalytics() {
  const key = analyticsKey();
  if (!key || typeof window === "undefined" || started) return;
  started = true;

  const local = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    persistence: "localStorage+cookie",
    disable_session_recording: local,
    session_recording: local
      ? undefined
      : {
          maskAllInputs: true,
          collectFonts: true,
          maskCapturedNetworkRequestFn: (request) => {
            if (!request) return request;
            const url = String(request.name || "");
            if (/otp|auth|token|razorpay|payments/i.test(url)) return null;
            return {
              ...request,
              requestBody: undefined,
              responseBody: undefined,
            };
          },
        },
  });
}

export function capture(event, properties = {}) {
  initAnalytics();
  if (!ready()) return;
  try {
    posthog.capture(event, {
      surface: analyticsSurface(),
      ...properties,
    });
  } catch {
    // Analytics must never break the app.
  }
}

export function identifyShop(userId, properties = {}) {
  if (typeof window === "undefined" || !analyticsKey() || !userId) return;
  try {
    initAnalytics();
    posthog.identify(userId, properties);
  } catch {
    // ignore
  }
}

export function registerShopContext(properties = {}) {
  if (!ready()) return;
  try {
    posthog.register(properties);
  } catch {
    // ignore
  }
}

export function resetAnalytics() {
  if (!ready()) return;
  try {
    posthog.reset();
  } catch {
    // ignore
  }
}

export function capturePageview() {
  if (typeof window === "undefined") return;
  capture("$pageview", { $current_url: window.location.href });
}

export function trackAppOpened() {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(OPENED_KEY)) return;
    window.sessionStorage.setItem(OPENED_KEY, "1");
  } catch {
    // Private mode can block storage; still send once this load.
  }
  capture("app_opened");
}
