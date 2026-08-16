import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyBill,
  applyDeposit,
  applyLedgerEntry,
  collectableRupees,
  customerBalance,
  customerTotals,
  entryBilledAmount,
  entryOutstanding,
  entryOutstandingPaise,
  playLedger,
  remainingAfterDeposit,
  shopToCollect,
  summarizeBilled,
  paiseToRupees,
  rupeesToPaise,
} from "./ledger-math.js";
import {
  entryBackupPaise,
  entryFromBackupPaise,
} from "./supabase/money.js";
import {
  parseMoney,
  validateAmount,
  validateDeposit,
  validateDue,
} from "./validation.js";
import { buildUpiPaymentUrl } from "./upi.js";
import { pickShopOwnerId } from "./supabase/ensure-shop-user.js";
import {
  sameIndianMobile,
  shopLoginEmail,
  toE164India,
} from "./supabase/phone.js";
import { getPaidTheme } from "./theme-catalog.js";

const A = "cus_a";
const B = "cus_b";

function bill(amount, due, customerId = A) {
  return { customerId, type: "invoice", amount, due };
}

function deposit(amount, customerId = A) {
  return { customerId, type: "got", amount };
}

function totalsOf(entries, id = A) {
  const t = customerTotals(entries, id);
  return {
    billed: t.billed,
    due: t.due,
    balance: customerBalance(entries, id),
    collectable: collectableRupees(customerBalance(entries, id)),
  };
}

function sqlViewOutstandingPaise(entry) {
  const { kind, amountPaise, duePaise } = entryBackupPaise(entry);
  if (kind === "got") return -amountPaise;
  if (kind === "invoice") return duePaise;
  return amountPaise;
}

describe("paise conversion", () => {
  it("round-trips whole rupees exactly", () => {
    for (const rupees of [0, 1, 40, 500, 1500, 2000, 99999]) {
      assert.equal(paiseToRupees(rupeesToPaise(rupees)), rupees);
    }
  });

  it("rounds half paise to nearest paise, not to whole rupees", () => {
    assert.equal(rupeesToPaise(10.5), 1050);
    assert.equal(rupeesToPaise(10.555), 1056);
    assert.equal(paiseToRupees(1050), 10.5);
  });

  it("treats garbage as 0", () => {
    assert.equal(rupeesToPaise("nope"), 0);
    assert.equal(rupeesToPaise(NaN), 0);
    assert.equal(rupeesToPaise(undefined), 0);
    assert.equal(paiseToRupees(undefined), 0);
  });
});

describe("bill: amount and due are independent", () => {
  it("₹2000 billed with empty due is fully paid (due 0)", () => {
    const { entries } = playLedger(A, [bill(2000, "")]);
    assert.deepEqual(totalsOf(entries), {
      billed: 2000,
      due: 0,
      balance: 0,
      collectable: 0,
    });
  });

  it("₹2000 billed with due omitted is stored as due 0", () => {
    const { entries } = playLedger(A, [{ type: "invoice", amount: 2000 }]);
    assert.deepEqual(totalsOf(entries), {
      billed: 2000,
      due: 0,
      balance: 0,
      collectable: 0,
    });
  });

  it("₹2000 billed, ₹500 due → collect 500, billed 2000", () => {
    const { entries } = playLedger(A, [bill(2000, 500)]);
    assert.deepEqual(totalsOf(entries), {
      billed: 2000,
      due: 500,
      balance: 500,
      collectable: 500,
    });
  });

  it("₹2000 billed, due 2000 → full unpaid", () => {
    const { entries } = playLedger(A, [bill(2000, 2000)]);
    assert.equal(customerBalance(entries, A), 2000);
    assert.equal(customerTotals(entries, A).billed, 2000);
  });

  it("clamps due above amount down to billed", () => {
    const { entries, entry } = applyLedgerEntry([], A, bill(2000, 2500));
    assert.equal(entry.due, 2000);
    assert.equal(customerBalance(entries, A), 2000);
  });

  it("rejects zero or negative bills", () => {
    assert.equal(applyLedgerEntry([], A, bill(0, 0)).entry, null);
    assert.equal(applyLedgerEntry([], A, bill(-100, 0)).entry, null);
  });

  it("legacy invoice without due field still counts full amount outstanding", () => {
    const legacy = [{ customerId: A, type: "invoice", amount: 2000 }];
    assert.equal(entryOutstanding(legacy[0]), 2000);
    assert.equal(customerBalance(legacy, A), 2000);
  });
});

