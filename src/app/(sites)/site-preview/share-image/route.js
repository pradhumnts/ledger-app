import { DEMO_PARAMS, demoSite } from "@/lib/sites/demo-site";
import { withSiteDefaults } from "@/lib/sites/document";
import { renderShareImage } from "@/lib/sites/share-image";

export const runtime = "nodejs";

/** Link-preview card for a `/site-preview?template=&pack=&palette=` demo link. */
export async function GET(request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  for (const key of DEMO_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }
  const image = await renderShareImage(withSiteDefaults(demoSite(params)), {
    origin: url.origin,
  });
  return new Response(image, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
