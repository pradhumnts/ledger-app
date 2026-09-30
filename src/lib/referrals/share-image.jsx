/* eslint-disable @next/next/no-img-element -- Satori renders plain <img>, not next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { GEIST_REGULAR_TTF_B64 } from "@/lib/og/geist-regular-b64";
import { APP_NAME } from "@/lib/branding";
import { REFERRAL_DISCOUNT_PERCENT } from "./rules";

const W = 1200;
const H = 630;
const FOREST = "#0b301f";
const LIME = "#c8e86a";

const assets = Promise.all([
  readFile(join(process.cwd(), "src/lib/og/fonts/InstrumentSerif-Regular.ttf")),
  readFile(join(process.cwd(), "src/lib/og/fonts/InstrumentSerif-Italic.ttf")),
  readFile(join(process.cwd(), "public/icon-192.png")),
]).then(([serif, serifItalic, icon]) => ({
  fonts: [
    { name: "Serif", data: serif, weight: 400, style: "normal" },
    { name: "Serif", data: serifItalic, weight: 400, style: "italic" },
    { name: "Sans", data: Buffer.from(GEIST_REGULAR_TTF_B64, "base64"), weight: 400, style: "normal" },
  ],
  icon: `data:image/png;base64,${icon.toString("base64")}`,
}));

function clip(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function headlineSize(text) {
  if (text.length <= 22) return 88;
  if (text.length <= 34) return 72;
  return 60;
}

/** 1200×630 WhatsApp / social preview for a referral link (JPEG bytes). */
export async function renderReferralImage({ label, code }) {
  const { fonts, icon } = await assets;
  const name = clip(label, 32);
  const headline = name ? `${name} invited you` : "Bills & payments, free for your shop";

  const card = (
    <div style={{ width: W, height: H, display: "flex", position: "relative", backgroundColor: FOREST, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          right: -160,
          top: -160,
          width: 620,
          height: 620,
          borderRadius: 310,
          backgroundImage: "radial-gradient(circle, rgba(200,232,106,0.28) 0%, rgba(200,232,106,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -120,
          bottom: -220,
          width: 520,
          height: 520,
          borderRadius: 260,
          backgroundImage: "radial-gradient(circle, rgba(52,211,153,0.22) 0%, rgba(52,211,153,0) 70%)",
        }}
      />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: W, height: H, padding: "56px 68px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={icon} alt="" width={60} height={60} style={{ borderRadius: 16 }} />
          <div style={{ fontFamily: "Sans", fontSize: 32, color: "#ffffff" }}>{APP_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Sans", fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: LIME }}>
            {name ? "You're invited" : "Free on Google Play"}
          </div>
          <div style={{ marginTop: 14, fontFamily: "Serif", fontSize: headlineSize(headline), lineHeight: 1.04, letterSpacing: -1, color: "#ffffff" }}>
            {headline}
          </div>
          <div style={{ marginTop: 18, fontFamily: "Sans", fontSize: 30, color: "rgba(255,255,255,0.74)" }}>
            Make bills, share on WhatsApp, collect UPI payments.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {code ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 30px",
                  borderRadius: 999,
                  backgroundColor: LIME,
                  color: FOREST,
                  fontFamily: "Sans",
                }}
              >
                <div style={{ fontSize: 22, letterSpacing: 4, marginRight: 16 }}>CODE</div>
                <div style={{ fontSize: 34 }}>{code}</div>
              </div>
              <div style={{ display: "flex", width: 30 }} />
              <div style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 38, color: LIME }}>
                {`${REFERRAL_DISCOUNT_PERCENT}% off the yearly website`}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: "Serif", fontStyle: "italic", fontSize: 38, color: LIME }}>Free for shops</div>
          )}
        </div>
      </div>
    </div>
  );

  const png = await new ImageResponse(card, { width: W, height: H, fonts }).arrayBuffer();
  return sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}
