import { findCode } from "@/lib/referrals/store";
import { renderReferralImage } from "@/lib/referrals/share-image";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Preview image for moneykitapp.com/r/CODE links. */
export async function GET(_request, { params }) {
  const { code } = await params;
  const admin = getSupabaseAdmin();
  const found = admin ? await findCode(admin, code).catch(() => null) : null;
  const image = await renderReferralImage({ label: found?.label || "", code: found?.code || "" });
  return new Response(image, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": found
        ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
        : "public, max-age=300, s-maxage=300",
    },
  });
}
