"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isInstalledApp } from "@/lib/installed-app";

const LandingGateContext = createContext({
  showLanding: true,
});

export function LandingGateProvider({ children }) {
  const pathname = usePathname();
  const onSiteRoot = pathname === "/";
  const [skipLanding, setSkipLanding] = useState(false);

  useEffect(() => {
    if (!onSiteRoot) {
      setSkipLanding(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("landing") === "1") {
      setSkipLanding(false);
      return;
    }

    setSkipLanding(isInstalledApp());
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
