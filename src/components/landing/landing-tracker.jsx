"use client";

import { useEffect } from "react";
import { capture } from "@/lib/analytics";

export function LandingTracker() {
  useEffect(() => {
    capture("landing_viewed");
  }, []);
  return null;
}
