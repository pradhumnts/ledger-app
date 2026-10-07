import { cache } from "react";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/sites/reveal";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { SHARE_IMAGE_SIZE, siteNav, siteUrl } from "@/lib/sites/config";
import { siteDescription, withSiteDefaults } from "@/lib/sites/document";
import { tierAtLeast } from "@/lib/sites/plan-tiers";
import {
  jsonLdScript,
  localBusinessJsonLd,
  serviceJsonLd,
  servicePageTitle,
} from "@/lib/sites/seo";
import { SERVICE_PAGES_TIER, paragraphs, servicePages } from "@/lib/sites/service-pages";
import { loadLiveSite } from "@/lib/sites/store";

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

/** The live site and its service page at `pageSlug`; null unless the shop is on Standard. */
const getServicePage = cache(async (slug, pageSlug) => {
  const site = await loadLiveSite(slug);
  if (!site || !tierAtLeast(site.tier, SERVICE_PAGES_TIER)) return null;
  const doc = withSiteDefaults(site.published);
  const page = servicePages(doc).find((item) => item.slug === pageSlug);
  return page ? { site, doc, page } : null;
});

function pageDescription(page, doc) {
  const text = page.summary || paragraphs(page.details)[0] || "";
  const clipped = text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
  return clipped || siteDescription(doc);
}

export async function generateMetadata({ params }) {
  const { slug, page: pageSlug } = await params;
  const found = await getServicePage(slug, pageSlug);
  if (!found) return { title: "Page not found", robots: { index: false } };

  const { site, doc, page } = found;
  const home = siteUrl(site.slug);
  const url = `${home}/${page.slug}`;
  const name = doc.business?.name || site.slug;
  const title = `${page.title} – ${name}`;
  const description = pageDescription(page, doc);
  const cover = [page.image, ...page.images].find((src) => String(src).startsWith("https://"));
  const version = Date.parse(site.published_at || "") || 0;
  const image = cover
    ? { url: cover, alt: page.title }
    : {
        url: `${home}/share-image?v=${version.toString(36)}`,
        ...SHARE_IMAGE_SIZE,
        type: "image/jpeg",
        alt: name,
      };
  const icon = doc.business?.logo;

  return {
    metadataBase: new URL(home),
    title: {
      absolute: servicePageTitle({
        title: page.title,
        name: doc.business?.name,
        address: doc.business?.address,
      }),
    },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: name,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    ...(icon ? { icons: { icon, apple: icon } } : {}),
  };
}

export default async function ServicePage({ params }) {
  const { slug, page: pageSlug } = await params;
  const found = await getServicePage(slug, pageSlug);
  if (!found) notFound();

  const { site, doc, page } = found;
  const home = siteUrl(site.slug);
  const url = `${home}/${page.slug}`;
  const data = [
    localBusinessJsonLd({
      doc,
      packId: site.published.packId,
      url: home,
      description: siteDescription(doc),
    }),
    serviceJsonLd({
      page,
      url,
      siteUrl: home,
      description: pageDescription(page, doc),
      address: doc.business?.address,
    }),
  ].filter(Boolean);

  return (
    <>
      {data.map((item) => (
        <script
          key={item["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(item) }}
        />
      ))}
      <SiteRenderer
        doc={site.published}
        withPages
        page={page.id}
        nav={siteNav(site.slug)}
      />
      <RevealOnScroll />
    </>
  );
}
