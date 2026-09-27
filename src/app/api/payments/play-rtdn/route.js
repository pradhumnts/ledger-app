import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { loadSiteForUser } from "@/lib/sites/store";
import { refreshPlaySubscription } from "@/lib/sites/subscription";

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
 * stops retrying; tokens we have never seen are claimed later from the app.
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
  const purchaseToken = note?.subscriptionNotification?.purchaseToken;
  if (!admin || !purchaseToken) return NextResponse.json({ ok: true });

  const { data: row } = await admin
    .from("site_subscriptions")
    .select("*")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();
  if (!row) return NextResponse.json({ ok: true });

  await refreshPlaySubscription(admin, row);
  const site = await loadSiteForUser(admin, row.user_id);
  if (site?.slug) revalidatePath(`/sites/${site.slug}`);
  return NextResponse.json({ ok: true });
}
