import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/supabase/user-from-request";
import { themeAlreadyUnlocked } from "@/lib/supabase/unlock-theme";
import { createRazorpayOrder, razorpayConfig } from "@/lib/razorpay";
import { getPaidTheme } from "@/lib/theme-catalog";

export const runtime = "nodejs";

export async function POST(request) {
  const admin = getSupabaseAdmin();
  const { keyId, configured } = razorpayConfig();
  if (!admin || !configured) {
    return NextResponse.json(
      { error: "Payments are not configured on the server." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const user = await getUserFromRequest(request, body.accessToken);
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to buy this theme." },
      { status: 401 }
    );
  }

  const theme = getPaidTheme(body.kind, body.themeId);
  if (!theme) {
    return NextResponse.json({ error: "That theme is not for sale." }, { status: 400 });
  }

  const alreadyUnlocked = await themeAlreadyUnlocked(
    admin,
    user.id,
    theme.kind,
    theme.themeId
  );
  if (alreadyUnlocked) {
    return NextResponse.json(
      { error: "You already own this theme.", alreadyOwned: true },
      { status: 409 }
    );
  }

  const { data: paid } = await admin
    .from("theme_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", theme.kind)
    .eq("theme_id", theme.themeId)
    .eq("status", "paid")
    .maybeSingle();
  if (paid) {
    return NextResponse.json(
      { error: "You already own this theme.", alreadyOwned: true },
      { status: 409 }
    );
  }

  try {
    const order = await createRazorpayOrder({
      amountPaise: theme.amountPaise,
      receipt: `mk_${theme.kind}_${theme.themeId}_${Date.now().toString(36)}`.slice(
        0,
        40
      ),
      notes: {
        user_id: user.id,
        kind: theme.kind,
        theme_id: theme.themeId,
      },
    });

    const { error } = await admin.from("theme_purchases").insert({
      user_id: user.id,
      kind: theme.kind,
      theme_id: theme.themeId,
      amount_paise: theme.amountPaise,
      razorpay_order_id: order.id,
      status: "created",
    });
    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not save that order." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: theme.amountPaise,
      currency: "INR",
      keyId,
      name: theme.name,
      description: `MoneyKit ${theme.kind === "bill" ? "bill" : "QR"} theme — ${theme.name}`,
      kind: theme.kind,
      themeId: theme.themeId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not start payment." },
      { status: 400 }
    );
  }
}
