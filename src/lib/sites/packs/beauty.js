const img = (name) => `/site-packs/beauty/${name}.webp`;

const beauty = {
  id: "beauty",
  slugSuffixes: ["parlour", "beauty", "makeup"],
  whatsappMessage:
    "Hi! I saw your website and want to book an appointment.",
  description: (name) =>
    `${name} — bridal makeup, mehendi, party looks and parlour care. See services and prices, and book on WhatsApp.`,
  hours: "Open all days, 10 AM – 8 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Aarohi Beauty Parlour",
    phone: "9876543210",
    address: "Hill Road, Bandra West, Mumbai",
    socials: { instagram: "aarohibeautyparlour" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See services",
    availability: "Book on WhatsApp",
    reach: "Walk-ins welcome",
    aboutLabel: "About the parlour",
    badge: "Bridal · Makeup · Mehendi · Hair · ",
    servicesLabel: "Services & prices",
    servicesIntro:
      "Honest prices, bridal trials on request, and products you can trust. Every look starts with a quick consultation.",
    enquire: "Book",
    priceFrom: "From",
    galleryLabel: "Our brides",
    galleryTags: ["Bridal", "Mehendi", "Eyes", "Hair", "South Indian", "Engagement"],
    galleryCta: "Book your date",
    contactLabel: "Book your look",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the parlour",
    whatsappNote: "Usually replies in minutes",
    placeLabel: "Parlour",
    hoursLabel: "Parlour hours",
  },
  sections: {
    hero: {
      eyebrow: "Bridal · Makeup · Mehendi",
      title: "Bridal glow, beautifully yours.",
      subtitle: "Bridal makeup, mehendi and parlour care for every celebration.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "A parlour that feels like family.",
      text: "From your first facial to your wedding day, we get brides and their families ready for every function. Every look starts with a chat about your outfit, your jewellery and the look you love — then we take our time getting it right.",
      image: img("about"),
    },
    services: {
      heading: "For every celebration.",
      items: [
        {
          name: "Bridal Makeup",
          note: "HD or airbrush makeup with bridal hairstyling and dupatta setting",
          price: 21000,
        },
        {
          name: "Engagement & Reception Look",
          note: "Soft glam or bold evening makeup with hairstyling",
          price: 8000,
        },
        {
          name: "Party Makeup",
          note: "For sangeet, mehendi, haldi and family functions",
          price: 3500,
        },
        {
          name: "Bridal Mehendi",
          note: "Full hands and feet in traditional, Arabic or portrait designs",
          price: 5100,
        },
        {
          name: "Saree Draping & Hairstyling",
          note: "Any drape style, with a bun and gajra, braid or soft curls",
          price: 1500,
        },
        {
          name: "Facial & Cleanup",
          note: "Fruit, gold or D-tan facial for fresh, glowing skin",
          price: 800,
        },
        {
          name: "Waxing & Threading",
          note: "Rica wax, eyebrows and upper lip, done gently",
          price: 300,
        },
        {
          name: "Pre-bridal Package",
          note: "Facials, body polishing, manicure, pedicure and hair spa before the wedding",
          price: 12000,
        },
      ],
    },
    gallery: {
      heading: "Our favourite brides.",
      images: [
        img("bridal"),
        img("mehendi"),
        img("eyes"),
        img("hairstyle"),
        img("south-bride"),
        img("engagement"),
      ],
    },
    contact: {
      heading: "Book your date.",
      text: "Message us on WhatsApp with your function date and the look you want. Bridal trials by appointment — we confirm your slot within minutes.",
    },
  },
};

export default beauty;
