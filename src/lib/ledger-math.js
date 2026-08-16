/**
 * Money math for bills / deposits.
 *
 * All running totals are integer paise so 10.15 + 10.15 never drifts.
 * Rupee values at the edges are converted with rupeesToPaise / paiseToRupees.
 *
 * Outstanding (positive = shop is owed / "to collect"):
 *   invoice → due (legacy invoices without due count the full amount)
 *   got     → −amount (payments never use leftover-due for the running total)
 *   due/gave → amount
 *
 * Empty Due on a new bill is stored as 0 (already paid). Deposits cannot
 * exceed current owed, so a payment never creates a "to pay" (negative) balance.
 */

import { paiseToRupees, rupeesToPaise } from "./supabase/money.js";

export { paiseToRupees, rupeesToPaise };

export function collectablePaise(balancePaise) {
  return Math.max(0, Number(balancePaise) || 0);
}

export function collectableRupees(balance) {
  return paiseToRupees(collectablePaise(rupeesToPaise(balance)));
}

export function entryBilledPaise(entry) {
  if (!entry || entry.type === "got") return 0;
  return rupeesToPaise(entry.amount);
}

export function entryOutstandingPaise(entry) {
  if (!entry) return 0;
  if (entry.type === "got") return -rupeesToPaise(entry.amount);
  if (entry.type === "invoice") {
    return rupeesToPaise(entry.due ?? entry.amount);
  }
  return rupeesToPaise(entry.amount);
}

export function entryBilledAmount(entry) {
  return paiseToRupees(entryBilledPaise(entry));
}

export function entryOutstanding(entry) {
  return paiseToRupees(entryOutstandingPaise(entry));
}

export function customerBalancePaise(entries, customerId) {
  return (entries || []).reduce((sum, entry) => {
    if (entry.customerId !== customerId) return sum;
    return sum + entryOutstandingPaise(entry);
  }, 0);
}

export function customerBalance(entries, customerId) {
  return paiseToRupees(customerBalancePaise(entries, customerId));
}

export function customerTotals(entries, customerId) {
  const acc = (entries || []).reduce(
    (totals, entry) => {
      if (entry.customerId !== customerId) return totals;
      totals.billedPaise += entryBilledPaise(entry);
      totals.duePaise += entryOutstandingPaise(entry);
      return totals;
    },
    { billedPaise: 0, duePaise: 0 }
  );
  return {
    billed: paiseToRupees(acc.billedPaise),
    due: paiseToRupees(acc.duePaise),
    billedPaise: acc.billedPaise,
    duePaise: acc.duePaise,
  };
}

/** Shop-wide "to collect": sum of each customer's positive balance only. */
export function shopToCollect(customers, entries) {
  const paise = (customers || []).reduce((sum, customer) => {
    return sum + collectablePaise(customerBalancePaise(entries, customer.id));
  }, 0);
  return paiseToRupees(paise);
}

export function summarizeBilled(entries, now = new Date()) {
  const todayStart = startOfLocalDay(now).getTime();
  const monthStart = startOfLocalMonth(now).getTime();
  let todayPaise = 0;
  let monthPaise = 0;

  (entries || []).forEach((entry) => {
    const t = new Date(entry.date).getTime();
    if (!Number.isFinite(t)) return;
    const billed = entryBilledPaise(entry);
    if (t >= todayStart) todayPaise += billed;
    if (t >= monthStart) monthPaise += billed;
  });

  const todayBilled = paiseToRupees(todayPaise);
  const monthBilled = paiseToRupees(monthPaise);
  return {
    todayBilled,
    monthBilled,
    todayIn: 0,
    todayOut: todayBilled,
    todayNet: todayBilled,
    monthIn: 0,
    monthOut: monthBilled,
    monthNet: monthBilled,
  };
}

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfLocalMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Cap a deposit so it never exceeds what is currently owed.
 * leftover = owed − paid; never negative.
 */
export function applyDeposit({ owedPaise, amountPaise }) {
  const owed = collectablePaise(owedPaise);
  const requested = Math.max(0, Number(amountPaise) || 0);
  const paid = Math.min(requested, owed);
  return {
    paidPaise: paid,
    remainingPaise: owed - paid,
    capped: requested > owed,
    rejected: paid <= 0,
  };
}

/**
 * Bill amount and due are independent. Due is clamped to [0, billed].
 * Empty due is 0 (already paid), not a copy of amount.
 */
export function applyBill({ amountPaise, duePaise }) {
  const billed = Math.max(0, Number(amountPaise) || 0);
  const rawDue = Number(duePaise);
  const due = Number.isFinite(rawDue)
    ? Math.min(Math.max(0, rawDue), billed)
    : 0;
  return {
    billedPaise: billed,
    duePaise: due,
    rejected: billed <= 0,
  };
}

export function remainingAfterDeposit(owed, paid) {
  const result = applyDeposit({
    owedPaise: rupeesToPaise(owed),
    amountPaise: rupeesToPaise(paid),
  });
  return paiseToRupees(result.remainingPaise);
}

/**
 * Turn a user payload into canonical rupee amount/due for storage.
 * `currentOwedPaise` is required for deposits (`got`).
 */
export function prepareEntryAmounts(payload, currentOwedPaise = 0) {
  const type = payload?.type;

  if (type === "got") {
    const result = applyDeposit({
      owedPaise: currentOwedPaise,
      amountPaise: rupeesToPaise(payload.amount),
    });
    if (result.rejected) {
      return { rejected: true, amount: 0, due: paiseToRupees(result.remainingPaise) };
    }
    return {
      rejected: false,
      amount: paiseToRupees(result.paidPaise),
      due: paiseToRupees(result.remainingPaise),
      capped: result.capped,
    };
  }

  if (type === "invoice") {
    const dueRaw =
      payload.due === "" || payload.due == null ? 0 : payload.due;
    const bill = applyBill({
      amountPaise: rupeesToPaise(payload.amount),
      duePaise: rupeesToPaise(dueRaw),
    });
    if (bill.rejected) {
      return { rejected: true, amount: 0, due: 0 };
    }
    return {
      rejected: false,
      amount: paiseToRupees(bill.billedPaise),
      due: paiseToRupees(bill.duePaise),
    };
  }

  const amountPaise = rupeesToPaise(payload?.amount);
  if (amountPaise <= 0) {
    return { rejected: true, amount: 0, due: 0 };
  }
  const amount = paiseToRupees(amountPaise);
  return { rejected: false, amount, due: amount };
}

/** Apply one bill/deposit as the live app would, without ids or dates. */
export function applyLedgerEntry(entries, customerId, payload) {
  const owedPaise = customerBalancePaise(entries, customerId);
  const prepared = prepareEntryAmounts(payload, owedPaise);
  if (prepared.rejected) {
    return { entries, entry: null, rejected: true };
  }
  const entry = {
    customerId,
    type: payload.type,
    amount: prepared.amount,
    due: prepared.due,
  };
  return {
    entries: [entry, ...(entries || [])],
    entry,
    rejected: false,
  };
}

export function playLedger(customerId, payloads, startingEntries = []) {
  return payloads.reduce(
    (acc, payload) => {
      const next = applyLedgerEntry(acc.entries, customerId, payload);
      if (next.entry) acc.applied.push(next.entry);
      else acc.rejected.push(payload);
      acc.entries = next.entries;
      return acc;
    },
    { entries: [...startingEntries], applied: [], rejected: [] }
  );
}
