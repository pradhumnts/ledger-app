import {
  Camera,
  Dumbbell,
  Gem,
  Glasses,
  GraduationCap,
  PartyPopper,
  Scissors,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = [
  { icon: Scissors, label: "Salons" },
  { icon: Sparkles, label: "Beauty parlours" },
  { icon: Dumbbell, label: "Gyms" },
  { icon: GraduationCap, label: "Coaching & study libraries" },
  { icon: Camera, label: "Photographers" },
  { icon: PartyPopper, label: "Event decorators" },
  { icon: Shirt, label: "Boutiques & tailors" },
  { icon: Gem, label: "Jewellers" },
  { icon: Glasses, label: "Opticals" },
  { icon: Smartphone, label: "Mobile shops" },
  { icon: UtensilsCrossed, label: "Cafés & restaurants" },
  { icon: Stethoscope, label: "Clinics" },
  { icon: ShoppingBag, label: "Kirana & retail" },
];

/** Each row holds every type (so it always overfills wide screens), in its own order. */
const ROWS = [
  { items: TYPES, reverse: false, speed: "70s" },
  {
    items: [...TYPES.filter((_, i) => i % 2), ...TYPES.filter((_, i) => i % 2 === 0)],
    reverse: true,
    speed: "80s",
  },
];

/** No two neighbours share a tone, including where a row loops back to its start. */
const TONE_PATTERN = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 1];

const TONES = [
  {
    pill: "border-black/[0.06] bg-white text-zinc-900 shadow-[0_10px_30px_-14px_rgba(11,48,31,0.25)]",
    icon: "bg-lime-soft text-forest",
  },
  {
    pill: "border-transparent bg-forest text-white shadow-[0_14px_34px_-14px_rgba(11,48,31,0.6)]",
    icon: "bg-lime text-forest",
  },
  {
    pill: "border-transparent bg-lime text-forest shadow-[0_12px_30px_-14px_rgba(120,160,40,0.55)]",
    icon: "bg-forest text-lime",
  },
];

function Pill({ icon: Icon, label, tone }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-full border py-2 pr-6 pl-2 transition-[translate,rotate] duration-300 ease-out hover:-translate-y-1 hover:-rotate-1 sm:py-2.5 sm:pl-2.5",
        tone.pill,
      )}
    >
      <span className={cn("flex size-9 items-center justify-center rounded-full sm:size-10", tone.icon)}>
        <Icon className="size-[18px]" strokeWidth={2.1} />
      </span>
      <span className="text-[15px] font-semibold whitespace-nowrap sm:text-base">{label}</span>
    </li>
  );
}

export function BusinessMarquee() {
  return (
    <section aria-labelledby="business-types" className="bg-paper pt-8 pb-2 sm:pt-6 sm:pb-6">
      <h2
        id="business-types"
        className="px-5 text-center text-2xl font-semibold tracking-[-0.02em] text-balance text-zinc-950 sm:text-3xl"
      >
        Made for{" "}
        <span className="font-display font-normal tracking-normal text-mint italic">every kind</span> of
        business
      </h2>
      <p className="mt-2 px-5 text-center text-sm text-zinc-500 sm:text-base">
        From salons to study libraries, if you send bills, MoneyKit fits.
      </p>

      <div
        className="mt-5 flex flex-col gap-4 overflow-hidden pt-4 pb-10"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn("flex w-max", row.reverse ? "lp-marquee-reverse" : "lp-marquee")}
            style={{ "--lp-marquee-speed": row.speed }}
          >
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 || rowIndex === 1} className="flex shrink-0 gap-3 pr-3">
                {row.items.map((type, index) => (
                  <Pill key={type.label} {...type} tone={TONES[TONE_PATTERN[(index + rowIndex * 4) % TONE_PATTERN.length]]} />
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
