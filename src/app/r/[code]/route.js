import { after } from "next/server";
import { APP_SITE_URL, PLAY_STORE_URL } from "@/lib/branding";
import { isLinkPreviewBot, referralPreviewHtml } from "@/lib/referrals/link-preview";
import { findCode, logClick } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * moneykitapp.com/r/RAHUL → the Play listing with `ref=RAHUL` in the install
 * referrer, which the app reads on first launch. Unknown codes still land on Play.
 * WhatsApp and other preview bots get a page with a preview card instead.
 */
export async function GET(request, { params }) {
  const { code: raw } = await params;
  const bot = isLinkPreviewBot(request.headers.get("user-agent"));
  const admin = getSupabaseAdmin();
  const found = admin
    ? await findCode(admin, raw, { withLabel: bot }).catch(() => null)
    : null;

  const playUrl = found
    ? `${PLAY_STORE_URL}&referrer=${encodeURIComponent(
        `ref=${found.code}&utm_source=referral&utm_campaign=${found.kind}`
      )}`
    : PLAY_STORE_URL;

  if (bot) {
    const origin = process.env.NODE_ENV === "production" ? APP_SITE_URL : new URL(request.url).origin;
    const path = `/r/${found ? found.code : encodeURIComponent(raw)}`;
    const html = referralPreviewHtml({
      label: found?.label || "",
      code: found?.code || "",
      url: `${origin}${path}`,
      image: `${origin}${path}/image`,
      playUrl,
    });
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Same URL redirects people, so the CDN must never serve this page to them.
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (found) after(() => logClick(admin, found.code).catch(() => {}));
  return Response.redirect(playUrl, 302);
}