describe("deposit due: never overpay, never create To Pay", () => {
  it("the original bug: bill 2000 due 500, then deposit 1500 cannot go negative", () => {
    const first = playLedger(A, [bill(2000, 500)]);
    assert.equal(customerBalance(first.entries, A), 500);

    const over = applyLedgerEntry(first.entries, A, deposit(1500));
    assert.equal(over.entry.amount, 500);
    assert.equal(over.entry.due, 0);
    assert.equal(customerBalance(over.entries, A), 0);
    assert.equal(collectableRupees(customerBalance(over.entries, A)), 0);
  });

  it("exact deposit clears the balance", () => {
    const { entries } = playLedger(A, [bill(2000, 500), deposit(500)]);
    assert.deepEqual(totalsOf(entries), {
      billed: 2000,
      due: 0,
      balance: 0,
      collectable: 0,
    });
  });

  it("partial deposit leaves leftover = owed − paid", () => {
    const { entries, applied } = playLedger(A, [bill(2000, 500), deposit(200)]);
    assert.equal(applied[1].due, 300);
    assert.equal(customerBalance(entries, A), 300);
    assert.equal(remainingAfterDeposit(500, 200), 300);
  });

  it("rejects deposit when nothing is owed", () => {
    const paidBill = playLedger(A, [bill(2000, 0)]);
    const result = applyLedgerEntry(paidBill.entries, A, deposit(500));
    assert.equal(result.entry, null);
    assert.equal(customerBalance(result.entries, A), 0);
  });

  it("rejects zero / empty / NaN deposits", () => {
    const owed = playLedger(A, [bill(1000, 400)]);
    assert.equal(applyLedgerEntry(owed.entries, A, deposit(0)).entry, null);
    assert.equal(applyLedgerEntry(owed.entries, A, deposit("")).entry, null);
    assert.equal(applyLedgerEntry(owed.entries, A, deposit("abc")).entry, null);
  });

  it("ignores a caller-supplied leftover due and recomputes from the ledger", () => {
    const owed = playLedger(A, [bill(2000, 500)]);
    const result = applyLedgerEntry(owed.entries, A, {
      type: "got",
      amount: 200,
      due: 9999,
    });
    assert.equal(result.entry.due, 300);
    assert.equal(customerBalance(result.entries, A), 300);
  });
});

describe("multi-bill and multi-deposit sequences", () => {
  it("two bills stack due independently of billed", () => {
    const { entries } = playLedger(A, [bill(2000, 500), bill(1000, 1000)]);
    assert.deepEqual(totalsOf(entries), {
      billed: 3000,
      due: 1500,
      balance: 1500,
      collectable: 1500,
    });
  });

  it("deposit against stacked bills reduces the running due", () => {
    const { entries } = playLedger(A, [
      bill(2000, 500),
      bill(1000, 1000),
      deposit(400),
    ]);
    assert.equal(customerBalance(entries, A), 1100);
    assert.equal(customerTotals(entries, A).billed, 3000);
  });

  it("bill → partial deposit → another bill", () => {
    const { entries } = playLedger(A, [
      bill(2000, 500),
      deposit(200),
      bill(1000, 1000),
    ]);
    assert.equal(customerBalance(entries, A), 1300);
  });

  it("several deposits can fully settle", () => {
    const { entries } = playLedger(A, [
      bill(5000, 1800),
      deposit(500),
      deposit(500),
      deposit(800),
    ]);
    assert.equal(customerBalance(entries, A), 0);
    assert.equal(customerTotals(entries, A).billed, 5000);
  });
});

