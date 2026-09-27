import { publicCatalog } from "@/lib/sites/catalog";
import { isFreePublish, sitesDomain } from "@/lib/sites/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      ...publicCatalog(),
      previewPath: "/site-preview",
      sitesDomain: sitesDomain(),
      freePublish: isFreePublish(),
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
