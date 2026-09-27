import { revalidatePath } from "next/cache";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import { publishDraft, siteSummary } from "@/lib/sites/store";
import { siteAccess } from "@/lib/sites/subscription";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user } = ctx;

  const access = await siteAccess(admin, user);
  if (!access.active) {
    return corsJson(request, { error: "subscriptionRequired", access }, { status: 402 });
  }

  const { row, error } = await publishDraft(admin, user.id);
  if (error) {
    const status = error === "save" ? 500 : 400;
    return corsJson(request, { error }, { status });
  }

  revalidatePath(`/sites/${row.slug}`);
  return corsJson(request, { site: siteSummary(row), access });
}
