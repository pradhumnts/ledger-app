const img = (name) => `/site-packs/restaurant/${name}.webp`;

const restaurant = {
  id: "restaurant",
  slugSuffixes: ["cafe", "kitchen", "eats"],
  whatsappMessage: "Hi! I saw your website and want to place an order.",
  description: (name) =>
    `${name} — specialty coffee, all-day brunch, pizzas and fresh bakes. See the menu and order on WhatsApp.`,
  hours: "Mon–Sun, 9 AM – 11 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "The Daily Brew",
    phone: "9876543210",
    address: "Koregaon Park, Pune",
    socials: { instagram: "thedailybrew" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See menu",
    availability: "Order on WhatsApp",
    reach: "Fresh bakes daily",
    aboutLabel: "About us",
    badge: "Coffee · Brunch · Bakes · Delivery · ",
    servicesLabel: "Our menu",
    servicesIntro:
      "Freshly brewed, freshly baked and made to order. Message us on WhatsApp for today's specials.",
    enquire: "Ask",
    priceFrom: "From",
    galleryLabel: "From our cafe",
    galleryTags: ["Coffee", "Burgers", "Pizza", "Shakes", "Evenings", "Wraps & fries"],
    galleryCta: "Order on WhatsApp",
    contactLabel: "Visit us",
    contactCta: "Order on WhatsApp",
    callLabel: "Call to order",
    whatsappNote: "Orders & table bookings",
    placeLabel: "Cafe",
    hoursLabel: "Open hours",
  },
  sections: {
    hero: {
      eyebrow: "Coffee · Brunch · Bakes",
      title: "Your new favourite cafe.",
      subtitle:
        "Great coffee, all-day brunch and fresh bakes — stay a while, or order on WhatsApp.",
      cta: "Order on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "A little corner to slow down.",
      text: "Good coffee, fresh bakes and food we love making — in a space made for long chats, work afternoons and celebrations. Everything is made fresh in our kitchen every day. Drop by, or order your favourites on WhatsApp.",
      image: img("about"),
    },
    services: {
      heading: "Something for every mood.",
      items: [
        {
          name: "Coffee",
          note: "Espresso, cappuccino, flat white and pour-overs",
          price: 150,
        },
        {
          name: "Cold Brews & Shakes",
          note: "Iced lattes, cold brew, matcha and thick shakes",
          price: 180,
        },
        {
          name: "All-day Breakfast",
          note: "Avocado toast, pancakes, smoothie bowls and more",
          price: 220,
        },
        {
          name: "Burgers & Wraps",
          note: "Aloo tikki and paneer burgers, paneer tikka wraps and loaded fries",
          price: 180,
        },
        {
          name: "Pizza & Pasta",
          note: "Wood-fired pizzas and creamy, saucy pastas",
          price: 280,
        },
        {
          name: "Desserts & Bakes",
          note: "Cheesecake, tiramisu, brownies and fresh croissants",
          price: 120,
        },
        {
          name: "Party & Bulk Orders",
          note: "Birthdays, office meetups and celebrations",
          price: null,
        },
        {
          name: "Home Delivery",
          note: "Your cafe favourites at your door — order on WhatsApp",
          price: null,
        },
      ],
    },
    gallery: {
      heading: "Made fresh, every day.",
      images: [
        img("coffee"),
        img("burgers"),
        img("pizza"),
        img("shakes"),
        img("evenings"),
        img("wraps"),
      ],
    },
    contact: {
      heading: "Come say hi.",
      text: "Order on WhatsApp for takeaway or delivery, book a table, or ask about party orders. Walk-ins are always welcome.",
    },
  },
};

export default restaurant;
