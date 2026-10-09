/**
 * Service pages: extra pages, one per service, each stored as a `page1`…`page8`
 * section of the site document and served at `{site}/{service-name}`. Standard
 * includes the first `STANDARD_SERVICE_PAGES`; the bigger Standard plans show 4
 * or 8 (see planPages). Drafts keep every slot, so pages come back when a shop
 * moves up again. Pure helpers, shared by the renderer, routes and tests.
 */

export const SERVICE_PAGE_IDS = [
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "page6",
  "page7",
  "page8",
];
export const SERVICE_PAGES_TIER = "standard";
export const STANDARD_SERVICE_PAGES = 1;

/** Slots a site may show, first ones first. */
export function includedServicePageIds(count = STANDARD_SERVICE_PAGES) {
  return SERVICE_PAGE_IDS.slice(0, count);
}

const SLUG_MAX = 48;
/** Paths the site itself serves under `/sites/{slug}/`. */
const RESERVED = new Set(["share-image", "sitemap-xml", "robots-txt"]);

export function isServicePageId(id) {
  return SERVICE_PAGE_IDS.includes(id);
}

/** URL path segment for a service name: "Bridal Makeup & Hair" → "bridal-makeup-and-hair". */
export function servicePageSlug(title) {
  return String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * The site's service pages in order: only ones with a name that aren't hidden,
 * within the first `count` slots, each with a unique `slug` (names that don't
 * slugify, e.g. Hindi, get "service-N").
 */
export function servicePages(doc, count = STANDARD_SERVICE_PAGES) {
  const hidden = new Set(list(doc?.hidden));
  const used = new Set();
  const pages = [];
  includedServicePageIds(count).forEach((id, index) => {
    const section = doc?.sections?.[id];
    const title = String(section?.title || "").trim();
    if (!title || hidden.has(id)) return;
    let base = servicePageSlug(title) || `service-${index + 1}`;
    if (RESERVED.has(base)) base = `${base}-${index + 1}`;
    let slug = base;
    for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
    used.add(slug);
    pages.push({
      ...section,
      id,
      position: pages.length + 1,
      slug,
      title,
      images: list(section.images).filter(Boolean),
      highlights: list(section.highlights).filter((item) => item?.name || item?.note),
    });
  });
  return pages;
}

/** `pages` entry whose name matches a services-list item, so the list can link to it. */
export function pageForService(pages, name) {
  const key = servicePageSlug(name);
  return key ? pages.find((page) => servicePageSlug(page.title) === key) || null : null;
}

/** Cover photo: the page's own, else its first gallery photo. */
export function servicePageCover(page) {
  return page?.image || page?.images?.[0] || "";
}

/** Details text as paragraphs (blank lines split them). */
export function paragraphs(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function servicePageMessage(businessName, title) {
  const shop = String(businessName || "").trim();
  return `Hi${shop ? ` ${shop}` : ""}! I'd like to know more about ${title}.`;
}

/**
 * Links between the home page and service pages. `home` + "#section" goes home,
 * `pagePrefix` + slug opens a page. The preview has a single URL, so it uses
 * `#home…` / `#page=…` links and switches views itself.
 */
export const PREVIEW_NAV = { home: "#home", pagePrefix: "#page=" };

export function homeLink(nav, hash = "") {
  return `${nav?.home ?? PREVIEW_NAV.home}${hash}`;
}

export function pageLink(nav, page) {
  return `${nav?.pagePrefix ?? PREVIEW_NAV.pagePrefix}${page.slug}`;
}

const DEMO_HIGHLIGHTS = [
  { name: "A quick chat first", note: "We talk through what you want before we begin." },
  { name: "Clear, upfront prices", note: "You know the full price before you book." },
  { name: "Easy booking", note: "Message us on WhatsApp and we confirm your slot." },
];

/** Sample service pages for the /site-preview demo, built from a content pack. */
export function demoServicePages(pack, count = STANDARD_SERVICE_PAGES) {
  const items = list(pack?.sections?.services?.items);
  const photos = list(pack?.sections?.gallery?.images);
  const about = String(pack?.sections?.about?.text || "").trim();
  const out = {};
  items.slice(0, count).forEach((item, index) => {
    const rotated = photos.length
      ? [...photos.slice(index), ...photos.slice(0, index)].slice(0, 5)
      : [];
    out[SERVICE_PAGE_IDS[index]] = {
      title: item.name,
      summary: item.note,
      image: rotated[0] || "",
      price: item.price ?? null,
      duration: "By appointment",
      details: [
        `${item.note}. Every booking starts with a short conversation about what you need, so the time, the plan and the price are clear before we begin.`,
        about,
      ]
        .filter(Boolean)
        .join("\n\n"),
      highlights: DEMO_HIGHLIGHTS,
      images: rotated.slice(1),
    };
  });
  return out;
}
