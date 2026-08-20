import { NextResponse } from "next/server";
import { loadPublicBill } from "@/lib/public-bills-db";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const snapshot = await loadPublicBill(id);
  if (!snapshot) {
    return NextResponse.json({ error: "Bill not found." }, { status: 404 });
  }
  return NextResponse.json(
    { snapshot },
    { headers: { "Cache-Control": "no-store" } }
  );
}
