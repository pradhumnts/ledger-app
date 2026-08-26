import { corsJson, corsPreflight } from "@/lib/api-cors";
import { clip, notifyNewRegistration } from "@/lib/ops-email";
import { isPlayReviewLogin } from "@/lib/play-review-auth";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  if (!user) {
    return corsJson(request, { error: "Sign in to continue." }, { status: 401 });
  }

  const phone = clip(body.phone) || clip(user.phone);
  if (isPlayReviewLogin(phone)) {
    return corsJson(request, { ok: true, skipped: true });
  }

  await notifyNewRegistration({
    phone,
    shop: clip(body.name || body.shop),
    type: clip(body.type),
    location: clip(body.address || body.location, 400),
    userId: user.id,
  }).catch(() => {});

  return corsJson(request, { ok: true });
}
