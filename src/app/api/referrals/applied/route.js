import { corsJson, corsPreflight } from "@/lib/api-cors";
import { referredBy } from "@/lib/referrals/store";
import { siteRequest } from "@/lib/sites/api";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** Just the code this shop was referred with, for the plan screen's discount. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user } = ctx;

  try {
    return corsJson(request, { referredBy: await referredBy(admin, user.id) });
  } catch {
    return corsJson(request, { error: "failed" }, { status: 500 });
  }
}
