const img = (name) => `/site-packs/photographer/${name}.webp`;

const photographer = {
  id: "photographer",
  slugSuffixes: ["photography", "studio", "films"],
  whatsappMessage:
    "Hi! I saw your website and want to check availability for a shoot.",
  description: (name) =>
    `${name} — wedding, pre-wedding, maternity, baby and birthday photography and films. See our stories and check availability on WhatsApp.`,
  hours: "Mon–Sun, 10 AM – 8 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Kahani Studios",
    phone: "9876543210",
    address: "Malviya Nagar, Jaipur",
    socials: { instagram: "kahanistudios" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "camera",
    primaryTarget: "gallery",
    directions: "Get directions",
    cta2: "Explore packages",
    availability: "Check availability",
    reach: "Available across India",
    aboutLabel: "About the studio",
    badge: "Weddings · Pre-wedding · Maternity · Baby · ",
    servicesLabel: "Shoots & packages",
    servicesIntro:
      "Clear packages, no surprises. Every shoot can be shaped around your dates, rituals and family.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Selected stories",
    galleryTags: [
      "Wedding",
      "Pre-wedding",
      "Maternity",
      "Newborn",
      "Birthday",
      "Haldi",
    ],
    galleryCta: "Book your date",
    contactLabel: "Let's talk",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the studio",
    whatsappNote: "Usually replies in an hour",
    placeLabel: "Studio",
    hoursLabel: "Studio hours",
  },
  sections: {
    hero: {
      eyebrow: "Wedding & family photographer",
      title: "Every moment, forever yours.",
      subtitle:
        "Candid wedding, pre-wedding, maternity and baby shoots you'll keep forever.",
      cta: "View our stories",
      image: img("hero"),
    },
    about: {
      heading: "We notice what the day feels like.",
      text: "We are a small team of photographers and filmmakers who care more about feeling than posing. From the nervous laugh before the pheras to your baby's first smile, we move quietly and catch the moments no one planned.\n\nEvery photo is edited by hand, so your pictures look like you, not a filter.",
      image: img("about"),
    },
    services: {
      heading: "Made for your kind of celebration.",
      items: [
        {
          name: "Wedding Photography",
          note: "Candid and traditional coverage of every ritual, with a hand-edited gallery",
          price: 65000,
        },
        {
          name: "Wedding Films",
          note: "A cinematic highlight film and full ceremony edit with your own soundtrack",
          price: 55000,
        },
        {
          name: "Pre-wedding Shoot",
          note: "A half-day shoot at two locations with outfit changes and a short reel",
          price: 25000,
        },
        {
          name: "Haldi, Mehendi & Sangeet",
          note: "Candid coverage of your pre-wedding functions",
          price: 20000,
        },
        {
          name: "Maternity Shoot",
          note: "Studio or outdoor session with gowns and styling guidance",
          price: 9500,
        },
        {
          name: "Newborn & Baby Shoot",
          note: "Gentle, safe sessions at home or in the studio, with props",
          price: 8500,
        },
        {
          name: "Birthday & Cake Smash",
          note: "First birthdays and kids' parties, candid and full of fun",
          price: 7500,
        },
        {
          name: "Albums & Frames",
          note: "Handmade lay-flat albums and wall frames printed to last",
          price: 12000,
        },
      ],
    },
    gallery: {
      heading: "Little moments, big memories.",
      images: [
        img("pheras"),
        img("prewedding"),
        img("maternity"),
        img("baby"),
        img("birthday"),
        img("haldi"),
      ],
    },
    contact: {
      heading: "Tell us about your day.",
      text: "Share your date, city and the kind of shoot you have in mind on WhatsApp. We reply within a few hours with availability and a plan that fits.",
    },
  },
};

export default photographer;
