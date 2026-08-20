import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isPublicBillId,
  randomPublicBillId,
  snapshotPublicBill,
} from "@/lib/public-bill";

function entryExternalId(snapshot) {
  const id = snapshot?.entry?.id;
  if (!id || id === "public") return null;
  return id;
}

export async function savePublicBill({ snapshot, userId }) {
  const payload = snapshotPublicBill(snapshot);
  if (!payload) return { error: "invalid", status: 400 };

  const admin = getSupabaseAdmin();
  if (!admin) return { error: "unavailable", status: 503 };

  const ownerId = userId || null;
  const externalId = entryExternalId(payload);

  if (ownerId && externalId) {
    const { data: existing } = await admin
      .from("public_bills")
      .select("id")
      .eq("user_id", ownerId)
      .eq("entry_external_id", externalId)
      .maybeSingle();
    if (existing?.id) {
      const { error } = await admin
        .from("public_bills")
        .update({ payload })
        .eq("id", existing.id);
      if (error) return { error: "save", status: 500 };
      return { id: existing.id };
    }
  }

  for (let i = 0; i < 8; i += 1) {
    const id = randomPublicBillId();
    const { error } = await admin.from("public_bills").insert({
      id,
      user_id: ownerId,
      entry_external_id: externalId,
      payload,
    });
    if (!error) return { id };
    if (error.code !== "23505") return { error: "save", status: 500 };

    if (ownerId && externalId) {
      const { data: raced } = await admin
        .from("public_bills")
        .select("id")
        .eq("user_id", ownerId)
        .eq("entry_external_id", externalId)
        .maybeSingle();
      if (raced?.id) {
        await admin.from("public_bills").update({ payload }).eq("id", raced.id);
        return { id: raced.id };
      }
    }
  }

  return { error: "save", status: 500 };
}

export async function loadPublicBill(id) {
  if (!isPublicBillId(id)) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("public_bills")
    .select("payload")
    .eq("id", id)
    .maybeSingle();
  return snapshotPublicBill(data?.payload);
}
