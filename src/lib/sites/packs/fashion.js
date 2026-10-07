const img = (name) => `/site-packs/fashion/${name}.webp`;

const fashion = {
  id: "fashion",
  slugSuffixes: ["fashion", "closet", "store"],
  whatsappMessage:
    "Hi! I saw your website and want to know more about your collection.",
  description: (name) =>
    `${name} — trendy western wear, co-ords, denims, streetwear and dresses, plus ethnic looks for every function. See the lookbook and chat on WhatsApp.`,
  hours: "Mon–Sun, 11 AM – 9 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Urban Closet",
    phone: "9876543210",
    address: "Lajpat Nagar, Delhi",
    socials: { instagram: "urbancloset" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "gallery",
    directions: "Get directions",
    cta2: "See collections",
    availability: "Ask about sizes",
    reach: "Delivery across the city",
    aboutLabel: "About the store",
    badge: "Co-ords · Denims · Streetwear · Dresses · ",
    servicesLabel: "Collections",
    servicesIntro:
      "Fresh drops every week in sizes XS to XXL. Ask us on WhatsApp for sizes, colours and stock.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "The lookbook",
    galleryTags: [
      "Co-ords",
      "Streetwear",
      "Accessories",
      "Menswear",
      "Weekend",
      "Ethnic",
    ],
    galleryCta: "Shop the look",
    contactLabel: "Visit us",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the store",
    whatsappNote: "Usually replies within an hour",
    placeLabel: "Store",
    hoursLabel: "Store hours",
  },
  sections: {
    hero: {
      eyebrow: "Trendy western wear",
      title: "Wear what feels like you.",
      subtitle:
        "Co-ords, denims, oversized tees and dresses, with fresh drops every week.",
      cta: "Explore the looks",
      image: img("hero"),
    },
    about: {
      heading: "Fashion that feels like you.",
      text: "We're a young fashion store for everyone who wants to look good without trying too hard. Think co-ords, denims, oversized tees, dresses and weekend fits, plus easy ethnic looks for functions.\n\nNot sure what works? Send us a photo of a look you love and we'll help you style it, in-store or on WhatsApp.",
      image: img("about"),
    },
    services: {
      heading: "New drops, every week.",
      items: [
        {
          name: "Co-ords & Sets",
          note: "Matching blazer, shirt and trouser sets in fresh seasonal colours",
          price: 1299,
        },
        {
          name: "Tops & Shirts",
          note: "Crop tops, baby tees, oversized shirts and everyday basics",
          price: 499,
        },
        {
          name: "Dresses",
          note: "Summer, party and brunch dresses from mini to maxi",
          price: 999,
        },
        {
          name: "Denims & Cargos",
          note: "Baggy, straight, wide-leg and mom fits, plus cargo pants",
          price: 999,
        },
        {
          name: "Oversized Tees & Hoodies",
          note: "Graphic tees, sweatshirts and hoodies for everyday streetwear",
          price: 599,
        },
        {
          name: "Menswear",
          note: "Shirts, tees, denims, cargos and jackets for boys and young men",
          price: 699,
        },
        {
          name: "Ethnic & Festive Wear",
          note: "Kurtis, kurta sets and Indo-western looks for every function",
          price: 1199,
        },
        {
          name: "Accessories",
          note: "Bags, caps, sunglasses and jewellery to finish the look",
          price: 299,
        },
      ],
    },
    gallery: {
      heading: "Fresh looks for every plan.",
      images: [
        img("western"),
        img("streetwear"),
        img("accessories"),
        img("menswear"),
        img("weekend"),
        img("ethnic"),
      ],
    },
    contact: {
      heading: "Come try it on.",
      text: "Send us a screenshot of a look you love, or ask about sizes and colours on WhatsApp. Walk in to try it on, or we'll keep it aside for you.",
    },
  },
};

export default fashion;
