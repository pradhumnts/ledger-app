/**
 * Website building blocks. The app renders its pickers and edit forms from
 * `publicCatalog()`, so adding a template, palette or section here needs no
 * app update as long as it only uses existing field types:
 *   text, textarea, phone, image, images, price, list (with text/price item fields).
 *
 * `fixed` fields are not editable in the app: business ones come from the shop
 * profile, section ones from the business-type content pack. A `fixed` section
 * is left out of the app menu entirely.
 */

import {
  SERVICE_PAGE_IDS,
  SERVICE_PAGES_TIER,
  includedServicePageIds,
} from "@/lib/sites/service-pages";

function label(en, hi, hinglish = en) {
  return { en, hi, hinglish };
}

/** Fields of each Standard service page (`page1`…`page4`). */
const SERVICE_PAGE_FIELDS = [
  {
    key: "title",
    type: "text",
    max: 60,
    label: label("Service name", "सर्विस का नाम", "Service ka naam"),
  },
  {
    key: "summary",
    type: "textarea",
    max: 200,
    label: label("Short intro", "छोटा परिचय", "Short intro"),
  },
  {
    key: "image",
    type: "image",
    label: label("Cover photo", "कवर फ़ोटो", "Cover photo"),
  },
  {
    key: "price",
    type: "price",
    label: label("Starting price (₹)", "शुरुआती दाम (₹)", "Starting price (₹)"),
  },
  {
    key: "duration",
    type: "text",
    max: 40,
    placeholder: "2–3 hours",
    label: label("Time it takes", "कितना समय लगता है", "Kitna time lagta hai"),
  },
  {
    key: "details",
    type: "textarea",
    max: 1500,
    label: label("Full details", "पूरी जानकारी", "Poori jaankari"),
  },
  {
    key: "highlights",
    type: "list",
    max: 6,
    label: label("What's included", "क्या-क्या शामिल है", "Kya kya included hai"),
    itemFields: [
      {
        key: "name",
        type: "text",
        max: 60,
        label: label("Point", "पॉइंट", "Point"),
      },
      {
        key: "note",
        type: "text",
        max: 140,
        label: label("Details", "जानकारी", "Details"),
      },
    ],
  },
  {
    key: "images",
    type: "images",
    max: 8,
    label: label("Photos", "फ़ोटो", "Photos"),
  },
];

const SERVICE_PAGE_SECTIONS = Object.fromEntries(
  SERVICE_PAGE_IDS.map((id, index) => [
    id,
    {
      id,
      label: label(
        `Service page ${index + 1}`,
        `सर्विस पेज ${index + 1}`,
        `Service page ${index + 1}`,
      ),
      fields: SERVICE_PAGE_FIELDS,
    },
  ]),
);

