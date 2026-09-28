import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import { isFreePublish, siteUrl, suggestSlugs } from "@/lib/sites/config";
import {
  applyBusinessProfile,
  buildStarterSite,
  sanitizeSiteDocument,
  siteDefaults,
} from "@/lib/sites/document";
import { publicCatalog } from "@/lib/sites/catalog";
import { getPack } from "@/lib/sites/packs";
import {
  loadProfile,
  loadSiteForUser,
  publishLogo,
  siteSummary,
} from "@/lib/sites/store";
import { siteAccess } from "@/lib/sites/subscription";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

async function freeSuggestions(admin, candidates) {
  if (!candidates.length) return [];
  const { data } = await admin.from("sites").select("slug").in("slug", candidates);
  const taken = new Set((data || []).map((row) => row.slug));
  return candidates.filter((slug) => !taken.has(slug)).slice(0, 3);
}

export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  const [row, { business, logoUrl }, access] = await Promise.all([
    loadSiteForUser(admin, user.id),
    loadProfile(admin, user.id, body.business).then(async (profile) => ({
      business: profile,
      logoUrl: await publishLogo(admin, user.id, profile.logo_path),
    })),
    siteAccess(admin, user),
  ]);

  const draft = row?.draft
    ? applyBusinessProfile(sanitizeSiteDocument(row.draft, { userId: user.id }), business, {
        logoUrl,
      })
    : buildStarterSite({ business, logoUrl });

  const pack = getPack(draft.packId || business.business_type);
  const defaults = Object.fromEntries(
    publicCatalog().templates.map((template) => [
      template.id,
      siteDefaults(template.id, draft.packId),
    ])
  );
  const suggestions = row?.slug
    ? []
    : await freeSuggestions(admin, suggestSlugs(business.name, pack.slugSuffixes));

  return corsJson(request, {
    site: siteSummary(row),
    draft,
    defaults,
    suggestions,
    exampleUrl: siteUrl("your-name"),
    freePublish: isFreePublish(),
    access,
  });
}
