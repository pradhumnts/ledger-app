import { NextResponse } from "next/server";

const ONBOARDING_COOKIE = "mk_onboarded";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/.well-known/")) {
    return NextResponse.next();
  }

  const onboarded = request.cookies.get(ONBOARDING_COOKIE)?.value === "1";
  const onOnboarding = pathname === "/onboarding";
  const onPayLink = pathname === "/p";
  const onHome = pathname === "/";

  if (!onboarded && !onOnboarding && !onPayLink && !onHome) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (onboarded && onOnboarding) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifest.webmanifest|sw.js|workbox|icon|apple-touch-icon|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
