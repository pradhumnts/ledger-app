import assert from "node:assert/strict";
import test from "node:test";
import {
  cardTitle,
  cardVcard,
  formatPhone,
  initials,
  normalizeCard,
  phoneE164,
  vcardFilename,
  webUrl,
} from "./cards.js";

test("phone numbers become E.164, Indian ones by default", () => {
  assert.equal(phoneE164("8740074255"), "+918740074255");
  assert.equal(phoneE164("+91 87400 74255"), "+918740074255");
  assert.equal(phoneE164("918740074255"), "+918740074255");
  assert.equal(phoneE164("08740074255"), "+918740074255");
  assert.equal(phoneE164("+1 (415) 555-0100"), "+14155550100");
  assert.equal(phoneE164("123"), "");
  assert.equal(formatPhone("+918740074255"), "+91 87400 74255");
  assert.equal(formatPhone("+14155550100"), "+14155550100");
});

test("websites need a real http(s) host", () => {
  assert.equal(webUrl("moneykitapp.com"), "https://moneykitapp.com/");
  assert.equal(webUrl("javascript:alert(1)"), "");
  assert.equal(webUrl("localhost"), "");
});

test("normalizeCard cleans loose JSON", () => {
  const card = normalizeCard({
    name: "  Pradyumn Vaishnav ",
    phone: "8740074255",
    email: "not an email",
    theme: "nope",
    socials: { linkedin: "@pradyumn", instagram: "https://instagram.com/moneykit", x: "bad handle!" },
    links: [{ label: "Pricing", url: "moneykitapp.com/pricing" }, { label: "", url: "x.com" }],
  });
  assert.equal(card.name, "Pradyumn Vaishnav");
  assert.equal(card.whatsapp, "+918740074255");
  assert.equal(card.email, "");
  assert.equal(card.theme, "midnight");
  assert.deepEqual(
    card.socials.map((s) => s.url),
    ["https://www.linkedin.com/in/pradyumn", "https://instagram.com/moneykit"],
  );
  assert.deepEqual(card.links, [{ label: "Pricing", url: "https://moneykitapp.com/pricing" }]);
  assert.equal(normalizeCard({ phone: "8740074255", whatsapp: false }).whatsapp, "");
  assert.equal(normalizeCard(null).name, "");
});

test("vCard escapes text, folds long lines and labels links", () => {
  const card = normalizeCard({
    name: "Pradyumn Vaishnav",
    title: "Founder",
    company: "MoneyKit; Billing, simplified",
    phone: "8740074255",
    bio: "Line one\nLine two",
    socials: { linkedin: "pradyumn" },
  });
  const vcard = cardVcard(card, { photo: "A".repeat(200), cardUrl: "https://moneykitapp.com/c/abc12345" });
  assert.ok(vcard.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\nN:Vaishnav;Pradyumn;;;\r\n"));
  assert.match(vcard, /ORG:MoneyKit\\; Billing\\, simplified\r\n/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+918740074255\r\n/);
  assert.match(vcard, /NOTE:Line one\\nLine two\r\n/);
  assert.match(vcard, /item1\.X-ABLabel:LinkedIn\r\n/);
  assert.match(vcard, /item2\.X-ABLabel:Digital card\r\n/);
  for (const line of vcard.split("\r\n")) {
    assert.ok(new TextEncoder().encode(line).length <= 75, line);
  }
  assert.ok(vcard.endsWith("END:VCARD\r\n"));
});

test("names, titles and filenames", () => {
  assert.equal(initials("Pradyumn Kumar Vaishnav"), "PV");
  assert.equal(initials(""), "•");
  assert.equal(cardTitle({ name: "Pradyumn", title: "Founder", company: "MoneyKit" }), "Pradyumn – Founder, MoneyKit");
  assert.equal(vcardFilename({ name: "Pradyumn \"V\"" }), "Pradyumn V.vcf");
});
