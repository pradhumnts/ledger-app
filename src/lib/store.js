import {
  isQrThemeUnlocked,
  QR_THEMES,
} from "@/lib/qr-themes";
import {
  startOfDay,
  startOfMonth,
  uniqueUid,
} from "@/lib/format";

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

export function entryBilledAmount(entry) {
  if (!entry || entry.type === "got") return 0;
  return Number(entry.amount) || 0;
}

export function entryOutstanding(entry) {
  if (!entry) return 0;
  if (entry.type === "got") return -Number(entry.amount) || 0;
  if (entry.type === "invoice") return Number(entry.due ?? entry.amount) || 0;
  return Number(entry.amount) || 0;
}

export function customerBalance(entries, customerId) {
  return entries
    .filter((e) => e.customerId === customerId)
    .reduce((sum, e) => sum + entryOutstanding(e), 0);
}

export function customerTotals(entries, customerId) {
  return entries
    .filter((e) => e.customerId === customerId)
    .reduce(
      (acc, entry) => {
        acc.billed += entryBilledAmount(entry);
        acc.due += entryOutstanding(entry);
        return acc;
      },
      { billed: 0, due: 0 }
    );
}

export function summarizeEntries(entries, now = new Date()) {
  const todayStart = startOfDay(now).getTime();
  const monthStart = startOfMonth(now).getTime();

  let todayBilled = 0;
  let monthBilled = 0;

  entries.forEach((entry) => {
    const t = new Date(entry.date).getTime();
    const billed = entryBilledAmount(entry);
    if (t >= todayStart) todayBilled += billed;
    if (t >= monthStart) monthBilled += billed;
  });

  return {
    todayBilled,
    monthBilled,
    todayIn: 0,
    todayOut: todayBilled,
    todayNet: todayBilled,
    monthIn: 0,
    monthOut: monthBilled,
    monthNet: monthBilled,
  };
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
  const amount = Number(payload.amount);
  // Always mint a fresh id and prepend — never replace an existing entry,
  // even if the same customer / amount / date is used again.
  const entry = {
    id: uniqueUid(
      "ent",
      state.entries.map((item) => item.id)
    ),
    customerId: payload.customerId,
    type: payload.type,
    amount,
    due:
      payload.type === "invoice"
        ? Number(payload.due ?? amount)
        : payload.type === "due"
          ? amount
          : payload.type === "got"
            ? Math.max(0, Number(payload.due ?? 0))
            : undefined,
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
