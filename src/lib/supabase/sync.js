import { rowsToCustomer, rowsToEntry, stateToBackupRows } from "@/lib/supabase/map-state";

export async function pushShop(supabase, userId, state) {
  if (!supabase || !userId) return { ok: false };
  const rows = stateToBackupRows(state, userId);

  const { error: businessError } = await supabase
    .from("businesses")
    .upsert(rows.business, { onConflict: "user_id" });
  if (businessError) return { ok: false, error: businessError };

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(rows.settings, { onConflict: "user_id" });
  if (settingsError) return { ok: false, error: settingsError };

  if (rows.customers.length) {
    const { error: customerError } = await supabase
      .from("customers")
      .upsert(rows.customers, { onConflict: "user_id,external_id" });
    if (customerError) return { ok: false, error: customerError };
  }

  const { data: customerRows, error: lookupError } = await supabase
    .from("customers")
    .select("id, external_id")
    .eq("user_id", userId);
  if (lookupError) return { ok: false, error: lookupError };

  const idByExternal = Object.fromEntries(
    (customerRows || []).map((row) => [row.external_id, row.id])
  );

  const entryPayload = rows.entries
    .map((entry) => {
      const customerId = idByExternal[entry.customer_external_id];
      if (!customerId) return null;
      return {
        user_id: entry.user_id,
        customer_id: customerId,
        external_id: entry.external_id,
        kind: entry.kind,
        amount_paise: entry.amount_paise,
        due_paise: entry.due_paise,
        description: entry.description,
        occurred_on: entry.occurred_on,
        created_at: entry.created_at,
      };
    })
    .filter(Boolean);

  if (entryPayload.length) {
    const { error: entryError } = await supabase.from("entries").upsert(entryPayload, {
      onConflict: "user_id,external_id",
      ignoreDuplicates: true,
    });
    if (entryError) return { ok: false, error: entryError };
  }

  return { ok: true };
}

export async function pullShop(supabase, userId) {
  if (!supabase || !userId) return null;

  const [
    { data: business },
    { data: settings },
    { data: customers },
    { data: entries },
  ] = await Promise.all([
    supabase.from("businesses").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("settings").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null),
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .is("voided_at", null),
  ]);

  if (!settings?.onboarding_complete) return null;

  const customerByUuid = Object.fromEntries(
    (customers || []).map((row) => [row.id, row.external_id])
  );

  return {
    business: {
      name: business?.name || "",
      phone: business?.phone || "",
      address: business?.address || "",
      upiId: business?.upi_id || "",
      type: business?.business_type || "",
      logo: "",
    },
    settings: {
      theme: settings.appearance === "dark" ? "dark" : "light",
      language: settings.language || "en",
      billTheme: settings.bill_theme || "classic",
      qrTheme: settings.qr_theme || null,
      unlockedBillThemes: settings.unlocked_bill_themes || [],
      unlockedQrThemes: settings.unlocked_qr_themes || [],
      qrSettingsVersion: settings.qr_settings_version ?? 2,
      onboardingComplete: true,
    },
    customers: (customers || []).map(rowsToCustomer),
    entries: (entries || [])
      .map((row) => rowsToEntry(row, customerByUuid[row.customer_id]))
      .filter((row) => row.customerId),
  };
}
