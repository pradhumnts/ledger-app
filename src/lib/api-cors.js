const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

export function corsHeaders(request) {
  const origin = String(request.headers.get("origin") || "");
  const allow =
    origin === "https://moneykitapp.com" || LOCAL.test(origin) ? origin : "";
  return {
    ...(allow ? { "Access-Control-Allow-Origin": allow } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-MoneyKit-Access-Token",
    Vary: "Origin",
  };
}

export function corsJson(request, body, init = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders(request),
      ...(init.headers || {}),
    },
  });
}

export function corsPreflight(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
