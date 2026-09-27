const img = (name) => `/site-packs/jewellery/${name}.webp`;

const jewellery = {
  id: "jewellery",
  slugSuffixes: ["jewellers", "jewellery", "gold"],
  whatsappMessage:
    "Hi! I saw your website and want to know about your jewellery and today's gold rate.",
  description: (name) =>
    `${name} — BIS hallmarked gold, certified diamonds and bridal jewellery. See our collections and enquire on WhatsApp.`,
  hours: "Mon–Sat, 11 AM – 8:30 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Swarn Jewellers",
    phone: "9876543210",
    address: "Johari Bazaar, Jaipur",
    socials: { instagram: "swarnjewellers" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See collections",
    availability: "Enquire on WhatsApp",
    reach: "BIS hallmarked gold",
    aboutLabel: "About us",
    badge: "Gold · Diamond · Bridal · Hallmarked · ",
    servicesLabel: "Collections",
    servicesIntro:
      "Prices depend on the day's gold rate, weight and making charges. Message us on WhatsApp for today's rate.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Our collections",
    galleryTags: ["Bridal", "Bangles", "Diamond", "Jhumkas", "Mangalsutra", "Showroom"],
    galleryCta: "Enquire on WhatsApp",
    contactLabel: "Visit us",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the showroom",
    whatsappNote: "Ask for today's gold rate",
    placeLabel: "Showroom",
    hoursLabel: "Showroom hours",
  },
  sections: {
    hero: {
      eyebrow: "Gold · Diamond · Bridal",
      title: "Jewellery for every milestone.",
      subtitle: "BIS hallmarked gold, certified diamonds and bridal sets, with honest making charges.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "Trusted by families for generations.",
      text: "What began as a small family shop is now a showroom trusted by thousands of families. Every piece is BIS hallmarked, every diamond is certified, and every bill clearly shows the gold rate, weight and making charges — no surprises.",
      image: img("about"),
    },
    services: {
      heading: "Something for every occasion.",
      items: [
        {
          name: "Bridal Jewellery Sets",
          note: "Kundan, polki and temple sets for your big day, with matching earrings",
          price: null,
        },
        {
          name: "Gold Necklaces",
          note: "Everyday chains to statement necklaces in 22k hallmarked gold",
          price: null,
        },
        {
          name: "Diamond Rings",
          note: "Certified solitaires and engagement bands",
          price: null,
        },
        {
          name: "Bangles & Kadas",
          note: "Carved, plain and antique finishes in 22k gold",
          price: null,
        },
        {
          name: "Earrings & Jhumkas",
          note: "Studs, drops and jhumkas for every day and every function",
          price: null,
        },
        {
          name: "Mangalsutra",
          note: "Traditional and modern designs in gold and diamond",
          price: null,
        },
        {
          name: "Old Gold Exchange",
          note: "Fair, transparent value for your old gold, tested in front of you",
          price: null,
        },
        {
          name: "Custom Design",
          note: "Share your idea and we'll make it, with a design preview first",
          price: null,
        },
      ],
    },
    gallery: {
      heading: "Pieces to treasure.",
      images: [
        img("bridal-set"),
        img("bangles"),
        img("ring"),
        img("jhumka"),
        img("mangalsutra"),
        img("showroom"),
      ],
    },
    contact: {
      heading: "Visit our showroom.",
      text: "Message us on WhatsApp for today's gold rate, designs and prices, or book a private viewing for bridal shopping.",
    },
  },
};

export default jewellery;
