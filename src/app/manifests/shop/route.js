import { manifestResponse, shopWebManifest } from "@/lib/web-manifests";

export function GET() {
  return manifestResponse(shopWebManifest());
}
