import assert from "node:assert/strict";
import test from "node:test";
import { planTier } from "./plan-tiers.js";

test("Play base plans map to their tier", () => {
  assert.equal(planTier("monthly"), "website");
  assert.equal(planTier("yearly"), "website");
  assert.equal(planTier("pro-monthly"), "pro");
  assert.equal(planTier("pro-yearly"), "pro");
  assert.equal(planTier(null), "website");
});

test("App Store products carry their tier", () => {
  assert.equal(planTier("website_yearly_referral"), "website");
  assert.equal(planTier("website_pro_monthly"), "pro");
  assert.equal(planTier("website_pro_yearly_referral"), "pro");
});

test("SITES_PRO_BASE_PLAN_IDS overrides the default ids", () => {
  process.env.SITES_PRO_BASE_PLAN_IDS = "plus-month, plus-year";
  try {
    assert.equal(planTier("plus-year"), "pro");
    assert.equal(planTier("pro-yearly"), "website");
  } finally {
    delete process.env.SITES_PRO_BASE_PLAN_IDS;
  }
});
