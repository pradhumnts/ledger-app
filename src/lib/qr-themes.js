import { arePaidThemesFree } from "@/lib/theme-access";

export const QR_THEME_PRICE = 40;

function imagePath(filename) {
  return `/qr-themes/${encodeURIComponent(filename)}`;
}

/** Carousel previews — add `{id}-preview.webp` in public/qr-themes/. */
function previewPath(themeId) {
  const file =
    themeId === "toy-store" ? "toys-store-preview.webp" : `${themeId}-preview.webp`;
  return imagePath(file);
}

/** Portrait QR poster themes (~853×1844). Background-only art in public/qr-themes/. */
export const QR_THEMES = [
  {
    id: "salon",
    name: "Salon",
    tagline: "Salons & beauty studios",
    free: false,
    image: imagePath("salon.webp"),
    preview: previewPath("salon"),
  },
  {
    id: "beauty",
    name: "Beauty",
    tagline: "Bridal & makeup",
    free: false,
    image: imagePath("beauty.webp"),
    preview: previewPath("beauty"),
  },
  {
    id: "clinic",
    name: "Clinic",
    tagline: "Doctors & clinics",
    free: false,
    image: imagePath("clinic.webp"),
    preview: previewPath("clinic"),
  },
  {
    id: "coaching",
    name: "Coaching Center",
    tagline: "Classes & tuition",
    free: false,
    image: imagePath("coaching.webp"),
    preview: previewPath("coaching"),
  },
  {
    id: "fitness",
    name: "Fitness",
    tagline: "Gyms & trainers",
    free: false,
    image: imagePath("fitness.webp"),
    preview: previewPath("fitness"),
  },
  {
    id: "photographer",
    name: "Photographer",
    tagline: "Studios & photographers",
    free: false,
    image: imagePath("photographer.webp"),
    preview: previewPath("photographer"),
  },
  {
    id: "toy-store",
    name: "Toy Store",
    tagline: "Kids shops & toys",
    free: false,
    image: imagePath("toys-store.webp"),
    preview: previewPath("toy-store"),
  },
];

export function getQrTheme(id) {
  return QR_THEMES.find((theme) => theme.id === id) || QR_THEMES[0];
}

export function isQrThemeUnlocked(theme, unlockedIds = []) {
  if (!theme) return false;
  if (theme.free || arePaidThemesFree()) return true;
  return unlockedIds.includes(theme.id);
}
