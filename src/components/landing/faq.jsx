import { Plus } from "lucide-react";
import { SectionHeading } from "./primitives";

export const FAQS = [
  {
    q: "Is MoneyKit really free?",
    a: "Yes. Bills, customers, dues, your UPI payment QR, reminders and sharing on WhatsApp are free to use. You only pay if you want a website or extra bill and QR designs.",
  },
  {
    q: "Do my customers need to install anything?",
    a: "No. They get your bill on WhatsApp or SMS, open it in their browser, and pay with whichever UPI app they already use.",
  },
  {
    q: "Does MoneyKit take a cut of my payments?",
    a: "No. Your QR and pay links use your own UPI ID, so money goes straight to your bank account. MoneyKit never touches it.",
  },
  {
    q: "Which languages does the app support?",
    a: "English, Hindi and Hinglish. You can switch anytime from settings, and type by speaking in English or Hindi.",
  },
  {
    q: "How do I get my website?",
    a: "Open Tools in the app, pick a design and colours, and check your details. Sample text and photos for your kind of business are already filled in. Your website goes live as soon as you subscribe.",
  },
  {
    q: "Can I change my website later?",
    a: "Anytime. Update prices, photos, offers and colours from the app and your website updates within moments.",
  },
  {
    q: "How do I cancel a website plan?",
    a: "Plans are Google Play subscriptions, so you can cancel anytime from the Subscriptions page in Google Play.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="Questions" title="Good to" accent="know." />
        <div className="mt-12 space-y-3">
          {FAQS.map((item, index) => (
            <details
              key={item.q}
              data-reveal
              style={{ "--reveal-delay": `${index * 50}ms` }}
              className="group rounded-3xl border border-black/[0.06] bg-white px-6 shadow-[0_10px_40px_-25px_rgba(11,48,31,0.25)] open:shadow-[0_20px_50px_-25px_rgba(11,48,31,0.35)]"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold text-zinc-950">
                {item.q}
                <span className="lp-faq-icon flex size-8 shrink-0 items-center justify-center rounded-full bg-paper text-forest transition-transform duration-300">
                  <Plus className="size-4" strokeWidth={2.4} />
                </span>
              </summary>
              <p className="pb-6 text-[15px] leading-relaxed text-zinc-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
