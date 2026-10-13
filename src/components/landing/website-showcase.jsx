import Image from "next/image";
import { ArrowUpRight, BadgePercent, Globe, LayoutTemplate, MessageCircle, Star, Smartphone } from "lucide-react";
import { getPack } from "@/lib/sites/packs";
import { splitTitle } from "@/lib/sites/links";
import { PhoneFrame, SectionHeading } from "./primitives";

const DEMOS = [
  { pack: "beauty", template: "glow" },
  { pack: "events", template: "studio" },
  { pack: "photographer", template: "studio" },
  { pack: "education", template: "glow" },
  { pack: "restaurant", template: "studio" },
  { pack: "jewellery", template: "glow" },
  { pack: "fitness", template: "studio" },
  { pack: "salon", template: "glow" },
  { pack: "fashion", template: "studio" },
  { pack: "eyeglasses", template: "glow" },
];

const POINTS = [
  { icon: Globe, title: "Your own link", body: "Like yourshop.moneykit.site. Share it on WhatsApp, Instagram or a poster." },
  { icon: LayoutTemplate, title: "Ready for your business", body: "Pick a design and it comes filled with sample text and photos for your kind of business." },
  { icon: MessageCircle, title: "Customers reach you in one tap", body: "WhatsApp, call and directions buttons on every page." },
  { icon: Star, title: "Google reviews", body: "Show your rating and best reviews right on your site." },
  { icon: BadgePercent, title: "Offer banners", body: "Run a festival sale and it hides by itself when it ends." },
  { icon: Smartphone, title: "Edit from your phone", body: "Change prices, photos and colours in the app and see it live." },
];

function DemoCard({ pack: packId, template }) {
  const pack = getPack(packId);
  const hero = pack.sections.hero;
  const [head, accent, tail] = splitTitle(hero.title);
  return (
    <a
      href={`/site-preview?template=${template}&pack=${packId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-[22rem] w-[15rem] shrink-0 overflow-hidden rounded-[1.75rem] bg-forest-soft ring-1 ring-white/10 sm:h-[25rem] sm:w-[17rem]"
    >
      <Image
        src={hero.image}
        alt=""
        fill
        sizes="272px"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-4">
        <span className="flex size-7 items-center justify-center rounded-full bg-white/90 font-display text-sm text-zinc-900">
          {pack.demo.name.charAt(0)}
        </span>
        <span className="truncate text-xs font-semibold text-white drop-shadow">{pack.demo.name}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-lime uppercase">{hero.eyebrow}</p>
        <p className="mt-2 font-display text-[1.65rem] leading-[1.05] text-white">
          {head} {accent ? <span className="italic">{accent}</span> : null} {tail}
        </p>
        <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors group-hover:bg-lime group-hover:text-forest">
          View demo <ArrowUpRight className="size-3.5" />
        </p>
      </div>
    </a>
  );
}

export function WebsiteShowcase() {
  return (
    <section id="website" className="relative isolate overflow-hidden bg-forest-deep py-24 text-white sm:py-32">
      <div aria-hidden className="lp-grid absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute top-1/3 left-[-15%] -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(31,138,76,0.45),transparent_65%)] blur-2xl"
      />

      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          tone="light"
          eyebrow="Your website"
          title="Your business online,"
          accent="without a developer."
          body="A beautiful website for your shop, made and updated from the MoneyKit app. No designer, no hosting, no coding."
        />

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[auto_1fr] lg:gap-20">
          <div data-reveal className="relative mx-auto w-[15.5rem] sm:w-[17rem]">
            <div
              aria-hidden
              className="absolute inset-[-12%] -z-10 rounded-full bg-[radial-gradient(circle,rgba(200,232,106,0.25),transparent_65%)] blur-xl"
            />
            <PhoneFrame src="/landing/app/website.webp" alt="Website editor in the MoneyKit app" sizes="280px" />
            <div className="lp-float absolute -right-10 bottom-16 hidden rounded-2xl bg-white px-4 py-3 text-zinc-950 shadow-2xl sm:block">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="size-2 rounded-full bg-mint" /> Live
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-zinc-600">sharma-beauty.moneykit.site</p>
            </div>
          </div>

          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} data-reveal style={{ "--reveal-delay": `${(index % 2) * 90}ms` }} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] text-lime ring-1 ring-white/10">
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-20">
        <p className="px-5 text-center text-sm font-medium text-white/60">
          See real demo websites. Tap any one to open it.
        </p>
        <div
          className="lp-marquee-paused mt-6 overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="lp-marquee flex w-max" style={{ "--lp-marquee-speed": "70s" }}>
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-5 pr-5">
                {DEMOS.map((demo) => (
                  <DemoCard key={`${copy}-${demo.pack}`} {...demo} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
