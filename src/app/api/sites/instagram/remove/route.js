import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { APP_SITE_URL } from "@/lib/branding";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { readSignedRequest, removeAccount } from "@/lib/sites/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Meta's "Deauthorize callback URL" and "Data deletion request URL" for the
 * Instagram app: the account removed MoneyKit, so its token goes. Deletion
 * requests expect `{ url, confirmation_code }` back.
 */
export async function POST(request) {
  const form = await request.formData().catch(() => null);
  const data = readSignedRequest(form?.get("signed_request"));
  if (!data?.user_id) {
    return NextResponse.json({ error: "signed_request" }, { status: 400 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "notConfigured" }, { status: 503 });

  await removeAccount(admin, data.user_id);
  const code = randomUUID();
  return NextResponse.json({
    url: `${APP_SITE_URL}/account-deletion?instagram=${code}`,
    confirmation_code: code,
  });
}
