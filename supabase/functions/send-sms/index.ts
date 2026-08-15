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
  const authkey = Deno.env.get("MSG91_AUTHKEY") || "";
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID") || "";

  try {
    const { user, sms } = new Webhook(secret).verify(
      payload,
      Object.fromEntries(req.headers)
    );

    const otp = String(sms?.otp || "").trim();
    const phone = String(user?.phone || "").replace(/\D/g, "");
    if (!otp || phone.length < 10) {
      return jsonError(400, "Missing phone or OTP");
    }
    if (!authkey) {
      return jsonError(500, "MSG91_AUTHKEY is not set");
    }
    if (!templateId) {
      return jsonError(
        500,
        "MSG91_TEMPLATE_ID is not set. Copy the default OTP template ID from MSG91 → OTP → Templates."
      );
    }

    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", phone);
    url.searchParams.set("otp", otp);
    url.searchParams.set("otp_length", String(otp.length));

    const smsRes = await fetch(url, {
      method: "POST",
      headers: {
        authkey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const body = await smsRes.json().catch(() => ({}));
    const type = String(body.type || body.Type || "").toLowerCase();
    const message = String(body.message || body.msg || "");

    console.log(
      JSON.stringify({
        msg91_status: smsRes.status,
        msg91_type: type,
        msg91_message: message,
      })
    );

    if (!smsRes.ok || type === "error" || type !== "success") {
      return jsonError(500, message || "MSG91 did not send the SMS");
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
