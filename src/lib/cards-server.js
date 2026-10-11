import "server-only";
import { cache } from "react";
import { APP_SITE_URL } from "@/lib/branding";
import { CARD_SLUG, normalizeCard } from "@/lib/cards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** The card at /c/SLUG, cleaned for showing, or null. Cached per request. */
export const loadCard = cache(async (slug) => {
  if (!CARD_SLUG.test(slug || "")) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("business_cards")
    .select("slug, card")
    .eq("slug", slug)
    .maybeSingle();
  return data ? { slug: data.slug, card: normalizeCard(data.card) } : null;
});

export async function recordCardEvent(slug, kind) {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin.rpc("record_business_card_event", { p_slug: slug, p_kind: kind });
}

export function cardUrl(slug) {
  return `${APP_SITE_URL}/c/${slug}`;
}
