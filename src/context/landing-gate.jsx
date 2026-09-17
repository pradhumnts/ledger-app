"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

const LandingGateContext = createContext({
  showLanding: false,
});

export function LandingGateProvider({ children }) {
  const pathname = usePathname();

  return (
    <LandingGateContext.Provider
      value={{
        showLanding: pathname === "/",
      }}
    >
      {children}
    </LandingGateContext.Provider>
  );
}

export function useLandingGate() {
  return useContext(LandingGateContext);
}
