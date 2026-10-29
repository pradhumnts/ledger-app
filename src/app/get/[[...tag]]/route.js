import { after } from "next/server";
import { appLinkPlayUrl, appStoreUrlFor, cleanAppLinkTag } from "@/lib/app-links";
import { isLinkPreviewBot } from "@/lib/referrals/link-preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * moneykitapp.com/get/bill → the right store: App Store on iPhone/iPad,
 * Play listing (with install utm) otherwise.
 * People's taps are counted in `app_link_clicks`; preview bots just follow the
 * redirect so WhatsApp still shows a store card.
 */
export async function GET(request, { params }) {
  const { tag: parts } = await params;
  const tag = cleanAppLinkTag(parts?.[0]);
  const userAgent = request.headers.get("user-agent") || "";

  if (!isLinkPreviewBot(userAgent)) {
    const admin = getSupabaseAdmin();
    if (admin) {
      after(async () => {
        await admin.from("app_link_clicks").insert({ tag: tag || "direct" });
      });
    }
  }

  const location = appStoreUrlFor(userAgent, tag) || appLinkPlayUrl(tag);
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": "private, no-store" },
  });
}
