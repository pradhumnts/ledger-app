import { ArrowUpRight, Globe, Mail, MapPin, Phone, UserPlus } from "lucide-react";
import {
  CARD_THEMES,
  displayUrl,
  formatPhone,
  initials,
  mapsHref,
  whatsappHref,
} from "@/lib/cards";
import { ShareButton } from "@/components/cards/share-button";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/sites/icons";

const SOCIAL_ICONS = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  x: XIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};

const GRADIENT = "bg-[linear-gradient(140deg,var(--c-from)_15%,var(--c-to))]";
const TILE = "bg-[#f4f3ef] transition hover:bg-[#ecebe5] active:scale-[0.97]";

function external(href) {
  return /^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-[0.22em] text-neutral-400 uppercase">{children}</h2>
  );
}

/** A digital business card. `vcardHref` downloads the contact. */
export function BusinessCard({ card, url, vcardHref }) {
  const theme = CARD_THEMES[card.theme];
  const style = {
    "--c-from": theme.from,
    "--c-to": theme.to,
    "--c-accent": theme.accent,
    "--c-glow": theme.glow,
  };

  const actions = [
    card.phone && { href: `tel:${card.phone}`, label: "Call", Icon: Phone },
    card.whatsapp && { href: whatsappHref(card.whatsapp), label: "WhatsApp", Icon: WhatsAppIcon },
    card.email && { href: `mailto:${card.email}`, label: "Email", Icon: Mail },
    card.website && { href: card.website, label: "Website", Icon: Globe },
  ].filter(Boolean);

  const details = [
    card.phone && { href: `tel:${card.phone}`, label: "Mobile", value: formatPhone(card.phone), Icon: Phone },
    card.email && { href: `mailto:${card.email}`, label: "Email", value: card.email, Icon: Mail },
    card.website && { href: card.website, label: "Website", value: displayUrl(card.website), Icon: Globe },
    card.address && { href: mapsHref(card), label: "Address", value: card.address, Icon: MapPin },
  ].filter(Boolean);

  let step = 3;
  const next = () => ({ "--i": step++ });

  return (
    <div style={style} className="min-h-dvh bg-[#e9e8e3] sm:py-12">
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 hidden h-80 opacity-[0.12] blur-3xl sm:block ${GRADIENT}`}
      />
      <article className="relative mx-auto flex min-h-dvh max-w-[440px] flex-col overflow-clip bg-white sm:min-h-0 sm:rounded-[2.25rem] sm:shadow-[0_50px_100px_-45px_rgba(12,18,34,0.55)] sm:ring-1 sm:ring-black/[0.04]">
        <header className={`relative h-52 overflow-hidden text-white ${GRADIENT}`}>
          <div
            aria-hidden
            className="c-drift absolute -top-28 -right-24 size-80 rounded-full bg-[var(--c-glow)] opacity-40 blur-3xl"
          />
          <div aria-hidden className="absolute -bottom-36 -left-20 size-80 rounded-full border border-white/10" />
          <div aria-hidden className="absolute -bottom-48 -left-32 size-[26rem] rounded-full border border-white/[0.06]" />
          <div className="relative flex items-center px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
            {card.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.logo} alt={card.company} className="h-7 w-auto max-w-[150px] object-contain" />
            ) : card.company ? (
              <span className="text-[12px] font-semibold tracking-[0.24em] text-white/80 uppercase">
                {card.company}
              </span>
            ) : null}
          </div>
        </header>

        <div className="relative -mt-[4.75rem] px-6">
          <div
            className={`c-photo-in relative size-36 overflow-hidden rounded-[2rem] shadow-[0_26px_50px_-22px_rgba(10,15,30,0.6)] ring-[5px] ring-white ${GRADIENT}`}
          >
            {card.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.photo} alt={card.name} className="size-full object-cover" />
            ) : (
              <span className="c-serif grid size-full place-items-center text-[3.25rem] text-[var(--c-accent)]">
                {initials(card.name)}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pt-5">
          <h1 className="c-in c-serif text-[2.65rem] leading-[1.02] tracking-[-0.01em] text-[#0e1116]">
            {card.name || card.company}
          </h1>
          {card.title || card.company ? (
            <p className="c-in mt-2.5 text-[15px] text-neutral-500" style={{ "--i": 1 }}>
              {card.title}
              {card.title && card.company ? <span className="mx-2 text-neutral-300">/</span> : null}
              {card.company ? <span className="font-medium text-neutral-900">{card.company}</span> : null}
            </p>
          ) : null}
          {card.headline ? (
            <p className="c-in mt-4 text-[15px] leading-relaxed text-neutral-600" style={{ "--i": 2 }}>
              {card.headline}
            </p>
          ) : null}
        </div>

        {actions.length ? (
          <nav
            aria-label="Quick actions"
            className="c-in mt-7 grid gap-2.5 px-6"
            style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0, 1fr))`, ...next() }}
          >
            {actions.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                {...external(href)}
                className={`flex flex-col items-center gap-2 rounded-2xl py-3.5 text-[12px] font-medium text-neutral-700 ${TILE}`}
              >
                <span className={`grid size-10 place-items-center rounded-full text-[var(--c-accent)] ${GRADIENT}`}>
                  <Icon className="size-[18px]" />
                </span>
                {label}
              </a>
            ))}
          </nav>
        ) : null}

        {details.length ? (
          <section className="c-in mt-9 px-6" style={next()}>
            <SectionTitle>Contact</SectionTitle>
            <ul className="mt-3 divide-y divide-black/[0.06] overflow-hidden rounded-3xl ring-1 ring-black/[0.07]">
              {details.map(({ href, label, value, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...external(href)}
                    className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-black/[0.02]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f3ef] text-[var(--c-to)]">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] text-neutral-400">{label}</span>
                      <span className="block text-[15px] font-medium text-neutral-900 [overflow-wrap:anywhere]">
                        {value}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-neutral-300" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {card.bio ? (
          <section className="c-in mt-9 px-6" style={next()}>
            <SectionTitle>About</SectionTitle>
            <p className="mt-3 text-[15px] leading-[1.75] whitespace-pre-line text-neutral-600">{card.bio}</p>
          </section>
        ) : null}

        {card.socials.length ? (
          <section className="c-in mt-9 px-6" style={next()}>
            <SectionTitle>Social</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {card.socials.map(({ id, label, url: href }) => {
                const Icon = SOCIAL_ICONS[id];
                return (
                  <a
                    key={id}
                    href={href}
                    {...external(href)}
                    className={`inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-3.5 text-[14px] font-medium text-neutral-800 ${TILE}`}
                  >
                    <Icon className="size-[18px]" />
                    {label}
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {card.links.length ? (
          <section className="c-in mt-9 px-6" style={next()}>
            <SectionTitle>Links</SectionTitle>
            <ul className="mt-3 space-y-2">
              {card.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    {...external(link.url)}
                    className={`flex items-center justify-between gap-4 rounded-2xl px-5 py-4 text-[15px] font-medium text-neutral-900 ${TILE}`}
                  >
                    {link.label}
                    <ArrowUpRight className="size-4 shrink-0 text-neutral-400" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex-1" />
        <div className="sticky bottom-0 z-10 mt-10 bg-[linear-gradient(to_top,white_65%,transparent)] px-5 pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2.5">
            <a
              href={vcardHref}
              className={`flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-white shadow-[0_20px_40px_-16px_rgba(10,15,30,0.65)] transition active:scale-[0.98] ${GRADIENT}`}
            >
              <UserPlus className="size-5 text-[var(--c-accent)]" />
              Save contact
            </a>
            <ShareButton
              url={url}
              title={card.name}
              className={`grid size-14 shrink-0 place-items-center rounded-full text-neutral-800 ${TILE}`}
            />
          </div>
        </div>
      </article>
    </div>
  );
}
