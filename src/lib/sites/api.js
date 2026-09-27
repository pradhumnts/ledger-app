import { corsJson } from "@/lib/api-cors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";

const MAX_BODY_BYTES = 100_000;

/** Parse the body and sign in the shop owner, or return the error response. */
export async function siteRequest(request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { response: corsJson(request, { error: "notConfigured" }, { status: 503 }) };
  }

  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) {
    return { response: corsJson(request, { error: "tooLarge" }, { status: 413 }) };
  }
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  if (!user) {
    return { response: corsJson(request, { error: "signIn" }, { status: 401 }) };
  }
  return { admin, user, body };
}
