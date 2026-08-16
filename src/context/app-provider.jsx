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
  STORAGE_KEY,
  updateCustomer as patchCustomer,
} from "@/lib/store";
import { DEFAULT_LANGUAGE, getHtmlLang, normalizeLanguage } from "@/lib/i18n";
import { persistOnboardingGate } from "@/lib/onboarding-gate";
import { restorePlayPurchases } from "@/lib/buy-theme";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/supabase/sign-in";
import { pushShop, pullShop } from "@/lib/supabase/sync";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [userId, setUserId] = useState(null);

  const applyShop = useCallback((shop) => {
    if (!shop) return;
    persistOnboardingGate(Boolean(shop.settings?.onboardingComplete));
    setState((prev) => ({
      ...prev,
      business: { ...prev.business, ...shop.business },
      customers: shop.customers,
      entries: shop.entries,
      settings: { ...prev.settings, ...shop.settings },
    }));
    const theme = shop.settings?.theme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    const theme = loaded.settings?.theme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = getHtmlLang(
      normalizeLanguage(loaded.settings?.language || DEFAULT_LANGUAGE)
    );
    persistOnboardingGate(Boolean(loaded.settings?.onboardingComplete));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session || cancelled) return;
      setUserId(session.user.id);
      const loaded = loadState();
      if (loaded.settings?.onboardingComplete) return;
      const shop = await pullShop(supabase, session.user.id);
      if (shop && !cancelled) applyShop(shop);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, [ready, applyShop]);

  useEffect(() => {
    if (!ready || !userId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const timer = window.setTimeout(() => {
      pushShop(supabase, userId, state);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [ready, userId, state]);

  useEffect(() => {
    if (!ready) return;
    const result = saveState(state);
    setSaveError(result.ok ? null : result.kind);
  }, [state, ready]);

  const dismissSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

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

  const grantUnlockedTheme = useCallback((kind, themeId) => {
    setState((prev) => {
      if (kind === "bill") {
        const unlocked = prev.settings.unlockedBillThemes || [];
        if (unlocked.includes(themeId)) return prev;
        return {
          ...prev,
          settings: {
            ...prev.settings,
            unlockedBillThemes: [...unlocked, themeId],
          },
        };
      }
      const unlocked = prev.settings.unlockedQrThemes || [];
      if (unlocked.includes(themeId)) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          unlockedQrThemes: [...unlocked, themeId],
        },
      };
    });
  }, []);

  useEffect(() => {
    if (!ready || !userId) return;
    restorePlayPurchases({
      onUnlocked: (kind, themeId) => grantUnlockedTheme(kind, themeId),
    }).catch(() => {});
  }, [ready, userId, grantUnlockedTheme]);

  const updateBusiness = useCallback((business) => {
    setState((prev) => ({
      ...prev,
      business: { ...prev.business, ...business },
    }));
  }, []);

  const completeOnboarding = useCallback((business) => {
    persistOnboardingGate(true);
    setState((prev) => ({
      ...prev,
      business: { ...prev.business, ...business },
      settings: { ...prev.settings, onboardingComplete: true },
    }));
  }, []);

  const signOut = useCallback(async () => {
    setUserId(null);
    persistOnboardingGate(false);
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private mode can block storage.
    }
    document.documentElement.classList.remove("dark");
    setState(defaultState);
  }, []);

  const sendPhoneOtp = useCallback(async (phone) => {
    const result = await requestPhoneOtp(phone);
    if (result.userId) setUserId(result.userId);
    if (result.shop) {
      applyShop(result.shop);
      return { restored: true, skipped: false, alreadyVerified: true };
    }
    return {
      restored: false,
      skipped: Boolean(result.skipped),
      alreadyVerified: Boolean(result.alreadyVerified),
      reqId: result.reqId || "",
    };
  }, [applyShop]);

  const confirmPhoneOtp = useCallback(async (phone, token, reqId) => {
    const result = await verifyPhoneOtp(phone, token, reqId);
    if (result.userId) setUserId(result.userId);
    if (result.shop) {
      applyShop(result.shop);
      return { restored: true };
    }
    return { restored: false };
  }, [applyShop]);

  const addCustomer = useCallback(({ name, phone }) => {
    let customer = null;
    setState((prev) => {
      const result = createCustomer(prev, { name, phone });
      customer = result.customer;
      saveState(result.state);
      return result.state;
    });
    return customer;
  }, []);

  const updateCustomer = useCallback((id, { name, phone }) => {
    let customer = null;
    setState((prev) => {
      const result = patchCustomer(prev, id, { name, phone });
      customer = result.customer;
      if (result.customer) saveState(result.state);
      return result.customer ? result.state : prev;
    });
    return customer;
  }, []);

  const addEntry = useCallback((payload) => {
    let entry = null;
    setState((prev) => {
      const result = createEntry(prev, payload);
      entry = result.entry;
      if (!result.entry) return prev;
      saveState(result.state);
      return result.state;
    });
    return entry;
  }, []);

  const getCustomer = useCallback(
    (id) => state.customers.find((c) => c.id === id) || null,
    [state.customers]
  );

  const value = useMemo(
    () => ({
      ready,
      saveError,
      dismissSaveError,
      userId,
      sendPhoneOtp,
      confirmPhoneOtp,
      ...state,
      setTheme,
      setLanguage,
      setBillTheme,
      unlockBillTheme,
      setQrTheme,
      unlockQrTheme,
      updateBusiness,
      completeOnboarding,
      signOut,
      addCustomer,
      updateCustomer,
      addEntry,
      getCustomer,
    }),
    [
      ready,
      saveError,
      dismissSaveError,
      userId,
      sendPhoneOtp,
      confirmPhoneOtp,
      state,
      setTheme,
      setLanguage,
      setBillTheme,
      unlockBillTheme,
      setQrTheme,
      unlockQrTheme,
      updateBusiness,
      completeOnboarding,
      signOut,
      addCustomer,
      updateCustomer,
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
