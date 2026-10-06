import { cache } from "react";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/sites/reveal";
import { SiteRenderer } from "@/components/sites/site-renderer";
import { SHARE_IMAGE_SIZE, siteUrl } from "@/lib/sites/config";
import { siteDescription, withSiteDefaults } from "@/lib/sites/document";
import { placeReviews } from "@/lib/sites/google-places";
import { latestPosts, loadConnection, profileUrl } from "@/lib/sites/instagram";
import { tierAtLeast } from "@/lib/sites/plan-tiers";
import { jsonLdScript, localBusinessJsonLd, siteTitle } from "@/lib/sites/seo";
import { loadLiveSite } from "@/lib/sites/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

const getSite = cache(loadLiveSite);

/** Google rating and reviews when the shop is on Standard and shows them; null otherwise. */
async function siteReviews(site) {
  const google = site.published?.google;
  if (!google?.placeId || google.reviews === false || !tierAtLeast(site.tier, "standard")) {
    return null;
  }
  const reviews = await placeReviews(google.placeId).catch(() => null);
  return reviews && (reviews.count || reviews.reviews.length) ? reviews : null;
}

/** Latest posts from the shop's connected Instagram when it is on Standard; null otherwise. */
async function siteInstagram(site) {
  const admin = getSupabaseAdmin();
  if (!admin || !tierAtLeast(site.tier, "standard")) return null;
  const connection = await loadConnection(admin, site.user_id).catch(() => null);
  if (!connection) return null;
  const posts = await latestPosts(connection.access_token).catch(() => []);
  return posts.length
    ? { username: connection.username, profileUrl: profileUrl(connection.username), posts }
    : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return { title: "Website not found", robots: { index: false } };

  const doc = withSiteDefaults(site.published);
  const url = siteUrl(site.slug);
  const title = doc.business?.name || site.slug;
  const searchTitle =
    siteTitle({
      name: doc.business?.name,
      packId: site.published.packId,
      address: doc.business?.address,
    }) || title;
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
    title: { absolute: searchTitle },
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
  const [reviews, instagram] = await Promise.all([siteReviews(site), siteInstagram(site)]);
  const doc = withSiteDefaults(site.published);
  const business = localBusinessJsonLd({
    doc,
    packId: site.published.packId,
    url: siteUrl(site.slug),
    description: siteDescription(doc),
    instagramUsername: instagram?.username,
  });
  return (
    <>
      {business ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(business) }}
        />
      ) : null}
      <SiteRenderer doc={site.published} reviews={reviews} instagram={instagram} />
      <RevealOnScroll />
    </>
  );
}
