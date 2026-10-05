import { getPalette, getTemplate } from "@/lib/sites/catalog";
import { withSiteDefaults } from "@/lib/sites/document";
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
 * `reviews`: the shop's Google rating and reviews (live Standard sites only).
 */
export function SiteRenderer({ doc: input, reviews = null }) {
  const doc = withSiteDefaults(input);
  const template = getTemplate(doc?.templateId);
  const palette = getPalette(template, doc?.paletteId);
  const Template = TEMPLATE_COMPONENTS[template.id] || StudioTemplate;
  const hidden = new Set(doc?.hidden || []);

  return (
    <div
      style={paletteStyle(palette.colors)}
      className="min-h-dvh bg-s-bg text-s-ink"
    >
      <Template doc={doc} isShown={(id) => !hidden.has(id)} reviews={reviews} />
    </div>
  );
}
