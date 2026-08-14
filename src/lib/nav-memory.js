const PATH = "ledger-path";
const PREV = "ledger-prev";

function originKey(customerId) {
  return `ledger-customer-origin:${customerId}`;
}

export function rememberPath(pathname) {
  if (typeof window === "undefined" || !pathname) return;
  try {
    const current = sessionStorage.getItem(PATH);
    if (current && current !== pathname) {
      sessionStorage.setItem(PREV, current);
    }
    sessionStorage.setItem(PATH, pathname);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getPreviousPath() {
  try {
    return sessionStorage.getItem(PREV) || "";
  } catch {
    return "";
  }
}

export function rememberCustomerOrigin(customerId, pathname) {
  if (typeof window === "undefined" || !customerId) return;
  const prev = getPreviousPath();
  if (prev.startsWith(`/customers/${customerId}/`)) return;
  const origin = prev && prev !== pathname ? prev : "/customers";
  try {
    sessionStorage.setItem(originKey(customerId), origin);
  } catch {
    /* ignore */
  }
}

export function getCustomerOrigin(customerId) {
  try {
    return sessionStorage.getItem(originKey(customerId)) || "/customers";
  } catch {
    return "/customers";
  }
}
