import { FaqItem } from "./faq-item";
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
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              style={{ "--reveal-delay": `${index * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