export const SITE_SECTIONS = {
  business: {
    id: "business",
    label: label("Shop details", "दुकान की जानकारी", "Shop details"),
    fields: [
      {
        key: "name",
        type: "text",
        max: 60,
        fixed: true,
        label: label("Business name", "बिज़नेस का नाम", "Business ka naam"),
      },
      {
        key: "phone",
        type: "phone",
        fixed: true,
        label: label("Phone", "फ़ोन", "Phone"),
      },
      {
        key: "whatsapp",
        type: "phone",
        label: label("WhatsApp number", "WhatsApp नंबर", "WhatsApp number"),
      },
      {
        key: "address",
        type: "textarea",
        max: 200,
        fixed: true,
        label: label("Address", "पता", "Address"),
      },
      {
        key: "hours",
        type: "text",
        max: 80,
        label: label("Opening hours", "खुलने का समय", "Timing"),
      },
      {
        key: "logo",
        type: "image",
        fixed: true,
        label: label("Logo", "लोगो", "Logo"),
      },
    ],
  },
  hero: {
    id: "hero",
    label: label("Top banner", "सबसे ऊपर का बैनर", "Top banner"),
    fields: [
      {
        key: "image",
        type: "image",
        label: label("Cover photo", "कवर फ़ोटो", "Cover photo"),
      },
      {
        key: "eyebrow",
        type: "text",
        max: 50,
        label: label(
          "Small line above title",
          "टाइटल के ऊपर छोटी लाइन",
          "Title ke upar chhoti line",
        ),
      },
      {
        key: "title",
        type: "text",
        max: 70,
        label: label("Headline", "हेडलाइन", "Headline"),
      },
      {
        key: "subtitle",
        type: "textarea",
        max: 180,
        label: label("Short description", "छोटा विवरण", "Short description"),
      },
      {
        key: "cta",
        type: "text",
        max: 30,
        fixed: true,
        label: label("Button text", "बटन का टेक्स्ट", "Button text"),
      },
    ],
  },
  about: {
    id: "about",
    label: label("About you", "आपके बारे में", "Aapke baare mein"),
    fields: [
      { key: "image", type: "image", label: label("Photo", "फ़ोटो", "Photo") },
      {
        key: "heading",
        type: "text",
        max: 60,
        label: label("Heading", "हेडिंग", "Heading"),
      },
      {
        key: "text",
        type: "textarea",
        max: 600,
        label: label("About text", "विवरण", "About text"),
      },
    ],
  },
  services: {
    id: "services",
    label: label("Services & prices", "सर्विस और दाम", "Services aur price"),
    fields: [
      {
        key: "heading",
        type: "text",
        max: 60,
        label: label("Heading", "हेडिंग", "Heading"),
      },
      {
        key: "items",
        type: "list",
        max: 8,
        label: label("Services", "सर्विस", "Services"),
        itemFields: [
          {
            key: "name",
            type: "text",
            max: 50,
            label: label("Name", "नाम", "Naam"),
          },
          {
            key: "note",
            type: "text",
            max: 120,
            label: label("Details", "जानकारी", "Details"),
          },
          {
            key: "price",
            type: "price",
            label: label(
              "Starting price (₹)",
              "शुरुआती दाम (₹)",
              "Starting price (₹)",
            ),
          },
        ],
      },
    ],
  },
  gallery: {
    id: "gallery",
    label: label("Photo gallery", "फ़ोटो गैलरी", "Photo gallery"),
    fields: [
      {
        key: "heading",
        type: "text",
        max: 60,
        label: label("Heading", "हेडिंग", "Heading"),
      },
      {
        key: "images",
        type: "images",
        max: 12,
        label: label("Photos", "फ़ोटो", "Photos"),
      },
    ],
  },
  socials: {
    id: "socials",
    label: label("Socials", "सोशल मीडिया", "Socials"),
    fields: [
      {
        key: "instagram",
        type: "text",
        max: 120,
        placeholder: "@yourshop",
        label: label("Instagram", "Instagram", "Instagram"),
      },
      {
        key: "facebook",
        type: "text",
        max: 120,
        placeholder: "facebook.com/yourshop",
        label: label("Facebook", "Facebook", "Facebook"),
      },
      {
        key: "youtube",
        type: "text",
        max: 120,
        placeholder: "youtube.com/@yourshop",
        label: label("YouTube", "YouTube", "YouTube"),
      },
    ],
  },
  contact: {
    id: "contact",
    fixed: true,
    label: label("Contact", "संपर्क", "Contact"),
    fields: [
      {
        key: "heading",
        type: "text",
        max: 60,
        fixed: true,
        label: label("Heading", "हेडिंग", "Heading"),
      },
      {
        key: "text",
        type: "textarea",
        max: 200,
        fixed: true,
        label: label("Message", "संदेश", "Message"),
      },
    ],
  },
  ...SERVICE_PAGE_SECTIONS,
};

