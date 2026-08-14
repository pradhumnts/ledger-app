import {
  isQrThemeUnlocked,
  QR_THEMES,
} from "@/lib/qr-themes";
import {
  startOfDay,
  startOfMonth,
  uid,
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

export function saveState(state) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function customerBalance(entries, customerId) {
  return entries
    .filter((e) => e.customerId === customerId)
    .reduce((sum, e) => {
      if (e.type === "gave" || e.type === "invoice") return sum + Number(e.amount);
      if (e.type === "got") return sum - Number(e.amount);
      return sum;
    }, 0);
}

export function summarizeEntries(entries, now = new Date()) {
  const todayStart = startOfDay(now).getTime();
  const monthStart = startOfMonth(now).getTime();

  let todayIn = 0;
  let todayOut = 0;
  let monthIn = 0;
  let monthOut = 0;

  entries.forEach((entry) => {
    const t = new Date(entry.date).getTime();
    const amount = Number(entry.amount) || 0;
    const isIn = entry.type === "got";
    const isOut = entry.type === "gave" || entry.type === "invoice";

    if (t >= todayStart) {
      if (isIn) todayIn += amount;
      if (isOut) todayOut += amount;
    }
    if (t >= monthStart) {
      if (isIn) monthIn += amount;
      if (isOut) monthOut += amount;
    }
  });

  return {
    todayIn,
    todayOut,
    todayNet: todayIn - todayOut,
    monthIn,
    monthOut,
    monthNet: monthIn - monthOut,
  };
}

export function createCustomer(state, { name, phone }) {
  const customer = {
    id: uid("cus"),
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

export function createEntry(state, payload) {
  const entry = {
    id: uid("ent"),
    customerId: payload.customerId,
    type: payload.type,
    amount: Number(payload.amount),
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
