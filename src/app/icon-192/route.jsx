import { ImageResponse } from "next/og";
import { PwaIconMark } from "@/lib/pwa-icon";

export async function GET() {
  return new ImageResponse(<PwaIconMark />, {
    width: 192,
    height: 192,
  });
}
