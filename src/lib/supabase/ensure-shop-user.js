import {
  indianMobileDigits,
  sameIndianMobile,
  shopLoginEmail,
  toE164India,
} from "./phone.js";

export function pickShopOwnerId(candidates) {
  if (!candidates.length) return null;
  return [...candidates].sort((left, right) => {
    if (right.entries !== left.entries) return right.entries - left.entries;
    if (right.customers !== left.customers) return right.customers - left.customers;
    if (Boolean(right.onboarded) !== Boolean(left.onboarded)) {
      return left.onboarded ? -1 : 1;
    }
    return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
  })[0].id;
}

function isAlreadyRegistered(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("already") ||
    message.includes("registered") ||
    error?.status === 422
  );
}

function isEmptyShop(candidate) {
  return (candidate.entries || 0) === 0 && (candidate.customers || 0) === 0;
}

async function listAuthUsers(admin) {
  const users = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < 200) break;
  }
  return users;
}

async function findCandidateIds(admin, e164, email) {
  const digits = indianMobileDigits(e164);
  const ids = new Set();

  const [{ data: profiles }, { data: shops }] = await Promise.all([
    admin.from("profiles").select("id, phone").like("phone", `%${digits}`),
    admin.from("businesses").select("user_id, phone").eq("phone", digits),
  ]);

  for (const row of profiles || []) {
    if (sameIndianMobile(row.phone, e164)) ids.add(row.id);
  }
  for (const row of shops || []) {
    if (row.user_id) ids.add(row.user_id);
  }

  try {
    const users = await listAuthUsers(admin);
    for (const user of users) {
      if (sameIndianMobile(user.phone, e164)) ids.add(user.id);
      if (
        email &&
        String(user.email || "").toLowerCase() === email.toLowerCase()
      ) {
        ids.add(user.id);
      }
    }
  } catch {
    // Auth listing is a fallback; profiles / businesses may still find the shop.
  }

  return [...ids];
}

async function loadCandidates(admin, ids) {
  const rows = await Promise.all(
    ids.map(async (id) => {
      const [
        { count: customers },
        { count: entries },
        { data: settings },
        userResult,
      ] = await Promise.all([
        admin
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", id)
          .is("deleted_at", null),
        admin
          .from("entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", id)
          .is("voided_at", null),
        admin
          .from("settings")
          .select("onboarding_complete")
          .eq("user_id", id)
          .maybeSingle(),
        admin.auth.admin.getUserById(id),
      ]);
      if (userResult.error || !userResult.data?.user) return null;
      return {
        id,
        customers: customers || 0,
        entries: entries || 0,
        onboarded: Boolean(settings?.onboarding_complete),
        createdAt: userResult.data.user.created_at || "",
        email: userResult.data.user.email || "",
        phone: userResult.data.user.phone || "",
      };
    })
  );
  return rows.filter(Boolean);
}

async function createShopUser(admin, e164, email) {
  const created = await admin.auth.admin.createUser({
    email,
    phone: e164,
    email_confirm: true,
    phone_confirm: true,
  });
  if (!created.error && created.data?.user?.id) {
    return created.data.user;
  }
  if (!isAlreadyRegistered(created.error)) {
    throw new Error(created.error?.message || "Could not create shop user.");
  }
  return null;
}

async function attachLoginIdentity(admin, winner, e164, email) {
  const currentEmail = String(winner.email || "").trim();
  const loginEmail =
    currentEmail && currentEmail.toLowerCase() !== email.toLowerCase()
      ? currentEmail
      : email;

  const attributes = {
    phone: e164,
    phone_confirm: true,
    email_confirm: true,
  };
  if (!currentEmail || currentEmail.toLowerCase() === email.toLowerCase()) {
    attributes.email = email;
  }

  const updated = await admin.auth.admin.updateUserById(winner.id, attributes);
  if (updated.error && !isAlreadyRegistered(updated.error)) {
    throw new Error(updated.error.message || "Could not attach login to shop.");
  }
  return loginEmail;
}

export async function ensureShopUser(admin, phone) {
  const e164 = toE164India(phone);
  const email = shopLoginEmail(phone);
  if (!e164 || !email) {
    throw new Error("Enter a valid mobile number.");
  }

  let candidateIds = await findCandidateIds(admin, e164, email);
  let candidates = await loadCandidates(admin, candidateIds);
  let winnerId = pickShopOwnerId(candidates);

  if (!winnerId) {
    const created = await createShopUser(admin, e164, email);
    if (created?.id) {
      return { userId: created.id, email };
    }
    candidateIds = await findCandidateIds(admin, e164, email);
    candidates = await loadCandidates(admin, candidateIds);
    winnerId = pickShopOwnerId(candidates);
  }

  if (!winnerId) {
    throw new Error("Could not create shop user.");
  }

  const winner = candidates.find((row) => row.id === winnerId);
  if (!winner) {
    throw new Error("Could not create shop user.");
  }
  const losers = candidates.filter(
    (row) => row.id !== winnerId && isEmptyShop(row)
  );
  await Promise.all(
    losers.map((row) => admin.auth.admin.deleteUser(row.id))
  );

  const loginEmail = await attachLoginIdentity(admin, winner, e164, email);
  return { userId: winnerId, email: loginEmail };
}
