import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteUrl, slugProblem } from "@/lib/sites/config";
import { ownerSitePlan } from "@/lib/sites/subscription";

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

/**
 * A live site with its owner's plan `tier` and the service `pages` it may show,
 * or null when it shouldn't be shown.
 */
export async function loadLiveSite(slug) {
  if (slugProblem(slug)) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("sites")
    .select("user_id, slug, status, published, published_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || data.status !== "live" || !data.published) return null;
  const { tier, pages } = await ownerSitePlan(admin, data.user_id);
  if (!tier) return null;
  return { ...data, tier, pages };
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

/** Saved business row, filled in from the app's local copy when it has not synced yet. */
export async function loadProfile(admin, userId, local) {
  const business = await loadBusiness(admin, userId);
  const source = local && typeof local === "object" ? local : {};
  const pick = (value, fallback) => String(value || "").trim() || String(fallback || "").trim();
  return {
    ...business,
    name: pick(business.name, source.name),
    phone: pick(business.phone, source.phone),
    address: pick(business.address, source.address),
    business_type: pick(business.business_type, source.type),
  };
}

export async function isSlugTaken(admin, slug, userId) {
  const { data } = await admin
    .from("sites")
    .select("user_id")
    .eq("slug", slug)
    .maybeSingle();
  return Boolean(data && data.user_id !== userId);
}

/** Last-modified time (ms) of a storage object, or 0 when it doesn't exist. */
async function objectUpdatedAt(admin, bucket, path) {
  const slash = path.lastIndexOf("/");
  const name = path.slice(slash + 1);
  const { data } = await admin.storage
    .from(bucket)
    .list(path.slice(0, slash), { search: name, limit: 5 });
  const item = (data || []).find((entry) => entry.name === name);
  return item ? new Date(item.updated_at || item.created_at || 0).getTime() || 0 : 0;
}

/**
 * Public copy of the private shop logo for live sites. Only re-copied when the
 * shop's logo changed; the `?v=` is the logo's own timestamp so the URL (and
 * the draft) stay the same between loads.
 */
export async function publishLogo(admin, userId, logoPath) {
  if (!logoPath) return "";
  const path = `${userId}/logo.jpg`;
  try {
    const [source, copy] = await Promise.all([
      objectUpdatedAt(admin, "business-logos", logoPath),
      objectUpdatedAt(admin, MEDIA_BUCKET, path),
    ]);
    if (!source) return "";
    const url = `${publicMediaUrl(path)}?v=${source}`;
    if (copy >= source) return url;

    const { data: file, error } = await admin.storage
      .from("business-logos")
      .download(logoPath);
    if (error || !file) return "";
    const { error: uploadError } = await admin.storage
      .from(MEDIA_BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    return uploadError ? "" : url;
  } catch {
    return "";
  }
}

/** One round trip: new shops get a draft row (status defaults to draft), others are updated. */
export async function saveDraft(admin, { userId, draft, slug }) {
  const patch = {
    user_id: userId,
    draft,
    template_id: draft.templateId,
    template_version: draft.templateVersion,
  };
  if (slug !== undefined) patch.slug = slug;
  const { data, error } = await admin
    .from("sites")
    .upsert(patch, { onConflict: "user_id" })
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
