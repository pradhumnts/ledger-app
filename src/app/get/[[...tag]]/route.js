import { after } from "next/server";
import { appLinkPlayUrl, cleanAppLinkTag } from "@/lib/app-links";
import { isLinkPreviewBot } from "@/lib/referrals/link-preview";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * moneykitapp.com/get/bill → the Play listing tagged for install tracking.
 * People's taps are counted in `app_link_clicks`; preview bots just follow the
 * redirect so WhatsApp still shows the Play card.
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

  // iPhone visitors go to the App Store listing once APP_STORE_URL is set.
  const appStoreUrl = process.env.APP_STORE_URL || "";
  const location =
    appStoreUrl && /iPhone|iPad|iPod/i.test(userAgent) ? appStoreUrl : appLinkPlayUrl(tag);
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": "private, no-store" },
  });
}
