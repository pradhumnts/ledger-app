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

export function BusinessMarquee() {
  return (
    <section aria-label="Businesses that use MoneyKit" className="bg-paper pt-6 pb-4 sm:pt-4">
      <p className="text-center text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
        Made for every kind of business
      </p>
      <div
        className="lp-marquee-paused relative mt-5 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="lp-marquee flex w-max" style={{ "--lp-marquee-speed": "55s" }}>
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3">
              {TYPES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-full border border-black/[0.05] bg-white py-2 pr-5 pl-2 shadow-[0_6px_20px_-8px_rgba(11,48,31,0.15)]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-lime-soft text-forest">
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap text-zinc-800">{label}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
