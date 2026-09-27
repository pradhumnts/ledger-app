/* eslint-disable @next/next/no-img-element -- plain <img> keeps customer sites off Vercel image optimisation billing */
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/sites/icons";
import { APP_SITE_URL } from "@/lib/branding";
import {
  formatRupees,
  instagramHandle,
  instagramUrl,
  mapsUrl,
  telUrl,
  whatsappUrl,
} from "@/lib/sites/links";

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

function SectionTitle({ children, align = "left" }) {
  if (!children) return null;
  return (
    <h2
      className={`font-serif text-4xl leading-tight font-semibold sm:text-5xl ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {children}
    </h2>
  );
}

function Header({ business, whatsapp, links }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className={`${container} flex items-center justify-between gap-4 py-5`}>
        <a href="#top" className="flex min-w-0 items-center gap-3 text-white">
          {business.logo ? (
            <img
              src={business.logo}
              alt=""
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-white/30"
            />
          ) : null}
          <span className="truncate font-serif text-2xl font-semibold tracking-wide">
            {business.name}
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
          >
            <WhatsAppIcon className="size-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}

function Hero({ hero, primaryHref }) {
  const external = primaryHref.startsWith("http");
  return (
    <section
      id="top"
      data-section="hero"
      className="relative flex min-h-[88svh] items-end overflow-hidden bg-[#1a1917] text-white"
    >
      {hero.image ? (
        <img
          src={hero.image}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/45" />
      <div className={`${container} relative pt-32 pb-16 sm:pb-24`}>
        {hero.eyebrow ? (
          <p className="text-xs tracking-[0.3em] text-white/75 uppercase">{hero.eyebrow}</p>
        ) : null}
        {hero.title ? (
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] font-semibold sm:text-7xl">
            {hero.title}
          </h1>
        ) : null}
        {hero.subtitle ? (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {hero.subtitle}
          </p>
        ) : null}
        {hero.cta ? (
          <a
            href={primaryHref}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-s-primary px-7 py-3.5 text-sm font-medium text-s-on-primary transition hover:opacity-90"
          >
            {hero.cta}
            <ArrowUpRight className="size-4" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

function About({ about }) {
  return (
    <section id="about" data-section="about" className="py-20 sm:py-28">
      <div
        className={`${container} grid items-center gap-10 ${
          about.image ? "md:grid-cols-2 md:gap-16" : "max-w-3xl"
        }`}
      >
        {about.image ? (
          <img
            src={about.image}
            alt=""
            loading="lazy"
            className="aspect-4/5 w-full rounded-4xl object-cover"
          />
        ) : null}
        <div>
          <SectionTitle>{about.heading}</SectionTitle>
          {about.text ? (
            <p className="mt-6 text-base leading-relaxed whitespace-pre-line text-s-muted sm:text-lg">
              {about.text}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Services({ services, business, whatsappPhone }) {
  return (
    <section id="services" data-section="services" className="bg-s-surface py-20 sm:py-28">
      <div className={container}>
        <SectionTitle>{services.heading}</SectionTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {services.items.map((item, index) => {
            const price = formatRupees(item.price);
            const enquire = whatsappUrl(
              whatsappPhone,
              item.name ? `Hi ${business.name}! I'm interested in ${item.name}.` : ""
            );
            return (
              <div
                key={`${item.name}-${index}`}
                className="flex flex-col rounded-3xl border border-s-line bg-s-bg p-6 sm:p-7"
              >
                {item.name ? (
                  <h3 className="font-serif text-2xl font-semibold">{item.name}</h3>
                ) : null}
                {item.note ? (
                  <p className="mt-2 text-sm leading-relaxed text-s-muted">{item.note}</p>
                ) : null}
                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                  {price ? (
                    <p className="text-sm text-s-muted">
                      From{" "}
                      <span className="font-serif text-2xl font-semibold text-s-primary">
                        {price}
                      </span>
                    </p>
                  ) : (
                    <span />
                  )}
                  {enquire ? (
                    <a
                      href={enquire}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-s-primary"
                    >
                      Enquire
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Gallery({ gallery }) {
  return (
    <section id="gallery" data-section="gallery" className="py-20 sm:py-28">
      <div className={container}>
        <SectionTitle>{gallery.heading}</SectionTitle>
        <div className="site-gallery mt-10">
          {gallery.images.map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt=""
              loading="lazy"
              className="mb-3 w-full break-inside-avoid rounded-2xl sm:mb-4"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ testimonials }) {
  return (
    <section id="reviews" data-section="testimonials" className="bg-s-surface py-20 sm:py-28">
      <div className={container}>
        <SectionTitle>{testimonials.heading}</SectionTitle>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.items.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="flex flex-col rounded-3xl border border-s-line bg-s-bg p-7"
            >
              <span className="font-serif text-5xl leading-none text-s-primary">“</span>
              <blockquote className="mt-2 font-serif text-xl leading-snug italic">
                {item.quote}
              </blockquote>
              {item.name ? (
                <figcaption className="mt-auto pt-6 text-xs tracking-[0.2em] text-s-muted uppercase">
                  {item.name}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactButton({ href, icon, label, primary = false }) {
  if (!href) return null;
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition ${
        primary
          ? "bg-s-primary text-s-on-primary hover:opacity-90"
          : "border border-s-line hover:bg-s-surface"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function Contact({ contact, business, whatsapp }) {
  const call = telUrl(business.phone);
  const directions = mapsUrl(business.address);
  const instagram = instagramUrl(business.instagram);
  return (
    <section id="contact" data-section="contact" className="py-20 sm:py-28">
      <div className={`${container} max-w-3xl text-center`}>
        <SectionTitle align="center">{contact.heading}</SectionTitle>
        {contact.text ? (
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-s-muted sm:text-lg">
            {contact.text}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ContactButton
            primary
            href={whatsapp}
            icon={<WhatsAppIcon className="size-4" />}
            label="WhatsApp"
          />
          <ContactButton href={call} icon={<Phone className="size-4" />} label="Call" />
          <ContactButton
            href={directions}
            icon={<MapPin className="size-4" />}
            label="Directions"
          />
          <ContactButton
            href={instagram}
            icon={<InstagramIcon className="size-4" />}
            label={`@${instagramHandle(business.instagram)}`}
          />
        </div>
        {business.address || business.hours ? (
          <div className="mt-10 space-y-3 text-sm text-s-muted">
            {business.address ? (
              <p className="flex items-start justify-center gap-2 whitespace-pre-line">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {business.address}
              </p>
            ) : null}
            {business.hours ? (
              <p className="flex items-center justify-center gap-2">
                <Clock className="size-4 shrink-0" />
                {business.hours}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Footer({ business }) {
  return (
    <footer className="border-t border-s-line py-8 pb-24 sm:pb-8">
      <div className={`${container} flex flex-col items-center justify-between gap-2 text-xs text-s-muted sm:flex-row`}>
        <p>
          © {new Date().getFullYear()} {business.name}
        </p>
        <a
          href={`${APP_SITE_URL}/?ref=site`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-s-text"
        >
          Website by MoneyKit
        </a>
      </div>
    </footer>
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
      className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

export function StudioTemplate({ doc, isShown }) {
  const business = doc?.business || {};
  const sections = doc?.sections || {};
  const hero = sections.hero || {};
  const about = sections.about || {};
  const services = { heading: "", items: [], ...sections.services };
  const gallery = { heading: "", images: [], ...sections.gallery };
  const testimonials = { heading: "", items: [], ...sections.testimonials };
  const contact = sections.contact || {};

  const whatsappPhone = business.whatsapp || business.phone;
  const whatsapp = whatsappUrl(whatsappPhone, doc?.whatsappMessage);
  const primaryHref = whatsapp || telUrl(business.phone) || "#contact";

  const show = {
    about: isShown("about") && Boolean(about.heading || about.text),
    services: isShown("services") && services.items.length > 0,
    gallery: isShown("gallery") && gallery.images.length > 0,
    testimonials: isShown("testimonials") && testimonials.items.length > 0,
  };

  const links = [
    show.about && { href: "#about", label: "About" },
    show.services && { href: "#services", label: "Services" },
    show.gallery && { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ].filter(Boolean);

  return (
    <>
      <Header business={business} whatsapp={whatsapp} links={links} />
      <main>
        <Hero hero={hero} primaryHref={primaryHref} />
        {show.about ? <About about={about} /> : null}
        {show.services ? (
          <Services services={services} business={business} whatsappPhone={whatsappPhone} />
        ) : null}
        {show.gallery ? <Gallery gallery={gallery} /> : null}
        {show.testimonials ? <Testimonials testimonials={testimonials} /> : null}
        <Contact contact={contact} business={business} whatsapp={whatsapp} />
      </main>
      <Footer business={business} />
      <FloatingWhatsApp href={whatsapp} />
    </>
  );
}
