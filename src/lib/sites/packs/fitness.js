const img = (name) => `/site-packs/fitness/${name}.webp`;

const fitness = {
  id: "fitness",
  slugSuffixes: ["fitness", "gym", "club"],
  whatsappMessage: "Hi! I saw your website and want to book a free trial.",
  description: (name) =>
    `${name} — gym memberships, personal training, group classes and yoga. See plans and prices, and book a free trial on WhatsApp.`,
  hours: "Mon–Sat, 5:30 AM – 10:30 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Shakti Fitness Club",
    phone: "9876543210",
    address: "Sector 29, Gurugram",
    socials: { instagram: "shaktifitnessclub" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See plans",
    availability: "Book a free trial",
    reach: "Open early, close late",
    aboutLabel: "About the gym",
    badge: "Strength · Cardio · Classes · Coaching · ",
    servicesLabel: "Plans & prices",
    servicesIntro:
      "No hidden fees. Every membership starts with a free fitness assessment.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Inside the gym",
    galleryTags: ["Strength", "Group class", "Yoga", "Boxing", "Functional", "Gym floor"],
    galleryCta: "Book a free trial",
    contactLabel: "Start today",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the gym",
    whatsappNote: "Usually replies in minutes",
    placeLabel: "Gym",
    hoursLabel: "Gym hours",
  },
  sections: {
    hero: {
      eyebrow: "Gym · Classes · Personal training",
      title: "Stronger starts today.",
      subtitle: "Modern equipment, certified trainers and classes for every fitness level.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "A gym that feels like a team.",
      text: "We are a neighbourhood gym built for real people — first-timers, busy parents and serious lifters alike. Our certified trainers help you set a goal, learn the right form and stay consistent, so the results actually last.",
      image: img("about"),
    },
    services: {
      heading: "Plans for every goal.",
      items: [
        {
          name: "Monthly Membership",
          note: "Full access to the strength and cardio floor, with a locker",
          price: 1500,
        },
        {
          name: "Quarterly Membership",
          note: "Three months of full access and a free fitness assessment",
          price: 4000,
        },
        {
          name: "Annual Membership",
          note: "Best value: twelve months of access and two personal training sessions",
          price: 12000,
        },
        {
          name: "Personal Training",
          note: "Twelve one-on-one sessions with a certified trainer",
          price: 8000,
        },
        {
          name: "Group Classes",
          note: "Zumba, HIIT and functional training, five days a week",
          price: 2000,
        },
        {
          name: "Yoga Batch",
          note: "Morning and evening batches for every level",
          price: 1500,
        },
        {
          name: "Diet & Nutrition Plan",
          note: "An Indian diet plan built around your goals and food habits",
          price: 2500,
        },
        {
          name: "Weight Loss Program",
          note: "Twelve weeks of training, diet and weekly check-ins",
          price: 9000,
        },
      ],
    },
    gallery: {
      heading: "Where the work happens.",
      images: [
        img("strength"),
        img("group"),
        img("yoga"),
        img("boxing"),
        img("functional"),
        img("interior"),
      ],
    },
    contact: {
      heading: "Start with a free trial.",
      text: "Message us on WhatsApp to book a free trial session and a quick tour. Tell us your goal and a time that suits you — we'll have a trainer ready.",
    },
  },
};

export default fitness;
