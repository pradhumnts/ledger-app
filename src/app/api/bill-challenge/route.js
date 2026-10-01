import { revalidatePath } from "next/cache";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { checkBillChallenge } from "@/lib/bill-challenge";
import { siteRequest } from "@/lib/sites/api";
import { loadSiteForUser } from "@/lib/sites/store";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** The shop's bill challenge; completes it and gives the free month once 25 customers are in. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user } = ctx;

  try {
    const challenge = await checkBillChallenge(admin, user.id);
    if (challenge.state === "completed" && ctx.body?.known !== "completed") {
      const site = await loadSiteForUser(admin, user.id).catch(() => null);
      if (site?.slug && site.status === "live") revalidatePath(`/sites/${site.slug}`);
    }
    return corsJson(request, { challenge });
  } catch {
    return corsJson(request, { error: "failed" }, { status: 500 });
  }
}
