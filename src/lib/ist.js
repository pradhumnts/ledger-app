export const IST_TIME_ZONE = "Asia/Kolkata";

/**
 * Calendar date in India (YYYY-MM-DD). IST has no daylight saving.
 * @param {Date|string|number} [value]
 */
export function istYmd(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return istYmd(new Date());
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Add whole calendar days to a YYYY-MM-DD string. */
export function addDaysYmd(ymd, days) {
  const [year, month, day] = String(ymd)
    .split("-")
    .map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

/**
 * UTC range covering one IST calendar day.
 * 8pm IST = 14:30 UTC; 3pm IST = 09:30 UTC.
 */
export function istDayUtcRange(ymd) {
  const next = addDaysYmd(ymd, 1);
  return {
    start: new Date(`${ymd}T00:00:00+05:30`).toISOString(),
    end: new Date(`${next}T00:00:00+05:30`).toISOString(),
  };
}
