const img = (name) => `/site-packs/eyeglasses/${name}.webp`;

const eyeglasses = {
  id: "eyeglasses",
  slugSuffixes: ["opticals", "optics", "eyewear"],
  whatsappMessage: "Hi! I saw your website and want to book an eye test.",
  description: (name) =>
    `${name} — eye tests, prescription glasses, sunglasses and contact lenses. See prices and book an eye test on WhatsApp.`,
  hours: "Mon–Sun, 10 AM – 9 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Drishti Opticals",
    phone: "9876543210",
    address: "Jayanagar, Bengaluru",
    socials: { instagram: "drishtiopticals" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See prices",
    availability: "Book an eye test",
    reach: "Walk-ins welcome",
    aboutLabel: "About us",
    badge: "Eye tests · Frames · Lenses · Sunglasses · ",
    servicesLabel: "Services & prices",
    servicesIntro:
      "Clear prices, quality lenses and free adjustments for as long as you wear our glasses.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Our store",
    galleryTags: ["Frames", "Try-on", "Sunglasses", "Kids", "Progressives", "Store"],
    galleryCta: "Book an eye test",
    contactLabel: "Visit us",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the store",
    whatsappNote: "Usually replies in minutes",
    placeLabel: "Store",
    hoursLabel: "Store hours",
  },
  sections: {
    hero: {
      eyebrow: "Eye tests · Frames · Lenses",
      title: "See the world clearly.",
      subtitle: "Free eye tests, stylish frames and quality lenses — often ready the same day.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "Eye care you can trust.",
      text: "Our qualified optometrists check your eyes properly — no rushing. Then we help you pick frames that suit your face, your lifestyle and your budget, and fit your lenses with care. Free adjustments and servicing, always.",
      image: img("about"),
    },
    services: {
      heading: "Everything for your eyes.",
      items: [
        {
          name: "Eye Test",
          note: "Computerised eye test by a qualified optometrist — free with any purchase",
          price: null,
        },
        {
          name: "Single Vision Glasses",
          note: "Frame with anti-glare lenses, usually ready in a day",
          price: 1200,
        },
        {
          name: "Blue-cut Computer Glasses",
          note: "Less eye strain from screens, for work and study",
          price: 1800,
        },
        {
          name: "Progressive Lenses",
          note: "One pair for near and far, fitted precisely",
          price: 4500,
        },
        {
          name: "Kids' Eyewear",
          note: "Flexible, unbreakable frames with safe lenses",
          price: 1000,
        },
        {
          name: "Sunglasses",
          note: "UV-protected and polarised sunglasses in every style",
          price: 1500,
        },
        {
          name: "Contact Lenses",
          note: "Daily, monthly and coloured lenses, with a proper fitting",
          price: 800,
        },
        {
          name: "Repairs & Adjustments",
          note: "Nose pads, screws and fitting — free for our customers",
          price: null,
        },
      ],
    },
    gallery: {
      heading: "Frames for every face.",
      images: [
        img("frames"),
        img("try-on"),
        img("sunglasses"),
        img("kids"),
        img("reading"),
        img("store"),
      ],
    },
    contact: {
      heading: "Book a free eye test.",
      text: "Message us on WhatsApp to book an eye test or check if a frame is in stock. Walk-ins are welcome too — a test takes about 15 minutes.",
    },
  },
};

export default eyeglasses;
