import Image from "next/image";
import { Sparkles } from "lucide-react";
import { PhoneFrame, SectionHeading } from "./primitives";

const POSTERS = [
  { id: "salon", label: "Salon" },
  { id: "jewellery", label: "Jewellery" },
  { id: "fitness", label: "Fitness" },
  { id: "photographer", label: "Photographer" },
  { id: "beauty", label: "Beauty" },
  { id: "coaching", label: "Coaching" },
  { id: "fashion-stitch", label: "Fashion & Stitch" },
  { id: "clinic", label: "Clinic" },
  { id: "eyeglasses", label: "Eyeglasses" },
  { id: "mobile-accessories", label: "Mobile & Accessories" },
  { id: "toys-store", label: "Toy Store" },
];

const CARDS = [
  {
    src: "/landing/app/bill-theme.webp",
    alt: "Picking a bill design in MoneyKit",
    title: "Bill designs",
    body: "Classic, minimal, movie ticket, paper receipt and more. Every bill you send carries your look.",
  },
  {
    src: "/landing/app/qr-theme.webp",
    alt: "Picking a QR poster theme in MoneyKit",
    title: "QR posters",
    body: "Print a payment poster made for your business and put it on the counter.",
  },
];

export function ThemesShowcase() {
  return (
    <section className="overflow-hidden bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Designs"
          title="Look like a brand,"
          accent="not a register."
          body="Payment posters and bill designs made for your kind of business. Pay once, keep them for life."
        />
      </div>

      <div
        className="mt-8 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 2%, black 98%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 2%, black 98%, transparent)",
        }}
      >
        <div className="lp-marquee-reverse flex w-max pt-6 pb-16" style={{ "--lp-marquee-speed": "60s" }}>
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-end gap-4 pr-4">
              {POSTERS.map((poster, index) => (
                <li
                  key={poster.id}
                  className={index % 2 ? "translate-y-1.5" : "translate-y-0"}
                >
                  <div className="relative aspect-[390/843] w-[6.75rem] overflow-hidden rounded-[1.25rem] shadow-[0_20px_44px_-18px_rgba(11,48,31,0.45)] ring-1 ring-black/5 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-3 hover:shadow-[0_32px_56px_-18px_rgba(11,48,31,0.55)] motion-reduce:transition-none sm:w-[7.75rem] md:w-[8.5rem]">
                    <Image
                      src={`/landing/qr/${poster.id}.webp`}
                      alt={`${poster.label} QR poster`}
                      fill
                      sizes="136px"
                      className="object-cover object-top"
                    />
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 px-5 sm:mt-14 md:grid-cols-2">
        {CARDS.map((card, index) => (
          <div
            key={card.title}
            data-reveal
            style={{ "--reveal-delay": `${index * 90}ms` }}
            className="relative flex min-h-[19rem] overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white p-7 shadow-[0_20px_60px_-30px_rgba(11,48,31,0.25)] sm:p-8"
          >
            <div className="relative z-10 flex max-w-[58%] flex-col">
              <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">{card.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{card.body}</p>
              <p className="mt-auto pt-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-soft px-3 py-1.5 text-[13px] font-semibold text-forest">
                  <Sparkles className="size-3.5" /> New designs added regularly
                </span>
              </p>
            </div>
            <PhoneFrame
              src={card.src}
              alt={card.alt}
              sizes="200px"
              className="absolute top-8 -right-6 w-[11rem] rotate-[6deg] sm:-right-2 sm:w-[12.5rem]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
