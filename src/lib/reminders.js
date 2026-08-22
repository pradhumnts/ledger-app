import { addDaysYmd } from "./ist.js";

export const OLD_DUE_DAYS = 7;

function entryId(row) {
  return row.externalId || row.external_id || row.id || "";
}

function customerId(row) {
  return row.customerExternalId || row.customer_external_id || row.customerId || "";
}

function kindOf(row) {
  return row.kind || row.type || "";
}

function occurredOn(row) {
  return String(row.occurredOn || row.occurred_on || row.date || "").slice(0, 10);
}

/**
 * Invoices created on this IST day that have not been shared yet.
 * @param {{
 *   invoices: Array<{ externalId?: string, id?: string, customerExternalId?: string, customerId?: string, createdYmd: string }>,
 *   sharedIds: Iterable<string>,
 *   todayYmd: string,
 * }} args
 */
export function pickUnsharedBills({ invoices, sharedIds, todayYmd }) {
  const shared = new Set(sharedIds);
  return (invoices || []).filter((row) => {
    const id = entryId(row);
    if (!id || shared.has(id)) return false;
    return row.createdYmd === todayYmd;
  });
}

/**
 * Customers who still owe, have at least one bill/due ≥ 7 days old,
 * have not received a payment in those 7 days, and were not reminded
 * in the last week. Daily 3pm scan is fine: a shop may get a ping
 * every day if a *different* customer crosses 7 days.
 *
 * @param {{
 *   customers: Array<{ externalId: string, name?: string, outstandingPaise: number }>,
 *   entries: Array<{ customerId?: string, customerExternalId?: string, type?: string, kind?: string, date?: string, occurredOn?: string, amount?: number, due?: number }>,
 *   remindedAtByCustomer: Record<string, string | null | undefined>,
 *   todayYmd: string,
 *   nowMs: number,
 * }} args
 */
export function pickOldDueCustomers({
  customers,
  entries,
  remindedAtByCustomer,
  todayYmd,
  nowMs,
}) {
  const weekAgoYmd = addDaysYmd(todayYmd, -OLD_DUE_DAYS);
  const weekAgoMs = nowMs - OLD_DUE_DAYS * 24 * 60 * 60 * 1000;
  const byCustomer = new Map();

  for (const entry of entries || []) {
    const id = customerId(entry);
    if (!id) continue;
    if (!byCustomer.has(id)) byCustomer.set(id, []);
    byCustomer.get(id).push(entry);
  }

  return (customers || []).filter((customer) => {
    if (!customer?.externalId) return false;
    if (!(Number(customer.outstandingPaise) > 0)) return false;

    const lastReminded = remindedAtByCustomer?.[customer.externalId];
    if (lastReminded) {
      const at = new Date(lastReminded).getTime();
      if (Number.isFinite(at) && at > weekAgoMs) return false;
    }

    const history = byCustomer.get(customer.externalId) || [];
    let latestChargeYmd = "";
    let paidThisWeek = false;
    for (const entry of history) {
      const day = occurredOn(entry);
      if (!day) continue;
      if (kindOf(entry) === "got") {
        if (day > weekAgoYmd) paidThisWeek = true;
        continue;
      }
      if (day > latestChargeYmd) latestChargeYmd = day;
    }
    if (paidThisWeek) return false;
    if (!latestChargeYmd || latestChargeYmd > weekAgoYmd) return false;
    return true;
  });
}
