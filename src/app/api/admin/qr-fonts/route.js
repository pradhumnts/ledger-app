import { corsJson, corsPreflight } from "@/lib/api-cors";
import { requireThemeAdmin } from "@/lib/admin/require-theme-admin";
import { builtInFonts, isValidThemeId, slugifyThemeId } from "@/lib/qr-theme-catalog";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function GET(request) {
  const gate = await requireThemeAdmin(request);
  if (gate.response) return gate.response;

  const { data, error } = await gate.admin
    .from("qr_theme_fonts")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    return corsJson(request, { error: "loadFailed", detail: error.message }, { status: 500 });
  }

  const custom = (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    family: row.family,
    source: "file",
    href: "",
    file_url: row.file_url || "",
  }));

  return corsJson(request, {
    fonts: [...builtInFonts(), ...custom],
    custom,
  });
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
  const fileUrl = String(body.fileUrl || "").trim();
  const family = String(body.family || name || id).trim().slice(0, 120);
  if (!name || !isValidThemeId(id) || !fileUrl) {
    return corsJson(request, { error: "invalid" }, { status: 400 });
  }

  const { data, error } = await gate.admin
    .from("qr_theme_fonts")
    .upsert(
      {
        id,
        name,
        family: `"${family.replace(/"/g, "")}", sans-serif`,
        source: "file",
        file_url: fileUrl,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();
  if (error) {
    return corsJson(request, { error: "saveFailed", detail: error.message }, { status: 500 });
  }

  return corsJson(request, {
    font: {
      id: data.id,
      name: data.name,
      family: data.family,
      source: "file",
      href: "",
      file_url: data.file_url,
    },
  });
}
