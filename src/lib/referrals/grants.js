/**
 * Website access from free months given outside a Play plan (the bill challenge).
 * Back-to-back grants count as one run; returns when it ends, or null.
 */
export async function activeGrant(admin, userId, now = Date.now()) {
  const { data } = await admin
    .from("site_access_grants")
    .select("starts_at, ends_at")
    .eq("user_id", userId)
    .gt("ends_at", new Date(now).toISOString())
    .order("starts_at", { ascending: true })
    .limit(24);
  const rows = data || [];
  if (!rows.length || new Date(rows[0].starts_at).getTime() > now) return null;

  let endsAt = new Date(rows[0].ends_at).getTime();
  for (const row of rows.slice(1)) {
    if (new Date(row.starts_at).getTime() > endsAt) break;
    endsAt = Math.max(endsAt, new Date(row.ends_at).getTime());
  }
  return { endsAt: new Date(endsAt).toISOString() };
}

/** Last day any grant (current or queued) covers, so a new one starts after it. */
export async function lastGrantEnd(admin, userId) {
  const { data } = await admin
    .from("site_access_grants")
    .select("ends_at")
    .eq("user_id", userId)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.ends_at ? new Date(data.ends_at).getTime() : 0;
}
