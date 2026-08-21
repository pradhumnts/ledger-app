import { NextResponse } from "next/server";
import {
  decodePublicShare,
  isPublicBillId,
  snapshotPublicStatement,
} from "@/lib/public-bill";
import {
  renderPublicBillOgImage,
  sampleOgBillSnapshot,
} from "@/lib/public-bill-og";
import { loadPublicBill } from "@/lib/public-bills-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id") || "";
  const token = searchParams.get("d") || "";
  const sampleTheme = searchParams.get("sample") || "";

  let snapshot = null;
  if (sampleTheme) {
    snapshot = sampleOgBillSnapshot(
      sampleTheme === "1" ? "classic" : sampleTheme
    );
  } else if (isPublicBillId(id)) {
    snapshot = await loadPublicBill(id);
  } else if (token) {
    snapshot = decodePublicShare(token);
  } else if (searchParams.get("kind") === "statement") {
    snapshot = snapshotPublicStatement({
      kind: "statement",
      business: { name: searchParams.get("shop") || "Shop" },
      customer: { name: searchParams.get("customer") || "Customer" },
      entries: [],
      balance: 0,
    });
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
