import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed "refresh this live site" requests from the MoneyKit admin, which
 * publishes straight to the database and can't revalidate our pages itself.
 * Both apps derive the key from the Supabase service role key, which is never
 * sent; the admin's `src/lib/site-refresh.ts` signs the same way.
 */
export const REFRESH_MAX_AGE_SECONDS = 5 * 60;

function refreshKey(serviceRole) {
  return serviceRole ? createHmac("sha256", serviceRole).update("moneykit-site-refresh").digest("hex") : "";
}

export function refreshSignature(siteId, expires, serviceRole) {
  const key = refreshKey(serviceRole);
  return key ? createHmac("sha256", key).update(`${siteId}.${expires}`).digest("base64url") : "";
}

/** Whether `{ siteId, expires, signature }` came from the admin and is still fresh. */
export function refreshAuthorized(input, serviceRole, now = Date.now()) {
  const siteId = String(input?.siteId || "");
  const expires = Number(input?.expires);
  const signature = String(input?.signature || "");
  if (!/^[0-9a-f-]{36}$/i.test(siteId) || !Number.isInteger(expires) || !signature) return false;
  const seconds = Math.floor(now / 1000);
  if (expires < seconds || expires > seconds + REFRESH_MAX_AGE_SECONDS) return false;
  const expected = Buffer.from(refreshSignature(siteId, expires, serviceRole));
  const given = Buffer.from(signature);
  return expected.length > 0 && expected.length === given.length && timingSafeEqual(expected, given);
}
