const img = (name) => `/site-packs/events/${name}.webp`;

/** Event planners and decorators: weddings, haldi, mehendi, sangeet DJs, anniversaries. */
const events = {
  id: "events",
  slugSuffixes: ["events", "decor", "decorators"],
  whatsappMessage: "Hi! I saw your website and want to check availability for my event.",
  description: (name) =>
    `${name} — wedding, haldi, mehendi, sangeet and anniversary decoration, with DJ and lights. See our setups and check your date on WhatsApp.`,
  hours: "Mon–Sun, 10 AM – 9 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Shubh Utsav Events & Decor",
    phone: "9876543210",
    address: "Hiran Magri, Udaipur",
    socials: { instagram: "shubhutsavevents" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "gallery",
    directions: "Get directions",
    cta2: "See packages",
    availability: "Check your date",
    reach: "Weddings across Rajasthan",
    aboutLabel: "About us",
    badge: "Weddings · Haldi · Mehendi · Sangeet · Anniversaries · ",
    servicesLabel: "Decor & packages",
    servicesIntro:
      "Clear packages for every function. Every setup is shaped around your venue, colours and budget.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Our setups",
    galleryTags: ["Entrance", "Haldi", "Mehendi", "Reception", "Sangeet & DJ", "Anniversary"],
    galleryCta: "Book your date",
    contactLabel: "Let's plan",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call us",
    whatsappNote: "Usually replies in an hour",
    placeLabel: "Office",
    hoursLabel: "Open",
  },
  sections: {
    hero: {
      eyebrow: "Wedding & event decorators",
      title: "Your celebration, beautifully done.",
      subtitle:
        "Mandaps, haldi, mehendi, sangeet and anniversaries, with flowers, lights and DJ handled by one team.",
      cta: "See our setups",
      image: img("hero"),
    },
    about: {
      heading: "Flowers, lights and every last detail.",
      text: "We are a family-run decor team that has dressed hundreds of weddings, from small home functions to big lawn weddings. We visit your venue, plan the colours with you and use fresh flowers every time.\n\nOn the day, our team sets up early, stays till the last function and handles the lights and DJ, so your family can just enjoy it.",
      image: img("about"),
    },
    services: {
      heading: "Decor for every function.",
      items: [
        {
          name: "Wedding Mandap Decoration",
          note: "Fresh-flower mandap, aisle, drapes, diyas and lighting for the pheras",
          price: 75000,
        },
        {
          name: "Haldi Decoration",
          note: "Marigold backdrop, chowki seating, umbrellas and haldi bowls in bright yellow",
          price: 15000,
        },
        {
          name: "Mehendi Decoration",
          note: "Floral swing, floor cushions, lanterns and a colourful lounge for guests",
          price: 20000,
        },
        {
          name: "Reception Stage Decoration",
          note: "Floral wall, couple sofa, chandeliers and stage lighting for the big evening",
          price: 45000,
        },
        {
          name: "Sangeet DJ & Lights",
          note: "DJ with sound, LED wall, dance floor lights and smoke for the whole night",
          price: 25000,
        },
        {
          name: "Entrance & Venue Lighting",
          note: "Floral entry gate, bells, rangoli, diyas and fairy lights along the walkway",
          price: 18000,
        },
        {
          name: "Anniversary & Birthday Decor",
          note: "Balloon arch, neon sign, cake table and fairy lights, at home or at a venue",
          price: 5000,
        },
        {
          name: "Free Venue Visit",
          note: "We visit your venue, share ideas and give you a clear quote, with no charge",
          price: null,
        },
      ],
    },
    gallery: {
      heading: "Setups our families loved.",
      images: [
        img("entrance"),
        img("haldi"),
        img("mehendi"),
        img("reception"),
        img("sangeet"),
        img("anniversary"),
      ],
    },
    contact: {
      heading: "Tell us your date.",
      text: "Message us on WhatsApp with your function, venue and date. We'll share setup ideas and a clear quote, and visit your venue for free.",
    },
  },
};

export default events;
