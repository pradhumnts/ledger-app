import { getSupabaseBrowserClient } from "@/lib/supabase/client";

async function accessToken() {
  const supabase = getSupabaseBrowserClient();
  const { data } = (await supabase?.auth.getSession()) || {};
  return data?.session?.access_token || "";
}

export async function adminHeaders() {
  const token = await accessToken();
  if (!token) throw new Error("signIn");
  return {
    Authorization: `Bearer ${token}`,
    "X-MoneyKit-Access-Token": token,
  };
}

export async function adminJson(url, { method = "GET", body } = {}) {
  const headers = await adminHeaders();
  const init = { method, headers: { ...headers } };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(payload.error || "requestFailed");
    err.status = response.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

export async function adminUpload({ kind, file, themeId, fontId }) {
  const headers = await adminHeaders();
  const form = new FormData();
  form.set("kind", kind);
  form.set("file", file);
  if (themeId) form.set("themeId", themeId);
  if (fontId) form.set("fontId", fontId);
  const response = await fetch("/api/admin/qr-themes/upload", {
    method: "POST",
    headers,
    body: form,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(payload.error || "uploadFailed");
    err.status = response.status;
    throw err;
  }
  return payload;
}
