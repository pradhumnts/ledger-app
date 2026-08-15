const NAME_FILLER =
  /^(my name is|name is|this is|customer is|naam hai|mera naam|नाम है|मेरा नाम है|मेरा नाम)\s+/i;

export function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function formatSpokenName(transcript) {
  let text = String(transcript || "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  text = text.replace(NAME_FILLER, "");
  if (/[अ-ह]/.test(text)) return text;
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatSpokenText(transcript) {
  return String(transcript || "").trim().replace(/\s+/g, " ");
}

export function transformSpeech(kind, transcript) {
  if (kind === "name") return formatSpokenName(transcript);
  return formatSpokenText(transcript);
}
