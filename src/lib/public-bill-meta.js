import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import { formatINRPlain } from "@/lib/format";
import { isPublicStatement, payAmountForPublicBill } from "@/lib/public-bill";

export function publicBillDisplayAmount(snapshot) {
  const pay = payAmountForPublicBill(snapshot?.entry);
  const amount =
    pay ??
    (Number.isFinite(Number(snapshot?.entry?.amount))
      ? Number(snapshot.entry.amount)
      : 0);
  return formatINRPlain(amount);
}

export function publicBillShareTitle(snapshot) {
  if (!snapshot) return `Bill · ${APP_NAME}`;
  const name = snapshot.business?.name?.trim() || "Shop";
  if (isPublicStatement(snapshot)) {
    const customer = snapshot.customer?.name?.trim();
    if (customer && customer !== "Customer") {
      return `${name} sent bills for ${customer}`;
    }
    return `${name} sent bills`;
  }
  const amount = publicBillDisplayAmount(snapshot);
  if (snapshot.entry?.type === "got") {
    return `${name} received ${amount} INR`;
  }
  return `${name} is billing ${amount} INR`;
}

export function publicBillShareDescription(snapshot) {
  if (!snapshot) return `View this bill on ${APP_NAME}.`;
  if (isPublicStatement(snapshot)) {
    return `View all bills on ${APP_NAME}.`;
  }
  const customer = snapshot.customer?.name?.trim();
  if (customer && customer !== "Customer") {
    return `Bill for ${customer}`;
  }
  return `View this bill on ${APP_NAME}.`;
}

export function publicBillShopInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  const compact = (parts[0] || APP_NAME).replace(/[^a-zA-Z0-9]/g, "");
  return compact.slice(0, 2).toUpperCase() || "MK";
}

export function clipPublicBillName(name, max = 22) {
  const value = String(name || "").trim() || "Shop";
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(1, max - 1))}…`;
}

export function publicBillMetadata(snapshot, { url, image } = {}) {
  const title = publicBillShareTitle(snapshot);
  const description = publicBillShareDescription(snapshot);
  const images = image
    ? [{ url: image, width: 1200, height: 900, alt: title }]
    : undefined;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: url || APP_SITE_URL,
      siteName: APP_NAME,
      locale: "en_IN",
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
