import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteUrl, slugProblem } from "@/lib/sites/config";

const MEDIA_BUCKET = "site-media";

function publicMediaUrl(path) {
  const base = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export function siteSummary(row) {
  if (!row) return null;
  return {
    slug: row.slug || "",
    status: row.status,
    url: row.slug ? siteUrl(row.slug) : "",
    draft: row.draft,
    published: row.published,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

export async function loadLiveSite(slug) {
  if (slugProblem(slug)) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("sites")
    .select("slug, status, published, published_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || data.status !== "live" || !data.published) return null;
  return data;
}

export async function loadSiteForUser(admin, userId) {
  const { data } = await admin
    .from("sites")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data || null;
}

export async function loadBusiness(admin, userId) {
  const { data } = await admin
    .from("businesses")
    .select("name, phone, address, logo_path, business_type")
    .eq("user_id", userId)
    .maybeSingle();
  return data || {};
}

export async function isSlugTaken(admin, slug, userId) {
  const { data } = await admin
    .from("sites")
    .select("user_id")
    .eq("slug", slug)
    .maybeSingle();
  return Boolean(data && data.user_id !== userId);
}

/** Copy the private shop logo into the public site bucket so live sites can show it. */
export async function publishLogo(admin, userId, logoPath) {
  if (!logoPath) return "";
  try {
    const { data: file, error } = await admin.storage
      .from("business-logos")
      .download(logoPath);
    if (error || !file) return "";
    const path = `${userId}/logo.jpg`;
    const { error: uploadError } = await admin.storage
      .from(MEDIA_BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    return uploadError ? "" : `${publicMediaUrl(path)}?v=${Date.now()}`;
  } catch {
    return "";
  }
}

export async function saveDraft(admin, { userId, draft, slug }) {
  const existing = await loadSiteForUser(admin, userId);
  const patch = {
    draft,
    template_id: draft.templateId,
    template_version: draft.templateVersion,
  };
  if (slug !== undefined) patch.slug = slug;

  if (existing) {
    const { data, error } = await admin
      .from("sites")
      .update(patch)
      .eq("user_id", userId)
      .select("*")
      .single();
    return { row: data, error };
  }
  const { data, error } = await admin
    .from("sites")
    .insert({ user_id: userId, status: "draft", ...patch })
    .select("*")
    .single();
  return { row: data, error };
}

export async function publishDraft(admin, userId) {
  const existing = await loadSiteForUser(admin, userId);
  if (!existing) return { error: "noSite" };
  if (!existing.slug) return { error: "noSlug" };
  if (existing.status === "suspended") return { error: "suspended" };
  const { data, error } = await admin
    .from("sites")
    .update({
      published: existing.draft,
      status: "live",
      published_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) return { error: "save" };
  return { row: data };
}
