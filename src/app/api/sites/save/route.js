import { revalidatePath } from "next/cache";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import { normalizeSlug, slugProblem } from "@/lib/sites/config";
import { sanitizeSiteDocument } from "@/lib/sites/document";
import { isSlugTaken, loadSiteForUser, saveDraft, siteSummary } from "@/lib/sites/store";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  const draft = sanitizeSiteDocument(body.draft, { userId: user.id });
  const before = await loadSiteForUser(admin, user.id);

  let slug;
  if (body.slug !== undefined && body.slug !== null) {
    slug = normalizeSlug(body.slug);
    const problem = slugProblem(slug);
    if (problem) {
      return corsJson(request, { error: "slug", problem }, { status: 400 });
    }
    if (slug !== before?.slug && (await isSlugTaken(admin, slug, user.id))) {
      return corsJson(request, { error: "slug", problem: "taken" }, { status: 409 });
    }
  }

  const { row, error } = await saveDraft(admin, { userId: user.id, draft, slug });
  if (error) {
    if (error.code === "23505") {
      return corsJson(request, { error: "slug", problem: "taken" }, { status: 409 });
    }
    return corsJson(request, { error: "save" }, { status: 500 });
  }

  if (before?.status === "live" && before.slug && slug && slug !== before.slug) {
    revalidatePath(`/sites/${before.slug}`);
    revalidatePath(`/sites/${slug}`);
  }

  return corsJson(request, { site: siteSummary(row) });
}
