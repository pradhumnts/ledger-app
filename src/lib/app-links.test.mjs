import assert from "node:assert/strict";
import test from "node:test";
import { appLink, appLinkPlayUrl, appStoreUrlFor, cleanAppLinkTag } from "./app-links.js";

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

test("website tags keep the utm pairs their Play links used", () => {
  assert.equal(referrer(appLinkPlayUrl("bill-logo")), "utm_source=bill_page&utm_campaign=logo");
  assert.equal(referrer(appLinkPlayUrl("bill-badge")), "utm_source=bill_page&utm_campaign=badge");
  assert.equal(referrer(appLinkPlayUrl("pay-logo")), "utm_source=pay_page&utm_campaign=logo");
  assert.equal(referrer(appLinkPlayUrl("site")), "utm_source=shop_site&utm_campaign=footer");
  assert.equal(referrer(appLinkPlayUrl("site-404")), "utm_source=shop_site&utm_campaign=not_found");
  assert.equal(referrer(appLinkPlayUrl("web-logo")), "utm_source=website&utm_campaign=logo");
  assert.equal(referrer(appLinkPlayUrl("web-cta")), "utm_source=website&utm_campaign=cta");
});

test("smart links point at /get", () => {
  assert.equal(appLink("bill-logo"), "https://moneykitapp.com/get/bill-logo");
  assert.equal(appLink(""), "https://moneykitapp.com/get");
});

test("App Store only for Apple devices, and only once the URL is set", () => {
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)";
  const android = "Mozilla/5.0 (Linux; Android 15; Pixel 9)";
  const store = "https://apps.apple.com/in/app/moneykit/id123?pt=999";
  assert.equal(appStoreUrlFor(iphone, "bill", ""), "");
  assert.equal(appStoreUrlFor(android, "bill", store), "");
  assert.equal(appStoreUrlFor(iphone, "bill", store), `${store}&ct=bill`);
  assert.equal(appStoreUrlFor(iphone, "", store), store);
  assert.equal(appStoreUrlFor(iphone, "bill", "not a url"), "");
});

test("tags are cleaned", () => {
  assert.equal(cleanAppLinkTag("Bill"), "bill");
  assert.equal(cleanAppLinkTag("a b"), "");
  assert.equal(cleanAppLinkTag("x".repeat(33)), "");
  assert.equal(cleanAppLinkTag(undefined), "");
});
