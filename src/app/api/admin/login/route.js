import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminCredentialsConfigured,
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request) {
  if (!adminCredentialsConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured on the server." },
      { status: 503 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await createAdminSessionToken(email);
  if (!token) {
    return NextResponse.json(
      { error: "Could not create admin session." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    token,
    adminSessionCookieOptions()
  );
  return response;
}
