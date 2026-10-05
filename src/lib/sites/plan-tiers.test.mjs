import assert from "node:assert/strict";
import test from "node:test";
import { planTier } from "./plan-tiers.js";

test("Play base plans map to their tier", () => {
  assert.equal(planTier("monthly"), "basic");
  assert.equal(planTier("yearly"), "basic");
  assert.equal(planTier("standard-monthly"), "standard");
  assert.equal(planTier("standard-yearly"), "standard");
  assert.equal(planTier(null), "basic");
});

test("App Store products carry their tier", () => {
  assert.equal(planTier("website_yearly_referral"), "basic");
  assert.equal(planTier("website_standard_monthly"), "standard");
  assert.equal(planTier("website_standard_yearly_referral"), "standard");
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
