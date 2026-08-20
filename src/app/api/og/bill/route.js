import { NextResponse } from "next/server";
import { decodePublicBill, isPublicBillId } from "@/lib/public-bill";
import { renderPublicBillOgImage } from "@/lib/public-bill-og";
import { loadPublicBill } from "@/lib/public-bills-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id") || "";
  const token = searchParams.get("d") || "";

  let snapshot = null;
  if (isPublicBillId(id)) {
    snapshot = await loadPublicBill(id);
  } else if (token) {
    snapshot = decodePublicBill(token);
  }

  try {
    return await renderPublicBillOgImage(snapshot);
  } catch {
    return NextResponse.json(
      { error: "Could not build preview." },
      { status: 500 }
    );
  }
}
