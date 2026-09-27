/* eslint-disable @next/next/no-img-element -- Satori renders plain <img>, not next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { GEIST_REGULAR_TTF_B64 } from "@/lib/og/geist-regular-b64";
import { getPalette, getTemplate } from "@/lib/sites/catalog";
import { SHARE_IMAGE_SIZE } from "@/lib/sites/config";
import { areaFrom, splitTitle } from "@/lib/sites/links";

const { width: W, height: H } = SHARE_IMAGE_SIZE;
const PHOTO_W = 600;
const FETCH_TIMEOUT_MS = 5000;

const fontDir = join(process.cwd(), "src/lib/og/fonts");
const fonts = Promise.all([
  readFile(join(fontDir, "InstrumentSerif-Regular.ttf")),
  readFile(join(fontDir, "InstrumentSerif-Italic.ttf")),
]).then(([serif, serifItalic]) => [
  { name: "Serif", data: serif, weight: 400, style: "normal" },
  { name: "Serif", data: serifItalic, weight: 400, style: "italic" },
  { name: "Sans", data: Buffer.from(GEIST_REGULAR_TTF_B64, "base64"), weight: 400, style: "normal" },
]);

function clip(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function rgba(hex, alpha) {
  const value = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

function nameSize(name) {
  if (name.length <= 12) return 96;
  if (name.length <= 20) return 80;
  if (name.length <= 28) return 64;
  return 52;
}

/** Satori only decodes PNG/JPEG, so every photo is re-encoded as a JPEG data URL. */
async function jpegDataUrl(src, origin, resize) {
  if (!src) return "";
  try {
    const response = await fetch(new URL(src, origin), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return "";
    const input = Buffer.from(await response.arrayBuffer());
    const output = await sharp(input)
      .resize({ ...resize, fit: "cover", position: "top" })
      .jpeg({ quality: 86 })
      .toBuffer();
    return `data:image/jpeg;base64,${output.toString("base64")}`;
  } catch {
    return "";
  }
}

/** 1200×630 link-preview card for a shop site (JPEG bytes). */
export async function renderShareImage(doc, { origin }) {
  const template = getTemplate(doc.templateId);
  const colors = getPalette(template, doc.paletteId).colors;
  const hero = doc.sections?.hero || {};
  const name = clip(doc.business?.name || "Our business", 40);
  const eyebrow = clip(hero.eyebrow, 44);
  const area = clip(areaFrom(doc.business?.address), 44);
  const [head, accent, tail] = splitTitle(clip(hero.title, 70));

  const [photo, logo] = await Promise.all([
    jpegDataUrl(hero.image, origin, { width: PHOTO_W * 2, height: H * 2 }),
    jpegDataUrl(doc.business?.logo, origin, { width: 112, height: 112 }),
  ]);

  const paper = colors.paper || "#ffffff";
  const card = (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        backgroundColor: colors.brand,
        overflow: "hidden",
      }}
    >
      {photo ? (
        <>
          <img
            src={photo}
            alt=""
            width={PHOTO_W}
            height={H}
            style={{ position: "absolute", top: 0, left: W - PHOTO_W, width: PHOTO_W, height: H }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: W - PHOTO_W,
              width: PHOTO_W,
              height: H,
              backgroundImage: `linear-gradient(90deg, ${colors.brand} 0%, ${rgba(colors.brand, 0.55)} 22%, ${rgba(colors.brand, 0)} 55%)`,
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            left: W - 480,
            top: -90,
            fontFamily: "Serif",
            fontStyle: "italic",
            fontSize: 820,
            lineHeight: 1,
            color: rgba(colors.accent, 0.16),
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: photo ? W - PHOTO_W + 60 : W - 200,
          height: H,
          padding: "58px 64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {logo ? (
            <img
              src={logo}
              alt=""
              width={56}
              height={56}
              style={{ borderRadius: 28, border: `2px solid ${rgba(paper, 0.25)}` }}
            />
          ) : null}
          {eyebrow ? (
            <div
              style={{
                fontFamily: "Sans",
                fontSize: 19,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: colors.accent,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Serif",
              fontSize: nameSize(name),
              lineHeight: 1.02,
              letterSpacing: -1,
              color: paper,
            }}
          >
            {name}
          </div>
          {head ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 22,
                fontFamily: "Serif",
                fontSize: 38,
                lineHeight: 1.15,
                color: rgba(paper, 0.82),
              }}
            >
              <span style={{ marginRight: 10 }}>{head}</span>
              {accent ? (
                <span style={{ marginRight: 10, fontStyle: "italic", color: colors.accent }}>
                  {accent}
                </span>
              ) : null}
              {tail ? <span>{tail}</span> : null}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", minHeight: 30 }}>
          {area ? (
            <>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginRight: 14,
                  backgroundColor: colors.accent,
                }}
              />
              <div style={{ fontFamily: "Sans", fontSize: 22, color: rgba(paper, 0.72) }}>
                {area}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  const png = await new ImageResponse(card, { ...SHARE_IMAGE_SIZE, fonts: await fonts }).arrayBuffer();
  return sharp(Buffer.from(png)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}
