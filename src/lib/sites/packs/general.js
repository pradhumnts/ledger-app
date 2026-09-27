const img = (name) => `/site-packs/photographer/${name}.webp`;

const general = {
  id: "general",
  slugSuffixes: ["official", "store", "online"],
  whatsappMessage: "Hi! I saw your website and have a question.",
  description: (name) =>
    `${name} — see our services and prices, and message us on WhatsApp.`,
  hours: "Mon–Sat, 10 AM – 8 PM",
  sections: {
    hero: {
      eyebrow: "Welcome",
      title: "Quality service you can trust",
      subtitle: "Visit us or send a message on WhatsApp — we are happy to help.",
      cta: "Chat on WhatsApp",
      image: img("studio"),
    },
    about: {
      heading: "About us",
      text:
        "We are a local business serving our neighbourhood with honest prices and friendly service. Tell us what you need and we will take care of the rest.",
      image: "",
    },
    services: {
      heading: "Services",
      items: [
        { name: "Our main service", note: "Tell customers what you offer", price: 500 },
        { name: "Another service", note: "Add a short line about it", price: 1000 },
      ],
    },
    gallery: { heading: "Gallery", images: [] },
    testimonials: {
      heading: "What customers say",
      items: [
        { quote: "Friendly people and great service. Highly recommended!", name: "Happy customer" },
      ],
    },
    contact: {
      heading: "Visit or message us",
      text: "We usually reply on WhatsApp within a few hours.",
    },
  },
};

export default general;
