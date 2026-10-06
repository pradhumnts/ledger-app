import { APP_NAME, APP_SITE_URL } from "./branding.js";

/** P = payment, W = website, then 7 characters with no 0/O, 1/I/L or U. */
const STICKER_CODE = /^[PW][23456789ABCDEFGHJKMNPQRSTVWXYZ]{7}$/;

/** "w-7q4x k2m" → "W7Q4XK2M". Empty when it can't be a sticker code. */
export function normalizeStickerCode(value) {
  const code = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return STICKER_CODE.test(code) ? code : "";
}

export function stickerKindFromCode(code) {
  if (code.startsWith("P")) return "payment";
  if (code.startsWith("W")) return "website";
  return "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

/**
 * What a customer reads when a sticker can't send them anywhere yet.
 * `state`: unknown | notLinked | noUpi | siteNotLive.
 */
export function stickerMessage({ state, kind, shopName }) {
  const shop = String(shopName || "").trim() || "This shop";
  const payment = kind === "payment";
  switch (state) {
    case "notLinked":
      return {
        title: "This sticker isn’t set up yet",
        titleHi: "यह स्टिकर अभी चालू नहीं हुआ है",
        body: payment
          ? "Please ask the shop for another way to pay."
          : "Please check back in a little while.",
      };
    case "noUpi":
      return {
        title: `${shop} can’t take UPI payments here yet`,
        titleHi: "यहाँ अभी UPI पेमेंट चालू नहीं है",
        body: "Please ask the shop for another way to pay.",
      };
    case "siteNotLive":
      return {
        title: `${shop}’s website is coming soon`,
        titleHi: "वेबसाइट जल्द आ रही है",
        body: "Please check back in a little while.",
      };
    default:
      return {
        title: "This QR code isn’t recognised",
        titleHi: "यह QR कोड पहचाना नहीं गया",
        body: `Check that you scanned a ${APP_NAME} sticker.`,
      };
  }
}

export function stickerPageHtml({ state, kind, shopName, code }) {
  const { title, titleHi, body } = stickerMessage({ state, kind, shopName });
  const t = escapeHtml(title);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#f4f5f3">
<title>${t} · ${escapeHtml(APP_NAME)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f5f3;color:#0b301f;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:380px;background:#fff;border-radius:1.75rem;padding:32px 26px 26px;text-align:center;box-shadow:0 12px 32px rgba(11,48,31,.08);border:1px solid rgba(11,48,31,.06)}
.mark{width:52px;height:52px;margin:0 auto 18px;border-radius:16px;background:#0b301f;display:grid;place-items:center}
.mark span{width:20px;height:20px;border-radius:6px;background:#c8e86a}
h1{margin:0;font-size:20px;line-height:1.3;font-weight:650;letter-spacing:-.01em}
.hi{margin:6px 0 0;font-size:15px;color:#3f5a4b}
p.body{margin:14px 0 0;font-size:14px;line-height:1.5;color:#5f6f66}
.code{display:inline-block;margin-top:18px;padding:4px 10px;border-radius:999px;background:#f4f5f3;font:500 12px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;color:#5f6f66}
footer{margin-top:22px;font-size:12px;color:#8a978f}
footer a{color:#0b301f;font-weight:600;text-decoration:none}
</style>
</head>
<body>
<main>
<div class="mark" aria-hidden="true"><span></span></div>
<h1>${t}</h1>
<p class="hi" lang="hi">${escapeHtml(titleHi)}</p>
<p class="body">${escapeHtml(body)}</p>
${code ? `<span class="code">${escapeHtml(code)}</span>` : ""}
<footer>Powered by <a href="${escapeHtml(APP_SITE_URL)}">${escapeHtml(APP_NAME)}</a></footer>
</main>
</body>
</html>`;
}
