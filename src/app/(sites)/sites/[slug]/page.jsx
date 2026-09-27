import { cache } from "react";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { siteUrl } from "@/lib/sites/config";
import { siteDescription } from "@/lib/sites/document";
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

  const doc = site.published;
  const url = siteUrl(site.slug);
  const title = doc.business?.name || site.slug;
  const description = siteDescription(doc);
  const image = doc.sections?.hero?.image;
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
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
    ...(icon ? { icons: { icon, apple: icon } } : {}),
  };
}

export default async function SitePage({ params }) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();
  return <SiteRenderer doc={site.published} />;
}
