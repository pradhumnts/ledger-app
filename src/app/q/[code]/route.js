import { after } from "next/server";
import { APP_SITE_URL } from "@/lib/branding";
import {
  canOpenUpiApp,
  normalizeStickerCode,
  stickerKindFromCode,
  stickerPageHtml,
} from "@/lib/qr-stickers";
import { isLinkPreviewBot } from "@/lib/referrals/link-preview";
import { siteUrl } from "@/lib/sites/config";
import { ownerSiteTier } from "@/lib/sites/subscription";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildUpiPayQuery } from "@/lib/upi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A sticker's destination changes when it's linked or the shop edits its UPI ID,
// so neither the redirect nor the page may be cached.
const NO_STORE = "private, no-store";

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": NO_STORE },
  });
}

function page(status, details) {
  return new Response(stickerPageHtml(details), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": NO_STORE },
  });
}

async function liveSiteSlug(admin, userId) {
  const { data } = await admin
    .from("sites")
    .select("slug, status, published")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.slug || data.status !== "live" || !data.published) return "";
  return (await ownerSiteTier(admin, userId)) ? data.slug : "";
}

/**
 * moneykitapp.com/q/P7Q4XK2M → a printed sticker. Payment stickers on a phone
 * redirect straight to upi://pay with the shop's current UPI ID (desktops and
 * link previews get the /p page instead); website stickers open its live site.
 * Stickers that aren't linked (or whose shop isn't ready) show a short page.
 */
export async function GET(request, { params }) {
  const { code: raw } = await params;
  const code = normalizeStickerCode(raw);
  const admin = getSupabaseAdmin();
  const sticker =
    code && admin
      ? await admin
          .from("qr_stickers")
          .select("code, kind, user_id")
          .eq("code", code)
          .maybeSingle()
          .then(({ data }) => data)
          .catch(() => null)
      : null;

  if (!sticker) {
    return page(404, { state: "unknown", kind: stickerKindFromCode(code), code });
  }

  const userAgent = request.headers.get("user-agent");
  const previewBot = isLinkPreviewBot(userAgent);
  if (!previewBot) {
    after(async () => {
      await admin.rpc("record_qr_sticker_scan", { p_code: sticker.code });
    });
  }

  const { kind } = sticker;
  if (!sticker.user_id) {
    return page(200, { state: "notLinked", kind, code: sticker.code });
  }

  const { data: business } = await admin
    .from("businesses")
    .select("name, upi_id")
    .eq("user_id", sticker.user_id)
    .maybeSingle();
  const shopName = business?.name?.trim() || "";

  if (kind === "payment") {
    const query = buildUpiPayQuery({ upiId: business?.upi_id, name: shopName });
    if (!query) return page(200, { state: "noUpi", kind, shopName, code: sticker.code });
    if (!previewBot && canOpenUpiApp(userAgent)) return redirect(`upi://pay?${query}`);
    const origin =
      process.env.NODE_ENV === "production" ? APP_SITE_URL : new URL(request.url).origin;
    return redirect(`${origin}/p?${query}`);
  }

  const slug = await liveSiteSlug(admin, sticker.user_id).catch(() => "");
  if (!slug) return page(200, { state: "siteNotLive", kind, shopName, code: sticker.code });
  return redirect(siteUrl(slug));
}
