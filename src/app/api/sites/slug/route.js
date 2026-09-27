import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import { normalizeSlug, siteUrl, slugProblem, suggestSlugs } from "@/lib/sites/config";
import { isSlugTaken } from "@/lib/sites/store";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  const slug = normalizeSlug(body.slug);
  const problem = slugProblem(slug);
  const taken = problem ? false : await isSlugTaken(admin, slug, user.id);

  let suggestions = [];
  if (problem || taken) {
    const candidates = suggestSlugs(slug || body.slug, ["studio", "official", "india"]).filter(
      (item) => item !== slug
    );
    const { data } = candidates.length
      ? await admin.from("sites").select("slug").in("slug", candidates)
      : { data: [] };
    const used = new Set((data || []).map((row) => row.slug));
    suggestions = candidates.filter((item) => !used.has(item)).slice(0, 3);
  }

  return corsJson(request, {
    slug,
    url: slug ? siteUrl(slug) : "",
    available: !problem && !taken,
    problem: problem || (taken ? "taken" : ""),
    suggestions,
  });
}
