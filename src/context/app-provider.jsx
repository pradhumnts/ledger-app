"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createCustomer,
  createEntry,
  defaultState,
  loadState,
  markEntriesShared as stampEntriesShared,
  saveState,
  sanitizeSettings,
  STORAGE_KEY,
  updateCustomer as patchCustomer,
} from "@/lib/store";
import { applyAppColorScheme } from "@/lib/app-color-scheme";
import { DEFAULT_LANGUAGE, getHtmlLang, normalizeLanguage } from "@/lib/i18n";
import { persistOnboardingGate } from "@/lib/onboarding-gate";
import { mergeAdminThemeUnlocks } from "@/lib/admin-themes";
import { restorePlayPurchases } from "@/lib/buy-theme";
import {
  amountBucket,
  capture,
  identifyShop,
  registerShopContext,
  resetAnalytics,
} from "@/lib/analytics";
import { disableReminders } from "@/lib/push-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/supabase/sign-in";
import { pushEntryShares, pushShop, pullShop } from "@/lib/supabase/sync";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [userId, setUserId] = useState(null);

  const applyShop = useCallback((shop, loginPhone) => {
    if (!shop) return;
    persistOnboardingGate(Boolean(shop.settings?.onboardingComplete));
    setState((prev) => {
      const business = { ...prev.business, ...shop.business };
      return {
        ...prev,
        business,
        customers: shop.customers,
        entries: shop.entries,
        settings: mergeAdminThemeUnlocks(
          sanitizeSettings(
            { ...prev.settings, ...shop.settings },
            business
          ),
          loginPhone
        ),
      };
    });
    const theme = shop.settings?.theme === "dark" ? "dark" : "light";
    applyAppColorScheme(theme);
  }, []);

  useLayoutEffect(() => {
    const loaded = loadState();
    setState(loaded);
    const theme = loaded.settings?.theme === "dark" ? "dark" : "light";
    applyAppColorScheme(theme);
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

    const applySession = (session) => {
      if (cancelled || !session?.user?.id) return;
      setUserId(session.user.id);
      setState((prev) => ({
        ...prev,
        settings: mergeAdminThemeUnlocks(
          prev.settings,
          prev.business.phone,
          session.user.phone
        ),
      }));
    };

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      applySession(session);
      if (!session || cancelled) return;
      const loaded = loadState();
      if (loaded.settings?.onboardingComplete) return;
      const shop = await pullShop(supabase, session.user.id);
      if (shop && !cancelled) applyShop(shop, session.user.phone);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        applySession(session);
        return;
      }
      // INITIAL_SESSION can fire with a null session while storage is still
      // hydrating. Only clear after an explicit sign-out.
      if (event === "SIGNED_OUT" && !cancelled) {
        setUserId(null);
      }
    });

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, [ready, applyShop]);

  useEffect(() => {
    if (!ready || !userId) return;
    const shopName = state.business?.name?.trim() || "";
    const shopPhone = String(state.business?.phone || "").replace(/\D/g, "").slice(-10);
    identifyShop(userId, {
      name: shopName || shopPhone || undefined,
      shop_name: shopName,
      shop_phone: shopPhone,
      business_type: state.business?.type || "",
      language: state.settings?.language || "en",
      bill_theme: state.settings?.billTheme || "classic",
      qr_theme: state.settings?.qrTheme || "",
    });
    registerShopContext({
      shop_name: shopName,
      shop_phone: shopPhone,
      business_type: state.business?.type || "",
      language: state.settings?.language || "en",
      bill_theme: state.settings?.billTheme || "classic",
      qr_theme: state.settings?.qrTheme || "",
    });
  }, [
    ready,
    userId,
    state.business?.name,
    state.business?.phone,
    state.business?.type,
    state.settings?.language,
    state.settings?.billTheme,
    state.settings?.qrTheme,
  ]);

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
    applyAppColorScheme(theme);
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
    capture("theme_selected", { kind: "bill", theme_id: billTheme });
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
    capture("theme_selected", { kind: "qr", theme_id: qrTheme });
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
    capture("onboarding_completed", {
      business_type: business?.type || "",
    });
  }, []);

  const signOut = useCallback(async () => {
    setUserId(null);
    persistOnboardingGate(false);
    await disableReminders().catch(() => {});
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private mode can block storage.
    }
    resetAnalytics();
    applyAppColorScheme("light");
    setState(defaultState);
  }, []);

  const sendPhoneOtp = useCallback(async (phone) => {
    capture("auth_otp_requested");
    const result = await requestPhoneOtp(phone);
    if (result.userId) setUserId(result.userId);
    if (result.shop) {
      applyShop(result.shop);
      capture("auth_signed_in", { restored: true });
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
    const restored = Boolean(result.shop);
    if (result.shop) applyShop(result.shop);
    capture("auth_signed_in", { restored });
    return { restored };
  }, [applyShop]);

  const addCustomer = useCallback(({ name, phone }) => {
    const isFirst = stateRef.current.customers.length === 0;
    const result = createCustomer(stateRef.current, { name, phone });
    stateRef.current = result.state;
    saveState(result.state);
    setState(result.state);
    capture("customer_created", {
      is_first: isFirst,
      has_phone: Boolean(String(phone || "").trim()),
    });
    return result.customer;
  }, []);

  const updateCustomer = useCallback((id, { name, phone }) => {
    const result = patchCustomer(stateRef.current, id, { name, phone });
    if (!result.customer) return null;
    stateRef.current = result.state;
    saveState(result.state);
    setState(result.state);
    return result.customer;
  }, []);

  const addEntry = useCallback((payload) => {
    const isFirst = stateRef.current.entries.length === 0;
    const result = createEntry(stateRef.current, payload);
    if (!result.entry) return null;
    stateRef.current = result.state;
    saveState(result.state);
    setState(result.state);
    capture("entry_created", {
      type: payload.type,
      is_first: isFirst,
      has_due: Number(payload.due) > 0,
      amount_bucket: amountBucket(payload.amount),
    });
    return result.entry;
  }, []);

  const markEntriesShared = useCallback((ids) => {
    const next = stampEntriesShared(stateRef.current, ids);
    if (next === stateRef.current) return;
    stateRef.current = next;
    saveState(next);
    setState(next);
    const supabase = getSupabaseBrowserClient();
    const signedInId = userId;
    if (supabase && signedInId) {
      const sharedAt = new Date().toISOString();
      pushEntryShares(
        supabase,
        signedInId,
        (ids || []).filter(Boolean).map((id) => ({ id, sharedAt }))
      );
    }
  }, [userId]);

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
      markEntriesShared,
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
      markEntriesShared,
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
