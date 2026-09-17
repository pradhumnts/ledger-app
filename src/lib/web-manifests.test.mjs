import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_MANIFEST_PATH,
  adminWebManifest,
  shopWebManifest,
} from "./web-manifests.js";

describe("web manifests", () => {
  it("keeps the public site as a browser page, not a shop PWA", () => {
    const manifest = shopWebManifest();
    assert.equal(manifest.display, "browser");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.prefer_related_applications, true);
    assert.ok(manifest.related_applications?.length);
  });

  it("installs admin as its own standalone PWA", () => {
    const manifest = adminWebManifest();
    assert.equal(manifest.id, "/admin");
    assert.equal(manifest.start_url, "/admin");
    assert.equal(manifest.scope, "/admin");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.prefer_related_applications, false);
    assert.deepEqual(manifest.related_applications, []);
    assert.equal(ADMIN_MANIFEST_PATH, "/manifests/admin");
    assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
    assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  });
});
