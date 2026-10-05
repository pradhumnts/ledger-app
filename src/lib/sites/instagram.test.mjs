import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

process.env.INSTAGRAM_APP_ID = "123";
process.env.INSTAGRAM_APP_SECRET = "test-secret";

const { authorizeUrl, cleanReturnUrl, readSignedRequest, readState } = await import("./instagram.js");

function stateFrom(url) {
  return new URL(url).searchParams.get("state");
}

test("state round-trips the shop and app return URL", () => {
  const url = authorizeUrl("user-1", "moneykit://website/instagram");
  assert.equal(new URL(url).searchParams.get("scope"), "instagram_business_basic");
  assert.deepEqual(readState(stateFrom(url)), {
    userId: "user-1",
    returnTo: "moneykit://website/instagram",
  });
});

test("state rejects tampering and other return schemes", () => {
  const state = stateFrom(authorizeUrl("user-1", "moneykit://website/instagram"));
  const [payload, signature] = state.split(".");
  const forged = Buffer.from(JSON.stringify({ u: "user-2", r: "", e: Date.now() + 60000 })).toString("base64url");
  assert.equal(readState(`${forged}.${signature}`), null);
  assert.equal(readState(`${payload}.x${signature}`), null);
  assert.equal(cleanReturnUrl("https://evil.example/x"), "");
  assert.equal(cleanReturnUrl("exp://192.168.1.5:8081/--/website/instagram"), "exp://192.168.1.5:8081/--/website/instagram");
});

test("signed_request from Meta is verified with the app secret", () => {
  const payload = Buffer.from(JSON.stringify({ user_id: "1784", algorithm: "HMAC-SHA256" })).toString("base64url");
  const signature = createHmac("sha256", "test-secret").update(payload).digest("base64url");
  assert.equal(readSignedRequest(`${signature}.${payload}`).user_id, "1784");
  assert.equal(readSignedRequest(`bad.${payload}`), null);
});
