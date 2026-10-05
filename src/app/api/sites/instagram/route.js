import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import {
  InstagramError,
  authorizeUrl,
  instagramConfigured,
  latestPosts,
  loadConnection,
  profileUrl,
  removeConnection,
} from "@/lib/sites/instagram";
import { tierAtLeast } from "@/lib/sites/plan-tiers";
import { siteAccess } from "@/lib/sites/subscription";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/**
 * The shop's Instagram account (Standard plan).
 * `{ action: "status" }` → `{ connected, username, profileUrl, posts }`;
 * `{ action: "start", returnTo }` → `{ url }` (Instagram's login page);
 * `{ action: "disconnect" }` → `{ connected: false }`.
 */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  if (body.action === "disconnect") {
    await removeConnection(admin, user.id);
    return corsJson(request, { connected: false });
  }
  if (!instagramConfigured()) {
    return corsJson(request, { error: "notConfigured" }, { status: 503 });
  }
  const access = await siteAccess(admin, user);
  if (!access.active || !tierAtLeast(access.tier, "standard")) {
    return corsJson(request, { error: "tier" }, { status: 403 });
  }

  if (body.action === "start") {
    return corsJson(request, { url: authorizeUrl(user.id, body.returnTo) });
  }
  if (body.action !== "status") {
    return corsJson(request, { error: "action" }, { status: 400 });
  }

  const connection = await loadConnection(admin, user.id);
  if (!connection) return corsJson(request, { connected: false });
  const account = {
    connected: true,
    username: connection.username,
    profileUrl: profileUrl(connection.username),
  };
  try {
    const posts = await latestPosts(connection.access_token, { fresh: true });
    return corsJson(request, { ...account, posts });
  } catch (error) {
    if (error instanceof InstagramError && error.code === "expired") {
      await removeConnection(admin, user.id);
      return corsJson(request, { connected: false, expired: true });
    }
    return corsJson(request, { ...account, posts: [], postsError: true });
  }
}
