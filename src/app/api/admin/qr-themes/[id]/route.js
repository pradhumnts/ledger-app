import { corsJson, corsPreflight } from "@/lib/api-cors";
import { requireThemeAdmin } from "@/lib/admin/require-theme-admin";
import { isValidThemeId, rowToTheme, themeToRow } from "@/lib/qr-theme-catalog";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

export async function GET(request, { params }) {
  const gate = await requireThemeAdmin(request);
  if (gate.response) return gate.response;

  const id = String((await params)?.id || "");
  if (!isValidThemeId(id)) {
    return corsJson(request, { error: "invalidId" }, { status: 400 });
  }

  const { data, error } = await gate.admin
    .from("qr_themes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return corsJson(request, { error: "loadFailed", detail: error.message }, { status: 500 });
  }
  if (!data) return corsJson(request, { error: "notFound" }, { status: 404 });
  return corsJson(request, { theme: rowToTheme(data) });
}

export async function PATCH(request, { params }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const gate = await requireThemeAdmin(request, body.accessToken);
  if (gate.response) return gate.response;

  const id = String((await params)?.id || "");
  if (!isValidThemeId(id)) {
    return corsJson(request, { error: "invalidId" }, { status: 400 });
  }

  const patch = themeToRow(
    {
      name: body.name,
      tagline: body.tagline,
      status: body.status,
      free: body.free,
      priceInr: body.priceInr,
      businessTypes: body.businessTypes,
      posterUrl: body.posterUrl,
      previewUrl: body.previewUrl,
      style: body.style,
      sortOrder: body.sortOrder,
    },
    { partial: true }
  );
  delete patch.id;
  if (!Object.keys(patch).length) {
    return corsJson(request, { error: "empty" }, { status: 400 });
  }

  const { data, error } = await gate.admin
    .from("qr_themes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    return corsJson(request, { error: "saveFailed", detail: error.message }, { status: 500 });
  }
  if (!data) return corsJson(request, { error: "notFound" }, { status: 404 });
  return corsJson(request, { theme: rowToTheme(data) });
}

export async function DELETE(request, { params }) {
  const gate = await requireThemeAdmin(request);
  if (gate.response) return gate.response;

  const id = String((await params)?.id || "");
  if (!isValidThemeId(id)) {
    return corsJson(request, { error: "invalidId" }, { status: 400 });
  }

  const { error } = await gate.admin.from("qr_themes").delete().eq("id", id);
  if (error) {
    return corsJson(request, { error: "deleteFailed", detail: error.message }, { status: 500 });
  }
  return corsJson(request, { ok: true });
}
