import { Suspense } from "react";
import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import { SHARE_IMAGE_SIZE } from "@/lib/sites/config";
import { DEMO_PARAMS, demoSite } from "@/lib/sites/demo-site";
import { siteDescription, withSiteDefaults } from "@/lib/sites/document";
import { PreviewClient } from "./preview-client";

const robots = { index: false, follow: false };

/** Demo links (`?template=&pack=`) get a link-preview card of the demo shop. */
export async function generateMetadata({ searchParams }) {
  const query = await searchParams;
  if (query.embed === "1") return { title: "Website preview", robots };

  const params = new URLSearchParams();
  for (const key of DEMO_PARAMS) {
    const value = query[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  const doc = withSiteDefaults(demoSite(params));
  const name = doc.business?.name || "Website";
  const title = `${name} – Website preview`;
  const description = siteDescription(doc);
  const image = {
    url: `/site-preview/share-image?${params}`,
    ...SHARE_IMAGE_SIZE,
    type: "image/jpeg",
    alt: name,
  };

  return {
    metadataBase: new URL(APP_SITE_URL),
    title: { absolute: title },
    description,
    robots,
    openGraph: {
      type: "website",
      url: `/site-preview?${params}`,
      title,
      description,
      siteName: APP_NAME,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default function SitePreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewClient />
    </Suspense>
  );
}
