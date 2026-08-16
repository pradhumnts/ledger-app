import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";
import { markPlayThemePaid } from "@/lib/supabase/unlock-theme";
import {
  acknowledgePlayPurchase,
  getPlayProductPurchase,
  playBillingConfig,
} from "@/lib/play-developer-api";
import { themeFromPlaySku } from "@/lib/theme-catalog";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  const { configured } = playBillingConfig();
  if (!admin || !configured) {
    return NextResponse.json(
      { error: "Play Billing is not configured on the server." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to buy this theme." },
      { status: 401 }
    );
  }

  const sku = String(body.sku || "").trim();
  const purchaseToken = String(body.purchaseToken || "").trim();
  const theme = themeFromPlaySku(sku);
  if (!theme || !purchaseToken) {
    return NextResponse.json({ error: "That theme is not for sale." }, { status: 400 });
  }

  try {
    const purchase = await getPlayProductPurchase(sku, purchaseToken);
    // 0 = purchased, 1 = canceled, 2 = pending
    if (Number(purchase.purchaseState) !== 0) {
      return NextResponse.json(
        { error: "That Play purchase is not complete." },
        { status: 400 }
      );
    }

    if (Number(purchase.acknowledgementState) !== 1) {
      await acknowledgePlayPurchase(sku, purchaseToken);
    }

    const unlocked = await markPlayThemePaid(admin, {
      userId: user.id,
      kind: theme.kind,
      themeId: theme.themeId,
      sku,
      purchaseToken,
      orderId: purchase.orderId || "",
      amountPaise: theme.amountPaise,
    });
    return NextResponse.json({ ok: true, provider: "play", ...unlocked });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not confirm that Play purchase." },
      { status: 400 }
    );
  }
}
