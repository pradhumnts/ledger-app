import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { connectWithCode, readState, saveConnection } from "@/lib/sites/instagram";
import { tierAtLeast } from "@/lib/sites/plan-tiers";
import { ownerSiteTier } from "@/lib/sites/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(returnTo, result) {
  if (!returnTo) {
    return new NextResponse(
      result === "connected"
        ? "Instagram connected. You can go back to the MoneyKit app."
        : "Instagram was not connected. Go back to the MoneyKit app and try again.",
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }
  const url = `${returnTo}${returnTo.includes("?") ? "&" : "?"}instagram=${result}`;
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}

/** Instagram sends the shop here after it logs in (or cancels); we save the account and return to the app. */
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const state = readState(params.get("state"));
  if (!state) return back("", "failed");
  if (params.get("error") || !params.get("code")) return back(state.returnTo, "cancelled");

  const admin = getSupabaseAdmin();
  if (!admin) return back(state.returnTo, "failed");
  try {
    if (!tierAtLeast(await ownerSiteTier(admin, state.userId), "standard")) {
      return back(state.returnTo, "failed");
    }
    const account = await connectWithCode(params.get("code"));
    await saveConnection(admin, state.userId, account);
    return back(state.returnTo, "connected");
  } catch {
    return back(state.returnTo, "failed");
  }
}
