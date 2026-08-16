import { createHmac } from "node:crypto";

export function razorpayConfig() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  return {
    keyId,
    keySecret,
    webhookSecret,
    configured: Boolean(keyId && keySecret),
  };
}

function authHeader(keyId, keySecret) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createRazorpayOrder({ amountPaise, receipt, notes }) {
  const { keyId, keySecret, configured } = razorpayConfig();
  if (!configured) {
    throw new Error("Razorpay is not configured.");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.id) {
    throw new Error(body.error?.description || "Could not start payment.");
  }
  return body;
}

export function isValidPaymentSignature({ orderId, paymentId, signature }) {
  const { keySecret } = razorpayConfig();
  if (!keySecret || !orderId || !paymentId || !signature) return false;
  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

export function isValidWebhookSignature(rawBody, signature) {
  const { webhookSecret } = razorpayConfig();
  if (!webhookSecret || !rawBody || !signature) return false;
  const expected = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
