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

async function unlockThemeOnSettings(admin, { userId, kind, themeId }) {
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

  return unlockThemeOnSettings(admin, { userId, kind, themeId });
}

export async function markPlayThemePaid(admin, {
  userId,
  kind,
  themeId,
  sku,
  purchaseToken,
  orderId,
  amountPaise,
}) {
  const now = new Date().toISOString();
  const { data: existing } = await admin
    .from("theme_purchases")
    .select("id, status")
    .eq("play_purchase_token", purchaseToken)
    .maybeSingle();

  if (existing?.status !== "paid") {
    if (existing) {
      const { error } = await admin
        .from("theme_purchases")
        .update({
          status: "paid",
          provider: "play",
          play_sku: sku,
          play_order_id: orderId || null,
          paid_at: now,
        })
        .eq("id", existing.id);
      if (error && error.code !== "23505") {
        throw new Error(error.message || "Could not save that payment.");
      }
    } else {
      const { error } = await admin.from("theme_purchases").insert({
        user_id: userId,
        kind,
        theme_id: themeId,
        amount_paise: amountPaise,
        provider: "play",
        play_sku: sku,
        play_purchase_token: purchaseToken,
        play_order_id: orderId || null,
        razorpay_order_id: null,
        status: "paid",
        paid_at: now,
      });
      if (error && error.code !== "23505") {
        throw new Error(error.message || "Could not save that payment.");
      }
    }
  }

  return unlockThemeOnSettings(admin, { userId, kind, themeId });
}
