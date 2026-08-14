export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function validateRequiredName(value) {
  const name = String(value || "").trim();
  if (!name) return "validation.nameRequired";
  if (name.length < 2) return "validation.nameTooShort";
  return "";
}

export function validateOptionalName(value) {
  const name = String(value || "").trim();
  if (!name) return "";
  if (name.length < 2) return "validation.nameTooShort";
  return "";
}

export function validateRequiredPhone(value) {
  const digits = digitsOnly(value);
  if (!digits) return "validation.phoneRequired";
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return "validation.phoneInvalid";
  }
  return "";
}

export function validateOptionalPhone(value) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return "validation.phoneInvalid";
  }
  return "";
}

export function validateAmount(value, { required = true } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw) return required ? "validation.amountRequired" : "";
  const num = Number(raw);
  if (!Number.isFinite(num)) return "validation.amountInvalid";
  if (num <= 0) return "validation.amountPositive";
  return "";
}

export function validateDate(value) {
  if (!String(value || "").trim()) return "validation.dateRequired";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "validation.dateInvalid";
  return "";
}

export function validateOptionalUpi(value) {
  const upi = String(value || "").trim();
  if (!upi) return "";
  if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/.test(upi)) {
    return "validation.upiInvalid";
  }
  return "";
}

export function collectErrors(fields) {
  const errors = {};
  for (const [key, message] of Object.entries(fields)) {
    if (message) errors[key] = message;
  }
  return errors;
}

export function focusFirstError(errors, idMap = {}) {
  const first = Object.keys(errors)[0];
  if (!first) return;
  const id = idMap[first] || first;
  requestAnimationFrame(() => {
    document.getElementById(id)?.focus();
  });
}

export function fieldInvalidClass(hasError) {
  return hasError
    ? "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 dark:border-rose-400 dark:focus-visible:border-rose-400"
    : "";
}
