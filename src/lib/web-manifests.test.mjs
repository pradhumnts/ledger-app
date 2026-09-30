import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shopWebManifest } from "./web-manifests.js";

describe("web manifests", () => {
  it("keeps the public site as a browser page, not a shop PWA", () => {
    const manifest = shopWebManifest();
    assert.equal(manifest.display, "browser");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.prefer_related_applications, true);
    assert.ok(manifest.related_applications?.length);
    assert.deepEqual(manifest.shortcuts, []);
  });
});
