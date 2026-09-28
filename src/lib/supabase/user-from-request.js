import { getSupabaseEnv } from "./env.js";

function tokenFromRequest(request, bodyToken = "") {
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const custom = request.headers.get("x-moneykit-access-token") || "";
  return String(bearer || custom || bodyToken || "").trim();
}

// Verified tokens, briefly, so an app screen's burst of requests costs one auth round trip.
const VERIFIED_TTL_MS = 60_000;
const VERIFIED_MAX = 500;
const verified = new Map();

function cachedUser(token) {
  const hit = verified.get(token);
  if (!hit) return null;
  if (hit.until < Date.now()) {
    verified.delete(token);
    return null;
  }
  return hit.user;
}

function remember(token, user) {
  if (verified.size >= VERIFIED_MAX) verified.delete(verified.keys().next().value);
  verified.set(token, { user, until: Date.now() + VERIFIED_TTL_MS });
}

export async function getUserFromRequest(request, bodyToken = "") {
  const token = tokenFromRequest(request, bodyToken);
  if (!token) return null;
  const hit = cachedUser(token);
  if (hit) return hit;

  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  if (!user?.id) return null;
  remember(token, user);
  return user;
}
