import assert from "node:assert/strict";
import test from "node:test";
import { isWebAccessiblePath } from "./onboarding-gate.js";
import {
  canOpenUpiApp,
  normalizeStickerCode,
  stickerKindFromCode,
  stickerMessage,
  stickerPageHtml,
} from "./qr-stickers.js";

test("sticker codes are cleaned up and checked", () => {
  assert.equal(normalizeStickerCode("w-7q4x k2m"), "W7Q4XK2M");
  assert.equal(normalizeStickerCode("P7Q4XK2M"), "P7Q4XK2M");
  assert.equal(normalizeStickerCode("X7Q4XK2M"), "");
  assert.equal(normalizeStickerCode("P7Q4XK2"), "");
  assert.equal(normalizeStickerCode("P7Q4XK2MM"), "");
  // 0, O, 1, I, L and U are never used, so they can't be misread.
  assert.equal(normalizeStickerCode("P0Q4XK2M"), "");
  assert.equal(normalizeStickerCode("PIQ4XK2M"), "");
  assert.equal(normalizeStickerCode(undefined), "");
});

test("the first letter says what the sticker does", () => {
  assert.equal(stickerKindFromCode("P7Q4XK2M"), "payment");
  assert.equal(stickerKindFromCode("W7Q4XK2M"), "website");
  assert.equal(stickerKindFromCode(""), "");
});

test("only phones are sent straight to a UPI app", () => {
  assert.equal(canOpenUpiApp("Mozilla/5.0 (Linux; Android 14; SM-A146B) Chrome/129.0 Mobile"), true);
  assert.equal(canOpenUpiApp("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"), true);
  assert.equal(canOpenUpiApp("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/129.0"), false);
  assert.equal(canOpenUpiApp(null), false);
});

test("unready stickers explain themselves", () => {
  assert.match(stickerMessage({ state: "notLinked", kind: "payment" }).body, /another way to pay/);
  assert.match(stickerMessage({ state: "notLinked", kind: "website" }).body, /check back/);
  assert.match(stickerMessage({ state: "noUpi", shopName: "Kavya Jewels" }).title, /^Kavya Jewels/);
  assert.match(stickerMessage({ state: "siteNotLive", shopName: "" }).title, /^This shop/);
  assert.match(stickerMessage({ state: "unknown" }).title, /isn’t recognised/);
});

test("the page escapes shop names", () => {
  const html = stickerPageHtml({ state: "noUpi", shopName: "<script>x</script>", code: "P7Q4XK2M" });
  assert.ok(!html.includes("<script>x"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("P7Q4XK2M"));
  assert.ok(html.includes('name="robots" content="noindex"'));
});

test("sticker links are served by the website", () => {
  assert.equal(isWebAccessiblePath("/q/P7Q4XK2M"), true);
  assert.equal(isWebAccessiblePath("/q"), false);
});
