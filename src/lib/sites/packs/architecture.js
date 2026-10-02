const img = (name) => `/site-packs/architecture/${name}.webp`;

const architecture = {
  id: "architecture",
  slugSuffixes: ["architects", "studio", "design"],
  whatsappMessage: "Hi! I saw your website and want to discuss a project.",
  description: (name) =>
    `${name} — architecture, interiors and turnkey projects for homes, offices and commercial spaces. See our work and book a consultation on WhatsApp.`,
  hours: "Mon–Sat, 10 AM – 7 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Studio Aakar",
    phone: "9876543210",
    address: "Paldi, Ahmedabad",
    socials: { instagram: "studioaakar" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "gallery",
    directions: "Get directions",
    cta2: "Our services",
    availability: "Book a consultation",
    reach: "Projects across India",
    aboutLabel: "About the studio",
    badge: "Architecture · Interiors · Turnkey · Planning · ",
    servicesLabel: "What we do",
    servicesIntro:
      "From the first sketch to handing over the keys — one team for design, drawings, approvals and site supervision.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Selected projects",
    galleryTags: [
      "Details",
      "Interiors",
      "Kitchens",
      "Workspaces",
      "Courtyards",
      "Commercial",
    ],
    galleryCta: "Start your project",
    contactLabel: "Let's talk",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the studio",
    whatsappNote: "Usually replies within a few hours",
    placeLabel: "Studio",
    hoursLabel: "Studio hours",
  },
  sections: {
    hero: {
      eyebrow: "Architecture · Interiors",
      title: "Spaces designed around you.",
      subtitle:
        "Homes, offices and commercial spaces — thoughtfully designed, carefully built and delivered on time.",
      cta: "View our projects",
      image: img("hero"),
    },
    about: {
      heading: "Good design starts with listening.",
      text: "We are a small studio of architects and interior designers who start every project by understanding how you live and work. Natural light, honest materials and spaces that stay cool in Indian summers guide everything we design.\n\nFrom concept sketches and 3D views to approvals and site visits, we stay with you until the last tile is laid.",
      image: img("about"),
    },
    services: {
      heading: "From the first sketch to the final key.",
      items: [
        {
          name: "Residential Architecture",
          note: "Bungalows, villas, row houses and farmhouses designed from the ground up",
          price: null,
        },
        {
          name: "Interior Design",
          note: "Living rooms, bedrooms, kitchens and wardrobes with full working drawings",
          price: null,
        },
        {
          name: "Turnkey Projects",
          note: "Design, execution and handover by one team, on a fixed timeline",
          price: null,
        },
        {
          name: "Offices & Commercial",
          note: "Workspaces, showrooms, cafes and clinics planned for how people use them",
          price: null,
        },
        {
          name: "Renovation & Remodelling",
          note: "Breathe new life into an old home without starting from scratch",
          price: null,
        },
        {
          name: "3D Views & Walkthroughs",
          note: "See your space in realistic 3D before a single brick is laid",
          price: 15000,
        },
        {
          name: "Vastu-friendly Planning",
          note: "Layouts that respect Vastu without compromising on light and comfort",
          price: null,
        },
        {
          name: "Design Consultation",
          note: "A site visit and a one-on-one session to plan your project",
          price: 2500,
        },
      ],
    },
    gallery: {
      heading: "Built with care, made to last.",
      images: [
        img("details"),
        img("interiors"),
        img("kitchens"),
        img("workspaces"),
        img("courtyards"),
        img("commercial"),
      ],
    },
    contact: {
      heading: "Let's talk about your project.",
      text: "Share your plot size, location and what you have in mind on WhatsApp. We'll set up a first call and a site visit to get started.",
    },
  },
};

export default architecture;
