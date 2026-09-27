const img = (name) => `/site-packs/salon/${name}.webp`;

const salon = {
  id: "salon",
  slugSuffixes: ["salon", "unisex", "hair"],
  whatsappMessage:
    "Hi! I saw your website and want to book an appointment.",
  description: (name) =>
    `${name} — unisex salon for haircuts, colour, beard grooming and hair care. See services and prices, and book on WhatsApp.`,
  hours: "Wed–Mon, 10 AM – 9 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Kesh Unisex Salon",
    phone: "9876543210",
    address: "Hill Road, Bandra West, Mumbai",
    socials: { instagram: "keshsalon" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See services",
    availability: "Book on WhatsApp",
    reach: "Walk-ins welcome",
    aboutLabel: "About the salon",
    badge: "Men · Women · Kids · Hair · ",
    servicesLabel: "Services & prices",
    servicesIntro:
      "Clear prices for men, women and kids. Every cut starts with a quick consultation.",
    enquire: "Book",
    priceFrom: "From",
    galleryLabel: "Our work",
    galleryTags: ["Women's cut", "Fade", "Colour", "Beard", "Hair spa", "Salon"],
    galleryCta: "Book your chair",
    contactLabel: "Book a visit",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the salon",
    whatsappNote: "Usually replies in minutes",
    placeLabel: "Salon",
    hoursLabel: "Salon hours",
  },
  sections: {
    hero: {
      eyebrow: "Men · Women · Kids",
      title: "Fresh cuts for everyone.",
      subtitle: "Haircuts, colour, beard and hair care for men and women.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "Your neighbourhood salon, done right.",
      text: "Our stylists and barbers work side by side, so the whole family can come in together. Every visit starts with a quick chat about your hair and your routine — then we cut, colour and style it so it looks great long after you leave.",
      image: img("about"),
    },
    services: {
      heading: "Cuts, colour & care.",
      items: [
        {
          name: "Men's Haircut",
          note: "Consultation, wash, cut and styling",
          price: 400,
        },
        {
          name: "Beard Trim & Shape",
          note: "Clean line-up, shaping and a hot towel finish",
          price: 250,
        },
        {
          name: "Women's Haircut",
          note: "Layers, bangs or a fresh new shape, with blow-dry",
          price: 800,
        },
        {
          name: "Blow-dry & Styling",
          note: "Smooth blow-dry, curls or waves for any occasion",
          price: 600,
        },
        {
          name: "Hair Colour",
          note: "Global colour, highlights or balayage with ammonia-free options",
          price: 1800,
        },
        {
          name: "Keratin & Smoothening",
          note: "Frizz-free, manageable hair that lasts for months",
          price: 4500,
        },
        {
          name: "Hair Spa & Scalp Care",
          note: "Deep conditioning and a relaxing head massage",
          price: 1200,
        },
        {
          name: "Kids' Haircut",
          note: "Quick, patient cuts for little ones under 10",
          price: 300,
        },
      ],
    },
    gallery: {
      heading: "Fresh from the chair.",
      images: [
        img("womens-cut"),
        img("fade"),
        img("colour"),
        img("beard"),
        img("hair-spa"),
        img("interior"),
      ],
    },
    contact: {
      heading: "Book your chair.",
      text: "Message us on WhatsApp with the service and a time that suits you. Walk-ins are welcome too — booking just skips the wait.",
    },
  },
};

export default salon;
