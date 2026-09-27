import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";
import { isFreePublish, siteUrl, suggestSlugs } from "@/lib/sites/config";
import { buildStarterSite } from "@/lib/sites/document";
import { getPack } from "@/lib/sites/packs";
import {
  loadBusiness,
  loadSiteForUser,
  publishLogo,
  siteSummary,
} from "@/lib/sites/store";

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

/** The app may not have synced the shop yet, so it sends its local copy as a fallback. */
function withLocalBusiness(business, local) {
  const source = local && typeof local === "object" ? local : {};
  const pick = (value, fallback) => String(value || "").trim() || String(fallback || "").trim();
  return {
    ...business,
    name: pick(business.name, source.name),
    phone: pick(business.phone, source.phone),
    address: pick(business.address, source.address),
    business_type: pick(business.business_type, source.type),
  };
}

export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  const [row, savedBusiness] = await Promise.all([
    loadSiteForUser(admin, user.id),
    loadBusiness(admin, user.id),
  ]);
  const business = withLocalBusiness(savedBusiness, body.business);

  let draft = row?.draft || null;
  if (!draft) {
    const logoUrl = await publishLogo(admin, user.id, business.logo_path);
    draft = buildStarterSite({ business, logoUrl });
  }

  const pack = getPack(draft.packId || business.business_type);
  const suggestions = row?.slug
    ? []
    : await freeSuggestions(admin, suggestSlugs(business.name, pack.slugSuffixes));

  return corsJson(request, {
    site: siteSummary(row),
    draft,
    suggestions,
    exampleUrl: siteUrl("your-name"),
    freePublish: isFreePublish(),
  });
}
