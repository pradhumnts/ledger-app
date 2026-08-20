import { NextResponse } from "next/server";
import { savePublicBill } from "@/lib/public-bills-db";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";

export const runtime = "nodejs";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  const result = await savePublicBill({
    snapshot: body,
    userId: user?.id || null,
  });

  if (result.id) {
    return NextResponse.json({ id: result.id });
  }

  const message =
    result.error === "invalid"
      ? "That bill cannot be shared."
      : result.error === "unavailable"
        ? "Public bills are not configured on the server."
        : "Could not create a public bill link.";

  return NextResponse.json(
    { error: message },
    { status: result.status || 500 }
  );
}
