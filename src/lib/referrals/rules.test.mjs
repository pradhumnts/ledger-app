import assert from "node:assert/strict";
import test from "node:test";
import {
  addMonths,
  codeFromReferrer,
  holdUntil,
  isUpiId,
  isYearlyPlan,
  maskName,
  normalizeCode,
  referralLink,
  shopCodeCandidate,
} from "./rules.js";

test("codes are case-insensitive and ignore spaces", () => {
  assert.equal(normalizeCode(" rahul "), "RAHUL");
  assert.equal(normalizeCode("sharma-427"), "SHARMA427");
  assert.equal(normalizeCode("ab"), "");
  assert.equal(normalizeCode(""), "");
  assert.equal(normalizeCode("x".repeat(21)), "");
});

test("payout UPI IDs need a handle and a bank", () => {
  assert.equal(isUpiId("sharma.kirana@okaxis"), true);
  assert.equal(isUpiId(" 9876543210@ybl "), true);
  assert.equal(isUpiId("sharma"), false);
  assert.equal(isUpiId("a@b"), false);
  assert.equal(isUpiId(""), false);
});

test("shop codes come from the business name", () => {
  const fixed = () => 0;
  assert.equal(shopCodeCandidate("Sharma Kirana Store", fixed), "SHARMA222");
  assert.equal(shopCodeCandidate("Om", fixed), "SHOP222");
  assert.equal(shopCodeCandidate("शर्मा किराना", fixed), "SHOP222");
  assert.match(shopCodeCandidate("Gupta Medical"), /^GUPTAM[2-9]{3}$/);
});

test("install referrer carries the code", () => {
  assert.equal(codeFromReferrer("ref=RAHUL&utm_source=referral"), "RAHUL");
  assert.equal(codeFromReferrer("utm_source=google-play&utm_medium=organic"), "");
  assert.equal(codeFromReferrer(""), "");
});

test("yearly plans by base plan name or referral offer", () => {
  delete process.env.SITES_YEARLY_BASE_PLAN_IDS;
  assert.equal(isYearlyPlan({ basePlanId: "yearly" }), true);
  assert.equal(isYearlyPlan({ basePlanId: "website-annual" }), true);
  assert.equal(isYearlyPlan({ basePlanId: "monthly" }), false);
  assert.equal(isYearlyPlan({ basePlanId: "p1m", offerId: "referral-10" }), true);
  process.env.SITES_YEARLY_BASE_PLAN_IDS = "plan-12";
  assert.equal(isYearlyPlan({ basePlanId: "plan-12" }), true);
  assert.equal(isYearlyPlan({ basePlanId: "yearly" }), false);
  delete process.env.SITES_YEARLY_BASE_PLAN_IDS;
});

test("App Store products count by their own period, whatever the Play list says", () => {
  process.env.SITES_YEARLY_BASE_PLAN_IDS = "plan-12";
  assert.equal(isYearlyPlan({ basePlanId: "website_yearly" }), true);
  assert.equal(isYearlyPlan({ basePlanId: "website_yearly_referral" }), true);
  assert.equal(isYearlyPlan({ basePlanId: "website_monthly" }), false);
  delete process.env.SITES_YEARLY_BASE_PLAN_IDS;
});

test("hold is 14 days from purchase", () => {
  assert.equal(holdUntil("2026-09-01T10:00:00.000Z"), "2026-09-15T10:00:00.000Z");
});

test("adding a month keeps the day, or the month's last day", () => {
  assert.equal(addMonths("2026-01-31T00:00:00.000Z").toISOString(), "2026-02-28T00:00:00.000Z");
  assert.equal(addMonths("2026-09-15T08:30:00.000Z").toISOString(), "2026-10-15T08:30:00.000Z");
  assert.equal(addMonths("2026-12-10T00:00:00.000Z").toISOString(), "2027-01-10T00:00:00.000Z");
});

test("invite names are masked", () => {
  assert.equal(maskName("Sharma Kirana Store"), "Sha••• Kir•••");
  assert.equal(maskName("Om"), "O••");
  assert.equal(maskName(""), "");
});

test("short link", () => {
  assert.equal(referralLink("https://moneykitapp.com/", "RAHUL"), "https://moneykitapp.com/r/RAHUL");
});

test("link previews: bots get a card, people get the redirect", async () => {
  const { isLinkPreviewBot, referralPreviewHtml } = await import("./link-preview.js");
  assert.equal(isLinkPreviewBot("WhatsApp/2.24.1.0 A"), true);
  assert.equal(isLinkPreviewBot("facebookexternalhit/1.1"), true);
  assert.equal(isLinkPreviewBot("TelegramBot (like TwitterBot)"), true);
  assert.equal(isLinkPreviewBot("Mozilla/5.0 (Linux; Android 14) Chrome/128 Mobile Safari/537.36"), false);
  assert.equal(isLinkPreviewBot(""), false);

  const html = referralPreviewHtml({
    label: `Ravi "<script>" Store`,
    code: "RAVI123",
    url: "https://moneykitapp.com/r/RAVI123",
    image: "https://moneykitapp.com/r/RAVI123/image",
    playUrl: "https://play.google.com/store/apps/details?id=app.moneykit.android&referrer=ref%3DRAVI123",
  });
  assert.ok(html.includes(`content="https://moneykitapp.com/r/RAVI123/image"`));
  assert.ok(html.includes("Ravi &quot;&lt;script&gt;&quot; Store invited you to MoneyKit"));
  assert.ok(html.includes("Use code RAVI123 for 10% off"));
  assert.ok(!html.includes(`"<script>"`), "shop name can't inject markup");
});
