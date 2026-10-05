/**
 * Instagram API with Instagram Login for the Standard plan: a shop connects its
 * Instagram professional (Business / Creator) account from the app, and its
 * live site shows the latest posts. Needs INSTAGRAM_APP_ID and
 * INSTAGRAM_APP_SECRET (the Instagram app ID / secret from the Meta dashboard),
 * with INSTAGRAM_REDIRECT_URI registered as a valid OAuth redirect URI there.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { APP_SITE_URL } from "../branding.js";

const GRAPH = "https://graph.instagram.com";
const SCOPE = "instagram_business_basic";
const STATE_TTL_MS = 15 * 60 * 1000;
/** Where the app may ask to be sent back to after Instagram: its own scheme, or Expo Go in development. */
const RETURN_URL = /^(moneykit|exp|exps):\/\/[A-Za-z0-9._~:/?=&%-]{0,200}$/;

/** Live sites re-ask Instagram for posts at most this often. */
export const POSTS_REVALIDATE_SECONDS = 60 * 60;
export const SITE_POSTS = 9;

export class InstagramError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function appId() {
  return String(process.env.INSTAGRAM_APP_ID || "").trim();
}

function appSecret() {
  return String(process.env.INSTAGRAM_APP_SECRET || "").trim();
}

export function instagramConfigured() {
  return Boolean(appId() && appSecret());
}

export function redirectUri() {
  return (
    String(process.env.INSTAGRAM_REDIRECT_URI || "").trim() ||
    `${APP_SITE_URL}/api/sites/instagram/callback`
  );
}

function sign(value) {
  return createHmac("sha256", appSecret()).update(value).digest("base64url");
}

function sameSignature(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

export function cleanReturnUrl(value) {
  const url = String(value || "").trim();
  return RETURN_URL.test(url) ? url : "";
}

/** Signed `state` that ties Instagram's redirect back to the shop that started it. */
function makeState(userId, returnTo) {
  const payload = Buffer.from(
    JSON.stringify({ u: userId, r: cleanReturnUrl(returnTo), e: Date.now() + STATE_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** `{ userId, returnTo }` from a state we issued, or null when forged or stale. */
export function readState(state) {
  const [payload, signature] = String(state || "").split(".");
  if (!payload || !signature || !appSecret() || !sameSignature(sign(payload), signature)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.u || !(Number(data.e) > Date.now())) return null;
    return { userId: String(data.u), returnTo: cleanReturnUrl(data.r) };
  } catch {
    return null;
  }
}

/** Instagram's login page for this shop. */
export function authorizeUrl(userId, returnTo) {
  const params = new URLSearchParams({
    client_id: appId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    state: makeState(userId, returnTo),
    enable_fb_login: "0",
    force_reauth: "true",
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (response.ok && !data.error) return data;
  throw new InstagramError(data.error?.code === 190 ? "expired" : "instagram");
}

async function graph(path, params, { next } = {}) {
  const response = await fetch(`${GRAPH}${path}?${new URLSearchParams(params)}`, {
    ...(next ? { next } : { cache: "no-store" }),
  });
  return readJson(response);
}

function expiresAt(seconds) {
  const ttl = Number(seconds) > 0 ? Number(seconds) : 60 * 24 * 60 * 60;
  return new Date(Date.now() + ttl * 1000).toISOString();
}

/**
 * Trade the code from Instagram's redirect for a long-lived token and the
 * account's ids and username.
 */
export async function connectWithCode(code) {
  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId(),
      client_secret: appSecret(),
      grant_type: "authorization_code",
      redirect_uri: redirectUri(),
      code: String(code || "").replace(/#_$/, ""),
    }),
    cache: "no-store",
  });
  const raw = await readJson(response);
  const short = Array.isArray(raw.data) ? raw.data[0] || {} : raw;
  if (!short.access_token) throw new InstagramError("instagram");

  const long = await graph("/access_token", {
    grant_type: "ig_exchange_token",
    client_secret: appSecret(),
    access_token: short.access_token,
  });
  const token = long.access_token || short.access_token;
  const me = await graph("/me", { fields: "user_id,username", access_token: token });
  return {
    ig_user_id: String(short.user_id || me.id || ""),
    ig_account_id: String(me.user_id || ""),
    username: String(me.username || "").slice(0, 60),
    access_token: token,
    expires_at: expiresAt(long.expires_in),
  };
}

/** A fresh 60-day token; Instagram allows it once the current one is a day old. */
export async function refreshToken(token) {
  const data = await graph("/refresh_access_token", {
    grant_type: "ig_refresh_token",
    access_token: token,
  });
  if (!data.access_token) throw new InstagramError("instagram");
  return { access_token: data.access_token, expires_at: expiresAt(data.expires_in) };
}

function fromMedia(item) {
  const image = item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;
  return {
    id: String(item.id || ""),
    image: String(image || ""),
    url: String(item.permalink || ""),
    caption: String(item.caption || "").slice(0, 300),
    type: item.media_type === "VIDEO" ? "video" : item.media_type === "CAROUSEL_ALBUM" ? "album" : "image",
  };
}

/**
 * The account's latest posts with a picture. `fresh` skips the shared cache,
 * for the shop's own preview in the app.
 */
export async function latestPosts(token, { limit = SITE_POSTS, fresh = false } = {}) {
  const data = await graph(
    "/me/media",
    {
      fields: "id,media_type,media_url,thumbnail_url,permalink,caption",
      limit: String(limit + 3),
      access_token: token,
    },
    { next: fresh ? undefined : { revalidate: POSTS_REVALIDATE_SECONDS } }
  );
  return (data.data || [])
    .map(fromMedia)
    .filter((post) => post.id && post.image && post.url)
    .slice(0, limit);
}

export function profileUrl(username) {
  return username ? `https://www.instagram.com/${encodeURIComponent(username)}/` : "";
}

export async function loadConnection(admin, userId) {
  const { data } = await admin
    .from("site_instagram")
    .select("user_id, ig_user_id, ig_account_id, username, access_token, expires_at, refreshed_at")
    .eq("user_id", userId)
    .maybeSingle();
  return data || null;
}

export async function saveConnection(admin, userId, account) {
  const now = new Date().toISOString();
  const { error } = await admin
    .from("site_instagram")
    .upsert({ user_id: userId, ...account, refreshed_at: now, connected_at: now }, { onConflict: "user_id" });
  if (error) throw new InstagramError("save");
}

export async function removeConnection(admin, userId) {
  await admin.from("site_instagram").delete().eq("user_id", userId);
}

/** Meta's deauthorize / data deletion callbacks name the account, not the shop. */
export async function removeAccount(admin, igUserId) {
  const id = String(igUserId || "").replace(/\D/g, "");
  if (!id) return;
  await admin.from("site_instagram").delete().or(`ig_user_id.eq.${id},ig_account_id.eq.${id}`);
}

/** The JSON inside Meta's `signed_request`, or null when the signature doesn't match. */
export function readSignedRequest(value) {
  const [signature, payload] = String(value || "").split(".");
  if (!signature || !payload || !appSecret() || !sameSignature(sign(payload), signature)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
