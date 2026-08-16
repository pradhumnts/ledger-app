import { NextResponse } from "next/server";
import { PLAY_PACKAGE_NAME } from "@/lib/branding";

export function GET() {
  const packageName =
    process.env.NEXT_PUBLIC_PLAY_PACKAGE_NAME || PLAY_PACKAGE_NAME;
  const fingerprints = String(process.env.PLAY_SHA256_CERT_FINGERPRINTS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!fingerprints.length) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageName,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
