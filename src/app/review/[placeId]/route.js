import { reviewWriteUrl } from "@/lib/sites/google-places";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** moneykitapp.com/review/<place id> → the shop's "write a review" page on Google. */
export async function GET(request, { params }) {
  const { placeId } = await params;
  const location = reviewWriteUrl(placeId) || "https://moneykitapp.com";
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": "public, max-age=86400" },
  });
}
