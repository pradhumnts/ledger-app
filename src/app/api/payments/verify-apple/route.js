import { NextResponse } from "next/server";
import { appStoreConfig, verifyAppleTransaction } from "@/lib/app-store-api";
import { notifyThemePurchase } from "@/lib/ops-email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";
import { markAppleThemePaid } from "@/lib/supabase/unlock-theme";
import { themeFromPlaySku } from "@/lib/theme-catalog";

export const runtime = "nodejs";

/** Unlock a theme bought in the iPhone app; theme SKUs match the Play ones. */
export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin || !appStoreConfig().configured) {
    return NextResponse.json(
      { error: "App Store purchases are not configured on the server." },
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
    return NextResponse.json({ error: "Sign in to buy this theme." }, { status: 401 });
  }

  const sku = String(body.sku || "").trim();
  const signedTransaction = String(body.signedTransaction || "").trim();
  const theme = themeFromPlaySku(sku);
  if (!theme || !signedTransaction) {
    return NextResponse.json({ error: "That theme is not for sale." }, { status: 400 });
  }

  let transaction;
  try {
    transaction = await verifyAppleTransaction(signedTransaction);
  } catch {
    return NextResponse.json(
      { error: "Could not confirm that App Store purchase." },
      { status: 400 }
    );
  }
  if (transaction.productId !== sku || transaction.revocationDate) {
    return NextResponse.json(
      { error: "That App Store purchase is not for this theme." },
      { status: 400 }
    );
  }

  try {
    const transactionId = String(transaction.originalTransactionId || transaction.transactionId);
    const unlocked = await markAppleThemePaid(admin, {
      userId: user.id,
      kind: theme.kind,
      themeId: theme.themeId,
      sku,
      transactionId,
      amountPaise: theme.amountPaise,
    });
    if (unlocked.newlyPaid) {
      await notifyThemePurchase({
        admin,
        userId: user.id,
        kind: theme.kind,
        themeId: theme.themeId,
        provider: "apple",
        amountPaise: theme.amountPaise,
        orderId: transactionId,
      }).catch(() => {});
    }
    return NextResponse.json({ ok: true, provider: "apple", ...unlocked });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not save that App Store purchase." },
      { status: 400 }
    );
  }
}
