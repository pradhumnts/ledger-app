import { createSign } from "node:crypto";
import { PLAY_PACKAGE_NAME } from "@/lib/branding";

const ANDROID_PUBLISHER_SCOPE =
  "https://www.googleapis.com/auth/androidpublisher";

export function playBillingConfig() {
  const packageName =
    process.env.PLAY_PACKAGE_NAME ||
    process.env.NEXT_PUBLIC_PLAY_PACKAGE_NAME ||
    PLAY_PACKAGE_NAME;
  const raw = process.env.PLAY_SERVICE_ACCOUNT_JSON || "";
  let serviceAccount = null;
  if (raw) {
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      serviceAccount = null;
    }
  }
  return {
    packageName,
    serviceAccount,
    configured: Boolean(
      packageName && serviceAccount?.client_email && serviceAccount?.private_key
    ),
  };
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken() {
  const { serviceAccount, configured } = playBillingConfig();
  if (!configured) {
    throw new Error("Play Billing is not configured on the server.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: ANDROID_PUBLISHER_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const jwt = `${unsigned}.${signer.sign(serviceAccount.private_key, "base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || "Could not talk to Google Play.");
  }
  return body.access_token;
}

export async function getPlayProductPurchase(sku, purchaseToken) {
  const { packageName, configured } = playBillingConfig();
  if (!configured) {
    throw new Error("Play Billing is not configured on the server.");
  }

  const accessToken = await getAccessToken();
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(packageName)}/purchases/products/` +
    `${encodeURIComponent(sku)}/tokens/${encodeURIComponent(purchaseToken)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error?.message || "Could not confirm that Play purchase.");
  }
  return body;
}

export async function acknowledgePlayPurchase(sku, purchaseToken) {
  const { packageName, configured } = playBillingConfig();
  if (!configured) return;

  const accessToken = await getAccessToken();
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(packageName)}/purchases/products/` +
    `${encodeURIComponent(sku)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
}
