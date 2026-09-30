import { corsJson, corsPreflight } from "@/lib/api-cors";
import { REFERRAL_DISCOUNT_PERCENT } from "@/lib/referrals/rules";
import { findCode } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** Whether a typed code exists, and whose it is, before the shop has signed in. */
export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return corsJson(request, { error: "notConfigured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));

  const found = await findCode(admin, body.code);
  if (!found) return corsJson(request, { valid: false });
  return corsJson(request, {
    valid: true,
    code: found.code,
    label: found.label,
    kind: found.kind,
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
  });
}
