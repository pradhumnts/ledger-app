import { entryTypeToKind, paiseToRupees, rupeesToPaise } from "@/lib/supabase/money";

function isoDate(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/** Current in-memory shop → rows keyed for upsert on (user_id, external_id). */
export function stateToBackupRows(state, userId) {
  const business = state.business || {};
  const settings = state.settings || {};

  return {
    business: {
      user_id: userId,
      name: business.name || "",
      phone: String(business.phone || "").replace(/\D/g, "").slice(-10),
      address: business.address || "",
      upi_id: business.upiId || "",
      business_type: business.type || "",
    },
    settings: {
      user_id: userId,
      appearance: settings.theme === "dark" ? "dark" : "light",
      language:
        settings.language === "hi" || settings.language === "hinglish"
          ? settings.language
          : "en",
      bill_theme: settings.billTheme || "classic",
      qr_theme: settings.qrTheme || null,
      unlocked_bill_themes: settings.unlockedBillThemes || [],
      unlocked_qr_themes: settings.unlockedQrThemes || [],
      qr_settings_version: settings.qrSettingsVersion ?? 2,
      onboarding_complete: Boolean(settings.onboardingComplete),
    },
    customers: (state.customers || []).map((customer) => ({
      user_id: userId,
      external_id: customer.id,
      name: customer.name,
      phone: String(customer.phone || "").replace(/\D/g, "").slice(-10),
      created_at: customer.createdAt || new Date().toISOString(),
    })),
    entries: (state.entries || []).map((entry) => {
      const kind = entryTypeToKind(entry.type);
      const amountPaise = rupeesToPaise(entry.amount);
      const duePaise =
        kind === "invoice"
          ? rupeesToPaise(entry.due ?? entry.amount)
          : kind === "got"
            ? rupeesToPaise(entry.due ?? 0)
            : amountPaise;
      return {
        user_id: userId,
        customer_external_id: entry.customerId,
        external_id: entry.id,
        kind,
        amount_paise: amountPaise,
        due_paise: duePaise,
        description: entry.description || "",
        occurred_on: isoDate(entry.date),
        created_at: entry.createdAt || entry.date || new Date().toISOString(),
      };
    }),
  };
}

export function rowsToCustomer(row) {
  return {
    id: row.external_id,
    name: row.name,
    phone: row.phone || "",
    createdAt: row.created_at,
  };
}

export function rowsToEntry(row, customerExternalId) {
  return {
    id: row.external_id,
    customerId: customerExternalId,
    type: row.kind,
    amount: paiseToRupees(row.amount_paise),
    due: paiseToRupees(row.due_paise),
    description: row.description || "",
    date: row.occurred_on,
    createdAt: row.created_at,
  };
}
