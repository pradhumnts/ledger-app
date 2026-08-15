import { digitsOnly } from "@/lib/validation";

export function indianMobileDigits(value) {
  return digitsOnly(value).slice(-10);
}

export function toE164India(value) {
  const digits = indianMobileDigits(value);
  if (digits.length !== 10) return "";
  return `+91${digits}`;
}
