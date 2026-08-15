import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toE164India } from "@/lib/supabase/phone";
import { pullShop } from "@/lib/supabase/sync";

export async function requestPhoneOtp(phone) {
  if (!isSupabaseConfigured()) {
    return { skipped: true };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { skipped: true };

  const e164 = toE164India(phone);
  if (!e164) throw new Error("Enter a valid mobile number.");

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

  const { error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: {
      channel: "sms",
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
  return { skipped: false, alreadyVerified: false };
}

export async function verifyPhoneOtp(phone, token) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const e164 = toE164India(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: e164,
    token: String(token || "").trim(),
    type: "sms",
  });
  if (error) throw error;

  const userId = data.session?.user?.id;
  if (!userId) throw new Error("Could not verify that code.");

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
