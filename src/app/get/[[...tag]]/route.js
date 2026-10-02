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

  if (!isLinkPreviewBot(request.headers.get("user-agent"))) {
    const admin = getSupabaseAdmin();
    if (admin) {
      after(async () => {
        await admin.from("app_link_clicks").insert({ tag: tag || "direct" });
      });
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: appLinkPlayUrl(tag), "Cache-Control": "private, no-store" },
  });
}