describe("customers are isolated; shop to-collect is sum of positives", () => {
  it("entries on B do not change A's balance", () => {
    let { entries } = playLedger(A, [bill(2000, 500)]);
    const b = playLedger(B, [bill(900, 900)], entries);
    assert.equal(customerBalance(b.entries, A), 500);
    assert.equal(customerBalance(b.entries, B), 900);
  });

  it("home to-collect sums only money the shop is owed", () => {
    let { entries } = playLedger(A, [bill(2000, 500)]);
    entries = playLedger(B, [bill(1000, 0)], entries).entries;
    const customers = [{ id: A }, { id: B }, { id: "cus_empty" }];
    assert.equal(shopToCollect(customers, entries), 500);
  });

  it("legacy negative balance is not subtracted from shop to-collect", () => {
    const entries = [
      { customerId: A, type: "invoice", amount: 100, due: 100 },
      { customerId: B, type: "got", amount: 50 },
    ];
    assert.equal(customerBalance(entries, B), -50);
    assert.equal(shopToCollect([{ id: A }, { id: B }], entries), 100);
  });
});

describe("legacy due / gave entries", () => {
  it("a due note increases billed and outstanding by the same amount", () => {
    const { entries } = playLedger(A, [{ type: "due", amount: 750 }]);
    assert.equal(entryBilledAmount(entries[0]), 750);
    assert.equal(entryOutstanding(entries[0]), 750);
    assert.equal(customerBalance(entries, A), 750);
  });

  it("a deposit can clear a legacy due note", () => {
    const { entries } = playLedger(A, [
      { type: "gave", amount: 400 },
      deposit(400),
    ]);
    assert.equal(customerBalance(entries, A), 0);
  });
});

describe("float rupees stay exact via paise", () => {
  it("10.15 + 10.15 = 20.30, not 20.299999999", () => {
    const { entries } = playLedger(A, [bill(10.15, 10.15), bill(10.15, 10.15)]);
    assert.equal(customerBalance(entries, A), 20.3);
    assert.equal(customerTotals(entries, A).billed, 20.3);
  });

  it("deposit of 0.1 against 0.3 leaves 0.2", () => {
    const { entries } = playLedger(A, [bill(1, 0.3), deposit(0.1)]);
    assert.equal(customerBalance(entries, A), 0.2);
  });
});

describe("today / month billed ignores payments", () => {
  it("deposits do not inflate billed totals", () => {
    const now = new Date("2026-08-15T10:00:00");
    const entries = [
      { customerId: A, type: "invoice", amount: 2000, due: 500, date: now.toISOString() },
      { customerId: A, type: "got", amount: 200, due: 300, date: now.toISOString() },
    ];
    const summary = summarizeBilled(entries, now);
    assert.equal(summary.todayBilled, 2000);
    assert.equal(summary.monthBilled, 2000);
  });
});

describe("cloud backup paise matches live outstanding", () => {
  it("round-trips bill + deposit through paise fields", () => {
    const { entries } = playLedger(A, [bill(2000, 500), deposit(200)]);
    const restored = entries.map((entry, index) => {
      const backup = entryBackupPaise(entry);
      return entryFromBackupPaise(
        {
          external_id: `e${index}`,
          kind: backup.kind,
          amount_paise: backup.amountPaise,
          due_paise: backup.duePaise,
          description: "",
          occurred_on: "2026-08-15",
          created_at: "2026-08-15T00:00:00.000Z",
        },
        A
      );
    });
    assert.equal(customerBalance(restored, A), customerBalance(entries, A));
    assert.equal(customerTotals(restored, A).billed, 2000);
  });

  it("SQL customer_totals outstanding formula matches JS", () => {
    const { entries } = playLedger(A, [
      bill(2000, 500),
      bill(800, 0),
      deposit(125),
      { type: "due", amount: 50 },
    ]);
    const js = entries.reduce((sum, entry) => sum + entryOutstandingPaise(entry), 0);
    const sql = entries.reduce((sum, entry) => sum + sqlViewOutstandingPaise(entry), 0);
    assert.equal(js, sql);
    assert.equal(paiseToRupees(js), customerBalance(entries, A));
  });
});

