import { digitsOnly, phoneKey } from "@/lib/validation";

const STORAGE_KEY = "moneykit-device-contacts-v1";

export function isContactPickerSupported() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.contacts?.select === "function"
  );
}

export function loadDeviceContacts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.name) : [];
  } catch {
    return [];
  }
}

export function saveDeviceContacts(contacts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // Quota / private mode.
  }
}

function firstNameFromContact(contact) {
  const names = [].concat(contact?.name || []).filter(Boolean);
  return String(names[0] || "").trim();
}

function phonesFromContact(contact) {
  return []
    .concat(contact?.tel || [])
    .map((value) => phoneKey(value))
    .filter((value) => value.length >= 10);
}

export function normalizePickedContacts(rows = []) {
  const byPhone = new Map();
  rows.forEach((row) => {
    const name = firstNameFromContact(row);
    const phones = phonesFromContact(row);
    if (!name && phones.length === 0) return;
    const phone = phones[0] || "";
    const key = phone || name.toLowerCase();
    if (byPhone.has(key)) return;
    byPhone.set(key, {
      id: `dc_${key}`,
      name: name || phone,
      phone,
    });
  });
  return [...byPhone.values()];
}

export function mergeDeviceContacts(existing, incoming) {
  const byPhone = new Map();
  [...existing, ...incoming].forEach((item) => {
    const key = phoneKey(item.phone) || String(item.name || "").toLowerCase();
    if (!key) return;
    if (!byPhone.has(key)) byPhone.set(key, item);
  });
  return [...byPhone.values()];
}

export async function pickDeviceContacts() {
  if (!isContactPickerSupported()) {
    throw new Error("unsupported");
  }
  let properties = ["name", "tel"];
  try {
    const available = await navigator.contacts.getProperties?.();
    if (Array.isArray(available) && available.length) {
      properties = properties.filter((item) => available.includes(item));
    }
  } catch {
    // Older pickers only accept the default name/tel set.
  }
  if (!properties.length) properties = ["name", "tel"];
  const rows = await navigator.contacts.select(properties, { multiple: true });
  return normalizePickedContacts(rows);
}

export function searchBillPeople(customers, contacts, query, limit = 8) {
  const q = query.trim().toLowerCase();
  const digits = digitsOnly(query);
  if (!q) return [];

  const usedPhones = new Set(
    (customers || []).map((item) => phoneKey(item.phone)).filter(Boolean)
  );

  const customerHits = (customers || [])
    .filter((item) => {
      if (item.name.toLowerCase().includes(q)) return true;
      return digits.length >= 3 && phoneKey(item.phone).includes(digits);
    })
    .map((item) => ({ ...item, source: "customer" }));

  const contactHits = (contacts || [])
    .filter((item) => {
      if (usedPhones.has(phoneKey(item.phone))) return false;
      if (item.name.toLowerCase().includes(q)) return true;
      return digits.length >= 3 && phoneKey(item.phone).includes(digits);
    })
    .map((item) => ({ ...item, source: "contact" }));

  return [...customerHits, ...contactHits].slice(0, limit);
}
