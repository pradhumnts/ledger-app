/* eslint-disable @next/next/no-img-element -- plain <img> keeps customer sites off Vercel image optimisation billing */
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import { FloatingAction } from "@/components/sites/floating-action";
import { GalleryRail } from "@/components/sites/gallery-rail";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/sites/icons";
import { GoogleReviews } from "@/components/sites/google-reviews";
import { InstagramFeed } from "@/components/sites/instagram-feed";
import { MobileMenu } from "@/components/sites/mobile-menu";
import { OfferBanners } from "@/components/sites/offer-banners";
import { ScrollHeader } from "@/components/sites/scroll-header";
import { playStoreUrl } from "@/lib/branding";
import { photoProps } from "@/lib/sites/photo";
import {
  areaFrom,
  formatRupees,
  instagramHandle,
  mapsUrl,
  phoneDigits,
  socialUrl,
  splitTitle,
  telUrl,
  whatsappUrl,
} from "@/lib/sites/links";
import { getPack } from "@/lib/sites/packs";
import {
  homeLink,
  pageForService,
  pageLink,
  paragraphs,
  servicePageCover,
  servicePageMessage,
} from "@/lib/sites/service-pages";

function pad(number) {
  return String(number).padStart(2, "0");
}

function titleSize(lines) {
  const longest = Math.max(...lines.map((line) => line.length));
  if (longest <= 13) return undefined;
  return longest <= 22 ? "m" : "s";
}

