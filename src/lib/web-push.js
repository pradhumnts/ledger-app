import { SUPPORT_EMAIL } from "@/lib/branding";
import webpush from "web-push";

export function vapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  return {
    publicKey,
    privateKey,
    configured: Boolean(publicKey && privateKey),
  };
}

export function cronAuthorized(request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function sendWebPush(subscription, payload) {
  const { publicKey, privateKey, configured } = vapidConfig();
  if (!configured) return { ok: false, expired: false };

  webpush.setVapidDetails(`mailto:${SUPPORT_EMAIL}`, publicKey, privateKey);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
    return { ok: true, expired: false };
  } catch (error) {
    const status = Number(error?.statusCode || 0);
    return { ok: false, expired: status === 404 || status === 410 };
  }
}

export async function sendToUserSubscriptions(admin, subscriptions, payload) {
  let sent = 0;
  for (const sub of subscriptions || []) {
    const result = await sendWebPush(sub, payload);
    if (result.ok) {
      sent += 1;
      continue;
    }
    if (result.expired && sub.endpoint) {
      await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    }
  }
  return sent;
}
