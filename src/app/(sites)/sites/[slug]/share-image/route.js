import { withSiteDefaults } from "@/lib/sites/document";
import { renderShareImage } from "@/lib/sites/share-image";
import { loadLiveSite } from "@/lib/sites/store";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { slug } = await params;
  const site = await loadLiveSite(slug);
  if (!site) return new Response("Not found", { status: 404 });

  const image = await renderShareImage(withSiteDefaults(site.published), {
    origin: new URL(request.url).origin,
  });
  // Metadata links here with ?v=<publish time>, so a new publish gets a fresh URL.
  return new Response(image, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
