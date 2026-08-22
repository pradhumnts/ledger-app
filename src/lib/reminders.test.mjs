import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addDaysYmd, istDayUtcRange, istYmd } from "./ist.js";
import { pickOldDueCustomers, pickUnsharedBills } from "./reminders.js";

describe("ist calendar helpers", () => {
  it("formats an instant as an IST calendar date", () => {
    assert.equal(istYmd("2026-08-21T20:00:00+05:30"), "2026-08-21");
    assert.equal(istYmd("2026-08-21T18:30:00.000Z"), "2026-08-22");
  });

  it("maps 8pm IST and 3pm IST onto UTC cron minutes", () => {
    const { start, end } = istDayUtcRange("2026-08-22");
    assert.equal(start, "2026-08-21T18:30:00.000Z");
    assert.equal(end, "2026-08-22T18:30:00.000Z");
    assert.equal(addDaysYmd("2026-08-22", -7), "2026-08-15");
  });
});

describe("unshared bill reminder", () => {
  it("keeps today's unshared invoices and drops the rest", () => {
    const picked = pickUnsharedBills({
      todayYmd: "2026-08-22",
      sharedIds: ["ent_shared"],
      invoices: [
        { externalId: "ent_a", customerExternalId: "cus_a", createdYmd: "2026-08-22" },
        { externalId: "ent_shared", customerExternalId: "cus_b", createdYmd: "2026-08-22" },
        { externalId: "ent_old", customerExternalId: "cus_c", createdYmd: "2026-08-21" },
      ],
    });
    assert.deepEqual(
      picked.map((row) => row.externalId),
      ["ent_a"]
    );
  });
});

describe("old due reminder", () => {
  const todayYmd = "2026-08-22";
  const nowMs = Date.parse("2026-08-22T15:00:00+05:30");

  it("picks a customer who still owes and has been quiet for a week", () => {
    const picked = pickOldDueCustomers({
      todayYmd,
      nowMs,
      remindedAtByCustomer: {},
      customers: [{ externalId: "cus_a", name: "Neha", outstandingPaise: 50000 }],
      entries: [
        {
          customerId: "cus_a",
          type: "invoice",
          date: "2026-08-10",
        },
      ],
    });
    assert.equal(picked.length, 1);
    assert.equal(picked[0].externalId, "cus_a");
  });

  it("skips a customer paid this week, reminded this week, or billed recently", () => {
    const base = {
      todayYmd,
      nowMs,
      customers: [{ externalId: "cus_a", name: "Neha", outstandingPaise: 50000 }],
    };
    assert.equal(
      pickOldDueCustomers({
        ...base,
        remindedAtByCustomer: {},
        entries: [
          { customerId: "cus_a", type: "invoice", date: "2026-08-10" },
          { customerId: "cus_a", type: "got", date: "2026-08-20" },
        ],
      }).length,
      0
    );
    assert.equal(
      pickOldDueCustomers({
        ...base,
        remindedAtByCustomer: { cus_a: "2026-08-20T09:30:00.000Z" },
        entries: [{ customerId: "cus_a", type: "invoice", date: "2026-08-10" }],
      }).length,
      0
    );
    assert.equal(
      pickOldDueCustomers({
        ...base,
        remindedAtByCustomer: {},
        entries: [{ customerId: "cus_a", type: "invoice", date: "2026-08-20" }],
      }).length,
      0
    );
  });
});