function linkProps(href) {
  return href?.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function CtaIcon({ cta, className }) {
  return cta.whatsapp ? (
    <WhatsAppIcon className={className} />
  ) : (
    <Phone className={className} strokeWidth={1.75} />
  );
}

function Header({ business, links, cta, homeHref = "#top" }) {
  return (
    <ScrollHeader className="sa-header sa-intro fixed inset-x-0 top-0 z-40">
      <div className="s-wrap flex h-[4.5rem] items-center justify-between gap-4 md:h-[5.25rem]">
        <a href={homeHref} className="flex min-w-0 items-center gap-3">
          {business.logo ? (
            <img
              src={business.logo}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <span className="sa-wordmark truncate">{business.name}</span>
        </a>
        <nav className="hidden items-center gap-9 text-[0.92rem] font-medium md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {cta.href ? (
            <a
              href={cta.href}
              {...linkProps(cta.href)}
              className="sa-btn sa-btn-primary sa-btn-sm hidden md:inline-flex"
            >
              <CtaIcon cta={cta} className="size-4" />
              {cta.label}
              <ArrowRight className="sa-arrow size-4" />
            </a>
          ) : null}
          <MobileMenu
            name={business.name}
            links={links}
            cta={cta}
            ctaIcon={<CtaIcon cta={cta} className="size-5" />}
            triggerClassName="-mr-2 grid size-11 shrink-0 place-items-center md:hidden [&_svg]:size-7 [&_svg]:stroke-[1.25]"
          />
        </div>
      </div>
    </ScrollHeader>
  );
}

function Hero({ hero, primary, directions }) {
  const lines = splitTitle(hero.title);
  const [head, accent, tail] = lines;

  return (
    <section
      id="top"
      data-section="hero"
      className="relative isolate flex min-h-[min(92svh,54rem)] flex-col justify-end overflow-hidden bg-s-brand text-white md:min-h-[min(100svh,60rem)]"
    >
      <div aria-hidden className="absolute inset-0 -z-10 md:left-[36%]">
        {hero.image ? (
          <img
            {...photoProps(hero.image, "(min-width: 768px) 64vw, 100vw")}
            alt=""
            fetchPriority="high"
            className="sa-hero-img size-full object-cover object-[50%_18%]"
          />
        ) : null}
        <div className="sa-hero-shade absolute inset-0" />
      </div>

      <div className="s-wrap pt-32 pb-[max(2.25rem,env(safe-area-inset-bottom))] md:pb-24">
        <div className="max-w-[40rem]">
          {hero.eyebrow ? (
            <p
              className="sa-in flex items-center gap-3 text-[0.72rem] font-semibold tracking-[0.22em] text-white/75 uppercase"
              style={{ "--d": "0.3s" }}
            >
              <span className="sa-rule h-px w-8 bg-s-accent" />
              {hero.eyebrow}
            </p>
          ) : null}

          {hero.title ? (
            <h1
              data-size={titleSize(lines)}
              className="s-serif sa-hero-title mt-5"
            >
              <span className="sa-line block" style={{ "--d": "0.45s" }}>
                {head}
              </span>
              {accent ? (
                <span
                  className="sa-line sa-accent s-italic block"
                  style={{ "--d": "0.6s" }}
                >
                  {accent}
                </span>
              ) : null}
              {tail ? (
                <span className="sa-line block" style={{ "--d": "0.75s" }}>
                  {tail}
                </span>
              ) : null}
            </h1>
          ) : null}

          {hero.subtitle ? (
            <p
              className="sa-in mt-5 max-w-[21rem] text-[1.05rem] leading-[1.55] text-white/85 sm:max-w-md sm:text-lg"
              style={{ "--d": "0.95s" }}
            >
              {hero.subtitle}
            </p>
          ) : null}

          {primary.href || directions.href ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primary.href ? (
                <a
                  href={primary.href}
                  {...linkProps(primary.href)}
                  className="sa-btn sa-btn-primary sa-sheen sa-in"
                  style={{ "--d": "1.1s" }}
                >
                  {primary.whatsapp ? (
                    <WhatsAppIcon className="size-5" />
                  ) : (
                    <Phone className="size-5" strokeWidth={1.75} />
                  )}
                  {primary.label}
                  <ArrowRight className="sa-arrow size-4" />
                </a>
              ) : null}
              {directions.href ? (
                <a
                  href={directions.href}
                  {...linkProps(directions.href)}
                  className="sa-btn sa-btn-glass sa-in"
                  style={{ "--d": "1.2s" }}
                >
                  <MapPin
                    className="size-5 shrink-0 fill-s-pop text-s-brand"
                    strokeWidth={1.5}
                  />
                  <span>{directions.label}</span>
                  {directions.area ? (
                    <span className="ml-auto min-w-0 truncate pl-2 text-[0.86rem] text-white/60 sm:ml-0">
                      {directions.area}
                    </span>
                  ) : null}
                  <ArrowUpRight className="sa-arrow-up size-4 shrink-0 text-white/60" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ children, onDark = false }) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-[0.9rem] font-medium ${
        onDark ? "text-white/60" : "text-s-muted"
      }`}
    >
      <span className="h-2 w-4 rounded-full bg-s-accent" />
      {children}
    </p>
  );
}

function About({ about, ui, business }) {
  return (
    <section
      id="about"
      data-section="about"
      className="py-24 text-center md:py-32"
    >
      <div className="s-wrap">
        <div className="mx-auto max-w-3xl">
          {ui.aboutLabel ? (
            <div data-reveal>
              <SectionLabel>{ui.aboutLabel}</SectionLabel>
            </div>
          ) : null}
          {about.heading ? (
            <div data-reveal style={{ "--d": "0.08s" }}>
              <AccentHeading
                text={about.heading}
                className="mx-auto mt-5 max-w-[14em]"
              />
            </div>
          ) : null}
          {about.text ? (
            <p
              data-reveal
              style={{ "--d": "0.16s" }}
              className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-[1.7] whitespace-pre-line text-s-muted sm:text-lg"
            >
              {about.text}
            </p>
          ) : null}
        </div>

        {about.image ? (
          <figure
            data-reveal="image"
            className="sa-photo relative mx-auto mt-12 aspect-4/5 max-w-5xl overflow-hidden rounded-[1.5rem] bg-s-brand sm:aspect-4/3 md:mt-16 md:aspect-16/9"
          >
            <img
              {...photoProps(about.image, "(min-width: 1024px) 1024px, 100vw")}
              alt=""
              loading="lazy"
              className="size-full object-cover object-[45%_center]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/20 to-transparent px-6 pt-20 pb-6 text-left text-white md:px-9 md:pb-8">
              <span className="s-serif block text-[2rem] leading-none md:text-[2.6rem]">
                {business.name}
              </span>
              {business.hours ? (
                <span className="mt-2 flex items-center gap-2 text-[0.95rem] text-white/80">
                  <Clock className="size-4" strokeWidth={1.75} />
                  {business.hours}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

function AccentHeading({ text, className, onDark = false }) {
  const [head, accent, tail] = splitTitle(text);
  return (
    <h2
      className={`s-serif ${onDark ? "text-white" : "sa-h2 text-s-ink"} ${className}`}
    >
      {head}
      {accent ? (
        <>
          {" "}
          <span
            className={`s-italic ${onDark ? "sa-accent" : "text-s-accent"}`}
          >
            {accent}
          </span>
        </>
      ) : null}
      {tail ? ` ${tail}` : null}
    </h2>
  );
}

function ServicesNote({ ui, cta, className }) {
  if (!ui.servicesIntro && !cta.href) return null;
  return (
    <div className={className}>
      {ui.servicesIntro ? (
        <p className="max-w-md text-[1.02rem] leading-[1.7] text-s-muted">
          {ui.servicesIntro}
        </p>
      ) : null}
      {cta.href ? (
        <a
          href={cta.href}
          {...linkProps(cta.href)}
          className="sa-btn sa-btn-primary mt-7 w-full sm:w-auto"
        >
          <CtaIcon cta={cta} className="size-5" />
          {cta.label}
          <ArrowRight className="sa-arrow size-4" />
        </a>
      ) : null}
    </div>
  );
}

function Services({ services, ui, business, whatsappPhone, cta, pages, nav }) {
  return (
    <section
      id="services"
      data-section="services"
      className="border-y border-s-line bg-s-paper py-24 md:py-32"
    >
      <div className="s-wrap md:grid md:grid-cols-[0.85fr_1.15fr] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start" data-reveal>
          {ui.servicesLabel ? (
            <SectionLabel>{ui.servicesLabel}</SectionLabel>
          ) : null}
          {services.heading ? (
            <AccentHeading text={services.heading} className="mt-5 max-w-[12em]" />
          ) : null}
          <ServicesNote ui={ui} cta={cta} className="mt-8 hidden md:block" />
        </div>

        <ol className="mt-10 md:mt-0">
          {services.items.map((item, index) => {
            const price = formatRupees(item.price);
            const page = pageForService(pages, item.name);
            const href = page
              ? pageLink(nav, page)
              : whatsappUrl(
                  whatsappPhone,
                  item.name
                    ? `Hi ${business.name}! I'd like to book ${item.name}.`
                    : "",
                ) || cta.href;
            return (
              <li
                key={`${item.name}-${index}`}
                data-reveal
                style={{ "--d": `${Math.min(index, 5) * 0.06}s` }}
                className="sa-row"
              >
                <a
                  href={href}
                  {...linkProps(href)}
                  className="group flex items-center gap-4 py-6 md:py-7"
                >
                  <div className="flex min-w-0 flex-1 items-baseline gap-4 md:gap-6">
                    <span className="w-7 shrink-0 text-[0.95rem] font-medium text-s-muted tabular-nums md:w-9">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    <div className="min-w-0">
                      {item.name ? (
                        <h3 className="s-serif sa-service-title text-s-ink transition duration-300 group-hover:translate-x-1 group-hover:text-s-accent">
                          {item.name}
                        </h3>
                      ) : null}
                      {price || item.note ? (
                        <p className="mt-2 line-clamp-2 text-[0.93rem] leading-relaxed text-s-muted md:line-clamp-none">
                          {price ? (
                            <span className="font-medium text-s-accent">
                              {ui.priceFrom || "From"} {price}
                            </span>
                          ) : null}
                          {price && item.note ? " · " : null}
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-s-line text-s-accent transition duration-300 group-hover:border-s-accent group-hover:bg-s-accent group-hover:text-s-on-accent">
                    {page ? (
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    ) : (
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <ServicesNote ui={ui} cta={cta} className="mt-10 md:hidden" />
      </div>
    </section>
  );
}

function InstagramLink({ socials, className }) {
  const href = socialUrl("instagram", socials.instagram);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`sa-btn sa-btn-outline ${className}`}
    >
      <InstagramIcon className="size-[1.1rem]" />
      <span>@{instagramHandle(socials.instagram)}</span>
      <ArrowUpRight className="sa-arrow-up size-4" />
    </a>
  );
}

/** The site gallery, or a service page's own (`id`, `label`, no Instagram link). */
function Gallery({
  gallery,
  ui,
  business,
  socials,
  id = "gallery",
  section = "gallery",
  label = ui.galleryLabel,
}) {
  return (
    <section id={id} data-section={section || undefined} className="py-24 md:py-32">
      <div className="s-wrap md:flex md:items-end md:justify-between md:gap-10">
        <div data-reveal>
          {label ? <SectionLabel>{label}</SectionLabel> : null}
          {gallery.heading ? (
            <AccentHeading text={gallery.heading} className="mt-5 max-w-[12em]" />
          ) : null}
        </div>
        <InstagramLink
          socials={socials}
          className="hidden shrink-0 md:inline-flex"
        />
      </div>

      <div className="sa-gallery-frame mt-10 md:mt-14">
        <GalleryRail
          data-reveal
          className="sa-rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 scroll-px-3 sm:gap-4 sm:px-5 sm:scroll-px-5 md:block md:columns-3 md:gap-5 md:overflow-visible md:px-0"
          barClassName="md:hidden"
        >
          {gallery.images.map((src, index) => (
            <li
              key={`${src}-${index}`}
              data-reveal
              style={{ "--d": `${Math.min(index, 5) * 0.07}s` }}
              className="sa-gallery-item w-[78%] shrink-0 snap-start sm:w-[44%] md:mb-5 md:w-auto md:break-inside-avoid"
            >
              <div className="group aspect-4/5 overflow-hidden rounded-[1.25rem] bg-s-line md:aspect-auto">
                <img
                  {...photoProps(src, "(min-width: 768px) 33vw, (min-width: 640px) 44vw, 78vw")}
                  alt={`${business.name} — photo ${index + 1}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] md:h-auto"
                />
              </div>
            </li>
          ))}
        </GalleryRail>
      </div>

      <div className="s-wrap mt-8 flex justify-center md:hidden">
        <InstagramLink socials={socials} />
      </div>
    </section>
  );
}

function formatPhone(value) {
  const digits = phoneDigits(value);
  if (digits.length !== 10) return String(value || "").trim();
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function InfoCard({ icon: Icon, label, value, link, delay }) {
  return (
    <li
      data-reveal
      style={{ "--d": delay }}
      className="flex items-start gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5 md:p-6"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/[0.07] text-s-pop">
        <Icon className="size-5" strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-white/45 uppercase">
          {label}
        </p>
        <p className="mt-1.5 text-[1.05rem] leading-snug whitespace-pre-line text-white">
          {value}
        </p>
        {link?.href ? (
          <a
            href={link.href}
            {...linkProps(link.href)}
            className="sa-accent mt-3 inline-flex items-center gap-1.5 text-[0.92rem] font-medium transition-opacity hover:opacity-80"
          >
            {link.label}
            <ArrowUpRight className="size-4" />
          </a>
        ) : null}
      </div>
    </li>
  );
}

function Contact({ contact, ui, business, primary, directions }) {
  const call = telUrl(business.phone);
  const cards = [
    business.address && {
      icon: MapPin,
      label: ui.placeLabel || "Visit us",
      value: business.address,
      link: { href: directions.href, label: directions.label },
    },
    business.hours && {
      icon: Clock,
      label: ui.hoursLabel || "Open",
      value: business.hours,
    },
    call && {
      icon: Phone,
      label: "Phone",
      value: formatPhone(business.phone),
      link: { href: call, label: "Call now" },
    },
  ].filter(Boolean);

  return (
    <section
      id="contact"
      data-section="contact"
      className="relative isolate overflow-hidden bg-s-brand py-24 text-white md:py-32"
    >
      <div
        aria-hidden
        className="sa-glow pointer-events-none absolute -top-40 -right-40 -z-10 size-[30rem] rounded-full bg-s-accent/25 blur-3xl"
      />
      <div
        aria-hidden
        className="sa-glow sa-glow-slow pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[26rem] rounded-full bg-s-brand-2 blur-3xl"
      />

      <div className="s-wrap md:grid md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-16">
        <div>
          {ui.contactLabel ? (
            <div data-reveal>
              <SectionLabel onDark>{ui.contactLabel}</SectionLabel>
            </div>
          ) : null}
          {contact.heading ? (
            <div data-reveal style={{ "--d": "0.08s" }}>
              <AccentHeading
                text={contact.heading}
                onDark
                className="sa-contact-title mt-5 max-w-[10em]"
              />
            </div>
          ) : null}
          {contact.text ? (
            <p
              data-reveal
              style={{ "--d": "0.16s" }}
              className="mt-6 max-w-md text-[1.05rem] leading-[1.7] text-white/70 sm:text-lg"
            >
              {contact.text}
            </p>
          ) : null}

          {primary.href ? (
            <div
              data-reveal
              style={{ "--d": "0.24s" }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <a
                href={primary.href}
                {...linkProps(primary.href)}
                className="sa-btn sa-btn-primary sa-sheen"
              >
                <CtaIcon cta={primary} className="size-5" />
                {primary.whatsapp ? ui.contactCta || primary.label : primary.label}
                <ArrowRight className="sa-arrow size-4" />
              </a>
              {primary.whatsapp && call ? (
                <a href={call} className="sa-btn sa-btn-glass justify-center">
                  <Phone className="size-[1.1rem] text-s-pop" strokeWidth={1.75} />
                  {ui.callLabel || "Call us"}
                </a>
              ) : null}
            </div>
          ) : null}
          {primary.whatsapp && ui.whatsappNote ? (
            <p
              data-reveal
              style={{ "--d": "0.3s" }}
              className="mt-5 flex items-center justify-center gap-2.5 text-[0.9rem] text-white/60 sm:justify-start"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-s-pop opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-s-pop" />
              </span>
              {ui.whatsappNote}
            </p>
          ) : null}
        </div>

        {cards.length ? (
          <ul className="mt-14 grid gap-3 md:mt-0">
            {cards.map((card, index) => (
              <InfoCard
                key={card.label}
                {...card}
                delay={`${0.1 + index * 0.08}s`}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function Footer({ business, links, socials, whatsapp, intro, homeHref = "#top" }) {
  const socialLinks = [
    { label: "Instagram", href: socialUrl("instagram", socials.instagram), icon: InstagramIcon },
    { label: "Facebook", href: socialUrl("facebook", socials.facebook), icon: FacebookIcon },
    { label: "YouTube", href: socialUrl("youtube", socials.youtube), icon: YouTubeIcon },
    { label: "WhatsApp", href: whatsapp, icon: WhatsAppIcon },
  ].filter((item) => item.href);

  return (
    <footer
      data-section="socials"
      className="border-t border-white/10 bg-s-footer pt-16 pb-28 text-white/60 md:pt-20 md:pb-10"
    >
      <div className="s-wrap">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr] md:gap-16">
          <div data-reveal>
            {intro ? (
              <p className="max-w-sm text-[1.02rem] leading-[1.7]">{intro}</p>
            ) : null}
            {socialLinks.length ? (
              <ul className="mt-7 flex flex-wrap gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...linkProps(href)}
                      aria-label={label}
                      className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition duration-300 hover:-translate-y-0.5 hover:border-s-accent hover:bg-s-accent hover:text-s-on-accent"
                    >
                      <Icon className="size-[1.1rem]" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div data-reveal style={{ "--d": "0.08s" }}>
            <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
              Explore
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5">
              {[{ href: homeHref, label: "Home" }, ...links].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href={homeHref}
          data-reveal
          style={{ "--d": "0.12s" }}
          className="sa-footer-name s-serif mt-16 block md:mt-24"
        >
          {business.name}
        </a>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-7 text-[0.88rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <a
            href={playStoreUrl("shop_site", "footer")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-white"
          >
            <span className="size-1.5 rounded-full bg-s-accent" />
            Website powered by MoneyKit
          </a>
        </div>
      </div>
    </footer>
  );
}

const CARD_GRID = {
  1: "md:grid-cols-1 md:max-w-xl",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** Service page cards: a swipeable row on phones, a grid on desktop. */
function ServiceCards({
  pages,
  ui,
  nav,
  id,
  section,
  label,
  heading,
  flushTop = false,
}) {
  const shape = pages.length <= 2 ? "aspect-4/5 md:aspect-4/3" : "aspect-4/5";
  return (
    <section
      id={id}
      data-section={section || undefined}
      className={flushTop ? "pb-24 md:pb-32" : "py-24 md:py-32"}
    >
      <div className="s-wrap" data-reveal>
        <SectionLabel>{label}</SectionLabel>
        <AccentHeading text={heading} className="mt-5 max-w-[12em]" />
      </div>

      <div className="sa-gallery-frame mt-10 md:mt-14">
        <GalleryRail
          data-reveal
          className={`sa-rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 scroll-px-3 sm:gap-4 sm:px-5 sm:scroll-px-5 md:grid md:gap-5 md:overflow-visible md:px-0 ${
            CARD_GRID[pages.length] || CARD_GRID[4]
          }`}
          barClassName="md:hidden"
        >
          {pages.map((page, index) => {
            const cover = servicePageCover(page);
            const price = formatRupees(page.price);
            return (
              <li
                key={page.id}
                data-reveal
                style={{ "--d": `${index * 0.08}s` }}
                className="sa-gallery-item w-[82%] shrink-0 snap-start sm:w-[46%] md:w-auto"
              >
                <a
                  href={pageLink(nav, page)}
                  className={`group relative isolate flex ${shape} flex-col justify-between overflow-hidden rounded-[1.5rem] bg-s-brand p-5 text-white md:p-6`}
                >
                  {cover ? (
                    <img
                      {...photoProps(
                        cover,
                        "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 82vw",
                      )}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/30 to-black/10"
                  />
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[0.9rem] font-medium text-white/75 tabular-nums">
                      {pad(page.position)}.
                    </span>
                    {price ? (
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.82rem] font-medium backdrop-blur-md">
                        {ui.priceFrom || "From"} {price}
                      </span>
                    ) : null}
                  </span>
                  <span className="block">
                    <span className="s-serif block text-[2rem] leading-[1.02] md:text-[2.25rem]">
                      {page.title}
                    </span>
                    {page.summary ? (
                      <span className="mt-2.5 line-clamp-2 block text-[0.92rem] leading-relaxed text-white/75">
                        {page.summary}
                      </span>
                    ) : null}
                    <span className="sa-accent mt-4 inline-flex items-center gap-2 text-[0.92rem] font-medium">
                      View details
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </GalleryRail>
      </div>
    </section>
  );
}

function ServiceHero({ page, ui, cta, backHref }) {
  const lines = splitTitle(page.title);
  const [head, accent, tail] = lines;
  const cover = servicePageCover(page);
  const price = formatRupees(page.price);
  const facts = [
    price && { icon: null, text: `${ui.priceFrom || "From"} ${price}` },
    page.duration && { icon: Clock, text: page.duration },
  ].filter(Boolean);

  return (
    <section
      id="top"
      data-section={page.id}
      className="relative isolate flex min-h-[min(88svh,52rem)] flex-col justify-end overflow-hidden bg-s-brand text-white md:min-h-[min(92svh,56rem)]"
    >
      <div aria-hidden className="absolute inset-0 -z-10 md:left-[36%]">
        {cover ? (
          <img
            {...photoProps(cover, "(min-width: 768px) 64vw, 100vw")}
            alt=""
            fetchPriority="high"
            className="sa-hero-img size-full object-cover object-[50%_25%]"
          />
        ) : null}
        <div className="sa-hero-shade absolute inset-0" />
      </div>

      <div className="s-wrap pt-32 pb-[max(2.25rem,env(safe-area-inset-bottom))] md:pb-24">
        <div className="max-w-[40rem]">
          <a
            href={backHref}
            className="sa-in inline-flex items-center gap-2.5 text-[0.72rem] font-semibold tracking-[0.22em] text-white/75 uppercase transition-colors hover:text-white"
            style={{ "--d": "0.3s" }}
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            {ui.servicesLabel || "Services"}
            <span className="sa-rule h-px w-8 bg-s-accent" />
            <span className="tabular-nums">{pad(page.position)}</span>
          </a>

          <h1 data-size={titleSize(lines)} className="s-serif sa-hero-title mt-5">
            <span className="sa-line block" style={{ "--d": "0.45s" }}>
              {head}
            </span>
            {accent ? (
              <span
                className="sa-line sa-accent s-italic block"
                style={{ "--d": "0.6s" }}
              >
                {accent}
              </span>
            ) : null}
            {tail ? (
              <span className="sa-line block" style={{ "--d": "0.75s" }}>
                {tail}
              </span>
            ) : null}
          </h1>

          {page.summary ? (
            <p
              className="sa-in mt-5 max-w-md text-[1.05rem] leading-[1.55] text-white/85 sm:text-lg"
              style={{ "--d": "0.95s" }}
            >
              {page.summary}
            </p>
          ) : null}

          {facts.length ? (
            <ul className="sa-in mt-6 flex flex-wrap gap-2.5" style={{ "--d": "1.05s" }}>
              {facts.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.92rem] font-medium backdrop-blur-md"
                >
                  {Icon ? (
                    <Icon className="size-4 text-s-pop" strokeWidth={1.75} />
                  ) : (
                    <span className="size-1.5 rounded-full bg-s-pop" />
                  )}
                  {text}
                </li>
              ))}
            </ul>
          ) : null}

          {cta.href ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={cta.href}
                {...linkProps(cta.href)}
                className="sa-btn sa-btn-primary sa-sheen sa-in"
                style={{ "--d": "1.15s" }}
              >
                <CtaIcon cta={cta} className="size-5" />
                {cta.label}
                <ArrowRight className="sa-arrow size-4" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ServiceDetails({ page }) {
  const text = paragraphs(page.details);
  if (!text.length && !page.highlights.length) return null;
  const [lead, ...rest] = text;
  return (
    <section
      id="details"
      className="border-y border-s-line bg-s-paper py-24 md:py-32"
    >
      <div className="s-wrap md:grid md:grid-cols-[0.85fr_1.15fr] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start" data-reveal>
          <SectionLabel>About this service</SectionLabel>
          <AccentHeading text="What to expect." className="mt-5 max-w-[12em]" />
        </div>

        <div className="mt-8 md:mt-0">
          {lead ? (
            <p
              data-reveal
              className="text-[1.2rem] leading-[1.65] whitespace-pre-line text-s-ink md:text-[1.35rem]"
            >
              {lead}
            </p>
          ) : null}
          {rest.map((part, index) => (
            <p
              key={index}
              data-reveal
              className="mt-5 text-[1.05rem] leading-[1.75] whitespace-pre-line text-s-muted"
            >
              {part}
            </p>
          ))}

          {page.highlights.length ? (
            <ul className={`grid gap-3 sm:grid-cols-2 ${text.length ? "mt-12" : ""}`}>
              {page.highlights.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  data-reveal
                  style={{ "--d": `${Math.min(index, 5) * 0.06}s` }}
                  className="flex gap-4 rounded-[1.25rem] border border-s-line bg-s-bg p-5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-s-accent text-s-on-accent">
                    <Check className="size-4" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 pt-1">
                    {item.name ? (
                      <h3 className="text-[1.02rem] leading-snug font-semibold text-s-ink">
                        {item.name}
                      </h3>
                    ) : null}
                    {item.note ? (
                      <p className="mt-1.5 text-[0.93rem] leading-relaxed text-s-muted">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const PAGES_LABEL = "Take a closer look";
const PAGES_HEADING = "Our signature services.";

/** One Standard service page: its own hero, details and gallery, then the shop's contact. */
function GlowServicePage({ page, pages, ui, business, sections, nav, links, whatsappPhone, directions }) {
  const whatsapp = whatsappUrl(whatsappPhone, servicePageMessage(business.name, page.title));
  const phone = telUrl(business.phone);
  const primary = {
    href: whatsapp || phone,
    whatsapp: Boolean(whatsapp),
    label: whatsapp ? ui.contactCta || "Chat on WhatsApp" : "Call us",
  };
  const cta = {
    ...primary,
    label: primary.whatsapp ? ui.availability || primary.label : primary.label,
  };
  const home = homeLink(nav);
  const homeLinks = [
    ...links
      .filter((link) => link.href !== "#contact")
      .map((link) => ({ ...link, href: homeLink(nav, link.href) })),
    { href: "#contact", label: "Contact" },
  ];
  const others = pages.filter((item) => item.id !== page.id);

  return (
    <>
      <Header
        business={business}
        links={[{ href: home, label: "Home" }, ...homeLinks]}
        cta={cta}
        homeHref={home}
      />
      <main className="overflow-x-clip">
        <ServiceHero
          page={page}
          ui={ui}
          cta={primary}
          backHref={homeLink(nav, "#explore")}
        />
        <ServiceDetails page={page} />
        {page.images.length ? (
          <Gallery
            gallery={{ heading: "In pictures.", images: page.images }}
            ui={ui}
            business={business}
            socials={{}}
            id="photos"
            section={null}
            label={page.title}
          />
        ) : null}
        {others.length ? (
          <ServiceCards
            pages={others}
            ui={ui}
            nav={nav}
            id="more"
            label="More services"
            heading="Explore what else we do."
          />
        ) : null}
        <Contact
          contact={sections.contact || {}}
          ui={ui}
          business={business}
          primary={primary}
          directions={directions}
        />
      </main>
      <Footer
        business={business}
        links={homeLinks}
        socials={sections.socials || {}}
        whatsapp={whatsapp}
        intro={page.summary || sections.hero?.subtitle}
        homeHref={home}
      />
      {whatsapp ? (
        <FloatingAction
          href={whatsapp}
          label={ui.contactCta || "Chat on WhatsApp"}
          hideOver="top contact"
          className="sa-fab fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-s-accent text-s-on-accent shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] md:hidden"
        >
          <WhatsAppIcon className="size-6" />
        </FloatingAction>
      ) : null}
    </>
  );
}

export function GlowTemplate({
  doc,
  isShown,
  reviews,
  instagram,
  pages = [],
  page = null,
  nav,
}) {
  const business = doc?.business || {};
  const sections = doc?.sections || {};
  const hero = sections.hero || {};
  const about = sections.about || {};
  const services = { items: [], ...sections.services };
  const gallery = { images: [], ...sections.gallery };
  const socials = sections.socials || {};
  const contact = sections.contact || {};
  const ui = getPack(doc?.packId).ui || {};

  const whatsappPhone = business.whatsapp || business.phone;
  const whatsapp = whatsappUrl(whatsappPhone, doc?.whatsappMessage);
  const phone = telUrl(business.phone);
  // Packs that aim the hero CTA at the gallery word it for that, not for WhatsApp.
  const heroCta = ui.primaryTarget === "gallery" ? ui.contactCta : hero.cta;
  const primary = {
    href: whatsapp || phone,
    whatsapp: Boolean(whatsapp),
    label: whatsapp ? heroCta || "Chat on WhatsApp" : "Call us",
  };
  const directions = {
    href: mapsUrl(business.address),
    label: ui.directions || "Get directions",
    area: areaFrom(business.address),
  };

  const showAbout = isShown("about") && Boolean(about.heading || about.text);
  const showServices = isShown("services") && services.items.length > 0;
  const showGallery = isShown("gallery") && gallery.images.length > 0;
  const showPages = pages.length > 0;
  // Gallery, About and the service page cards share the page background; Services has its own.
  const plainAbove = showGallery || (!showServices && (showPages || showAbout));
  const links = [
    showAbout && { href: "#about", label: "About" },
    showServices
      ? { href: "#services", label: "Services" }
      : showPages && { href: "#explore", label: "Services" },
    showGallery && { href: "#gallery", label: "Gallery" },
    instagram && { href: "#instagram", label: "Instagram" },
    reviews && { href: "#reviews", label: "Reviews" },
    { href: "#contact", label: "Contact" },
  ].filter(Boolean);

  if (page) {
    return (
      <GlowServicePage
        page={page}
        pages={pages}
        ui={ui}
        business={business}
        sections={sections}
        nav={nav}
        links={links}
        whatsappPhone={whatsappPhone}
        directions={directions}
      />
    );
  }
  const cta = {
    href: primary.href,
    whatsapp: primary.whatsapp,
    label: primary.whatsapp ? ui.availability || primary.label : primary.label,
  };

  return (
    <>
      <Header business={business} links={links} cta={cta} />
      <main className="overflow-x-clip">
        <Hero hero={hero} primary={primary} directions={directions} />
        <OfferBanners
          doc={doc}
          phone={business.phone}
          headingClassName="font-semibold tracking-tight"
        />
        {showAbout ? <About about={about} ui={ui} business={business} /> : null}
        {showPages ? (
          <ServiceCards
            pages={pages}
            ui={ui}
            nav={nav}
            id="explore"
            section="service-pages"
            label={PAGES_LABEL}
            heading={PAGES_HEADING}
            flushTop={showAbout}
          />
        ) : null}
        {showServices ? (
          <Services
            services={services}
            ui={ui}
            business={business}
            whatsappPhone={whatsappPhone}
            cta={cta}
            pages={pages}
            nav={nav}
          />
        ) : null}
        {showGallery ? (
          <Gallery
            gallery={gallery}
            ui={ui}
            business={business}
            socials={socials}
          />
        ) : null}
        <InstagramFeed
          feed={instagram}
          headingClassName="font-semibold tracking-tight"
          flushTop={plainAbove}
        />
        <GoogleReviews
          reviews={reviews}
          headingClassName="font-semibold tracking-tight"
          flushTop={plainAbove || Boolean(instagram)}
        />
        <Contact
          contact={contact}
          ui={ui}
          business={business}
          primary={primary}
          directions={directions}
        />
      </main>
      <Footer
        business={business}
        links={links}
        socials={socials}
        whatsapp={whatsapp}
        intro={hero.subtitle}
      />
      {whatsapp ? (
        <FloatingAction
          href={whatsapp}
          label={ui.contactCta || "Chat on WhatsApp"}
          hideOver="top contact"
          className="sa-fab fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-s-accent text-s-on-accent shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] md:hidden"
        >
          <WhatsAppIcon className="size-6" />
        </FloatingAction>
      ) : null}
    </>
  );
}
