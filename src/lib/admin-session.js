const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "mk_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function getSecret() {
  return String(process.env.ADMIN_SESSION_SECRET || "").trim();
}

function getCredentials() {
  const email = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!email || !password) return null;
  return { email, password };
}

function toBase64Url(bytes) {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 1) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function safeEqualString(a, b) {
  const left = String(a);
  const right = String(b);
  const len = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let i = 0; i < len; i += 1) {
    mismatch |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload) {
  const secret = getSecret();
  if (!secret) return null;
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(signature);
}

export function adminCredentialsConfigured() {
  return Boolean(getCredentials() && getSecret());
}

export function verifyAdminCredentials(email, password) {
  const creds = getCredentials();
  if (!creds || !getSecret()) return false;
  const emailOk = safeEqualString(
    String(email || "")
      .trim()
      .toLowerCase(),
    creds.email
  );
  const passOk = safeEqualString(String(password || ""), creds.password);
  return emailOk && passOk;
}

export async function createAdminSessionToken(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(8)));
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ email: normalized, exp, nonce }))
  );
  const sig = await sign(payload);
  if (!sig) return null;
  return `${payload}.${sig}`;
}

export async function parseAdminSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await sign(payload);
  if (!expected || !safeEqualString(sig, expected)) return null;
  try {
    const json = new TextDecoder().decode(fromBase64Url(payload));
    const data = JSON.parse(json);
    if (!data?.email || !data?.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSessionFromRequest(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return parseAdminSessionToken(token);
}

export function adminSessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
