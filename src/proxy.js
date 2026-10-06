import { NextResponse } from "next/server";
import { APP_SITE_URL } from "@/lib/branding";
import {
  ONBOARDING_COOKIE,
  isShopSitePath,
  isWebAccessiblePath,
} from "@/lib/onboarding-gate";
import {
  isRootSitesHost,
  siteUrl,
  sitesDomain,
  slugFromHost,
} from "@/lib/sites/config";

const STATIC_FILE = /\.[a-z0-9]+$/i;

function robotsTxt(sitemap) {
  return new NextResponse(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function rewriteToSitemap(request, slug) {
  const url = request.nextUrl.clone();
  url.pathname = "/api/sites/sitemap";
  url.search = slug ? `?site=${slug}` : "";
  return NextResponse.rewrite(url);
}

/** `{slug}.{SITES_DOMAIN}` serves /sites/{slug}; nothing else of the app is reachable there. */
function routeSiteHost(request, pathname) {
  const host = request.headers.get("host");
  const slug = slugFromHost(host);
  if (slug) {
    if (pathname.startsWith("/_next/") || pathname.startsWith("/site-packs/")) {
      return NextResponse.next();
    }
    if (pathname === "/robots.txt") return robotsTxt(`${siteUrl(slug)}/sitemap.xml`);
    if (pathname === "/sitemap.xml") return rewriteToSitemap(request, slug);
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${slug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
  if (isRootSitesHost(host)) {
    if (pathname === "/robots.txt") return robotsTxt(`https://${sitesDomain()}/sitemap.xml`);
    if (pathname === "/sitemap.xml") return rewriteToSitemap(request, "");
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

export function proxy(request) {
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

  if (STATIC_FILE.test(pathname) || isWebAccessiblePath(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  if (request.cookies.has(ONBOARDING_COOKIE)) {
    response.cookies.delete(ONBOARDING_COOKIE);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifests|sw.js|workbox|icon|apple-touch-icon|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
