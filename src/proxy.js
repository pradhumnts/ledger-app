import { NextResponse } from "next/server";
import {
  ONBOARDING_COOKIE,
  isUnauthedAllowedPath,
} from "@/lib/onboarding-gate";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/.well-known/")) {
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
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifest.webmanifest|sw.js|workbox|icon|apple-touch-icon|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
