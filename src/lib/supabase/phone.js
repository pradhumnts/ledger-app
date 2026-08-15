import { digitsOnly } from "../validation.js";

export function indianMobileDigits(value) {
  return digitsOnly(value).slice(-10);
}

export function toE164India(value) {
  const digits = indianMobileDigits(value);
  if (digits.length !== 10) return "";
  return `+91${digits}`;
}

export function sameIndianMobile(left, right) {
  const a = indianMobileDigits(left);
  const b = indianMobileDigits(right);
  return a.length === 10 && a === b;
}

export function shopLoginEmail(phone) {
  const digits = indianMobileDigits(phone);
  return digits.length === 10 ? `${digits}@phone.moneykit.app` : "";
}
