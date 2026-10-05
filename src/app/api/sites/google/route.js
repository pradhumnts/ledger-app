import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import {
  PlacesError,
  placeReviews,
  placesConfigured,
  searchPlaces,
} from "@/lib/sites/google-places";
import { tierAtLeast } from "@/lib/sites/plan-tiers";
import { siteAccess } from "@/lib/sites/subscription";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/**
 * The shop's Google listing (Standard plan).
 * `{ action: "search", query }` → `{ places }`; `{ action: "place", placeId }` → `{ place }`.
 */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  if (!placesConfigured()) {
    return corsJson(request, { error: "notConfigured" }, { status: 503 });
  }
  const access = await siteAccess(admin, user);
  if (!access.active || !tierAtLeast(access.tier, "standard")) {
    return corsJson(request, { error: "tier" }, { status: 403 });
  }

  try {
    if (body.action === "search") {
      return corsJson(request, { places: await searchPlaces(body.query) });
    }
    if (body.action === "place") {
      return corsJson(request, { place: await placeReviews(body.placeId, { fresh: true }) });
    }
    return corsJson(request, { error: "action" }, { status: 400 });
  } catch (error) {
    const code = error instanceof PlacesError ? error.code : "google";
    return corsJson(request, { error: code }, { status: code === "notFound" ? 404 : 502 });
  }
}
