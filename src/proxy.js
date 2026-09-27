import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  parseAdminSessionToken,
} from "@/lib/admin-session";
import { APP_SITE_URL } from "@/lib/branding";
import {
  ONBOARDING_COOKIE,
  isAdminPath,
  isShopSitePath,
  isUnauthedAllowedPath,
} from "@/lib/onboarding-gate";
import {
  isRootSitesHost,
  siteUrl,
  sitesDomain,
  slugFromHost,
} from "@/lib/sites/config";

/** `{slug}.{SITES_DOMAIN}` serves /sites/{slug}; nothing else of the app is reachable there. */
function routeSiteHost(request, pathname) {
  const host = request.headers.get("host");
  const slug = slugFromHost(host);
  if (slug) {
    if (pathname.startsWith("/_next/") || pathname.startsWith("/site-packs/")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${slug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
  if (isRootSitesHost(host)) {
    return NextResponse.redirect(APP_SITE_URL);
  }
  if (sitesDomain() && pathname.startsWith("/sites/")) {
    const [, , siteSlug, ...rest] = pathname.split("/");
    if (siteSlug) {
      const target = new URL(siteUrl(siteSlug));
      target.pathname = rest.length ? `/${rest.join("/")}` : "/";
      return NextResponse.redirect(target, 308);
    }
  }
  return null;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const siteResponse = routeSiteHost(request, pathname);
  if (siteResponse) return siteResponse;
  if (isShopSitePath(pathname)) return NextResponse.next();

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
