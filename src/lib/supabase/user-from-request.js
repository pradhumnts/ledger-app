import { getSupabaseEnv } from "./env.js";

function tokenFromRequest(request, bodyToken = "") {
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const custom = request.headers.get("x-moneykit-access-token") || "";
  return String(bearer || custom || bodyToken || "").trim();
}

export async function getUserFromRequest(request, bodyToken = "") {
  const token = tokenFromRequest(request, bodyToken);
  if (!token) return null;

  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return user?.id ? user : null;
}
