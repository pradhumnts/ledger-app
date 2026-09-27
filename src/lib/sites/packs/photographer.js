const img = (name) => `/site-packs/photographer/${name}.webp`;

const photographer = {
  id: "photographer",
  slugSuffixes: ["photography", "studio", "films"],
  whatsappMessage: "Hi! I saw your website and want to book a shoot.",
  description: (name) =>
    `${name} — wedding, pre-wedding, portrait and event photography. See our work and book your shoot on WhatsApp.`,
  hours: "Mon–Sun, 10 AM – 8 PM",
  sections: {
    hero: {
      eyebrow: "Wedding & Portrait Photography",
      title: "Your story, beautifully told",
      subtitle:
        "Candid weddings, pre-wedding shoots and portraits that you will love looking back at — for years.",
      cta: "Book on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "Hi, we capture real moments",
      text:
        "We are a team of passionate photographers who love weddings, families and people. From the haldi to the vidaai, we stay in the background and capture the laughs, the tears and every little detail — so you can relive the day exactly as it felt.",
      image: img("about"),
    },
    services: {
      heading: "Packages",
      items: [
        { name: "Wedding photography", note: "Full-day candid + traditional coverage with an edited album", price: 45000 },
        { name: "Pre-wedding shoot", note: "Half-day shoot at 2 locations with 40+ edited photos", price: 15000 },
        { name: "Birthday & events", note: "Up to 4 hours of coverage with same-week delivery", price: 8000 },
        { name: "Portrait & maternity", note: "Studio or outdoor, 1 hour, 15 edited photos", price: 4000 },
      ],
    },
    gallery: {
      heading: "Recent work",
      images: [
        img("couple"),
        img("bride"),
        img("field"),
        img("newborn"),
        img("newlywed"),
        img("studio"),
      ],
    },
    testimonials: {
      heading: "Kind words",
      items: [
        { quote: "They made us feel so comfortable. Our wedding photos look like a movie — every guest has asked for the photographer's number!", name: "Priya & Rohan" },
        { quote: "Booked them for our baby's first birthday. Quick delivery and lovely candid shots.", name: "Neha Sharma" },
        { quote: "Professional, on time and very creative. Our pre-wedding shoot was so much fun.", name: "Aman & Kritika" },
      ],
    },
    contact: {
      heading: "Let's plan your shoot",
      text: "Tell us your date and city on WhatsApp — we reply within a few hours.",
    },
  },
};

export default photographer;
