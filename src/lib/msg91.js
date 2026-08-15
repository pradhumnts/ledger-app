const WIDGET_BASE = "https://control.msg91.com/api/v5/widget";

function widgetConfig() {
  const widgetId = process.env.MSG91_WIDGET_ID || "";
  const tokenAuth = process.env.MSG91_TOKEN_AUTH || "";
  const authkey = process.env.MSG91_AUTHKEY || "";
  return {
    widgetId,
    tokenAuth,
    authkey,
    configured: Boolean(widgetId && tokenAuth),
  };
}

function pickReqId(body) {
  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message.trim();
  }
  return (
    body?.message?.reqId ||
    body?.data?.reqId ||
    body?.reqId ||
    body?.message?.requestId ||
    ""
  );
}

function pickAccessToken(body) {
  return (
    body?.message?.["access-token"] ||
    body?.message?.accessToken ||
    body?.data?.["access-token"] ||
    body?.data?.accessToken ||
    body?.["access-token"] ||
    ""
  );
}

function isMsg91Error(body, httpOk) {
  const type = String(body?.type || body?.Type || "").toLowerCase();
  const message = String(
    typeof body?.message === "string" ? body.message : body?.msg || ""
  ).toLowerCase();
  if (!httpOk) return true;
  if (type === "error") return true;
  if (message.includes("fail") || message.includes("invalid")) return true;
  return false;
}

async function widgetPost(path, payload) {
  const { tokenAuth } = widgetConfig();
  const response = await fetch(`${WIDGET_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      tokenAuth,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

export async function msg91SendOtp(phoneDigits) {
  const { widgetId, tokenAuth, configured } = widgetConfig();
  if (!configured) {
    throw new Error("MSG91 widget is not configured.");
  }

  const identifier =
    String(phoneDigits || "").replace(/\D/g, "").length === 10
      ? `91${String(phoneDigits).replace(/\D/g, "")}`
      : String(phoneDigits || "").replace(/\D/g, "");

  // Web widget endpoint. /sendOtpMobile is only for Mobile Integration widgets.
  const { response, body } = await widgetPost("/sendOtp", {
    widgetId,
    tokenAuth,
    identifier,
  });
  if (isMsg91Error(body, response.ok)) {
    const detail =
      (typeof body.message === "string" && body.message) ||
      body.msg ||
      "Could not send the SMS code.";
    throw new Error(detail);
  }
  const reqId = pickReqId(body);
  if (!reqId) {
    throw new Error("MSG91 did not return a request id.");
  }
  return { reqId };
}

export async function msg91VerifyOtp(reqId, otp) {
  const { widgetId, tokenAuth, authkey, configured } = widgetConfig();
  if (!configured) {
    throw new Error("MSG91 widget is not configured.");
  }

  const { response, body } = await widgetPost("/verifyOtp", {
    widgetId,
    tokenAuth,
    reqId,
    otp: String(otp || "").trim(),
  });
  if (isMsg91Error(body, response.ok)) {
    const detail =
      (typeof body.message === "string" && body.message) ||
      body.msg ||
      "That code didn't work.";
    throw new Error(detail);
  }

  const accessToken = pickAccessToken(body);
  if (authkey && accessToken) {
    const { response: check, body: checkBody } = await widgetPost(
      "/verifyAccessToken",
      {
        authkey,
        "access-token": accessToken,
      }
    );
    if (isMsg91Error(checkBody, check.ok)) {
      throw new Error("Could not confirm that SMS login.");
    }
  }

  return { ok: true };
}
