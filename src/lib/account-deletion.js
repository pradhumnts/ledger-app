import { revalidatePath } from "next/cache";

// Both buckets keep a shop's files under `{user_id}/`.
const USER_BUCKETS = ["business-logos", "site-media"];

async function filesUnder(admin, bucket, folder) {
  const paths = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await admin.storage.from(bucket).list(folder, { limit: 100, offset });
    if (error) throw new Error(error.message || "Could not list files.");
    for (const item of data || []) {
      const path = `${folder}/${item.name}`;
      if (item.id) paths.push(path);
      else paths.push(...(await filesUnder(admin, bucket, path)));
    }
    if (!data || data.length < 100) return paths;
  }
}

async function removeUserFiles(admin, userId) {
  for (const bucket of USER_BUCKETS) {
    const paths = await filesUnder(admin, bucket, userId);
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await admin.storage.from(bucket).remove(paths.slice(i, i + 100));
      if (error) throw new Error(error.message || "Could not delete files.");
    }
  }
}

/**
 * Delete a shop for good: its files, public bill links, website and login.
 * Every other row (ledger, settings, subscriptions, referrals) goes with the
 * auth user through `on delete cascade`. Store subscriptions keep billing
 * until the shop cancels them with Apple or Google.
 */
export async function deleteAccount(admin, userId) {
  const { data: site } = await admin
    .from("sites")
    .select("slug")
    .eq("user_id", userId)
    .maybeSingle();

  await removeUserFiles(admin, userId);

  const { error: billsError } = await admin.from("public_bills").delete().eq("user_id", userId);
  if (billsError) throw new Error(billsError.message || "Could not delete bill links.");

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message || "Could not delete the account.");

  if (site?.slug) revalidatePath(`/sites/${site.slug}`);
}
