const img = (name) => `/site-packs/education/${name}.webp`;

/** Coaching centres, tuition classes and self-study libraries (paid study spaces). */
const education = {
  id: "education",
  slugSuffixes: ["academy", "classes", "library"],
  whatsappMessage: "Hi! I saw your website and want to know about admissions and fees.",
  description: (name) =>
    `${name} — coaching classes and a quiet study library. See courses, fees and seat plans, and book a free demo class on WhatsApp.`,
  hours: "Mon–Sun, 6 AM – 10 PM",
  // Shop profile used only by the /site-preview demo.
  demo: {
    name: "Gyan Academy & Study Library",
    phone: "9876543210",
    address: "Rajeev Gandhi Nagar, Kota",
    socials: { instagram: "gyanacademy" },
  },
  // Template copy that is not customer-editable.
  ui: {
    icon: "",
    primaryTarget: "whatsapp",
    directions: "Get directions",
    cta2: "See courses",
    availability: "Admissions open",
    reach: "Free demo class",
    aboutLabel: "About us",
    badge: "Coaching · Study library · Mock tests · Doubt classes · ",
    servicesLabel: "Courses & fees",
    servicesIntro:
      "Simple monthly fees, small batches and a free demo class before you join.",
    enquire: "Enquire",
    priceFrom: "From",
    galleryLabel: "Inside our centre",
    galleryTags: ["Study hall", "Tuition", "Doubt classes", "Mock tests", "Study desk", "Results"],
    galleryCta: "Book a free demo",
    contactLabel: "Visit us",
    contactCta: "Chat on WhatsApp",
    callLabel: "Call the centre",
    whatsappNote: "Usually replies in minutes",
    placeLabel: "Centre",
    hoursLabel: "Open",
  },
  sections: {
    hero: {
      eyebrow: "Coaching · Study library",
      title: "Study better. Score higher.",
      subtitle:
        "Small-batch coaching and a quiet AC study library with reserved seats, open from 6 AM to 10 PM.",
      cta: "Chat on WhatsApp",
      image: img("hero"),
    },
    about: {
      heading: "A place built for focus.",
      text: "We started with one goal: give every student a calm place to study and teachers who know them by name. Batches stay small, doubts are cleared the same day, and regular tests show exactly where you stand.\n\nOur study library has reserved cabins, fast Wi-Fi, charging points and strict silence, so every hour you put in really counts.",
      image: img("about"),
    },
    services: {
      heading: "Courses and seats for every goal.",
      items: [
        {
          name: "Study Library Seat",
          note: "Reserved AC cabin with a lamp, charging point, Wi-Fi and lockers, monthly",
          price: 1200,
        },
        {
          name: "School Tuition (Class 6–10)",
          note: "All subjects in small batches, with weekly tests and updates for parents",
          price: 1500,
        },
        {
          name: "Class 11–12 Science",
          note: "Physics, Chemistry, Maths and Biology for boards, with full syllabus notes",
          price: 2500,
        },
        {
          name: "Competitive Exam Coaching",
          note: "SSC, Banking, Railways and state exams, with daily practice and mock tests",
          price: 2000,
        },
        {
          name: "JEE / NEET Foundation",
          note: "Concept classes, practice sheets and full-length tests from Class 9 onwards",
          price: 4000,
        },
        {
          name: "Spoken English",
          note: "Grammar, vocabulary and speaking practice to build real confidence",
          price: 1800,
        },
        {
          name: "Library Day Pass",
          note: "Walk in and study for the day in a quiet, air-conditioned hall",
          price: 100,
        },
        {
          name: "Free Demo Class",
          note: "Sit in on a class before you join, with no charge and no pressure",
          price: null,
        },
      ],
    },
    gallery: {
      heading: "Where the hard work happens.",
      images: [
        img("study-hall"),
        img("tuition"),
        img("doubts"),
        img("mock-test"),
        img("desk"),
        img("results"),
      ],
    },
    contact: {
      heading: "Book a free demo class.",
      text: "Message us on WhatsApp to ask about batches, fees or library seats. Drop by any day to see the centre. Your first class is on us.",
    },
  },
};

export default education;
