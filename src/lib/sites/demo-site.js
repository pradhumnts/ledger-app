import { buildStarterSite, withSiteDefaults } from "@/lib/sites/document";
import { demoOffers } from "@/lib/sites/offers";
import { getPack } from "@/lib/sites/packs";
import { demoServicePages } from "@/lib/sites/service-pages";

/** Template demos showcase more service pages than a plan includes by default. */
const DEMO_SERVICE_PAGES = 4;

/** Query params that shape the `/site-preview` demo and its link-preview card. */
export const DEMO_PARAMS = ["template", "pack", "palette", "name", "address"];

/**
 * The `/site-preview` demo site for `?template=&pack=&palette=` (any object with
 * `get(key)`, such as URLSearchParams). `&pages=0` drops the sample service pages
 * and `&offers=0` the sample offers; `&offer=` picks the first offer's theme.
 */
export function demoSite(params) {
  const packId = params.get("pack") || "photographer";
  const demo = getPack(packId).demo || {};
  const doc = buildStarterSite({
    business: {
      name: params.get("name") || demo.name || "Your Studio",
      phone: demo.phone || "9876543210",
      address: params.get("address") || demo.address || "Connaught Place, New Delhi",
      business_type: packId,
    },
    templateId: params.get("template") || undefined,
    paletteId: params.get("palette") || undefined,
  });
  if (demo.socials && doc.sections.socials) {
    doc.sections.socials = { ...doc.sections.socials, ...demo.socials };
  }
  if (params.get("pages") !== "0") {
    // Sample content comes from the pack the site actually shows (the template's, for "general").
    Object.assign(doc.sections, demoServicePages(getPack(withSiteDefaults(doc).packId), DEMO_SERVICE_PAGES));
  }
  if (params.get("offers") !== "0") {
    doc.offers = demoOffers(params.get("offer"));
  }
  return doc;
}
