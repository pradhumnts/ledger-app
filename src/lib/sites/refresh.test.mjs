import assert from "node:assert/strict";
import test from "node:test";
import { REFRESH_MAX_AGE_SECONDS, refreshAuthorized, refreshSignature } from "./refresh.js";

const siteId = "e66745e7-be60-4002-b077-d4bc7f32a77e";
const now = Date.UTC(2026, 9, 12, 7, 0, 0);
const expires = Math.floor(now / 1000) + 60;

test("accepts a fresh request signed with the same service key", () => {
  const signature = refreshSignature(siteId, expires, "service-key");
  assert.equal(refreshAuthorized({ siteId, expires, signature }, "service-key", now), true);
});

test("refuses other keys, other sites, stale or far-future requests", () => {
  const signature = refreshSignature(siteId, expires, "service-key");
  assert.equal(refreshAuthorized({ siteId, expires, signature }, "other-key", now), false);
  assert.equal(
    refreshAuthorized({ siteId: "f6d27fc7-32cb-46d9-bc7b-e8285fa1dd4e", expires, signature }, "service-key", now),
    false
  );
  assert.equal(refreshAuthorized({ siteId, expires, signature }, "service-key", (expires + 1) * 1000), false);
  const far = Math.floor(now / 1000) + REFRESH_MAX_AGE_SECONDS + 5;
  assert.equal(
    refreshAuthorized({ siteId, expires: far, signature: refreshSignature(siteId, far, "service-key") }, "service-key", now),
    false
  );
  assert.equal(refreshAuthorized({ siteId, expires, signature }, "", now), false);
});
