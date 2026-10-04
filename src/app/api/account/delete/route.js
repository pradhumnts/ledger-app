import { deleteAccount } from "@/lib/account-deletion";
import { corsJson, corsPreflight } from "@/lib/api-cors";
import { siteRequest } from "@/lib/sites/api";

export const runtime = "nodejs";

export async function OPTIONS(request) {
  return corsPreflight(request);
}

/** In-app account deletion. The app sends `confirm: "DELETE"` after the shop confirms. */
export async function POST(request) {
  const ctx = await siteRequest(request);
  if (ctx.response) return ctx.response;
  const { admin, user, body } = ctx;

  if (body.confirm !== "DELETE") {
    return corsJson(request, { error: "confirm" }, { status: 400 });
  }
  try {
    await deleteAccount(admin, user.id);
  } catch (error) {
    console.error("account deletion failed", error);
    return corsJson(request, { error: "failed" }, { status: 500 });
  }
  return corsJson(request, { ok: true });
}
