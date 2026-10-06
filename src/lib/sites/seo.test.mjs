import assert from "node:assert/strict";
import test from "node:test";
import { addressParts, jsonLdScript, localBusinessJsonLd, siteTitle, sitemapXml } from "./seo.js";

test("city, state and PIN from Indian addresses", () => {
  assert.deepEqual(addressParts("12 MG Road, Vijay Nagar, Indore, Madhya Pradesh 452010"), {
    city: "Indore",
    region: "Madhya Pradesh",
    postalCode: "452010",
  });
  assert.equal(addressParts("Hill Road, Bandra West, Mumbai 400050").city, "Mumbai");
  assert.equal(addressParts("Connaught Place, New Delhi, India").city, "New Delhi");
  assert.equal(addressParts("Connaught Place, New Delhi, Delhi 110001").city, "Delhi");
  assert.equal(addressParts("Shop no 4").city, "");
  assert.equal(addressParts("").city, "");
});

test("titles say what the shop is and where, without repeating the name", () => {
  assert.equal(
    siteTitle({ name: "Shadow Beauty", packId: "beauty", address: "Vijay Nagar, Indore" }),
    "Shadow Beauty – Beauty Parlour in Indore"
  );
  assert.equal(
    siteTitle({ name: "Drishti Opticals", packId: "eyeglasses", address: "Hill Road, Pune" }),
    "Drishti Opticals, Pune"
  );
  assert.equal(
    siteTitle({ name: "Glam Beauty Parlour", packId: "beauty", address: "Rohini, Delhi" }),
    "Glam Beauty Parlour, Delhi"
  );
  assert.equal(siteTitle({ name: "Sharma Store", packId: "general", address: "" }), "Sharma Store");
  assert.equal(siteTitle({ name: "Shakti Gym", packId: "fitness", address: "Shop 2" }), "Shakti Gym");
  assert.equal(
    siteTitle({ name: "Shakti Fitness", packId: "fitness", address: "Shop 2" }),
    "Shakti Fitness – Gym"
  );
});

test("LocalBusiness data uses the shop's type, phone, address and links", () => {
  const data = localBusinessJsonLd({
    doc: {
      business: { name: "Shadow Beauty", phone: "98765 43210", address: "Vijay Nagar, Indore 452010", logo: "" },
      sections: { hero: { image: "/site-packs/beauty/hero.webp" }, socials: { instagram: "shadowbeauty" } },
      google: { placeId: "ChIJabcdefghijk" },
    },
    packId: "beauty",
    url: "https://shadowbeauty.moneykit.site",
    description: "Bridal makeup",
  });
  assert.equal(data["@type"], "BeautySalon");
  assert.equal(data.telephone, "+919876543210");
  assert.equal(data.address.addressLocality, "Indore");
  assert.equal(data.image, undefined);
  assert.deepEqual(data.sameAs, [
    "https://instagram.com/shadowbeauty",
    "https://www.google.com/maps/place/?q=place_id:ChIJabcdefghijk",
  ]);
  assert.ok(!jsonLdScript({ x: "</script>" }).includes("</script>"));
});

test("sitemap escapes URLs", () => {
  const xml = sitemapXml([{ loc: "https://a.moneykit.site", lastmod: "2026-10-06T10:00:00Z" }]);
  assert.match(xml, /<loc>https:\/\/a\.moneykit\.site<\/loc><lastmod>2026-10-06T10:00:00\.000Z<\/lastmod>/);
});
