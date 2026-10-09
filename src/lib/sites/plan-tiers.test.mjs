import assert from "node:assert/strict";
import test from "node:test";
import { planPages, planTier } from "./plan-tiers.js";

test("Play base plans map to their tier", () => {
  assert.equal(planTier("monthly"), "basic");
  assert.equal(planTier("yearly"), "basic");
  assert.equal(planTier("standard-monthly"), "standard");
  assert.equal(planTier("standard-yearly"), "standard");
  assert.equal(planTier("standard4-monthly"), "standard");
  assert.equal(planTier("standard8-yearly"), "standard");
  assert.equal(planTier("standard4-annual"), "standard");
  assert.equal(planTier("standards-monthly"), "basic");
  assert.equal(planTier(null), "basic");
});

test("App Store products carry their tier", () => {
  assert.equal(planTier("website_yearly_referral"), "basic");
  assert.equal(planTier("website_standard_monthly"), "standard");
  assert.equal(planTier("website_standard_yearly_referral"), "standard");
  assert.equal(planTier("website_standard4_yearly"), "standard");
  assert.equal(planTier("website_standard8_monthly"), "standard");
});

test("Plans include 0, 1, 4 or 8 service pages", () => {
  assert.equal(planPages("monthly"), 0);
  assert.equal(planPages("website_yearly"), 0);
  assert.equal(planPages("standard-monthly"), 1);
  assert.equal(planPages("website_standard_yearly_referral"), 1);
  assert.equal(planPages("standard4-monthly"), 4);
  assert.equal(planPages("website_standard4_yearly"), 4);
  assert.equal(planPages("standard8-yearly"), 8);
  assert.equal(planPages("standard4-annual"), 4);
  assert.equal(planPages("website_standard8_monthly"), 8);
  assert.equal(planPages(null), 0);
});

test("SITES_STANDARD_BASE_PLAN_IDS overrides the default ids", () => {
  process.env.SITES_STANDARD_BASE_PLAN_IDS = "std-month, std-year";
  try {
    assert.equal(planTier("std-year"), "standard");
    assert.equal(planTier("standard-yearly"), "basic");
  } finally {
    delete process.env.SITES_STANDARD_BASE_PLAN_IDS;
  }
});
