import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionToken,
} from "@/lib/admin-session";
import {
  ONBOARDING_COOKIE,
  isAdminPath,
  isUnauthedAllowedPath,
} from "@/lib/onboarding-gate";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/.well-known/") ||
    pathname.startsWith("/manifests/") ||
    pathname.endsWith(".webmanifest")
  ) {
    return NextResponse.next();
  }

  if (isAdminPath(pathname)) {
    const onLogin =
      pathname === "/admin/login" || pathname === "/admin/login/";
    const session = await parseAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    if (!onLogin && !session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (onLogin && session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const onboarded = request.cookies.get(ONBOARDING_COOKIE)?.value === "1";
  const onOnboarding = pathname === "/onboarding";

  if (!onboarded && !isUnauthedAllowedPath(pathname)) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (onboarded && onOnboarding) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifests|sw.js|workbox|icon|apple-touch-icon|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
