/**
 * Google Places API (New). Standard plan: shops find their own listing, and
 * their live site shows its rating plus the (at most 5) reviews Google returns.
 * Any plan: live search to pin the website's location.
 * Needs GOOGLE_PLACES_API_KEY with "Places API (New)" enabled.
 */
import { cleanPlaceId } from "./links.js";

const API = "https://places.googleapis.com/v1";

/** Live sites re-ask Google at most this often per listing. */
export const REVIEWS_REVALIDATE_SECONDS = 6 * 60 * 60;

export class PlacesError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function apiKey() {
  return String(process.env.GOOGLE_PLACES_API_KEY || "").trim();
}

export function placesConfigured() {
  return Boolean(apiKey());
}

/** Google's "write a review" page for a listing. */
export function reviewWriteUrl(placeId) {
  const id = cleanPlaceId(placeId);
  return id ? `https://search.google.com/local/writereview?placeid=${id}` : "";
}

async function call(path, { method = "GET", fields, body, next } = {}) {
  const key = apiKey();
  if (!key) throw new PlacesError("notConfigured");
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fields,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...(next ? { next } : { cache: "no-store" }),
  });
  if (!response.ok) throw new PlacesError(response.status === 404 ? "notFound" : "google");
  return response.json();
}

/** Listings matching a shop's name and area, for it to pick its own. */
export async function searchPlaces(query) {
  const textQuery = String(query || "").trim().slice(0, 120);
  if (textQuery.length < 3) return [];
  const data = await call("/places:searchText", {
    method: "POST",
    fields: "places.id,places.displayName,places.formattedAddress",
    body: { textQuery, regionCode: "IN", languageCode: "en", pageSize: 6 },
  });
  return (data.places || [])
    .map((place) => ({
      id: cleanPlaceId(place.id),
      name: String(place.displayName?.text || "").slice(0, 120),
      address: String(place.formattedAddress || "").slice(0, 200),
    }))
    .filter((place) => place.id && place.name);
}

const SESSION_TOKEN = /^[A-Za-z0-9_-]{8,36}$/;

/** Google bills one typing session (suggestions + the pick) as a single lookup when the app sends the same token. */
function sessionToken(value) {
  const token = String(value || "");
  return SESSION_TOKEN.test(token) ? token : "";
}

/** As-you-type suggestions for the website's location, in India. */
export async function suggestPlaces(input, token) {
  const text = String(input || "").trim().slice(0, 120);
  if (text.length < 3) return [];
  const session = sessionToken(token);
  const data = await call("/places:autocomplete", {
    method: "POST",
    fields:
      "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
    body: {
      input: text,
      includedRegionCodes: ["in"],
      languageCode: "en",
      ...(session ? { sessionToken: session } : {}),
    },
  });
  return (data.suggestions || [])
    .map((suggestion) => suggestion.placePrediction)
    .filter(Boolean)
    .map((place) => ({
      id: cleanPlaceId(place.placeId),
      name: String(place.structuredFormat?.mainText?.text || place.text?.text || "").slice(0, 120),
      address: String(place.structuredFormat?.secondaryText?.text || "").slice(0, 200),
    }))
    .filter((place) => place.id && place.name)
    .slice(0, 6);
}

/** A picked suggestion as `{ placeId, label, lat, lng }`; ends the typing session. */
export async function placeLocation(placeId, token) {
  const id = cleanPlaceId(placeId);
  if (!id) throw new PlacesError("notFound");
  const session = sessionToken(token);
  const data = await call(`/places/${id}${session ? `?sessionToken=${session}` : ""}`, {
    fields: "id,displayName,formattedAddress,location",
  });
  const lat = Number(data.location?.latitude);
  const lng = Number(data.location?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new PlacesError("notFound");
  const name = String(data.displayName?.text || "").trim();
  const address = String(data.formattedAddress || "").trim();
  const repeatsName = address.toLowerCase().startsWith(`${name.toLowerCase()},`);
  const label = !name || !address || repeatsName ? address || name : `${name}, ${address}`;
  return { placeId: id, label: label.slice(0, 200), lat, lng };
}

function fromReview(review) {
  const author = review.authorAttribution || {};
  const text = review.originalText?.text || review.text?.text || "";
  return {
    author: String(author.displayName || "").slice(0, 80),
    authorUrl: String(author.uri || ""),
    photo: String(author.photoUri || ""),
    rating: Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0))),
    text: String(text).slice(0, 600),
    when: String(review.relativePublishTimeDescription || ""),
  };
}

/**
 * Rating, review count and up to 5 reviews (Google's pick, most relevant first).
 * `fresh` skips the shared cache, for the shop's own preview in the app.
 */
export async function placeReviews(placeId, { fresh = false } = {}) {
  const id = cleanPlaceId(placeId);
  if (!id) throw new PlacesError("notFound");
  const data = await call(`/places/${id}`, {
    fields: "displayName,rating,userRatingCount,reviews,googleMapsUri",
    next: fresh ? undefined : { revalidate: REVIEWS_REVALIDATE_SECONDS },
  });
  return {
    placeId: id,
    name: String(data.displayName?.text || ""),
    rating: Number(data.rating) || 0,
    count: Number(data.userRatingCount) || 0,
    mapsUrl: String(data.googleMapsUri || ""),
    reviewUrl: reviewWriteUrl(id),
    reviews: (data.reviews || []).slice(0, 5).map(fromReview).filter((review) => review.author),
  };
}
