import {
  isQrThemeUnlocked,
  QR_THEMES,
} from "@/lib/qr-themes";
import { uniqueUid } from "@/lib/format";
import {
  customerBalance,
  customerBalancePaise,
  customerTotals,
  entryBilledAmount,
  entryOutstanding,
  prepareEntryAmounts,
  shopToCollect,
  summarizeBilled,
} from "@/lib/ledger-math";

export {
  customerBalance,
  customerTotals,
  entryBilledAmount,
  entryOutstanding,
  shopToCollect,
};

export const STORAGE_KEY = "ledger-app-v1";
export const QR_SETTINGS_VERSION = 2;

export const defaultState = {
  business: {
    name: "",
    phone: "",
    address: "",
    logo: "",
    upiId: "",
    type: "",
  },
  customers: [],
  entries: [],
  settings: {
    theme: "light",
    language: "en",
    billTheme: "classic",
    unlockedBillThemes: [],
    qrTheme: null,
    unlockedQrThemes: [],
    qrSettingsVersion: QR_SETTINGS_VERSION,
    onboardingComplete: false,
  },
};

function sanitizeQrSettings(settings) {
  const version = settings.qrSettingsVersion ?? 1;

  if (version < QR_SETTINGS_VERSION) {
    return {
      ...settings,
      qrTheme: null,
      unlockedQrThemes: [],
      qrSettingsVersion: QR_SETTINGS_VERSION,
    };
  }

  const unlocked = (settings.unlockedQrThemes || []).filter((id) =>
    QR_THEMES.some((theme) => theme.id === id)
  );
  const theme = settings.qrTheme
    ? QR_THEMES.find((item) => item.id === settings.qrTheme)
    : null;
  const qrTheme =
    theme && isQrThemeUnlocked(theme, unlocked) ? settings.qrTheme : null;

  return {
    ...settings,
    qrTheme,
    unlockedQrThemes: unlocked,
    qrSettingsVersion: QR_SETTINGS_VERSION,
  };
}

function sanitizeSettings(settings, business = {}) {
  const sanitized = sanitizeQrSettings(settings);
  if (!sanitized.onboardingComplete) {
    const hasProfile =
      business.name?.trim() || business.phone?.trim();
    if (hasProfile) {
      return { ...sanitized, onboardingComplete: true };
    }
  }
  return sanitized;
}

export function loadState() {
  if (typeof window === "undefined") return structuredClone(defaultState);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      business: {
        ...defaultState.business,
        ...(parsed.business || {}),
      },
      settings: sanitizeSettings(
        {
          ...defaultState.settings,
          ...(parsed.settings || {}),
          unlockedBillThemes: parsed.settings?.unlockedBillThemes || [],
          unlockedQrThemes: parsed.settings?.unlockedQrThemes || [],
        },
        {
          ...defaultState.business,
          ...(parsed.business || {}),
        }
      ),
    };
  } catch {
    return structuredClone(defaultState);
  }
}

export function isQuotaError(error) {
  if (!error) return false;
  const name = error.name || "";
  const code = error.code;
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    code === 22 ||
    code === 1014
  );
}

/** @returns {{ ok: true } | { ok: false, kind: "quota" | "blocked" }} */
export function saveState(state) {
  if (typeof window === "undefined") return { ok: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    return { ok: false, kind: isQuotaError(error) ? "quota" : "blocked" };
  }
}

export function peekStoredPrefs() {
  if (typeof window === "undefined") {
    return { language: "en", theme: "light" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { language: "en", theme: "light" };
    const parsed = JSON.parse(raw);
    return {
      language: parsed?.settings?.language || "en",
      theme: parsed?.settings?.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return { language: "en", theme: "light" };
  }
}

export function summarizeEntries(entries, now = new Date()) {
  return summarizeBilled(entries, now);
}

export function createCustomer(state, { name, phone }) {
  const customer = {
    id: uniqueUid(
      "cus",
      state.customers.map((item) => item.id)
    ),
    name: name.trim(),
    phone: String(phone || "").trim(),
    createdAt: new Date().toISOString(),
  };
  return {
    state: {
      ...state,
      customers: [customer, ...state.customers],
    },
    customer,
  };
}

export function updateCustomer(state, id, { name, phone }) {
  let customer = null;
  const customers = state.customers.map((item) => {
    if (item.id !== id) return item;
    customer = {
      ...item,
      name: name.trim(),
      phone: String(phone || "").trim(),
    };
    return customer;
  });
  return {
    state: { ...state, customers },
    customer,
  };
}

export function createEntry(state, payload) {
  const owedPaise = customerBalancePaise(state.entries, payload.customerId);
  const prepared = prepareEntryAmounts(payload, owedPaise);
  if (prepared.rejected) {
    return { state, entry: null };
  }

  const entry = {
    id: uniqueUid(
      "ent",
      state.entries.map((item) => item.id)
    ),
    customerId: payload.customerId,
    type: payload.type,
    amount: prepared.amount,
    due: prepared.due,
    description: (payload.description || "").trim(),
    date: payload.date
      ? new Date(payload.date).toISOString()
      : new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  return {
    state: {
      ...state,
      entries: [entry, ...state.entries],
    },
    entry,
  };
}

export function findCustomersByName(customers, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return customers
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 6);
}

export function entriesForCustomer(entries, customerId) {
  return entries
    .filter((e) => e.customerId === customerId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function recentActivity(entries, customers, limit = 20) {
  const byId = Object.fromEntries(customers.map((c) => [c.id, c]));
  return [...entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
    .map((entry) => ({
      ...entry,
      customer: byId[entry.customerId] || null,
    }));
}

export function groupEntriesByDate(entries) {
  const groups = [];
  const map = new Map();

  [...entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((entry) => {
      const key = new Date(entry.date).toDateString();
      if (!map.has(key)) {
        const group = { key, date: entry.date, items: [] };
        map.set(key, group);
        groups.push(group);
      }
      map.get(key).items.push(entry);
    });

  return groups;
}
