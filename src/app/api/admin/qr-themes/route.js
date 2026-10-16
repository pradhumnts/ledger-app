import { corsJson, corsPreflight } from "@/lib/api-cors";
import { requireThemeAdmin } from "@/lib/admin/require-theme-admin";
import {
  defaultThemeStyle,
  isValidThemeId,
  rowToTheme,
  slugifyThemeId,
  themeToRow,
} from "@/lib/qr-theme-catalog";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function GET(request) {
  const gate = await requireThemeAdmin(request);
  if (gate.response) return gate.response;

  const { data, error } = await gate.admin
    .from("qr_themes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    return corsJson(request, { error: "loadFailed", detail: error.message }, { status: 500 });
  }
  return corsJson(request, { themes: (data || []).map(rowToTheme) });
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const gate = await requireThemeAdmin(request, body.accessToken);
  if (gate.response) return gate.response;

  const name = String(body.name || "").trim().slice(0, 80);
  const id = isValidThemeId(body.id) ? body.id : slugifyThemeId(body.id || name);
  if (!name || !isValidThemeId(id)) {
    return corsJson(request, { error: "invalidId" }, { status: 400 });
  }

  const row = themeToRow({
    id,
    name,
    tagline: body.tagline || "",
    status: "draft",
    free: Boolean(body.free),
    priceInr: body.priceInr,
    businessTypes: body.businessTypes || [],
    posterUrl: body.posterUrl || "",
    previewUrl: body.previewUrl || "",
    style: body.style && typeof body.style === "object" ? body.style : defaultThemeStyle(),
    sortOrder: body.sortOrder,
  });

  const { data, error } = await gate.admin
    .from("qr_themes")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return corsJson(
      request,
      { error: status === 409 ? "idTaken" : "saveFailed", detail: error.message },
      { status }
    );
  }
  return corsJson(request, { theme: rowToTheme(data) });
}
