import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("ok", { status: 200 });
  }

  const payload = await req.text();
  const secret = (Deno.env.get("SEND_SMS_HOOK_SECRET") || "").replace(
    "v1,whsec_",
    ""
  );
  const apiKey = Deno.env.get("TWOFACTOR_API_KEY") || "";
  const template = Deno.env.get("TWOFACTOR_TEMPLATE_NAME") || "";

  try {
    const { user, sms } = new Webhook(secret).verify(
      payload,
      Object.fromEntries(req.headers)
    );

    const otp = sms?.otp;
    const phone = String(user?.phone || "").replace(/\D/g, ""); // +9198… → 9198…
    if (!otp || phone.length < 10) {
      return jsonError(400, "Missing phone or OTP");
    }

    const path = template
      ? `${apiKey}/SMS/${phone}/${otp}/${encodeURIComponent(template)}`
      : `${apiKey}/SMS/${phone}/${otp}`;

    const smsRes = await fetch(`https://2factor.in/API/V1/${path}`);
    const body = await smsRes.json().catch(() => ({}));

    if (body.Status !== "Success") {
      return jsonError(500, body.Details || "2Factor send failed");
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return jsonError(500, String(error?.message || error));
  }
});

function jsonError(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: { http_code: status, message } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}