export const TEMPLATES = {
  studio: {
    id: "studio",
    version: 1,
    name: label("Studio", "स्टूडियो", "Studio"),
    // Phone-size hero screenshot (480px wide) shown in the app's template picker.
    thumbnail: "/site-packs/templates/studio.webp",
    // Sample content for shops whose business type has no pack of its own.
    starterPack: "photographer",
    sections: ["hero", "about", "services", "gallery", "socials", "contact"],
    optionalSections: ["about", "services", "gallery"],
    defaultPalette: "sage",
    // bg: page · paper: raised light surfaces · brand/brand2: dark sections ·
    // accent: buttons and highlights · footer: darkest band.
    palettes: [
      {
        id: "sage",
        name: label("Forest", "फ़ॉरेस्ट", "Forest"),
        colors: {
          bg: "#f6f1e7",
          paper: "#fffdf8",
          ink: "#162219",
          muted: "#697168",
          line: "rgba(11,48,31,0.16)",
          brand: "#0b301f",
          brand2: "#123f2b",
          accent: "#c8e86a",
          onAccent: "#0b301f",
          footer: "#071f15",
        },
      },
      {
        id: "noir",
        name: label("Noir", "नोयर", "Noir"),
        colors: {
          bg: "#f4f0e8",
          paper: "#fffdf9",
          ink: "#17150f",
          muted: "#6f6a60",
          line: "rgba(23,21,15,0.14)",
          brand: "#16140f",
          brand2: "#24211a",
          accent: "#d9b77c",
          onAccent: "#16140f",
          footer: "#0c0b08",
        },
      },
      {
        id: "ivory",
        name: label("Espresso", "एस्प्रेसो", "Espresso"),
        colors: {
          bg: "#f7f2ea",
          paper: "#fffdf9",
          ink: "#2a2019",
          muted: "#7a6d61",
          line: "rgba(58,42,30,0.15)",
          brand: "#3a2a1e",
          brand2: "#4a3727",
          accent: "#ecd3a8",
          onAccent: "#3a2a1e",
          footer: "#241910",
        },
      },
      {
        id: "blush",
        name: label("Maroon", "मैरून", "Maroon"),
        colors: {
          bg: "#faf1ec",
          paper: "#fffaf7",
          ink: "#2b1716",
          muted: "#7d625d",
          line: "rgba(94,33,36,0.15)",
          brand: "#5e2124",
          brand2: "#70302f",
          accent: "#f3c1b2",
          onAccent: "#5e2124",
          footer: "#3a1214",
        },
      },
    ],
  },
  // Add `draft: true` to keep a template in /site-preview only: hidden from the app and never saved.
  glow: {
    id: "glow",
    version: 1,
    name: label("Glow", "ग्लो", "Glow"),
    thumbnail: "/site-packs/templates/glow.webp",
    starterPack: "beauty",
    sections: ["hero", "about", "services", "gallery", "socials", "contact"],
    optionalSections: ["about", "services", "gallery"],
    defaultPalette: "terracotta",
    // pop: small highlights such as the map pin (falls back to accent).
    palettes: [
      {
        id: "terracotta",
        name: label("Terracotta", "टेराकोटा", "Terracotta"),
        colors: {
          bg: "#f8f3ed",
          paper: "#fffcf8",
          ink: "#2b1e1a",
          muted: "#7c6b64",
          line: "rgba(74,44,34,0.14)",
          brand: "#221612",
          brand2: "#33211b",
          accent: "#cf634e",
          onAccent: "#fff8f2",
          footer: "#170e0b",
          pop: "#cfe47d",
        },
      },
      {
        id: "sage",
        name: label("Sage", "सेज", "Sage"),
        colors: {
          bg: "#f2f1ea",
          paper: "#fbfaf5",
          ink: "#1c2520",
          muted: "#66706a",
          line: "rgba(28,52,40,0.14)",
          brand: "#14231c",
          brand2: "#1f3128",
          accent: "#55845f",
          onAccent: "#f6fbf4",
          footer: "#0c1611",
          pop: "#e8c77e",
        },
      },
      {
        id: "blush",
        name: label("Blush", "ब्लश", "Blush"),
        colors: {
          bg: "#faf1ef",
          paper: "#fffaf9",
          ink: "#2d1822",
          muted: "#7d6570",
          line: "rgba(90,40,60,0.14)",
          brand: "#2a1320",
          brand2: "#3a1c2c",
          accent: "#c14f78",
          onAccent: "#fff5f8",
          footer: "#1a0b13",
          pop: "#f5c3a0",
        },
      },
      {
        id: "midnight",
        name: label("Midnight Gold", "मिडनाइट गोल्ड", "Midnight Gold"),
        colors: {
          bg: "#f5f2ec",
          paper: "#fdfbf7",
          ink: "#16171b",
          muted: "#6c6a66",
          line: "rgba(20,22,30,0.13)",
          brand: "#111318",
          brand2: "#1b1e25",
          accent: "#a67c3d",
          onAccent: "#fffaf0",
          footer: "#0a0b0e",
          pop: "#e6cf9a",
        },
      },
    ],
  },
};

export const DEFAULT_TEMPLATE_ID = "studio";

export function getTemplate(templateId) {
  return TEMPLATES[templateId] || TEMPLATES[DEFAULT_TEMPLATE_ID];
}

/** Like `getTemplate`, but drafts fall back to the default so they can't be saved. */
export function getPublishableTemplate(templateId) {
  const template = TEMPLATES[templateId];
  return template && !template.draft ? template : TEMPLATES[DEFAULT_TEMPLATE_ID];
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
    templates: Object.values(TEMPLATES)
      .filter((template) => !template.draft)
      .map((template) => ({
      id: template.id,
      version: template.version,
      name: template.name,
      thumbnail: template.thumbnail || "",
      sections: ["business", ...template.sections],
      optionalSections: template.optionalSections,
      defaultPalette: template.defaultPalette,
      palettes: template.palettes.map((palette) => ({
        id: palette.id,
        name: palette.name,
        swatch: [
          palette.colors.bg,
          palette.colors.brand,
          palette.colors.accent,
        ],
      })),
    })),
    sections: SITE_SECTIONS,
    // Same for every template; not in `templates[].sections`, so app versions
    // that predate service pages never list them.
    servicePages: { ids: includedServicePageIds(), tier: SERVICE_PAGES_TIER },
  };
}
