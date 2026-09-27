/**
 * Website building blocks. The app renders its pickers and edit forms from
 * `publicCatalog()`, so adding a template, palette or section here needs no
 * app update as long as it only uses existing field types:
 *   text, textarea, phone, image, images, list (with text/price item fields).
 */

function label(en, hi, hinglish = en) {
  return { en, hi, hinglish };
}

export const SITE_SECTIONS = {
  business: {
    id: "business",
    label: label("Shop details", "दुकान की जानकारी", "Shop details"),
    fields: [
      { key: "name", type: "text", max: 60, label: label("Business name", "बिज़नेस का नाम", "Business ka naam") },
      { key: "phone", type: "phone", label: label("Phone", "फ़ोन", "Phone") },
      { key: "whatsapp", type: "phone", label: label("WhatsApp number", "WhatsApp नंबर", "WhatsApp number") },
      { key: "address", type: "textarea", max: 200, label: label("Address", "पता", "Address") },
      { key: "hours", type: "text", max: 80, label: label("Opening hours", "खुलने का समय", "Timing") },
      { key: "instagram", type: "text", max: 40, label: label("Instagram username", "Instagram यूज़रनेम", "Instagram username") },
      { key: "logo", type: "image", label: label("Logo", "लोगो", "Logo") },
    ],
  },
  hero: {
    id: "hero",
    label: label("Top banner", "सबसे ऊपर का बैनर", "Top banner"),
    fields: [
      { key: "eyebrow", type: "text", max: 50, label: label("Small line above title", "टाइटल के ऊपर छोटी लाइन", "Title ke upar chhoti line") },
      { key: "title", type: "text", max: 70, label: label("Headline", "हेडलाइन", "Headline") },
      { key: "subtitle", type: "textarea", max: 180, label: label("Short description", "छोटा विवरण", "Short description") },
      { key: "cta", type: "text", max: 30, label: label("Button text", "बटन का टेक्स्ट", "Button text") },
      { key: "image", type: "image", label: label("Cover photo", "कवर फ़ोटो", "Cover photo") },
    ],
  },
  about: {
    id: "about",
    label: label("About you", "आपके बारे में", "Aapke baare mein"),
    fields: [
      { key: "heading", type: "text", max: 60, label: label("Heading", "हेडिंग", "Heading") },
      { key: "text", type: "textarea", max: 600, label: label("About text", "विवरण", "About text") },
      { key: "image", type: "image", label: label("Photo", "फ़ोटो", "Photo") },
    ],
  },
  services: {
    id: "services",
    label: label("Services & prices", "सर्विस और दाम", "Services aur price"),
    fields: [
      { key: "heading", type: "text", max: 60, label: label("Heading", "हेडिंग", "Heading") },
      {
        key: "items",
        type: "list",
        max: 8,
        label: label("Services", "सर्विस", "Services"),
        itemFields: [
          { key: "name", type: "text", max: 50, label: label("Name", "नाम", "Naam") },
          { key: "note", type: "text", max: 120, label: label("Details", "जानकारी", "Details") },
          { key: "price", type: "price", label: label("Starting price (₹)", "शुरुआती दाम (₹)", "Starting price (₹)") },
        ],
      },
    ],
  },
  gallery: {
    id: "gallery",
    label: label("Photo gallery", "फ़ोटो गैलरी", "Photo gallery"),
    fields: [
      { key: "heading", type: "text", max: 60, label: label("Heading", "हेडिंग", "Heading") },
      { key: "images", type: "images", max: 12, label: label("Photos", "फ़ोटो", "Photos") },
    ],
  },
  testimonials: {
    id: "testimonials",
    label: label("Customer reviews", "ग्राहकों की राय", "Customer reviews"),
    fields: [
      { key: "heading", type: "text", max: 60, label: label("Heading", "हेडिंग", "Heading") },
      {
        key: "items",
        type: "list",
        max: 6,
        label: label("Reviews", "राय", "Reviews"),
        itemFields: [
          { key: "quote", type: "text", max: 220, label: label("Review", "राय", "Review") },
          { key: "name", type: "text", max: 40, label: label("Customer name", "ग्राहक का नाम", "Customer ka naam") },
        ],
      },
    ],
  },
  contact: {
    id: "contact",
    label: label("Contact", "संपर्क", "Contact"),
    fields: [
      { key: "heading", type: "text", max: 60, label: label("Heading", "हेडिंग", "Heading") },
      { key: "text", type: "textarea", max: 200, label: label("Message", "संदेश", "Message") },
    ],
  },
};

export const TEMPLATES = {
  studio: {
    id: "studio",
    version: 1,
    name: label("Studio", "स्टूडियो", "Studio"),
    sections: ["hero", "about", "services", "gallery", "testimonials", "contact"],
    optionalSections: ["about", "services", "gallery", "testimonials"],
    defaultPalette: "noir",
    palettes: [
      {
        id: "noir",
        name: label("Noir", "नोयर", "Noir"),
        colors: {
          bg: "#0f0e0d",
          surface: "#1a1917",
          text: "#f4efe6",
          muted: "#a8a196",
          line: "rgba(244,239,230,0.12)",
          primary: "#d4b483",
          onPrimary: "#15120d",
        },
      },
      {
        id: "ivory",
        name: label("Ivory", "आइवरी", "Ivory"),
        colors: {
          bg: "#f7f3ec",
          surface: "#ffffff",
          text: "#1f1b16",
          muted: "#6f685e",
          line: "rgba(31,27,22,0.1)",
          primary: "#1f1b16",
          onPrimary: "#f7f3ec",
        },
      },
      {
        id: "sage",
        name: label("Sage", "सेज", "Sage"),
        colors: {
          bg: "#eef1ea",
          surface: "#ffffff",
          text: "#1d2a21",
          muted: "#5d6b60",
          line: "rgba(29,42,33,0.1)",
          primary: "#2f4a3a",
          onPrimary: "#ffffff",
        },
      },
      {
        id: "blush",
        name: label("Blush", "ब्लश", "Blush"),
        colors: {
          bg: "#fbf1ee",
          surface: "#ffffff",
          text: "#2b1b18",
          muted: "#7a625c",
          line: "rgba(43,27,24,0.1)",
          primary: "#a4533f",
          onPrimary: "#ffffff",
        },
      },
    ],
  },
};

export const DEFAULT_TEMPLATE_ID = "studio";

export function getTemplate(templateId) {
  return TEMPLATES[templateId] || TEMPLATES[DEFAULT_TEMPLATE_ID];
}

export function getPalette(template, paletteId) {
  return (
    template.palettes.find((item) => item.id === paletteId) ||
    template.palettes.find((item) => item.id === template.defaultPalette) ||
    template.palettes[0]
  );
}

export function publicCatalog() {
  return {
    templates: Object.values(TEMPLATES).map((template) => ({
      id: template.id,
      version: template.version,
      name: template.name,
      sections: ["business", ...template.sections],
      optionalSections: template.optionalSections,
      defaultPalette: template.defaultPalette,
      palettes: template.palettes.map((palette) => ({
        id: palette.id,
        name: palette.name,
        swatch: [palette.colors.bg, palette.colors.primary, palette.colors.text],
      })),
    })),
    sections: SITE_SECTIONS,
  };
}
