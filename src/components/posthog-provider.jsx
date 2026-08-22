"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import {
  analyticsKey,
  capturePageview,
  initAnalytics,
  trackAppOpened,
} from "@/lib/analytics";

function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    capturePageview();
  }, [pathname]);

  return null;
}

export function PostHogProvider({ children }) {
  const key = analyticsKey();

  useEffect(() => {
    initAnalytics();
    trackAppOpened();
  }, []);

  if (!key) return children;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
