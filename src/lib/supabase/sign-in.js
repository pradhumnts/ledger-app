import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toE164India } from "@/lib/supabase/phone";
import { pullShop } from "@/lib/supabase/sync";

export async function requestPhoneOtp(phone) {
  if (!isSupabaseConfigured()) {
    return { skipped: true };
  }

  const e164 = toE164India(phone);
  if (!e164) throw new Error("Enter a valid mobile number.");

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.phone === e164) {
      const shop = await pullShop(supabase, session.user.id);
      return {
        skipped: false,
        alreadyVerified: true,
        userId: session.user.id,
        shop,
      };
    }
  }

  const response = await fetch("/api/auth/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not send the SMS code.");
  }
  return {
    skipped: false,
    alreadyVerified: false,
    reqId: payload.reqId,
  };
}

export async function verifyPhoneOtp(phone, token, reqId) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp: token, reqId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not verify that code.");
  }

  const { error } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: payload.hashed_token,
  });
  if (error) throw error;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id || payload.user?.id;
  if (!userId) throw new Error("Could not sign in.");

  const shop = await pullShop(supabase, userId);
  return { userId, shop };
}

export function authErrorKey(error, fallback = "auth.phoneFailed") {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("api key") || message.includes("apikey")) {
    return "auth.apiKeyInvalid";
  }
  if (
    message.includes("invalid") ||
    message.includes("expired") ||
    message.includes("token") ||
    message.includes("otp")
  ) {
    return "auth.otpInvalid";
  }
  if (
    message.includes("rate") ||
    message.includes("sms") ||
    message.includes("provider") ||
    message.includes("phone")
  ) {
    return "auth.otpSendFailed";
  }
  return fallback;
}
