import { corsJson, corsPreflight } from "@/lib/api-cors";
import { businessTypeLabel, clip, sendOpsEmail } from "@/lib/ops-email";
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

  const shop = clip(body.businessName);
  const phone = clip(body.phone) || clip(user.phone);
  const address = clip(body.address, 400);
  const plan = clip(body.planTitle);
  const price = clip(body.price, 40);
  const source = clip(body.source, 40);
  const type = businessTypeLabel(clip(body.type));

  const subject = `[MoneyKit] Website interest${shop ? ` — ${shop}` : ""}`;
  const text = [
    "Someone asked about a MoneyKit website.",
    "",
    `Shop: ${shop || "—"}`,
    `Phone: ${phone || "—"}`,
    `Address: ${address || "—"}`,
    `Plan / Price: ${plan || "—"}${price ? ` / ${price}` : ""}`,
    `Button: ${source || "—"}`,
    `User ID: ${user.id}`,
    `Business type: ${type || "—"}`,
    `Business location: ${address || "—"}`,
  ].join("\n");

  const sent = await sendOpsEmail({ subject, text });
  if (!sent.ok) {
    const status = sent.error?.includes("RESEND_API_KEY") ? 503 : 502;
    return corsJson(request, { error: sent.error || "Could not send." }, { status });
  }

  return corsJson(request, { ok: true });
}
