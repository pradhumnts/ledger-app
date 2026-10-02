import assert from "node:assert/strict";
import test from "node:test";
import { appLinkPlayUrl, cleanAppLinkTag } from "./app-links.js";

const referrer = (url) => decodeURIComponent(new URL(url).searchParams.get("referrer"));

test("known tags keep the utm pairs the app used before", () => {
  assert.equal(referrer(appLinkPlayUrl("wa")), "utm_source=whatsapp&utm_campaign=share");
  assert.equal(referrer(appLinkPlayUrl("bill")), "utm_source=whatsapp&utm_campaign=bill");
  assert.equal(referrer(appLinkPlayUrl("invite")), "utm_source=app_share&utm_campaign=invite");
  assert.equal(referrer(appLinkPlayUrl("pdf")), "utm_source=bill_pdf&utm_campaign=footer");
  assert.ok(appLinkPlayUrl("bill").startsWith("https://play.google.com/store/apps/details?id=app.moneykit.android&"));
});

test("new tags become the utm source; a bare link is direct", () => {
  assert.equal(referrer(appLinkPlayUrl("poster")), "utm_source=poster&utm_campaign=link");
  assert.equal(referrer(appLinkPlayUrl("")), "utm_source=link&utm_campaign=direct");
});

test("tags are cleaned", () => {
  assert.equal(cleanAppLinkTag("Bill"), "bill");
  assert.equal(cleanAppLinkTag("a b"), "");
  assert.equal(cleanAppLinkTag("x".repeat(33)), "");
  assert.equal(cleanAppLinkTag(undefined), "");
});
