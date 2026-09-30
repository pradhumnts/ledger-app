import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { voidRewardsForToken } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { loadSiteForUser } from "@/lib/sites/store";
import { claimPlaySubscription, refreshPlaySubscription } from "@/lib/sites/subscription";

export const runtime = "nodejs";

function sameSecret(given, expected) {
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(String(expected || ""));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

function decodeMessage(body) {
  try {
    const data = Buffer.from(String(body?.message?.data || ""), "base64").toString("utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Google Play real-time developer notifications (Pub/Sub push). The push URL
 * carries `?token=PLAY_RTDN_TOKEN`. Always 200 once authenticated so Pub/Sub
 * stops retrying; unknown tokens are claimed when Google says whose they are.
 */
export async function POST(request) {
  const expected = process.env.PLAY_RTDN_TOKEN || "";
  if (!expected) return NextResponse.json({ error: "notConfigured" }, { status: 503 });
  const token = new URL(request.url).searchParams.get("token");
  if (!sameSecret(token, expected)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  const note = decodeMessage(await request.json().catch(() => ({})));

  // Refunds (with or without revoking access) take back referral rewards still on hold.
  const voidedToken = note?.voidedPurchaseNotification?.purchaseToken;
  if (admin && voidedToken) {
    await voidRewardsForToken(admin, voidedToken, "refunded").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  const purchaseToken = note?.subscriptionNotification?.purchaseToken;
  if (!admin || !purchaseToken) return NextResponse.json({ ok: true });

  const { data: row } = await admin
    .from("site_subscriptions")
    .select("*")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();

  const saved = row
    ? await refreshPlaySubscription(admin, row)
    : await claimPlaySubscription(admin, purchaseToken);
  if (!saved) return NextResponse.json({ ok: true });

  const site = await loadSiteForUser(admin, saved.user_id);
  if (site?.slug) revalidatePath(`/sites/${site.slug}`);
  return NextResponse.json({ ok: true });
}
