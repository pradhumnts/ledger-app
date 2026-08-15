export const BILL_THEME_PRICE = 20;

/** Visual layout styles for carousel demos. PDF layouts come later. */
export const BILL_THEMES = [
  {
    id: "classic",
    name: "Classic Bill",
    tagline: "Clean everyday bill",
    free: true,
    style: "invoice",
    pdf: {
      forest: [11, 48, 31],
      lime: [200, 232, 106],
      detail: [196, 214, 190],
      markBg: [200, 232, 106],
      markText: [11, 48, 31],
    },
  },
  {
    id: "minimal",
    name: "Clean Minimal",
    tagline: "Simple black & white",
    free: true,
    style: "minimal",
    pdf: {
      forest: [17, 17, 17],
      lime: [228, 228, 231],
      detail: [180, 180, 185],
      markBg: [228, 228, 231],
      markText: [17, 17, 17],
    },
  },
  {
    id: "navy",
    name: "Color Pop",
    tagline: "Bold & branded look",
    free: false,
    style: "colorful",
    pdf: {
      forest: [11, 31, 58],
      lime: [126, 182, 255],
      detail: [180, 200, 230],
      markBg: [126, 182, 255],
      markText: [11, 31, 58],
    },
  },
  {
    id: "midnight",
    name: "Movie Ticket",
    tagline: "Fun stub-style bill",
    free: false,
    style: "ticket",
    pdf: {
      forest: [28, 24, 16],
      lime: [212, 168, 75],
      detail: [210, 190, 150],
      markBg: [212, 168, 75],
      markText: [28, 24, 16],
    },
  },
  {
    id: "ivory",
    name: "Shop Receipt",
    tagline: "Store paper roll feel",
    free: false,
    style: "receipt",
    pdf: {
      forest: [61, 44, 30],
      lime: [243, 230, 208],
      detail: [210, 190, 165],
      markBg: [243, 230, 208],
      markText: [61, 44, 30],
    },
  },
  {
    id: "slate",
    name: "Pro Statement",
    tagline: "Corporate statement",
    free: false,
    style: "statement",
    pdf: {
      forest: [30, 41, 59],
      lime: [148, 163, 184],
      detail: [180, 190, 205],
      markBg: [148, 163, 184],
      markText: [30, 41, 59],
    },
  },
];

export function getBillTheme(id) {
  return BILL_THEMES.find((theme) => theme.id === id) || BILL_THEMES[0];
}

export function isBillThemeUnlocked(theme, unlockedIds = []) {
  if (!theme) return false;
  if (theme.free) return true;
  return unlockedIds.includes(theme.id);
}
