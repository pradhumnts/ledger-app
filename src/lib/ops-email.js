import { Resend } from "resend";
import { getPaidTheme } from "@/lib/theme-catalog";

const TYPE_LABELS = {
  salon: "Salon",
  beauty: "Beauty",
  clinic: "Healthcare",
  education: "Education",
  fitness: "Gym / Fitness",
  photographer: "Video / Photography",
  retail: "Retail",
  restaurant: "Restaurant / Cafe",
  jewellery: "Jewellery",
  eyeglasses: "Eyeglasses",
  mobiles: "Mobile & accessories",
  other: "Other",
};

export function businessTypeLabel(type) {
  const id = String(type || "").trim();
  if (!id) return "";
  return TYPE_LABELS[id] || id;
}

const DEFAULT_FROM = "Mably <noreply@mably.io>";
const DEFAULT_TO = "hello@prad.dev";

export function clip(value, max = 200) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function sendOpsEmail({ subject, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || DEFAULT_FROM;
  const to = process.env.WEBSITE_LEAD_TO?.trim() || DEFAULT_TO;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) return { ok: false, error: error.message || "Resend send failed" };
  return { ok: true };
}

async function shopForUser(admin, userId) {
  if (!admin || !userId) return { name: "", phone: "" };
  const { data } = await admin
    .from("businesses")
    .select("name, phone")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    name: clip(data?.name),
    phone: clip(data?.phone),
  };
}

export async function notifyNewRegistration({
  phone,
  shop,
  type,
  location,
  userId,
}) {
  const number = clip(phone);
  const name = clip(shop);
  const kind = businessTypeLabel(type);
  const place = clip(location, 400);
  const subject = `[MoneyKit] New registration${name ? ` — ${name}` : number ? ` — ${number}` : ""}`;
  const text = [
    "A new shop finished onboarding on MoneyKit.",
    "",
    `Phone: ${number || "—"}`,
    `Shop: ${name || "—"}`,
    `Business type: ${kind || "—"}`,
    `Location: ${place || "—"}`,
    `User ID: ${userId || "—"}`,
  ].join("\n");
  return sendOpsEmail({ subject, text });
}

export async function notifyThemePurchase({
  admin,
  userId,
  kind,
  themeId,
  provider,
  amountPaise,
  orderId,
}) {
  const shop = await shopForUser(admin, userId);
  const theme = getPaidTheme(kind, themeId);
  const label = theme?.name || clip(themeId) || "theme";
  const type = kind === "qr" ? "QR" : "Bill";
  const pay = provider === "play" ? "Play" : "Razorpay";
  const paise = Number(amountPaise);
  const rupees = Number.isFinite(paise)
    ? Math.round(paise / 100)
    : theme?.amountPaise
      ? Math.round(theme.amountPaise / 100)
      : null;
  const subject = `[MoneyKit] ${type} theme bought — ${label}`;
  const text = [
    `Someone bought a ${type.toLowerCase()} theme.`,
    "",
    `Theme: ${label} (${clip(themeId) || "—"})`,
    `Kind: ${type}`,
    `Paid via: ${pay}`,
    rupees != null ? `Amount: ₹${rupees}` : "Amount: —",
    `Shop: ${shop.name || "—"}`,
    `Phone: ${shop.phone || "—"}`,
    `User ID: ${userId || "—"}`,
    orderId ? `Order: ${clip(orderId, 80)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return sendOpsEmail({ subject, text });
}
