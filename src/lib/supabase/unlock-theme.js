export async function themeAlreadyUnlocked(admin, userId, kind, themeId) {
  const { data } = await admin
    .from("settings")
    .select("unlocked_bill_themes, unlocked_qr_themes")
    .eq("user_id", userId)
    .maybeSingle();
  const list =
    kind === "bill"
      ? data?.unlocked_bill_themes || []
      : data?.unlocked_qr_themes || [];
  return list.includes(themeId);
}

export async function markThemePaid(admin, { userId, kind, themeId, orderId, paymentId }) {
  const now = new Date().toISOString();
  const { error: purchaseError } = await admin
    .from("theme_purchases")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId || null,
      paid_at: now,
    })
    .eq("razorpay_order_id", orderId);

  if (purchaseError && purchaseError.code !== "23505") {
    throw new Error(purchaseError.message || "Could not save that payment.");
  }

  const { data: settings, error: settingsError } = await admin
    .from("settings")
    .select("unlocked_bill_themes, unlocked_qr_themes, bill_theme, qr_theme")
    .eq("user_id", userId)
    .maybeSingle();
  if (settingsError) {
    throw new Error(settingsError.message || "Could not unlock that theme.");
  }

  const bill = new Set(settings?.unlocked_bill_themes || []);
  const qr = new Set(settings?.unlocked_qr_themes || []);
  if (kind === "bill") bill.add(themeId);
  if (kind === "qr") qr.add(themeId);

  const { error: unlockError } = await admin
    .from("settings")
    .update({
      unlocked_bill_themes: [...bill],
      unlocked_qr_themes: [...qr],
      bill_theme: kind === "bill" ? themeId : settings?.bill_theme || "classic",
      qr_theme: kind === "qr" ? themeId : settings?.qr_theme || null,
    })
    .eq("user_id", userId);
  if (unlockError) {
    throw new Error(unlockError.message || "Could not unlock that theme.");
  }

  return { kind, themeId };
}
