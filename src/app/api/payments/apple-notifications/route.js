import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { appleToken, appStoreConfig, verifyAppleNotification } from "@/lib/app-store-api";
import { voidRewardsForToken } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { appleSitePlan } from "@/lib/sites/apple-plans";
import { loadSiteForUser } from "@/lib/sites/store";
import { claimAppleSubscription, refreshSubscription } from "@/lib/sites/subscription";

export const runtime = "nodejs";

const REFUND_TYPES = new Set(["REFUND", "REVOKE"]);

/**
 * App Store Server Notifications V2. Apple signs every payload, so no shared
 * secret; anything that fails verification is rejected. Website plans are
 * re-read from Apple (renewals, cancellations, refunds); a plan we have never
 * seen is claimed for the shop named in its appAccountToken.
 */
export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin || !appStoreConfig().configured) {
    return NextResponse.json({ error: "notConfigured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  let decoded;
  try {
    decoded = await verifyAppleNotification(body?.signedPayload);
  } catch {
    return NextResponse.json({ error: "notVerified" }, { status: 400 });
  }

  const { notification, transaction, environment } = decoded;
  if (!transaction?.originalTransactionId || !appleSitePlan(transaction.productId)) {
    return NextResponse.json({ ok: true });
  }

  const purchaseToken = appleToken(transaction.originalTransactionId);
  if (REFUND_TYPES.has(notification.notificationType)) {
    await voidRewardsForToken(admin, purchaseToken, "refunded").catch(() => {});
  }

  const { data: row } = await admin
    .from("site_subscriptions")
    .select("*")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();

  const saved = row
    ? await refreshSubscription(admin, row)
    : await claimAppleSubscription(admin, {
        originalTransactionId: transaction.originalTransactionId,
        environment,
      });
  if (!saved) return NextResponse.json({ ok: true });

  const site = await loadSiteForUser(admin, saved.user_id);
  if (site?.slug) revalidatePath(`/sites/${site.slug}`);
  return NextResponse.json({ ok: true });
}
