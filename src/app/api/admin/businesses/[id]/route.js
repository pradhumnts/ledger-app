import { NextResponse } from "next/server";
import {
  adminBusinessTypeLabel,
  adminThemeName,
  resolveBusinessLogoUrl,
} from "@/lib/admin-business";
import { getAdminSessionFromRequest } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service role is not configured on the server." },
      { status: 503 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing business id." }, { status: 400 });
  }

  const businessRes = await admin
    .from("businesses")
    .select(
      "id, user_id, name, phone, address, logo_path, upi_id, business_type, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (businessRes.error) {
    return NextResponse.json(
      { error: businessRes.error.message || "Could not load business." },
      { status: 500 }
    );
  }
  if (!businessRes.data) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const business = businessRes.data;
  const userId = business.user_id;

  const [
    profileRes,
    settingsRes,
    customersCountRes,
    invoicesCountRes,
    paymentsCountRes,
    invoicesSumRes,
    paymentsSumRes,
    recentInvoicesRes,
    purchasesRes,
    publicBillsCountRes,
    logoUrl,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, phone, created_at")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("settings")
      .select(
        "appearance, language, bill_theme, qr_theme, unlocked_bill_themes, unlocked_qr_themes, onboarding_complete, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
    admin
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "invoice")
      .is("voided_at", null),
    admin
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "got")
      .is("voided_at", null),
    admin
      .from("entries")
      .select("amount_paise, due_paise")
      .eq("user_id", userId)
      .eq("kind", "invoice")
      .is("voided_at", null),
    admin
      .from("entries")
      .select("amount_paise")
      .eq("user_id", userId)
      .eq("kind", "got")
      .is("voided_at", null),
    admin
      .from("entries")
      .select(
        "id, customer_id, external_id, amount_paise, due_paise, description, occurred_on, created_at"
      )
      .eq("user_id", userId)
      .eq("kind", "invoice")
      .is("voided_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("theme_purchases")
      .select(
        "id, kind, theme_id, amount_paise, status, paid_at, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("public_bills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    resolveBusinessLogoUrl(admin, business.logo_path),
  ]);

  const loadError =
    profileRes.error ||
    settingsRes.error ||
    customersCountRes.error ||
    invoicesCountRes.error ||
    paymentsCountRes.error ||
    invoicesSumRes.error ||
    paymentsSumRes.error ||
    recentInvoicesRes.error ||
    purchasesRes.error ||
    publicBillsCountRes.error;

  if (loadError) {
    return NextResponse.json(
      { error: loadError.message || "Could not load business details." },
      { status: 500 }
    );
  }

  const invoices = invoicesSumRes.data || [];
  const payments = paymentsSumRes.data || [];
  const billedPaise = invoices.reduce(
    (sum, row) => sum + (Number(row.amount_paise) || 0),
    0
  );
  const outstandingPaise = invoices.reduce(
    (sum, row) => sum + (Number(row.due_paise) || 0),
    0
  );
  const collectedPaise = payments.reduce(
    (sum, row) => sum + (Number(row.amount_paise) || 0),
    0
  );

  const paidPurchases = (purchasesRes.data || []).filter(
    (row) => row.status === "paid"
  );
  const themeSpendPaise = paidPurchases.reduce(
    (sum, row) => sum + (Number(row.amount_paise) || 0),
    0
  );

  const lastActivityRes = await admin
    .from("entries")
    .select("created_at")
    .eq("user_id", userId)
    .is("voided_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const settings = settingsRes.data;
  const recentInvoiceRows = recentInvoicesRes.data || [];
  const customerIds = [
    ...new Set(
      recentInvoiceRows.map((row) => row.customer_id).filter(Boolean)
    ),
  ];
  const entryExternalIds = [
    ...new Set(
      recentInvoiceRows.map((row) => row.external_id).filter(Boolean)
    ),
  ];

  let customerById = new Map();
  if (customerIds.length) {
    const customersRes = await admin
      .from("customers")
      .select("id, name, phone")
      .in("id", customerIds);
    if (customersRes.error) {
      return NextResponse.json(
        { error: customersRes.error.message || "Could not load customers." },
        { status: 500 }
      );
    }
    customerById = new Map(
      (customersRes.data || []).map((row) => [row.id, row])
    );
  }

  let publicBillByEntry = new Map();
  if (entryExternalIds.length) {
    const publicBillsRes = await admin
      .from("public_bills")
      .select("id, entry_external_id")
      .eq("user_id", userId)
      .in("entry_external_id", entryExternalIds);
    if (publicBillsRes.error) {
      return NextResponse.json(
        {
          error:
            publicBillsRes.error.message || "Could not load public bills.",
        },
        { status: 500 }
      );
    }
    publicBillByEntry = new Map(
      (publicBillsRes.data || [])
        .filter((row) => row.entry_external_id)
        .map((row) => [row.entry_external_id, row.id])
    );
  }

  return NextResponse.json({
    business: {
      id: business.id,
      userId: business.user_id,
      name: business.name || "Unnamed shop",
      phone: business.phone || "",
      address: business.address || "",
      upiId: business.upi_id || "",
      businessType: business.business_type || "",
      businessTypeLabel: adminBusinessTypeLabel(business.business_type),
      logoUrl,
      createdAt: business.created_at,
      updatedAt: business.updated_at,
    },
    profile: {
      phone: profileRes.data?.phone || "",
      createdAt: profileRes.data?.created_at || null,
    },
    settings: {
      appearance: settings?.appearance || "light",
      language: settings?.language || "en",
      billTheme: settings?.bill_theme || "classic",
      billThemeName: adminThemeName("bill", settings?.bill_theme || "classic"),
      qrTheme: settings?.qr_theme || null,
      qrThemeName: settings?.qr_theme
        ? adminThemeName("qr", settings.qr_theme)
        : null,
      unlockedBillThemes: (settings?.unlocked_bill_themes || []).map(
        (themeId) => ({
          id: themeId,
          name: adminThemeName("bill", themeId),
        })
      ),
      unlockedQrThemes: (settings?.unlocked_qr_themes || []).map((themeId) => ({
        id: themeId,
        name: adminThemeName("qr", themeId),
      })),
      onboardingComplete: Boolean(settings?.onboarding_complete),
      updatedAt: settings?.updated_at || null,
    },
    stats: {
      customers: customersCountRes.count ?? 0,
      bills: invoicesCountRes.count ?? 0,
      payments: paymentsCountRes.count ?? 0,
      billedPaise,
      outstandingPaise,
      collectedPaise,
      themePurchases: paidPurchases.length,
      themeSpendPaise,
      publicBills: publicBillsCountRes.count ?? 0,
      lastActivityAt: lastActivityRes.data?.created_at || null,
    },
    recentBills: recentInvoiceRows.map((row) => {
      const customer = customerById.get(row.customer_id);
      const publicBillId = publicBillByEntry.get(row.external_id) || null;
      return {
        id: row.id,
        amountPaise: row.amount_paise,
        duePaise: row.due_paise,
        description: row.description || "",
        occurredOn: row.occurred_on,
        createdAt: row.created_at,
        customerName: customer?.name || "Unknown customer",
        customerPhone: customer?.phone || "",
        publicUrl: publicBillId ? `/b/${publicBillId}` : null,
      };
    }),
    purchases: paidPurchases.map((row) => ({
      id: row.id,
      kind: row.kind,
      themeId: row.theme_id,
      themeName: adminThemeName(row.kind, row.theme_id),
      amountPaise: row.amount_paise,
      paidAt: row.paid_at || row.created_at,
    })),
  });
}
