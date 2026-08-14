export default function manifest() {
  return {
    id: "/",
    name: "Ledger — Simple billing for India",
    short_name: "Ledger",
    description:
      "Super simple customer khata, bills, and UPI payment QR for Indian businesses.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f5f3",
    theme_color: "#0b301f",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Customers",
        short_name: "Customers",
        url: "/customers",
      },
      {
        name: "Receive payment",
        short_name: "Pay QR",
        url: "/pay",
      },
      {
        name: "Create bill",
        short_name: "Bill",
        url: "/invoice/new",
      },
    ],
  };
}
