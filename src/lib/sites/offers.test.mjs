import assert from "node:assert/strict";
import test from "node:test";
import {
  OFFER_MAX,
  cleanOffers,
  formatOfferDate,
  indiaToday,
  visibleOffers,
} from "./offers.js";

const offer = (patch = {}) => ({
  id: "offer-a",
  theme: "festive",
  badge: "20% OFF",
  title: "Diwali offer",
  text: "On all facials",
  ends: "",
  button: "whatsapp",
  hidden: false,
  ...patch,
});

test("cleanOffers keeps valid offers as they are", () => {
  assert.deepEqual(cleanOffers([offer()]), [offer()]);
});

test("cleanOffers drops blanks, non-objects and anything past the limit", () => {
  const input = [
    null,
    "x",
    offer({ badge: " ", title: "", text: "\n" }),
    ...Array.from({ length: OFFER_MAX + 2 }, (_, i) => offer({ id: `offer-${i}` })),
  ];
  const out = cleanOffers(input);
  assert.equal(out.length, OFFER_MAX);
  assert.deepEqual(out.map((item) => item.id), ["offer-0", "offer-1", "offer-2"]);
  assert.deepEqual(cleanOffers("nope"), []);
  assert.deepEqual(cleanOffers(undefined), []);
});

test("cleanOffers clips text and falls back on unknown values", () => {
  const [out] = cleanOffers([
    offer({
      id: "<script>",
      theme: "neon",
      badge: "MEGA DISCOUNT 50% OFF",
      title: "  Big   sale  ",
      text: "x".repeat(300),
      ends: "2026-02-30",
      button: "sms",
      hidden: "yes",
    }),
  ]);
  assert.equal(out.id, "offer-1");
  assert.equal(out.theme, "forest");
  assert.equal(out.badge, "MEGA DISCOUNT");
  assert.equal(out.title, "Big sale");
  assert.equal(out.text.length, 120);
  assert.equal(out.ends, "");
  assert.equal(out.button, "whatsapp");
  assert.equal(out.hidden, false);
});

test("cleanOffers gives repeated ids new ones", () => {
  const ids = cleanOffers([offer(), offer(), offer()]).map((item) => item.id);
  assert.equal(new Set(ids).size, 3);
});

test("visibleOffers hides hidden and ended offers, keeping the last day", () => {
  const doc = {
    offers: [
      offer({ id: "hidden", hidden: true }),
      offer({ id: "ended", ends: "2026-10-06" }),
      offer({ id: "last-day", ends: "2026-10-07" }),
    ],
  };
  assert.deepEqual(
    visibleOffers(doc, "2026-10-07").map((item) => item.id),
    ["last-day"]
  );
  assert.equal(visibleOffers({ offers: [offer()] }, "2026-10-07").length, 1);
  assert.deepEqual(visibleOffers({}), []);
});

test("indiaToday rolls over at midnight in India, not UTC", () => {
  assert.equal(indiaToday(new Date("2026-10-07T18:29:00Z")), "2026-10-07");
  assert.equal(indiaToday(new Date("2026-10-07T18:31:00Z")), "2026-10-08");
});

test("formatOfferDate", () => {
  assert.equal(formatOfferDate("2026-10-15"), "15 Oct");
  assert.equal(formatOfferDate(""), "");
});
