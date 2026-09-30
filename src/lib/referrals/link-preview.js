import { APP_NAME } from "../branding.js";
import { REFERRAL_DISCOUNT_PERCENT } from "./rules.js";

// Apps that fetch a link to draw its preview card. Everyone else is redirected straight to Play.
const PREVIEW_BOTS =
  /WhatsApp|facebookexternalhit|Facebot|meta-externalagent|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|Pinterest|SkypeUriPreview|redditbot|Applebot|Googlebot|bingbot|Snapchat|Viber|Iframely|Embedly|vkShare/i;

export function isLinkPreviewBot(userAgent) {
  return PREVIEW_BOTS.test(String(userAgent || ""));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function referralPreviewText({ label, code }) {
  const title = label ? `${label} invited you to ${APP_NAME}` : `You're invited to ${APP_NAME}`;
  const description = code
    ? `Free billing and UPI payments app for shops. Use code ${code} for ${REFERRAL_DISCOUNT_PERCENT}% off the yearly website plan.`
    : "Free billing and UPI payments app for shops.";
  return { title, description };
}

/**
 * Tiny page with Open Graph tags for link previews. Preview bots don't run
 * scripts, so the script redirect only moves on a person who lands here.
 */
export function referralPreviewHtml({ label, code, url, image, playUrl }) {
  const { title, description } = referralPreviewText({ label, code });
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const play = escapeHtml(playUrl);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${APP_NAME}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${t}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${escapeHtml(image)}">
</head>
<body style="font-family:system-ui,sans-serif;background:#0b301f;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center">
<main style="padding:24px">
<h1 style="font-size:22px">${t}</h1>
<p style="opacity:.8">${d}</p>
<a href="${play}" style="display:inline-block;margin-top:12px;padding:12px 22px;border-radius:999px;background:#c8e86a;color:#0b301f;font-weight:700;text-decoration:none">Get ${APP_NAME} on Google Play</a>
</main>
<script>location.replace(${JSON.stringify(playUrl).replace(/</g, "\\u003c")})</script>
</body>
</html>`;
}
