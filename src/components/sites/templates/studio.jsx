/* eslint-disable @next/next/no-img-element -- plain <img> keeps customer sites off Vercel image optimisation billing */
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "@/components/sites/icons";
import { GoogleReviews } from "@/components/sites/google-reviews";
import { InstagramFeed } from "@/components/sites/instagram-feed";
import { MobileMenu } from "@/components/sites/mobile-menu";
import { playStoreUrl } from "@/lib/branding";
import { photoProps } from "@/lib/sites/photo";
import {
  formatRupees,
  instagramHandle,
  mapsUrl,
  phoneDigits,
  socialUrl,
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

/** Headline → [plain line, italic line]: split after the first comma, else the last word or two. */
function splitTitle(title) {
  const text = String(title || "").trim();
  const mark = text.search(/[,:;]\s/);
  if (mark > 0 && mark < text.length - 2) {
    return [text.slice(0, mark + 1), text.slice(mark + 1).trim()];
  }
  const words = text.split(/\s+/);
  if (words.length < 3) return [text, ""];
  const tail = words.length > 4 ? 2 : 1;
  return [words.slice(0, -tail).join(" "), words.slice(-tail).join(" ")];
}

function titleSize(title) {
  const length = String(title || "").length;
  if (length <= 24) return undefined;
  return length <= 44 ? "m" : "s";
}

function cityFrom(address) {
  const parts = String(address || "")
    .split(/[,\n]/)
    .map((part) =>
      part
        .replace(/\d+/g, "")
        .replace(/[\s-]+$/, "")
        .trim(),
    )
    .filter((part) => part && !/^india$/i.test(part));
  return parts.at(-1) || "";
}

function formatPhone(value) {
  const digits = phoneDigits(value);
  if (digits.length !== 10) return String(value || "").trim();
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function initialOf(name) {
  return (
    String(name || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "M"
  );
}

function linkProps(href) {
  return href?.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

function CtaIcon({ cta, className }) {
  if (cta.whatsapp) return <WhatsAppIcon className={className} />;
  if (cta.href?.startsWith("tel:")) {
    return <Phone className={className} strokeWidth={1.75} />;
  }
  return null;
}

function BrandMark({ business, ui, light = false }) {
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-full ${
        light ? "bg-s-accent text-s-on-accent" : "bg-s-brand text-s-accent"
      }`}
    >
      {business.logo ? (
        <img src={business.logo} alt="" className="size-full object-cover" />
      ) : ui.icon === "camera" ? (
        <Camera className="size-5" strokeWidth={1.6} />
      ) : (
        <span className="s-serif text-xl leading-none">
          {initialOf(business.name)}
        </span>
      )}
    </span>
  );
}

function Wordmark({ business, ui, light = false }) {
  return (
    <>
      <BrandMark business={business} ui={ui} light={light} />
      <span className="s-serif truncate text-[1.6rem] leading-none tracking-[-0.01em]">
        {business.name}
      </span>
    </>
  );
}

function Header({ business, ui, links, cta, homeHref = "#top" }) {
  return (
    <header className="s-header sa-intro sticky top-0 z-40">
      <div className="s-wrap flex h-[4.75rem] items-center justify-between gap-4">
        <a href={homeHref} className="flex min-w-0 items-center gap-3 text-s-brand">
          <Wordmark business={business} ui={ui} />
        </a>
        <nav className="s-nav hidden items-center gap-9 text-s-ink/75 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-s-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={cta.href}
            {...linkProps(cta.href)}
            className="s-btn s-btn-primary s-btn-sm hidden sm:inline-flex"
          >
            <CtaIcon cta={cta} className="size-4" />
            {cta.label}
            <ArrowRight className="s-arrow size-4" />
          </a>
          <MobileMenu
            name={business.name}
            links={links}
            cta={cta}
            ctaIcon={<CtaIcon cta={cta} className="size-5" />}
          />
        </div>
      </div>
    </header>
  );
}

function Hero({ hero, ui, reach, primary, secondaryHref }) {
  const [first, second] = splitTitle(hero.title);
  return (
    <section
      id="top"
      data-section="hero"
      className="relative pt-6 pb-20 sm:pt-10 md:pt-16 md:pb-32"
    >
      <div className="s-wrap grid items-center gap-12 md:grid-cols-[1.08fr_0.92fr] md:gap-16">
        <div className="relative md:order-last">
          <div
            aria-hidden
            className="st-pop absolute top-12 -right-3 size-28 rounded-full bg-s-accent sm:-right-6 md:top-16 md:-right-10 md:size-40"
            style={{ "--d": "0.55s" }}
          />
          <div
            className="s-arch sa-in relative h-[min(122vw,34rem)] overflow-hidden bg-s-brand md:h-[min(82svh,46rem)]"
            style={{ "--d": "0.1s" }}
          >
            {hero.image ? (
              <img
                {...photoProps(hero.image, "(min-width: 768px) 46vw, 100vw")}
                alt=""
                fetchPriority="high"
                className="sa-hero-img size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-s-accent/60">
                <Camera className="size-14" strokeWidth={1} />
              </div>
            )}
          </div>
          {reach ? (
            <div
              className="sa-in absolute bottom-5 left-1/2 -translate-x-1/2 md:bottom-14 md:-left-10 md:translate-x-0"
              style={{ "--d": "0.95s" }}
            >
              <p className="flex items-center gap-2.5 rounded-full bg-s-paper/95 px-4 py-2.5 text-[0.82rem] font-medium whitespace-nowrap text-s-brand shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)]">
                <span className="size-2 rounded-full bg-s-accent ring-4 ring-s-accent/35" />
                {reach}
              </p>
            </div>
          ) : null}
        </div>

        <div>
          {hero.eyebrow ? (
            <p
              className="s-eyebrow sa-in flex items-center gap-3 text-s-brand"
              style={{ "--d": "0.3s" }}
            >
              <span className="sa-rule h-px w-10 bg-s-brand/50" />
              {hero.eyebrow}
            </p>
          ) : null}
          {hero.title ? (
            <h1
              data-size={titleSize(hero.title)}
              className="s-serif s-hero-title mt-6 text-s-ink md:mt-8"
            >
              <span className="sa-line block" style={{ "--d": "0.4s" }}>
                {first}
              </span>
              {second ? (
                <span
                  className="sa-line s-italic block text-s-brand"
                  style={{ "--d": "0.6s" }}
                >
                  {second}
                </span>
              ) : null}
            </h1>
          ) : null}
          {hero.subtitle ? (
            <p
              className="sa-in mt-8 max-w-[34rem] text-[1.06rem] leading-[1.75] text-s-muted sm:text-lg"
              style={{ "--d": "0.8s" }}
            >
              {hero.subtitle}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-3">
            {hero.cta ? (
              <a
                href={primary.href}
                {...linkProps(primary.href)}
                className="s-btn s-btn-primary sa-sheen sa-in flex-1 sm:flex-none"
                style={{ "--d": "0.95s" }}
              >
                <CtaIcon cta={primary} className="size-5" />
                {hero.cta}
                <ArrowRight className="s-arrow size-4" />
              </a>
            ) : null}
            {ui.cta2 ? (
              <a
                href={secondaryHref}
                className="s-btn s-btn-secondary sa-in flex-1 sm:flex-none"
                style={{ "--d": "1.05s" }}
              >
                {ui.cta2}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function RingBadge({ text, ui, name }) {
  return (
    <div className="relative grid size-32 place-items-center rounded-full bg-s-brand text-s-paper shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)] md:size-36">
      <svg
        viewBox="0 0 120 120"
        aria-hidden
        className="s-spin absolute inset-0 size-full"
      >
        <defs>
          <path
            id="s-badge-ring"
            d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
          />
        </defs>
        <text
          fill="currentColor"
          fontSize="8.6"
          fontWeight="600"
          letterSpacing="1.4"
        >
          <textPath
            href="#s-badge-ring"
            textLength="272"
            lengthAdjust="spacing"
          >
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <span className="grid size-12 place-items-center rounded-full bg-s-accent text-s-on-accent">
        {ui.icon === "camera" ? (
          <Camera className="size-5" strokeWidth={1.6} />
        ) : (
          <span className="s-serif text-xl leading-none">
            {initialOf(name)}
          </span>
        )}
      </span>
    </div>
  );
}

function About({ about, image, ui, business }) {
  const badge = ui.badge ? (
    <RingBadge text={ui.badge} ui={ui} name={business.name} />
  ) : null;
  return (
    <section id="about" data-section="about" className="py-24 md:py-36">
      <div
        className={`s-wrap grid items-center gap-16 ${
          image ? "md:grid-cols-[0.9fr_1.1fr] md:gap-24" : ""
        }`}
      >
        {image ? (
          <div className="relative mr-5 mb-5">
            <div
              aria-hidden
              data-reveal
              style={{ "--d": "0.35s" }}
              className="absolute inset-0 translate-x-5 translate-y-5 rounded-[1.25rem] bg-s-accent"
            />
            <div
              data-reveal
              className="st-photo relative overflow-hidden rounded-[1.25rem]"
            >
              <img
                {...photoProps(image, "(min-width: 768px) 45vw, 100vw")}
                alt=""
                loading="lazy"
                className="aspect-4/5 w-full object-cover"
              />
            </div>
            {badge ? (
              <div
                data-reveal
                style={{ "--d": "0.6s" }}
                className="absolute -top-10 -right-4 md:top-auto md:-right-14 md:-bottom-12"
              >
                {badge}
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          className={image ? "" : "max-w-3xl"}
          data-reveal
          style={{ "--d": "0.1s" }}
        >
          {ui.aboutLabel ? (
            <p className="s-eyebrow text-s-brand/70">{ui.aboutLabel}</p>
          ) : null}
          {about.heading ? (
            <h2 className="s-serif s-h2 mt-5 text-s-ink">{about.heading}</h2>
          ) : null}
          {about.text ? (
            <p className="mt-8 max-w-xl text-[1.05rem] leading-[1.8] whitespace-pre-line text-s-muted">
              {about.text}
            </p>
          ) : null}
          <p className="mt-10 flex items-center gap-4 text-s-brand">
            <span className="h-px w-12 bg-s-brand/40" />
            <span className="s-serif s-italic s-signature">
              {business.name}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Services({ services, ui, business, whatsappPhone, cta, pages, nav }) {
  return (
    <section
      id="services"
      data-section="services"
      className="relative overflow-hidden bg-s-brand py-24 text-s-paper md:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -right-48 size-[32rem] rounded-full bg-s-brand-2"
      />
      <div className="s-wrap relative">
        <div
          className="grid gap-8 md:grid-cols-[1.25fr_0.75fr] md:items-end md:gap-16"
          data-reveal
        >
          <div>
            {ui.servicesLabel ? (
              <p className="s-eyebrow text-s-accent">{ui.servicesLabel}</p>
            ) : null}
            {services.heading ? (
              <h2 className="s-serif s-h2 mt-5">{services.heading}</h2>
            ) : null}
          </div>
          <div>
            {ui.servicesIntro ? (
              <p className="max-w-md text-[1.02rem] leading-[1.75] text-s-paper/65">
                {ui.servicesIntro}
              </p>
            ) : null}
            <a
              href={cta.href}
              {...linkProps(cta.href)}
              className="s-btn s-btn-primary mt-7"
            >
              <CtaIcon cta={cta} className="size-5" />
              {cta.label}
              <ArrowRight className="s-arrow size-4" />
            </a>
          </div>
        </div>

        <ol className="mt-14 grid border-t border-s-paper/15 md:mt-20 md:grid-cols-2 md:gap-x-14">
          {services.items.map((item, index) => {
            const price = formatRupees(item.price);
            const page = pageForService(pages, item.name);
            const href = page
              ? pageLink(nav, page)
              : whatsappUrl(
                  whatsappPhone,
                  item.name
                    ? `Hi ${business.name}! I'm interested in ${item.name}.`
                    : "",
                ) || cta.href;
            return (
              <li
                key={`${item.name}-${index}`}
                data-reveal
                style={{ "--d": `${(index % 2) * 0.08}s` }}
                className="sa-row [--row-line:color-mix(in_srgb,var(--s-paper)_15%,transparent)]"
              >
                <a
                  href={href}
                  {...linkProps(href)}
                  className="group -mx-3 flex gap-4 rounded-2xl px-3 py-7 transition-colors duration-300 hover:bg-s-accent/[0.07] sm:gap-6 md:py-8"
                >
                  <span className="s-eyebrow w-7 shrink-0 pt-2 text-s-accent tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.name ? (
                      <h3 className="s-serif s-service-title">{item.name}</h3>
                    ) : null}
                    {item.note ? (
                      <p className="mt-2.5 text-[0.95rem] leading-relaxed text-s-paper/60">
                        {item.note}
                      </p>
                    ) : null}
                    {price ? (
                      <p className="mt-4 text-sm text-s-paper/55 sm:hidden">
                        {ui.priceFrom}{" "}
                        <span className="s-serif text-xl text-s-accent">
                          {price}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
                    {price ? (
                      <>
                        <span className="s-eyebrow text-[0.66rem] text-s-paper/45">
                          {ui.priceFrom}
                        </span>
                        <span className="s-serif mt-1.5 text-[1.75rem] leading-none text-s-accent">
                          {price}
                        </span>
                      </>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1 text-[0.82rem] font-medium text-s-paper/40 transition-colors group-hover:text-s-accent">
                      {page ? "Details" : ui.enquire}
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Editorial rows on a 12-col grid: [7,5] · [4,4,4] · [12], repeating. */
function galleryTiles(count) {
  const rows = [[7, 5], [4, 4, 4], [12]];
  const tiles = [];
  for (let row = 0; tiles.length < count; row += 1) {
    const pattern = rows[row % rows.length];
    const take = Math.min(pattern.length, count - tiles.length);
    const triple = pattern.length === 3;
    for (let slot = 0; slot < take; slot += 1) {
      const md = take === pattern.length ? pattern[slot] : 12 / take;
      const wideThird = triple && take === 3 && slot === 2;
      const sm =
        triple && take === 3 ? (wideThird ? 12 : 6) : md === 12 ? 12 : 6;
      const xs = triple && take >= 2 && !wideThird ? 6 : 12;
      tiles.push({
        "--md": md,
        "--md-h":
          md === 12
            ? "34rem"
            : pattern.length === 2
              ? "36rem"
              : md === 6
                ? "30rem"
                : "26rem",
        "--sm": sm,
        "--sm-h":
          sm === 12 ? "28rem" : pattern.length === 2 ? "26rem" : "22rem",
        "--xs": xs,
        "--xs-h": xs === 12 ? "25rem" : "13rem",
      });
    }
  }
  return tiles;
}

/** The site gallery, or a service page's own (`id`, `label`, no sample tags). */
function Gallery({
  gallery,
  ui,
  socials,
  cta,
  id = "gallery",
  section = "gallery",
  label = ui.galleryLabel,
  tags = ui.galleryTags || [],
}) {
  const tiles = galleryTiles(gallery.images.length);
  const instagram = socialUrl("instagram", socials.instagram);
  return (
    <section
      id={id}
      data-section={section || undefined}
      className="bg-s-paper py-24 md:py-36"
    >
      <div className="s-wrap">
        <div
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          data-reveal
        >
          <div className="max-w-3xl">
            {label ? (
              <p className="s-eyebrow text-s-brand/70">{label}</p>
            ) : null}
            {gallery.heading ? (
              <h2 className="s-serif s-h2 mt-5 text-s-ink">
                {gallery.heading}
              </h2>
            ) : null}
          </div>
          {instagram ? (
            <a
              href={instagram}
              {...linkProps(instagram)}
              className="s-btn s-btn-secondary shrink-0 self-start md:self-auto"
            >
              <InstagramIcon className="size-4" />@
              {instagramHandle(socials.instagram)}
            </a>
          ) : ui.galleryCta ? (
            <a
              href={cta.href}
              {...linkProps(cta.href)}
              className="s-btn s-btn-secondary shrink-0 self-start md:self-auto"
            >
              <CtaIcon cta={cta} className="size-4" />
              {ui.galleryCta}
              <ArrowRight className="s-arrow size-4" />
            </a>
          ) : null}
        </div>

        <div className="s-gallery mt-12 md:mt-16">
          {gallery.images.map((src, index) => {
            const sample = src.startsWith("/");
            const tag = sample && tags.length ? tags[index % tags.length] : "";
            return (
              <figure
                key={`${src}-${index}`}
                data-reveal
                style={{ ...tiles[index], "--d": `${(index % 3) * 0.1}s` }}
                className="s-tile st-photo relative m-0 overflow-hidden rounded-[1.25rem] bg-s-bg"
              >
                <img
                  {...photoProps(src, "(min-width: 768px) 40vw, 90vw")}
                  alt={tag}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent p-4 pt-16 text-white sm:p-6 sm:pt-20">
                  <span className="s-eyebrow block text-[0.66rem] text-s-accent">
                    No. {String(index + 1).padStart(2, "0")}
                  </span>
                  {tag ? (
                    <span className="s-serif mt-1.5 block text-[1.35rem] leading-none sm:text-[1.7rem]">
                      {tag}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, icon: Icon, value, href }) {
  if (!value) return null;
  const Row = href ? "a" : "div";
  return (
    <li className="border-b border-s-on-accent/20 last:border-b-0">
      <Row
        {...(href ? { href, ...linkProps(href) } : {})}
        className="flex items-center gap-4 px-5 py-5 transition-colors hover:bg-s-paper/25 sm:gap-5 sm:px-6"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-s-brand text-s-paper sm:size-12">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="s-eyebrow block text-[0.72rem] opacity-65">
            {label}
          </span>
          <span className="mt-1 block text-[1.1rem] leading-snug font-semibold whitespace-pre-line text-s-ink sm:text-[1.2rem]">
            {value}
          </span>
        </span>
      </Row>
    </li>
  );
}

function Contact({ contact, ui, business, whatsapp }) {
  const call = telUrl(business.phone);
  const primary = whatsapp || call;
  return (
    <section
      id="contact"
      data-section="contact"
      className="relative overflow-hidden bg-s-accent py-24 text-s-on-accent md:py-36"
    >
      <span
        aria-hidden
        className="s-serif pointer-events-none absolute top-1/2 -right-[0.06em] -translate-y-1/2 text-[clamp(24rem,55vw,50rem)] leading-none opacity-[0.08] select-none"
      >
        {initialOf(business.name)}
      </span>
      <div className="s-wrap relative grid gap-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-20">
        <div data-reveal>
          {ui.contactLabel ? (
            <p className="s-eyebrow opacity-70">{ui.contactLabel}</p>
          ) : null}
          {contact.heading ? (
            <h2 className="s-serif s-contact-title mt-5">{contact.heading}</h2>
          ) : null}
          {contact.text ? (
            <p className="mt-7 max-w-xl text-[1.06rem] leading-[1.75] opacity-75">
              {contact.text}
            </p>
          ) : null}
          {primary ? (
            <a
              href={primary}
              {...linkProps(primary)}
              className="s-btn sa-sheen mt-10 w-full bg-s-brand px-8 text-[1.05rem] text-s-paper shadow-[0_18px_36px_-20px_rgba(0,0,0,0.6)] sm:w-auto"
            >
              <CtaIcon
                cta={{ href: primary, whatsapp: Boolean(whatsapp) }}
                className="size-5"
              />
              {whatsapp ? ui.contactCta : formatPhone(business.phone)}
              <ArrowRight className="s-arrow ml-2 size-5" strokeWidth={1.75} />
            </a>
          ) : null}
        </div>
        <ul
          className="m-0 list-none overflow-hidden rounded-[1.5rem] border border-s-on-accent/25 bg-s-paper/40 p-0 backdrop-blur-sm"
          data-reveal
          style={{ "--d": "0.12s" }}
        >
          <InfoRow
            label={ui.callLabel || "Call us"}
            icon={Phone}
            value={formatPhone(business.phone)}
            href={call}
          />
          <InfoRow
            label="WhatsApp"
            icon={WhatsAppIcon}
            value={whatsapp ? ui.whatsappNote || "Chat with us" : ""}
            href={whatsapp}
          />
          <InfoRow
            label={ui.placeLabel || "Visit us"}
            icon={MapPin}
            value={business.address}
            href={mapsUrl(business.address)}
          />
          <InfoRow
            label={ui.hoursLabel || "Open"}
            icon={Clock}
            value={business.hours}
          />
        </ul>
      </div>
    </section>
  );
}

function Footer({ business, ui, links, socials, whatsapp, intro, homeHref = "#top" }) {
  const socialLinks = [
    {
      label: "Instagram",
      href: socialUrl("instagram", socials.instagram),
      icon: InstagramIcon,
    },
    {
      label: "Facebook",
      href: socialUrl("facebook", socials.facebook),
      icon: FacebookIcon,
    },
    {
      label: "YouTube",
      href: socialUrl("youtube", socials.youtube),
      icon: YouTubeIcon,
    },
    { label: "WhatsApp", href: whatsapp, icon: WhatsAppIcon },
  ].filter((item) => item.href);

  return (
    <footer
      data-section="socials"
      className="bg-s-footer pt-20 pb-28 text-s-paper/65 md:pt-24 md:pb-10"
    >
      <div className="s-wrap">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] md:gap-16">
          <div className="sm:col-span-2 md:col-span-1">
            <a
              href={homeHref}
              className="inline-flex max-w-full items-center gap-3 text-s-paper"
            >
              <Wordmark business={business} ui={ui} light />
            </a>
            {intro ? (
              <p className="mt-6 max-w-sm leading-[1.75]">{intro}</p>
            ) : null}
          </div>
          <div>
            <p className="s-eyebrow text-s-accent">Explore</p>
            <ul className="mt-6 space-y-3.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-s-paper"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {socialLinks.length ? (
            <div>
              <p className="s-eyebrow text-s-accent">Social</p>
              <ul className="mt-6 space-y-3.5">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...linkProps(href)}
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-s-paper"
                    >
                      <Icon className="size-4" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-s-paper/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <a
            href={playStoreUrl("shop_site", "footer")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-s-paper"
          >
            <span className="size-1.5 rounded-full bg-s-accent" />
            Website powered by MoneyKit
          </a>
        </div>
      </div>
    </footer>
  );
}

function SplitHeading({ text, className }) {
  const [first, second] = splitTitle(text);
  return (
    <h2 className={`s-serif s-h2 ${className}`}>
      {first}
      {second ? (
        <>
          {" "}
          <span className="s-italic text-s-brand">{second}</span>
        </>
      ) : null}
    </h2>
  );
}

const CARD_GRID = {
  1: "max-w-2xl",
  2: "sm:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Service page cards: on the home page, and as "more services" on each page. */
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
  const wide = pages.length <= 2;
  return (
    <section
      id={id}
      data-section={section || undefined}
      className={flushTop ? "pb-24 md:pb-36" : "py-24 md:py-36"}
    >
      <div className="s-wrap">
        <div data-reveal className="max-w-3xl">
          <p className="s-eyebrow text-s-brand/70">{label}</p>
          <SplitHeading text={heading} className="mt-5 text-s-ink" />
        </div>
        <ul
          className={`mt-12 grid gap-x-5 gap-y-12 md:mt-16 ${CARD_GRID[pages.length] || CARD_GRID[4]}`}
        >
          {pages.map((page, index) => {
            const cover = servicePageCover(page);
            const price = formatRupees(page.price);
            return (
              <li
                key={page.id}
                data-reveal
                style={{ "--d": `${(index % 4) * 0.08}s` }}
              >
                <a href={pageLink(nav, page)} className="group block">
                  <div
                    className={`relative overflow-hidden rounded-[1.25rem] bg-s-brand ${
                      wide ? "aspect-4/3" : "aspect-5/4 sm:aspect-4/5"
                    }`}
                  >
                    {cover ? (
                      <img
                        {...photoProps(
                          cover,
                          wide
                            ? "(min-width: 620px) 50vw, 100vw"
                            : "(min-width: 1024px) 25vw, (min-width: 620px) 50vw, 100vw",
                        )}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      />
                    ) : (
                      <span className="s-serif grid size-full place-items-center text-[5rem] leading-none text-s-accent/70">
                        {initialOf(page.title)}
                      </span>
                    )}
                    <span className="s-eyebrow absolute top-4 left-4 rounded-full bg-s-paper/90 px-3 py-1.5 text-[0.64rem] text-s-brand backdrop-blur-sm">
                      No. {pad(page.position)}
                    </span>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="s-serif s-service-title text-s-ink">
                        {page.title}
                      </h3>
                      {page.summary ? (
                        <p className="mt-2.5 line-clamp-2 text-[0.95rem] leading-relaxed text-s-muted">
                          {page.summary}
                        </p>
                      ) : null}
                      {price ? (
                        <p className="mt-3 text-sm text-s-muted">
                          {ui.priceFrom || "From"}{" "}
                          <span className="s-serif text-xl text-s-brand">
                            {price}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-s-brand/25 text-s-brand transition duration-300 group-hover:border-s-brand group-hover:bg-s-brand group-hover:text-s-accent">
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ServiceHero({ page, ui, cta, backHref }) {
  const [first, second] = splitTitle(page.title);
  const cover = servicePageCover(page);
  const price = formatRupees(page.price);
  const hasDetails = Boolean(page.details || page.highlights.length);
  return (
    <section
      id="top"
      data-section={page.id}
      className="relative pt-6 pb-20 sm:pt-10 md:pt-14 md:pb-28"
    >
      <div className="s-wrap grid items-center gap-12 md:grid-cols-[1.08fr_0.92fr] md:gap-16">
        <div className="relative md:order-last">
          <div
            aria-hidden
            className="st-pop absolute top-10 -right-3 z-10 grid size-24 place-items-center rounded-full bg-s-accent text-s-on-accent shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] sm:-right-6 md:top-14 md:-right-10 md:size-32"
            style={{ "--d": "0.55s" }}
          >
            <span className="s-serif s-italic text-[2.4rem] leading-none md:text-[3.2rem]">
              {pad(page.position)}
            </span>
          </div>
          <div
            className="s-arch sa-in relative h-[min(112vw,31rem)] overflow-hidden bg-s-brand md:h-[min(76svh,40rem)]"
            style={{ "--d": "0.1s" }}
          >
            {cover ? (
              <img
                {...photoProps(cover, "(min-width: 768px) 46vw, 100vw")}
                alt={page.title}
                fetchPriority="high"
                className="sa-hero-img size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-s-accent/60">
                <Camera className="size-14" strokeWidth={1} />
              </div>
            )}
          </div>
        </div>

        <div>
          <p
            className="s-eyebrow sa-in flex items-center gap-3 text-s-brand"
            style={{ "--d": "0.3s" }}
          >
            <a
              href={backHref}
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              <ArrowLeft className="size-3.5" strokeWidth={2} />
              {ui.servicesLabel || "Services"}
            </a>
            <span className="sa-rule h-px w-10 bg-s-brand/50" />
          </p>
          <h1
            data-size={titleSize(page.title)}
            className="s-serif s-hero-title mt-6 text-s-ink md:mt-8"
          >
            <span className="sa-line block" style={{ "--d": "0.4s" }}>
              {first}
            </span>
            {second ? (
              <span
                className="sa-line s-italic block text-s-brand"
                style={{ "--d": "0.6s" }}
              >
                {second}
              </span>
            ) : null}
          </h1>
          {page.summary ? (
            <p
              className="sa-in mt-8 max-w-[34rem] text-[1.06rem] leading-[1.75] text-s-muted sm:text-lg"
              style={{ "--d": "0.8s" }}
            >
              {page.summary}
            </p>
          ) : null}
          {price || page.duration ? (
            <dl
              className="sa-in mt-9 flex max-w-[34rem] flex-wrap gap-x-12 gap-y-5 border-t border-s-line pt-6"
              style={{ "--d": "0.9s" }}
            >
              {price ? (
                <div>
                  <dt className="s-eyebrow text-[0.66rem] text-s-muted">
                    {ui.priceFrom || "From"}
                  </dt>
                  <dd className="s-serif mt-2 text-[2.1rem] leading-none text-s-brand">
                    {price}
                  </dd>
                </div>
              ) : null}
              {page.duration ? (
                <div>
                  <dt className="s-eyebrow text-[0.66rem] text-s-muted">
                    Duration
                  </dt>
                  <dd className="mt-2.5 flex items-center gap-2 text-[1.05rem] font-medium text-s-ink">
                    <Clock className="size-4 text-s-brand" strokeWidth={1.75} />
                    {page.duration}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={cta.href}
              {...linkProps(cta.href)}
              className="s-btn s-btn-primary sa-sheen sa-in flex-1 sm:flex-none"
              style={{ "--d": "1s" }}
            >
              <CtaIcon cta={cta} className="size-5" />
              {cta.label}
              <ArrowRight className="s-arrow size-4" />
            </a>
            {hasDetails ? (
              <a
                href="#details"
                className="s-btn s-btn-secondary sa-in flex-1 sm:flex-none"
                style={{ "--d": "1.1s" }}
              >
                See details
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Long text and "what's included", on the dark band Services uses at home. */
function ServiceDetails({ page }) {
  const text = paragraphs(page.details);
  if (!text.length && !page.highlights.length) return null;
  const [lead, ...rest] = text;
  const shortLead = lead && lead.length <= 260;
  return (
    <section
      id="details"
      className="relative overflow-hidden bg-s-brand py-24 text-s-paper md:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -left-48 size-[32rem] rounded-full bg-s-brand-2"
      />
      <div className="s-wrap relative grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-24">
        <div data-reveal className="md:sticky md:top-28 md:self-start">
          <p className="s-eyebrow text-s-accent">About this service</p>
          <h2 className="s-serif s-h2 mt-5">
            What to <span className="s-italic text-s-accent">expect.</span>
          </h2>
        </div>
        <div>
          {lead ? (
            <p
              data-reveal
              className={
                shortLead
                  ? "s-serif text-[1.65rem] leading-[1.3] md:text-[2.1rem]"
                  : "text-[1.15rem] leading-[1.8] whitespace-pre-line text-s-paper/90"
              }
            >
              {lead}
            </p>
          ) : null}
          {rest.map((part, index) => (
            <p
              key={index}
              data-reveal
              className="mt-6 max-w-2xl text-[1.05rem] leading-[1.8] whitespace-pre-line text-s-paper/65"
            >
              {part}
            </p>
          ))}
          {page.highlights.length ? (
            <div className={text.length ? "mt-16" : ""}>
              <p data-reveal className="s-eyebrow text-s-accent">
                What&apos;s included
              </p>
              <ul className="mt-6 border-t border-s-paper/15">
                {page.highlights.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    data-reveal
                    style={{ "--d": `${Math.min(index, 5) * 0.06}s` }}
                    className="sa-row flex gap-5 py-6 [--row-line:color-mix(in_srgb,var(--s-paper)_15%,transparent)]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-s-accent text-s-on-accent">
                      <Check className="size-4" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 pt-1.5">
                      {item.name ? (
                        <h3 className="text-[1.1rem] leading-snug font-semibold">
                          {item.name}
                        </h3>
                      ) : null}
                      {item.note ? (
                        <p className="mt-1.5 text-[0.98rem] leading-relaxed text-s-paper/60">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsApp({ href }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-s-brand text-s-accent shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] ring-1 ring-s-accent/30 transition hover:scale-105 md:hidden"
    >
      <WhatsAppIcon className="size-6" />
    </a>
  );
}

const PAGES_LABEL = "Take a closer look";
const PAGES_HEADING = "Our signature services.";

/** One Standard service page: its own hero, details and gallery, then the shop's contact. */
function StudioServicePage({ page, pages, ui, business, sections, nav, links, whatsappPhone }) {
  const whatsapp = whatsappUrl(whatsappPhone, servicePageMessage(business.name, page.title));
  const cta = {
    href: whatsapp || telUrl(business.phone) || "#contact",
    label: ui.availability || "Contact us",
    whatsapp: Boolean(whatsapp),
  };
  const home = homeLink(nav);
  const pageLinks = [
    { href: home, label: "Home" },
    ...links
      .filter((link) => link.href !== "#contact")
      .map((link) => ({ ...link, href: homeLink(nav, link.href) })),
    { href: "#contact", label: "Contact" },
  ];
  const others = pages.filter((item) => item.id !== page.id);

  return (
    <>
      <Header business={business} ui={ui} links={pageLinks} cta={cta} homeHref={home} />
      <main className="overflow-x-clip">
        <ServiceHero
          page={page}
          ui={ui}
          cta={cta}
          backHref={homeLink(nav, "#explore")}
        />
        <ServiceDetails page={page} />
        {page.images.length ? (
          <Gallery
            gallery={{ heading: "In pictures.", images: page.images }}
            ui={ui}
            socials={{}}
            cta={cta}
            id="photos"
            section={null}
            label={page.title}
            tags={[]}
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
          whatsapp={whatsapp}
        />
      </main>
      <Footer
        business={business}
        ui={ui}
        links={pageLinks}
        socials={sections.socials || {}}
        whatsapp={whatsapp}
        intro={page.summary || sections.hero?.subtitle}
        homeHref={home}
      />
      <FloatingWhatsApp href={whatsapp} />
    </>
  );
}

export function StudioTemplate({
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
  const services = { heading: "", items: [], ...sections.services };
  const gallery = { heading: "", images: [], ...sections.gallery };
  const socials = sections.socials || {};
  const contact = sections.contact || {};
  const ui = getPack(doc?.packId).ui || {};

  const whatsappPhone = business.whatsapp || business.phone;
  const whatsapp = whatsappUrl(whatsappPhone, doc?.whatsappMessage);
  const contactHref = whatsapp || telUrl(business.phone) || "#contact";

  const show = {
    about: isShown("about") && Boolean(about.heading || about.text),
    services: isShown("services") && services.items.length > 0,
    gallery: isShown("gallery") && gallery.images.length > 0,
  };

  const showPages = pages.length > 0;

  // About and the service page cards share the page background; Services and Gallery have their own.
  const plainAbove = !show.gallery && !show.services && (showPages || show.about);
  const links = [
    show.about && { href: "#about", label: "About" },
    show.services
      ? { href: "#services", label: "Services" }
      : showPages && { href: "#explore", label: "Services" },
    show.gallery && { href: "#gallery", label: "Gallery" },
    instagram && { href: "#instagram", label: "Instagram" },
    reviews && { href: "#reviews", label: "Reviews" },
    { href: "#contact", label: "Contact" },
  ].filter(Boolean);

  if (page) {
    return (
      <StudioServicePage
        page={page}
        pages={pages}
        ui={ui}
        business={business}
        sections={sections}
        nav={nav}
        links={links}
        whatsappPhone={whatsappPhone}
      />
    );
  }

  const cta = {
    href: contactHref,
    label: ui.availability || "Contact us",
    whatsapp: Boolean(whatsapp),
  };
  const primary =
    ui.primaryTarget === "gallery" && show.gallery
      ? { href: "#gallery", whatsapp: false }
      : cta;
  const secondaryHref = show.services ? "#services" : "#contact";
  const city = cityFrom(business.address);
  const reach = [city, ui.reach].filter(Boolean).join(" · ");

  return (
    <>
      <Header business={business} ui={ui} links={links} cta={cta} />
      <main className="overflow-x-clip">
        <Hero
          hero={hero}
          ui={ui}
          reach={reach}
          primary={primary}
          secondaryHref={secondaryHref}
        />
        {show.about ? (
          <About
            about={about}
            image={about.image || hero.image}
            ui={ui}
            business={business}
          />
        ) : null}
        {showPages ? (
          <ServiceCards
            pages={pages}
            ui={ui}
            nav={nav}
            id="explore"
            section="service-pages"
            label={PAGES_LABEL}
            heading={PAGES_HEADING}
            flushTop={show.about}
          />
        ) : null}
        {show.services ? (
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
        {show.gallery ? (
          <Gallery gallery={gallery} ui={ui} socials={socials} cta={cta} />
        ) : null}
        <InstagramFeed feed={instagram} headingClassName="s-serif" flushTop={plainAbove} />
        <GoogleReviews
          reviews={reviews}
          headingClassName="s-serif"
          flushTop={plainAbove || Boolean(instagram)}
        />
        <Contact
          contact={contact}
          ui={ui}
          business={business}
          whatsapp={whatsapp}
        />
      </main>
      <Footer
        business={business}
        ui={ui}
        links={links}
        socials={socials}
        whatsapp={whatsapp}
        intro={hero.subtitle}
      />
      <FloatingWhatsApp href={whatsapp} />
    </>
  );
}
