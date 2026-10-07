import { Phone, Tag } from "lucide-react";
import { WhatsAppIcon } from "@/components/sites/icons";
import { telUrl, whatsappUrl } from "@/lib/sites/links";
import { formatOfferDate, offerTheme } from "@/lib/sites/offers";

function OfferCard({ offer, phone, headingClassName }) {
  const theme = offerTheme(offer.theme);
  const title = String(offer.title || "").trim();
  const badge = String(offer.badge || "").trim();
  const text = String(offer.text || "").trim();
  const ends = formatOfferDate(offer.ends);
  const call = offer.button === "call";
  const href =
    offer.button === "none"
      ? ""
      : call
        ? telUrl(phone)
        : whatsappUrl(phone, `Hi! I'd like to know more about your offer: ${title || badge}`);

  return (
    <div
      className="relative h-full overflow-hidden rounded-[1.75rem] px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6"
      style={{ backgroundColor: theme.bg, color: theme.ink }}
    >
      <span
        aria-hidden
        className="absolute -top-20 -right-12 size-44 rounded-full opacity-[0.16]"
        style={{ backgroundColor: theme.accent }}
      />
      <span
        aria-hidden
        className="absolute -bottom-14 -left-6 size-24 rounded-full opacity-[0.16]"
        style={{ backgroundColor: theme.accent }}
      />
      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          {title ? (
            <h2 className={`text-2xl leading-tight md:text-3xl ${headingClassName}`}>{title}</h2>
          ) : null}
          {text ? (
            <p className="mt-2 text-sm leading-relaxed opacity-85 md:text-base">{text}</p>
          ) : null}
        </div>
        {badge ? (
          <div
            className="flex max-w-[42%] min-w-20 -rotate-[4deg] flex-col items-center gap-1 rounded-[1.25rem] px-3 py-3 text-center"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            <Tag className="size-3.5" strokeWidth={2.4} />
            <span className="text-lg leading-tight font-extrabold break-words md:text-xl">
              {badge}
            </span>
          </div>
        ) : null}
      </div>
      <div className="relative mt-5 flex min-h-9 items-center justify-between gap-3">
        <span className="text-xs font-semibold opacity-75">{ends ? `Till ${ends}` : ""}</span>
        {href ? (
          <a
            href={href}
            target={call ? undefined : "_blank"}
            rel={call ? undefined : "noopener noreferrer"}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold"
            style={{ backgroundColor: theme.accent, color: theme.accentInk }}
          >
            {call ? <Phone className="size-3.5" strokeWidth={2.4} /> : <WhatsAppIcon className="size-3.5" />}
            {call ? "Call now" : "Book on WhatsApp"}
          </a>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The shop's visible offers right under the hero: one full-width card, or a
 * swipeable row (two columns on wide screens) when several are on.
 */
export function OfferBanners({ offers = [], phone, headingClassName = "font-bold tracking-tight" }) {
  if (!offers.length) return null;
  const single = offers.length === 1;
  return (
    <section id="offers" data-section="offers" className="pt-8 md:pt-12">
      <div className="s-wrap">
        <ul
          className={
            single
              ? ""
              : "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible [&::-webkit-scrollbar]:hidden"
          }
        >
          {offers.map((offer) => (
            <li key={offer.id} className={single ? "" : "w-[88%] shrink-0 snap-center md:w-auto"}>
              <OfferCard offer={offer} phone={phone} headingClassName={headingClassName} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
