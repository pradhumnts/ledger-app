import { adminWebManifest, manifestResponse } from "@/lib/web-manifests";

export function GET() {
  return manifestResponse(adminWebManifest());
}
