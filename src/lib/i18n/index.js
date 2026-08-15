import { messages } from "./messages";

/** @typedef {'en'|'hi'|'hinglish'} AppLanguage */

export const LANGUAGES = [
  {
    id: "en",
    labelKey: "language.english",
    descKey: "language.englishDesc",
  },
  {
    id: "hi",
    labelKey: "language.hindi",
    descKey: "language.hindiDesc",
  },
  {
    id: "hinglish",
    labelKey: "language.hinglish",
    descKey: "language.hinglishDesc",
  },
];

export const DEFAULT_LANGUAGE = "en";

/**
 * @param {string} language
 * @returns {AppLanguage}
 */
export function normalizeLanguage(language) {
  if (language === "hi" || language === "hinglish") return language;
  return "en";
}

/**
 * @param {AppLanguage} language
 */
export function getHtmlLang(language) {
  return language === "hi" ? "hi" : "en";
}

/**
 * @param {AppLanguage} language
 */
export function getIntlLocale(language) {
  return language === "hi" ? "hi-IN" : "en-IN";
}

/**
 * @param {AppLanguage} language
 */
export function getSpeechLang(language) {
  return normalizeLanguage(language) === "en" ? "en-IN" : "hi-IN";
}

/**
 * @param {AppLanguage} language
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 */
export function translate(language, key, vars = {}) {
  const locale = messages[normalizeLanguage(language)] || messages.en;
  let value = key.split(".").reduce((obj, part) => obj?.[part], locale);
  if (typeof value !== "string") {
    value = key.split(".").reduce((obj, part) => obj?.[part], messages.en);
  }
  if (typeof value !== "string") return key;
  return value.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  );
}

/**
 * @param {AppLanguage} language
 * @param {'bill'|'qr'} kind
 * @param {string} id
 */
export function themeLabel(language, kind, id, field = "name") {
  return translate(language, `themes.${kind}.${id}.${field}`);
}

/**
 * @param {AppLanguage} language
 * @param {string} planId
 */
export function websitePlanLabel(language, planId, field = "title") {
  const key =
    planId === "website-booking"
      ? `website.websiteBooking${field === "tagline" ? "Tagline" : ""}`
      : `website.website${field === "tagline" ? "Tagline" : ""}`;
  if (field === "tagline") {
    return translate(
      language,
      planId === "website-booking"
        ? "website.websiteBookingTagline"
        : "website.websiteTagline"
    );
  }
  return translate(
    language,
    planId === "website-booking" ? "website.websiteBooking" : "website.website"
  );
}
