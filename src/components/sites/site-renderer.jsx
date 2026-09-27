import { getPalette, getTemplate } from "@/lib/sites/catalog";
import { StudioTemplate } from "@/components/sites/templates/studio";

const TEMPLATE_COMPONENTS = {
  studio: StudioTemplate,
};

export function paletteStyle(colors) {
  return {
    "--s-bg": colors.bg,
    "--s-surface": colors.surface,
    "--s-text": colors.text,
    "--s-muted": colors.muted,
    "--s-line": colors.line,
    "--s-primary": colors.primary,
    "--s-on-primary": colors.onPrimary,
  };
}

/** Renders a site document. Shared by live sites and the in-app preview. */
export function SiteRenderer({ doc }) {
  const template = getTemplate(doc?.templateId);
  const palette = getPalette(template, doc?.paletteId);
  const Template = TEMPLATE_COMPONENTS[template.id] || StudioTemplate;
  const hidden = new Set(doc?.hidden || []);

  return (
    <div
      style={paletteStyle(palette.colors)}
      className="min-h-dvh bg-s-bg text-s-text"
    >
      <Template doc={doc} isShown={(id) => !hidden.has(id)} />
    </div>
  );
}
