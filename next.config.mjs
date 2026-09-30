const NO_CACHE_HEADERS = [
  { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Lets a phone on the same Wi-Fi load the dev server (Expo app testing).
  // Any home/office Wi-Fi address, so a changed DHCP lease doesn't break testing.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  experimental: {
    globalNotFound: true,
  },
  serverExternalPackages: ["@resvg/resvg-js", "web-push", "sharp"],
  outputFileTracingIncludes: {
    "/sites/\\[slug\\]/share-image": ["./src/lib/og/fonts/*.ttf"],
    "/r/\\[code\\]/image": ["./src/lib/og/fonts/*.ttf", "./public/icon-192.png"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      { source: "/sw.js", headers: NO_CACHE_HEADERS },
      { source: "/push-sw.js", headers: NO_CACHE_HEADERS },
    ];
  },
};

export default nextConfig;
