"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isInstalledApp, markInstalledApp } from "@/lib/installed-app";

const LandingGateContext = createContext({
  showLanding: false,
});

export function LandingGateProvider({ children }) {
  const pathname = usePathname();
  const onSiteRoot = pathname === "/";
  const [skipLanding, setSkipLanding] = useState(false);

  useLayoutEffect(() => {
    if (!onSiteRoot) {
      setSkipLanding(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("landing") === "1") {
      setSkipLanding(false);
      return;
    }

    if (isInstalledApp()) {
      markInstalledApp();
      setSkipLanding(true);
      return;
    }

    setSkipLanding(false);
  }, [onSiteRoot]);

  return (
    <LandingGateContext.Provider
      value={{
        showLanding: onSiteRoot && !skipLanding,
      }}
    >
      {children}
    </LandingGateContext.Provider>
  );
}

export function useLandingGate() {
  return useContext(LandingGateContext);
}
