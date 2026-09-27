import { cache } from "react";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/sites/reveal";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { SHARE_IMAGE_SIZE, siteUrl } from "@/lib/sites/config";
import { siteDescription, withSiteDefaults } from "@/lib/sites/document";
import { loadLiveSite } from "@/lib/sites/store";

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

const getSite = cache(loadLiveSite);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return { title: "Website not found", robots: { index: false } };

  const doc = withSiteDefaults(site.published);
  const url = siteUrl(site.slug);
  const title = doc.business?.name || site.slug;
  const description = siteDescription(doc);
  const version = Date.parse(site.published_at || "") || 0;
  const image = {
    url: `${url}/share-image?v=${version.toString(36)}`,
    ...SHARE_IMAGE_SIZE,
    type: "image/jpeg",
    alt: title,
  };
  const icon = doc.business?.logo;

  return {
    metadataBase: new URL(url),
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: title,
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

export default async function SitePage({ params }) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();
  return (
    <>
      <SiteRenderer doc={site.published} />
      <RevealOnScroll />
    </>
  );
}
