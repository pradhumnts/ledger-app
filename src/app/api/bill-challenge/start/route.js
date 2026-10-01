import { corsJson, corsPreflight } from "@/lib/api-cors";
import { startBillChallenge } from "@/lib/bill-challenge";
import { siteRequest } from "@/lib/sites/api";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** Start the shop's 7-day bill challenge (once per shop). */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user } = ctx;

  try {
    const challenge = await startBillChallenge(admin, user.id);
    return corsJson(request, { challenge });
  } catch {
    return corsJson(request, { error: "failed" }, { status: 500 });
  }
}
