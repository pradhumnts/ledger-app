import { loadPublicBill } from "@/lib/public-bills-db";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderPublicBillOgImage,
} from "@/lib/public-bill-og";

export const alt = "MoneyKit bill";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Image({ params }) {
  const { id } = await params;
  const snapshot = await loadPublicBill(id);
  return renderPublicBillOgImage(snapshot);
}
