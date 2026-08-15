"use client";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient;

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured;
}

/**
 * Browser client. Returns null until env is set.
 * Sign-in is SMS OTP only — no session until the code is verified.
 */
export function getSupabaseBrowserClient() {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
