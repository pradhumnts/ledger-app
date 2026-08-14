"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createCustomer,
  createEntry,
  defaultState,
  loadState,
  saveState,
} from "@/lib/store";
import { DEFAULT_LANGUAGE, getHtmlLang, normalizeLanguage } from "@/lib/i18n";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    const theme = loaded.settings?.theme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = getHtmlLang(
      normalizeLanguage(loaded.settings?.language || DEFAULT_LANGUAGE)
    );
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = getHtmlLang(
      normalizeLanguage(state.settings?.language || DEFAULT_LANGUAGE)
    );
  }, [state.settings?.language, ready]);

  const setTheme = useCallback((theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme },
    }));
  }, []);

  const setLanguage = useCallback((language) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: normalizeLanguage(language) },
    }));
  }, []);

  const setBillTheme = useCallback((billTheme) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, billTheme },
    }));
  }, []);

  const unlockBillTheme = useCallback((billThemeId) => {
    setState((prev) => {
      const unlocked = prev.settings.unlockedBillThemes || [];
      if (unlocked.includes(billThemeId)) {
        return {
          ...prev,
          settings: { ...prev.settings, billTheme: billThemeId },
        };
      }
      return {
        ...prev,
        settings: {
          ...prev.settings,
          billTheme: billThemeId,
          unlockedBillThemes: [...unlocked, billThemeId],
        },
      };
    });
  }, []);

  const setQrTheme = useCallback((qrTheme) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, qrTheme },
    }));
  }, []);

  const unlockQrTheme = useCallback((qrThemeId) => {
    setState((prev) => {
      const unlocked = prev.settings.unlockedQrThemes || [];
      if (unlocked.includes(qrThemeId)) {
        return {
          ...prev,
          settings: { ...prev.settings, qrTheme: qrThemeId },
        };
      }
      return {
        ...prev,
        settings: {
          ...prev.settings,
          qrTheme: qrThemeId,
          unlockedQrThemes: [...unlocked, qrThemeId],
        },
      };
    });
  }, []);

  const updateBusiness = useCallback((business) => {
    setState((prev) => ({
      ...prev,
      business: { ...prev.business, ...business },
    }));
  }, []);

  const completeOnboarding = useCallback((business) => {
    setState((prev) => ({
      ...prev,
      business: { ...prev.business, ...business },
      settings: { ...prev.settings, onboardingComplete: true },
    }));
  }, []);

  const addCustomer = useCallback(({ name, phone }) => {
    const result = createCustomer(state, { name, phone });
    setState(result.state);
    return result.customer;
  }, [state]);

  const addEntry = useCallback(
    (payload) => {
      const result = createEntry(state, payload);
      setState(result.state);
      return result.entry;
    },
    [state]
  );

  const getCustomer = useCallback(
    (id) => state.customers.find((c) => c.id === id) || null,
    [state.customers]
  );

  const value = useMemo(
    () => ({
      ready,
      ...state,
      setTheme,
      setLanguage,
      setBillTheme,
      unlockBillTheme,
      setQrTheme,
      unlockQrTheme,
      updateBusiness,
      completeOnboarding,
      addCustomer,
      addEntry,
      getCustomer,
    }),
    [
      ready,
      state,
      setTheme,
      setLanguage,
      setBillTheme,
      unlockBillTheme,
      setQrTheme,
      unlockQrTheme,
      updateBusiness,
      completeOnboarding,
      addCustomer,
      addEntry,
      getCustomer,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
