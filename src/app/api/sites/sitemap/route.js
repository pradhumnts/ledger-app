import { NextResponse } from "next/server";
import { siteUrl, sitesDomain, slugProblem } from "@/lib/sites/config";
import { tierAtLeast } from "@/lib/sites/plan-tiers";
import { sitemapXml } from "@/lib/sites/seo";
import { SERVICE_PAGES_TIER, servicePages } from "@/lib/sites/service-pages";
import { loadLiveSite } from "@/lib/sites/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Google's per-file sitemap limit. */
const MAX_URLS = 50_000;
/** Supabase caps each select at 1000 rows by default. */
const PAGE = 1000;

function xml(body) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

/**
 * Served as `{SITES_DOMAIN}/sitemap.xml` (every live shop site, for Search
 * Console's domain property) and `{slug}.{SITES_DOMAIN}/sitemap.xml` (`?site=`,
 * that one site); the proxy rewrites both here.
 */
export async function GET(request) {
  if (!sitesDomain()) return new NextResponse("Not found", { status: 404 });
  const slug = request.nextUrl.searchParams.get("site");

  if (slug !== null) {
    const site = slugProblem(slug) ? null : await loadLiveSite(slug);
    if (!site) return new NextResponse("Not found", { status: 404 });
    const home = siteUrl(site.slug);
    const pages = tierAtLeast(site.tier, SERVICE_PAGES_TIER) ? servicePages(site.published) : [];
    return xml(
      sitemapXml([
        { loc: home, lastmod: site.published_at },
        ...pages.map((page) => ({ loc: `${home}/${page.slug}`, lastmod: site.published_at })),
      ])
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) return new NextResponse("Not configured", { status: 503 });
  const rows = [];
  while (rows.length < MAX_URLS) {
    const { data, error } = await admin
      .from("sites")
      .select("slug, published_at")
      .eq("status", "live")
      .not("slug", "is", null)
      .not("published", "is", null)
      .order("published_at", { ascending: false })
      .order("slug")
      .range(rows.length, Math.min(rows.length + PAGE, MAX_URLS) - 1);
    if (error) return new NextResponse("Sitemap failed", { status: 500 });
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  return xml(sitemapXml(rows.map((row) => ({ loc: siteUrl(row.slug), lastmod: row.published_at }))));
}
