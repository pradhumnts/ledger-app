export function rupeesToPaise(amount) {
  const rupees = Number(amount);
  if (!Number.isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise) {
  const value = Number(paise);
  if (!Number.isFinite(value)) return 0;
  return value / 100;
}

/** Maps the live app entry.type to the DB enum `kind`. */
export function entryTypeToKind(type) {
  if (type === "invoice" || type === "got" || type === "due" || type === "gave") {
    return type;
  }
  return "invoice";
}

/** Paise fields written to `entries` — must match customer_totals view. */
export function entryBackupPaise(entry) {
  const kind = entryTypeToKind(entry?.type);
  const amountPaise = rupeesToPaise(entry?.amount);
  if (kind === "invoice") {
    return {
      kind,
      amountPaise,
      duePaise: rupeesToPaise(entry?.due ?? entry?.amount),
    };
  }
  if (kind === "got") {
    return {
      kind,
      amountPaise,
      duePaise: rupeesToPaise(entry?.due ?? 0),
    };
  }
  return { kind, amountPaise, duePaise: amountPaise };
}

export function entryFromBackupPaise(row, customerExternalId) {
  return {
    id: row.external_id,
    customerId: customerExternalId,
    type: row.kind,
    amount: paiseToRupees(row.amount_paise),
    due: paiseToRupees(row.due_paise),
    description: row.description || "",
    date: row.occurred_on,
    createdAt: row.created_at,
  };
}
