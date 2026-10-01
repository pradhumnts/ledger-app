const img = (name) => `/site-packs/mobiles/${name}.webp`;

const mobiles = {
  id: "mobiles",
  slugSuffixes: ["mobiles", "mobile", "telecom"],
  whatsappMessage: "Hi! I saw your website and want to ask about a phone.",
  description: (name) =>
    `${name} — new smartphones, accessories and same-day repairs. See prices and check stock on WhatsApp.`,
  hours: "Mon–Sun, 10 AM – 9:30 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Shree Mobiles",
    phone: "9876543210",
    address: "Lajpat Nagar, Delhi",
    socials: { instagram: "shreemobiles" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See prices",
    availability: "Check stock",
    reach: "Same-day repairs",
    aboutLabel: "About us",
    badge: "Phones · Repairs · Accessories · EMI · ",
    servicesLabel: "Phones & services",
    servicesIntro:
      "Genuine products with bills and warranty. Easy EMI and exchange on new phones — ask us for today's offers.",
    enquire: "Ask price",
    priceFrom: "From",
    galleryLabel: "Our store",
    galleryTags: ["Phones", "Accessories", "Repairs", "Audio", "Screen guards", "Store"],
    galleryCta: "Check stock",
    contactLabel: "Visit us",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the store",
    whatsappNote: "Ask for price & stock",
    placeLabel: "Store",
    hoursLabel: "Store hours",
  },
  sections: {
    hero: {
      eyebrow: "Phones · Repairs · Accessories",
      title: "Your next phone, sorted.",
      subtitle:
        "The latest smartphones on easy EMI, genuine accessories and quick repairs — all under one roof.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "Your neighbourhood phone experts.",
      text: "We help you pick the right phone for your budget, set it up and move your contacts, photos and WhatsApp for you. Every phone comes with a proper bill and warranty, and if something breaks, our technicians fix it right here — usually the same day.",
      image: img("about"),
    },
    services: {
      heading: "Everything for your phone.",
      items: [
        {
          name: "New Smartphones",
          note: "All popular brands, with easy EMI and free setup",
          price: 7999,
        },
        {
          name: "Exchange Your Old Phone",
          note: "Get the best value for your old phone against a new one",
          price: null,
        },
        {
          name: "Screen Replacement",
          note: "Quality displays fitted in about an hour, with warranty",
          price: 1499,
        },
        {
          name: "Battery Replacement",
          note: "A new battery with warranty, done while you wait",
          price: 799,
        },
        {
          name: "Tempered Glass & Covers",
          note: "Screen guards fitted free, covers for every model",
          price: 199,
        },
        {
          name: "Earphones & Speakers",
          note: "Wired and wireless earbuds, headphones and Bluetooth speakers",
          price: 299,
        },
        {
          name: "Chargers & Power Banks",
          note: "Fast chargers, strong cables and power banks that last",
          price: 249,
        },
        {
          name: "Smartwatches",
          note: "Fitness bands and smartwatches for every budget",
          price: 1499,
        },
      ],
    },
    gallery: {
      heading: "Come see what's new.",
      images: [
        img("phones"),
        img("accessories"),
        img("repair"),
        img("audio"),
        img("screen-guard"),
        img("store"),
      ],
    },
    contact: {
      heading: "Ask us anything.",
      text: "Message us on WhatsApp to check if a phone is in stock, get today's price or book a repair. Walk-ins are welcome too — most repairs are done the same day.",
    },
  },
};

export default mobiles;
