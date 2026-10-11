import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { BusinessCard } from "@/components/cards/business-card";
import { CARD_THEMES, cardTitle } from "@/lib/cards";
import { cardUrl, loadCard, recordCardEvent } from "@/lib/cards-server";
import { isLinkPreviewBot } from "@/lib/referrals/link-preview";

// Edits from the admin panel show straight away, and every open is counted.
export const dynamic = "force-dynamic";

const PRIVATE = { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } };

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const loaded = await loadCard(slug);
  if (!loaded) return { title: "Card not found", robots: PRIVATE };
  const { card } = loaded;
  const title = cardTitle(card);
  const description =
    card.headline || [card.title, card.company].filter(Boolean).join(" at ") || "Save my contact";
  return {
    title,
    description,
    robots: PRIVATE,
    alternates: { canonical: cardUrl(slug) },
    openGraph: {
      title,
      description,
      url: cardUrl(slug),
      type: "profile",
      images: card.photo ? [{ url: card.photo }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export async function generateViewport({ params }) {
  const { slug } = await params;
  const loaded = await loadCard(slug);
  return { themeColor: CARD_THEMES[loaded?.card.theme]?.from || CARD_THEMES.midnight.from };
}

export default async function CardPage({ params }) {
  const { slug } = await params;
  const loaded = await loadCard(slug);
  if (!loaded) notFound();

  if (!isLinkPreviewBot((await headers()).get("user-agent"))) {
    after(() => recordCardEvent(slug, "view").catch(() => {}));
  }

  return <BusinessCard card={loaded.card} url={cardUrl(slug)} vcardHref={`/c/${slug}/vcard`} />;
}