describe("applyBill / applyDeposit primitives", () => {
  it("empty due is 0 outstanding, not a copy of amount", () => {
    assert.deepEqual(applyBill({ amountPaise: 200000, duePaise: 0 }), {
      billedPaise: 200000,
      duePaise: 0,
      rejected: false,
    });
  });

  it("deposit leftover is owed minus paid in paise", () => {
    assert.deepEqual(applyDeposit({ owedPaise: 50000, amountPaise: 20000 }), {
      paidPaise: 20000,
      remainingPaise: 30000,
      capped: false,
      rejected: false,
    });
  });

  it("over-deposit is capped, leftover 0, never negative", () => {
    const result = applyDeposit({ owedPaise: 50000, amountPaise: 150000 });
    assert.equal(result.paidPaise, 50000);
    assert.equal(result.remainingPaise, 0);
    assert.equal(result.capped, true);
    assert.equal(result.rejected, false);
  });
});

describe("form validation matches ledger rules", () => {
  it("parseMoney accepts Indian grouping commas", () => {
    assert.equal(parseMoney("1,500"), 1500);
  });

  it("rejects empty, zero, and non-numeric amounts", () => {
    assert.equal(validateAmount(""), "validation.amountRequired");
    assert.equal(validateAmount("0"), "validation.amountPositive");
    assert.equal(validateAmount("abc"), "validation.amountInvalid");
  });

  it("deposit cannot exceed current owed", () => {
    assert.equal(validateDeposit("1500", 500), "validation.depositTooLarge");
    assert.equal(validateDeposit("500", 500), "");
    assert.equal(validateDeposit("1", 0), "validation.nothingDue");
  });

  it("due cannot exceed billed amount", () => {
    assert.equal(validateDue("2500", "2000"), "validation.dueTooLarge");
    assert.equal(validateDue("500", "2000"), "");
    assert.equal(validateDue("", "2000"), "");
    assert.equal(validateDue("-1", "2000"), "validation.dueNegative");
  });

  it("compares deposit vs owed in paise so 10.15 is not rejected as 10.1500001", () => {
    assert.equal(validateDeposit("10.15", 10.15), "");
  });
});

describe("UPI pay amount", () => {
  it("omits am when amount is empty or zero", () => {
    const url = buildUpiPaymentUrl({ upiId: "shop@upi", name: "Shop", amount: "" });
    assert.equal(url.includes("am="), false);
  });

  it("sends amount with two decimal places", () => {
    const url = buildUpiPaymentUrl({
      upiId: "shop@upi",
      name: "Shop",
      amount: 500,
    });
    assert.match(url, /am=500\.00/);
  });
});

describe("shop login identity", () => {
  it("treats +91 and 10-digit forms as the same mobile", () => {
    assert.equal(sameIndianMobile("+919876543210", "9876543210"), true);
    assert.equal(sameIndianMobile("919876543210", "9876543210"), true);
    assert.equal(sameIndianMobile("9876543210", "9876543211"), false);
    assert.equal(toE164India("9876543210"), "+919876543210");
    assert.equal(shopLoginEmail("9876543210"), "9876543210@phone.moneykit.app");
  });

  it("signs into the shop that already has billing data", () => {
    const emptyNew = {
      id: "new",
      entries: 0,
      customers: 0,
      onboarded: false,
      createdAt: "2026-08-15T00:00:00Z",
    };
    const oldShop = {
      id: "old",
      entries: 4,
      customers: 2,
      onboarded: true,
      createdAt: "2026-08-01T00:00:00Z",
    };
    assert.equal(pickShopOwnerId([emptyNew, oldShop]), "old");
  });
});

describe("paid theme catalog", () => {
  it("sells paid themes at catalog paise and rejects free ones", () => {
    assert.equal(getPaidTheme("bill", "classic"), null);
    assert.equal(getPaidTheme("bill", "navy")?.amountPaise, 2000);
    assert.equal(getPaidTheme("qr", "salon")?.amountPaise, 4000);
    assert.equal(getPaidTheme("qr", "missing"), null);
  });
});
