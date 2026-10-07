import { getPalette, getTemplate } from "@/lib/sites/catalog";
import { withSiteDefaults } from "@/lib/sites/document";
import { PREVIEW_NAV, servicePages } from "@/lib/sites/service-pages";
import { GlowTemplate } from "@/components/sites/templates/glow";
import { StudioTemplate } from "@/components/sites/templates/studio";

const TEMPLATE_COMPONENTS = {
  studio: StudioTemplate,
  glow: GlowTemplate,
};

export function paletteStyle(colors) {
  return {
    "--s-bg": colors.bg,
    "--s-paper": colors.paper,
    "--s-ink": colors.ink,
    "--s-muted": colors.muted,
    "--s-line": colors.line,
    "--s-brand": colors.brand,
    "--s-brand-2": colors.brand2,
    "--s-accent": colors.accent,
    "--s-on-accent": colors.onAccent,
    "--s-footer": colors.footer,
    "--s-pop": colors.pop || colors.accent,
  };
}

/**
 * Renders a site document. Shared by live sites and the in-app preview.
 * `reviews`: the shop's Google rating and reviews, `instagram`: its latest
 * Instagram posts (live Standard sites only). `withPages` turns on service
 * pages (Standard); `page` is the id of the one to show instead of the home
 * page, and `nav` says how the two link to each other.
 */
export function SiteRenderer({
  doc: input,
  reviews = null,
  instagram = null,
  withPages = false,
  page: pageId = null,
  nav = PREVIEW_NAV,
}) {
  const doc = withSiteDefaults(input);
  const template = getTemplate(doc?.templateId);
  const palette = getPalette(template, doc?.paletteId);
  const Template = TEMPLATE_COMPONENTS[template.id] || StudioTemplate;
  const hidden = new Set(doc?.hidden || []);
  const pages = withPages ? servicePages(doc) : [];
  const page = pageId ? pages.find((item) => item.id === pageId) || null : null;

  return (
    <div
      style={paletteStyle(palette.colors)}
      className="min-h-dvh bg-s-bg text-s-ink"
    >
      <Template
        doc={doc}
        isShown={(id) => !hidden.has(id)}
        reviews={page ? null : reviews}
        instagram={page ? null : instagram}
        pages={pages}
        page={page}
        nav={nav}
      />
    </div>
  );
}
