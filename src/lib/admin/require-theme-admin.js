import { corsJson } from "@/lib/api-cors";
import { isThemeAdminPhone } from "@/lib/admin-themes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { indianMobileDigits } from "@/lib/supabase/phone";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";

/** Theme-admin request, or a JSON error response. */
export async function requireThemeAdmin(request, bodyToken = "") {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { response: corsJson(request, { error: "notConfigured" }, { status: 503 }) };
  }

  const user = await getUserFromRequest(request, bodyToken);
  if (!user) {
    return { response: corsJson(request, { error: "signIn" }, { status: 401 }) };
  }

  const phone = indianMobileDigits(user.phone || "");
  if (!isThemeAdminPhone(phone)) {
    return { response: corsJson(request, { error: "forbidden" }, { status: 403 }) };
  }

  return { admin, user, phone };
}
