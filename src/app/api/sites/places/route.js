import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import {
  PlacesError,
  placeLocation,
  placesConfigured,
  suggestPlaces,
} from "@/lib/sites/google-places";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/**
 * Live search for the website's location (any plan).
 * `{ action: "suggest", input, sessionToken }` → `{ places }`;
 * `{ action: "pick", placeId, sessionToken }` → `{ location: { placeId, label, lat, lng } }`.
 */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { body } = ctx;

  if (!placesConfigured()) {
    return corsJson(request, { error: "notConfigured" }, { status: 503 });
  }

  try {
    if (body.action === "suggest") {
      return corsJson(request, { places: await suggestPlaces(body.input, body.sessionToken) });
    }
    if (body.action === "pick") {
      return corsJson(request, { location: await placeLocation(body.placeId, body.sessionToken) });
    }
    return corsJson(request, { error: "action" }, { status: 400 });
  } catch (error) {
    const code = error instanceof PlacesError ? error.code : "google";
    return corsJson(request, { error: code }, { status: code === "notFound" ? 404 : 502 });
  }
}
