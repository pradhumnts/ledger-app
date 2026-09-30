import { createHmac, timingSafeEqual } from "node:crypto";

export const PARTNER_COOKIE = "mk_partner";
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const OTP_TICKET_SECONDS = 10 * 60;

function secret() {
  const own = process.env.PARTNER_SESSION_SECRET || "";
  if (own) return own;
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return base ? createHmac("sha256", base).update("moneykit-partner-session").digest("hex") : "";
}

function mac(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

function open(token) {
  if (!secret()) return null;
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(mac(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

function expiresIn(seconds) {
  return Math.floor(Date.now() / 1000) + seconds;
}

export function partnerSessionToken(affiliateId) {
  return sign({ a: affiliateId, exp: expiresIn(SESSION_SECONDS) });
}

/** The signed-in affiliate's id, or "". */
export function readPartnerSession(token) {
  return open(token)?.a || "";
}

export function partnerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

/** Binds an MSG91 request id to the phone it was sent to, so a code can't sign in another number. */
export function otpTicket(phone, reqId) {
  return sign({ p: phone, r: reqId, exp: expiresIn(OTP_TICKET_SECONDS) });
}

export function checkOtpTicket(ticket, phone, reqId) {
  const payload = open(ticket);
  return Boolean(payload && payload.p === phone && payload.r === reqId);
}
