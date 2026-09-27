import { APP_SITE_URL } from "@/lib/branding";
import { decodePublicShare } from "@/lib/public-bill";
import { publicBillMetadata } from "@/lib/public-bill-meta";
import { PublicBillQueryView } from "./query-view";

export async function generateMetadata({ searchParams }) {
  const query = await searchParams;
  const token = typeof query.d === "string" ? query.d : "";
  const snapshot = decodePublicShare(token);
  const meta = publicBillMetadata(snapshot, {
    url: token
      ? `${APP_SITE_URL}/b?d=${encodeURIComponent(token)}`
      : `${APP_SITE_URL}/b`,
    image: token
      ? `${APP_SITE_URL}/api/og/bill?d=${encodeURIComponent(token)}`
      : undefined,
  });
  return meta;
}

export default function PublicBillPage() {
  return <PublicBillQueryView />;
}
