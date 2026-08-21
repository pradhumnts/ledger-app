import { APP_SITE_URL } from "@/lib/branding";

const TYPES = new Set(["invoice", "got", "due", "gave"]);
const MAX_TEXT = {
  name: 80,
  phone: 20,
  address: 160,
  upi: 80,
  note: 400,
  id: 64,
  theme: 40,
};

/** Crockford-ish: no 0/O/1/I/l so ids stay easy to read aloud. */
export const PUBLIC_BILL_ID_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
export const PUBLIC_BILL_ID_PATTERN = new RegExp(
  `^[${PUBLIC_BILL_ID_ALPHABET}]{8}$`
);

export function isPublicBillId(id) {
  return PUBLIC_BILL_ID_PATTERN.test(String(id || ""));
}

export function randomPublicBillId() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += PUBLIC_BILL_ID_ALPHABET[bytes[i] % PUBLIC_BILL_ID_ALPHABET.length];
  }
  return out;
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function toBase64Url(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token) {
  const b64 = String(token || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodePublicBill({ entry, customer, business, themeId }) {
  const payload = {
    v: 1,
    sn: clip(business?.name, MAX_TEXT.name),
    sp: clip(business?.phone, MAX_TEXT.phone),
    sa: clip(business?.address, MAX_TEXT.address),
    su: clip(business?.upiId, MAX_TEXT.upi),
    cn: clip(customer?.name, MAX_TEXT.name),
    cp: clip(customer?.phone, MAX_TEXT.phone),
    t: TYPES.has(entry?.type) ? entry.type : "invoice",
    a: Number(entry?.amount) || 0,
    d: Number(entry?.due) || 0,
    dt: String(entry?.date || new Date().toISOString()).slice(0, 40),
    n: clip(entry?.description, MAX_TEXT.note),
    i: clip(entry?.id, MAX_TEXT.id),
    th: clip(themeId, MAX_TEXT.theme),
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function clipLogo(logo) {
  const value = String(logo || "").trim();
  if (!value) return "";
  if (
    (value.startsWith("data:image/jpeg") ||
      value.startsWith("data:image/jpg") ||
      value.startsWith("data:image/png")) &&
    value.length <= 160000
  ) {
    return value;
  }
  return "";
}

/** Normalized snapshot stored in the cloud (and accepted by decode round-trip). */
export function snapshotPublicBill(input) {
  if (!input || typeof input !== "object") return null;
  const snapshot = decodePublicBill(encodePublicBill(input));
  if (!snapshot) return null;
  snapshot.business.logo = clipLogo(input.business?.logo);
  return snapshot;
}

export function decodePublicBill(token) {
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(token)));
    if (!data || data.v !== 1) return null;
    const amount = Number(data.a);
    if (!Number.isFinite(amount)) return null;
    const shopName = clip(data.sn, MAX_TEXT.name);
    const customerName = clip(data.cn, MAX_TEXT.name);
    if (!shopName && !customerName) return null;

    return {
      entry: {
        id: clip(data.i, MAX_TEXT.id) || "public",
        type: TYPES.has(data.t) ? data.t : "invoice",
        amount,
        due: Number(data.d) || 0,
        date: clip(data.dt, 40) || new Date().toISOString(),
        description: clip(data.n, MAX_TEXT.note),
      },
      customer: {
        name: customerName || "Customer",
        phone: clip(data.cp, MAX_TEXT.phone),
      },
      business: {
        name: shopName || "Shop",
        phone: clip(data.sp, MAX_TEXT.phone),
        address: clip(data.sa, MAX_TEXT.address),
        upiId: clip(data.su, MAX_TEXT.upi),
      },
      themeId: clip(data.th, MAX_TEXT.theme),
    };
  } catch {
    return null;
  }
}

export function buildLegacyPublicBillUrl({
  entry,
  customer,
  business,
  themeId,
}) {
  const token = encodePublicBill({ entry, customer, business, themeId });
  return `${APP_SITE_URL}/b?d=${token}`;
}

export function payAmountForPublicBill(entry) {
  if (!entry) return undefined;
  const due = Number(entry.due);
  if (Number.isFinite(due) && due > 0) return due;
  if (entry.type === "got") return undefined;
  const amount = Number(entry.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

const MAX_STATEMENT_ENTRIES = 20;
const MAX_URL_NOTE = 80;

export function isPublicStatement(snapshot) {
  return snapshot?.kind === "statement";
}

function clipStatementEntry(entry, noteMax = MAX_TEXT.note) {
  const amount = Number(entry?.amount);
  return {
    id: clip(entry?.id, MAX_TEXT.id) || "public",
    type: TYPES.has(entry?.type) ? entry.type : "invoice",
    amount: Number.isFinite(amount) ? amount : 0,
    due: Number(entry?.due) || 0,
    date: String(entry?.date || new Date().toISOString()).slice(0, 40),
    description: clip(entry?.description, noteMax),
  };
}

export function snapshotPublicStatement(input) {
  if (!input || typeof input !== "object") return null;
  const shopName = clip(input.business?.name, MAX_TEXT.name);
  const customerName = clip(input.customer?.name, MAX_TEXT.name);
  if (!shopName && !customerName) return null;

  const entries = Array.isArray(input.entries) ? input.entries : [];
  const recent = [...entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_STATEMENT_ENTRIES)
    .map((entry) => clipStatementEntry(entry));

  const balance = Number(input.balance);
  const billed = Number(input.billed);

  return {
    kind: "statement",
    customer: {
      id: clip(input.customer?.id, MAX_TEXT.id),
      name: customerName || "Customer",
      phone: clip(input.customer?.phone, MAX_TEXT.phone),
    },
    business: {
      name: shopName || "Shop",
      phone: clip(input.business?.phone, MAX_TEXT.phone),
      address: clip(input.business?.address, MAX_TEXT.address),
      upiId: clip(input.business?.upiId, MAX_TEXT.upi),
      logo: clipLogo(input.business?.logo),
    },
    balance: Number.isFinite(balance) ? balance : 0,
    billed: Number.isFinite(billed) ? billed : 0,
    entries: recent,
    themeId: clip(input.themeId, MAX_TEXT.theme),
  };
}

export function snapshotPublicShare(input) {
  if (!input || typeof input !== "object") return null;
  if (input.kind === "statement" || (Array.isArray(input.entries) && !input.entry)) {
    return snapshotPublicStatement(input);
  }
  return snapshotPublicBill(input);
}

export function encodePublicStatement(input) {
  const snapshot = snapshotPublicStatement(input);
  if (!snapshot) return "";
  const payload = {
    v: 2,
    k: "s",
    sn: snapshot.business.name,
    sp: snapshot.business.phone,
    sa: snapshot.business.address,
    su: snapshot.business.upiId,
    cn: snapshot.customer.name,
    cp: snapshot.customer.phone,
    ci: snapshot.customer.id,
    b: snapshot.balance,
    bl: snapshot.billed,
    th: snapshot.themeId,
    e: snapshot.entries.map((entry) => ({
      t: entry.type,
      a: entry.amount,
      d: entry.due,
      dt: entry.date,
      n: clip(entry.description, MAX_URL_NOTE),
      i: entry.id,
    })),
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodePublicShare(token) {
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(token)));
    if (!data || typeof data !== "object") return null;
    if (data.v === 2 && data.k === "s") {
      return snapshotPublicStatement({
        kind: "statement",
        business: {
          name: data.sn,
          phone: data.sp,
          address: data.sa,
          upiId: data.su,
        },
        customer: {
          id: data.ci,
          name: data.cn,
          phone: data.cp,
        },
        balance: data.b,
        billed: data.bl,
        themeId: data.th,
        entries: Array.isArray(data.e)
          ? data.e.map((row) => ({
              type: row?.t,
              amount: row?.a,
              due: row?.d,
              date: row?.dt,
              description: row?.n,
              id: row?.i,
            }))
          : [],
      });
    }
    if (data.v !== 1) return null;
    return decodePublicBill(token);
  } catch {
    return null;
  }
}

export function buildLegacyPublicStatementUrl(args) {
  const token = encodePublicStatement(args);
  if (!token) return `${APP_SITE_URL}/b`;
  return `${APP_SITE_URL}/b?d=${token}`;
}

export function buildLegacyPublicShareUrl(args) {
  const snapshot = snapshotPublicShare(args);
  if (isPublicStatement(snapshot)) {
    return buildLegacyPublicStatementUrl(snapshot);
  }
  return buildLegacyPublicBillUrl(args);
}
