import { APP_SITE_URL } from "@/lib/branding";
import { decodePublicBill } from "@/lib/public-bill";
import { publicBillMetadata } from "@/lib/public-bill-meta";
import { PublicBillQueryView } from "./query-view";

export async function generateMetadata({ searchParams }) {
  const query = await searchParams;
  const token = typeof query.d === "string" ? query.d : "";
  const snapshot = decodePublicBill(token);
  const meta = publicBillMetadata(snapshot, {
    url: token ? `${APP_SITE_URL}/b?d=${encodeURIComponent(token)}` : `${APP_SITE_URL}/b`,
  });
  if (!token || !snapshot) return meta;
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      images: [
        {
          url: `/api/og/bill?d=${encodeURIComponent(token)}`,
          width: 1200,
          height: 630,
          alt: meta.openGraph.title,
        },
      ],
    },
  };
}

export default function PublicBillPage() {
  return <PublicBillQueryView />;
}
