import { after } from "next/server";
import sharp from "sharp";
import { cardVcard, vcardFilename } from "@/lib/cards";
import { cardUrl, loadCard, recordCardEvent } from "@/lib/cards-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only our own storage is fetched, so a saved photo URL can't point the server elsewhere. */
function isStorageUrl(url) {
  const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return Boolean(supabase) && url.startsWith(`${supabase}/storage/v1/object/public/`);
}

/** The photo as a small square base64 JPEG, which every contacts app accepts. */
async function photoBase64(url) {
  if (!url || !isStorageUrl(url)) return "";
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return "";
    const jpeg = await sharp(Buffer.from(await response.arrayBuffer()))
      .rotate()
      .resize(400, 400, { fit: "cover" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return jpeg.toString("base64");
  } catch {
    return "";
  }
}

/** /c/SLUG/vcard → the card as a .vcf that opens "Add to contacts". */
export async function GET(_request, { params }) {
  const { slug } = await params;
  const loaded = await loadCard(slug);
  if (!loaded) return new Response("Not found", { status: 404 });

  const { card } = loaded;
  const vcard = cardVcard(card, { photo: await photoBase64(card.photo), cardUrl: cardUrl(slug) });
  after(() => recordCardEvent(slug, "save").catch(() => {}));

  const filename = vcardFilename(card);
  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
