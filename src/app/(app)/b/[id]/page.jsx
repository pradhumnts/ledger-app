import { cache, Suspense } from "react";
import { PublicBillScreen } from "@/components/public-bill-screen";
import { APP_SITE_URL } from "@/lib/branding";
import { publicBillMetadata } from "@/lib/public-bill-meta";
import { loadPublicBill as loadPublicBillFromDb } from "@/lib/public-bills-db";

export const dynamic = "force-dynamic";

const loadPublicBill = cache(loadPublicBillFromDb);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const snapshot = await loadPublicBill(id);
  return publicBillMetadata(snapshot, {
    url: `${APP_SITE_URL}/b/${id}`,
    image: `${APP_SITE_URL}/api/og/bill?id=${encodeURIComponent(id)}`,
  });
}

export default function ShortPublicBillPage({ params }) {
  return (
    <Suspense fallback={<PublicBillScreen loading />}>
      <ShortPublicBill params={params} />
    </Suspense>
  );
}

async function ShortPublicBill({ params }) {
  const { id } = await params;
  const snapshot = await loadPublicBill(id);
  return <PublicBillScreen snapshot={snapshot} />;
}
