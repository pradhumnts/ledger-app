import { corsJson, corsPreflight } from "@/lib/api-cors";
import { requireThemeAdmin } from "@/lib/admin/require-theme-admin";
import { BUCKET, isValidThemeId, slugifyThemeId } from "@/lib/qr-theme-catalog";

export const runtime = "nodejs";
export const maxDuration = 60;

const KINDS = {
  poster: { folder: "posters", max: 6_000_000, types: /^image\/(webp|jpeg|png)$/ },
  preview: { folder: "previews", max: 2_000_000, types: /^image\/(webp|jpeg|png)$/ },
  font: {
    folder: "fonts",
    max: 2_500_000,
    types: /^(font\/(ttf|otf|woff2?)|application\/(octet-stream|font-sfnt|x-font-ttf|x-font-opentype))$/,
  },
};

function extFor(kind, fileName, mime) {
  const fromName = String(fileName || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (kind === "font") {
    if (["ttf", "otf", "woff", "woff2"].includes(fromName)) return fromName;
    if (mime.includes("woff2")) return "woff2";
    if (mime.includes("woff")) return "woff";
    if (mime.includes("otf") || mime.includes("opentype")) return "otf";
    return "ttf";
  }
  if (fromName === "jpg" || mime === "image/jpeg") return "jpg";
  if (fromName === "png" || mime === "image/png") return "png";
  return "webp";
}

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function POST(request) {
  const gate = await requireThemeAdmin(request);
  if (gate.response) return gate.response;

  const form = await request.formData().catch(() => null);
  if (!form) return corsJson(request, { error: "invalid" }, { status: 400 });

  const kind = String(form.get("kind") || "");
  const themeId = slugifyThemeId(form.get("themeId") || "theme");
  const fontId = slugifyThemeId(form.get("fontId") || "");
  const file = form.get("file");
  const rule = KINDS[kind];
  if (!rule || !file || typeof file === "string") {
    return corsJson(request, { error: "invalid" }, { status: 400 });
  }
  if (kind !== "font" && !isValidThemeId(themeId)) {
    return corsJson(request, { error: "invalidId" }, { status: 400 });
  }

  const mime = String(file.type || "application/octet-stream");
  const size = Number(file.size) || 0;
  if (size <= 0 || size > rule.max) {
    return corsJson(request, { error: "tooLarge" }, { status: 413 });
  }
  if (!rule.types.test(mime) && kind !== "font") {
    return corsJson(request, { error: "badType" }, { status: 400 });
  }

  const ext = extFor(kind, file.name, mime);
  const stamp = Date.now().toString(36);
  const path =
    kind === "font"
      ? `${rule.folder}/${fontId || stamp}.${ext}`
      : `${rule.folder}/${themeId}-${stamp}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await gate.admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });
  if (error) {
    return corsJson(request, { error: "uploadFailed", detail: error.message }, { status: 500 });
  }

  const { data } = gate.admin.storage.from(BUCKET).getPublicUrl(path);
  return corsJson(request, { url: data.publicUrl, path });
}
