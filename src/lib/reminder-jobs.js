import { istDayUtcRange, istYmd } from "@/lib/ist";
import {
  oldDueNotification,
  testNotification,
  unsharedNotification,
} from "@/lib/reminder-copy";
import {
  pickOldDueCustomers,
  pickUnsharedBills,
} from "@/lib/reminders";
import { sendToUserSubscriptions } from "@/lib/web-push";

function groupBy(rows, key) {
  const map = new Map();
  for (const row of rows || []) {
    const id = row[key];
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(row);
  }
  return map;
}

async function subscribedUsers(admin) {
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth");
  if (error) throw error;
  const subscriptions = data || [];
  return {
    subscriptions,
    userIds: [...new Set(subscriptions.map((row) => row.user_id))],
    byUser: groupBy(subscriptions, "user_id"),
  };
}

async function languagesFor(admin, userIds) {
  if (!userIds.length) return {};
  const { data, error } = await admin
    .from("settings")
    .select("user_id, language")
    .in("user_id", userIds);
  if (error) throw error;
  return Object.fromEntries(
    (data || []).map((row) => [row.user_id, row.language || "en"])
  );
}

function outstandingFromEntries(entries) {
  return (entries || []).reduce((sum, row) => {
    if (row.kind === "got") return sum - Number(row.amount_paise || 0);
    if (row.kind === "invoice") return sum + Number(row.due_paise || 0);
    return sum + Number(row.amount_paise || 0);
  }, 0);
}

export async function sendUnsharedBillReminders(admin) {
  const todayYmd = istYmd();
  const { start, end } = istDayUtcRange(todayYmd);
  const { userIds, byUser } = await subscribedUsers(admin);
  if (!userIds.length) return { sent: 0, shops: 0 };

  const { data: already, error: alreadyError } = await admin
    .from("notification_receipts")
    .select("user_id")
    .eq("kind", "unshared")
    .eq("sent_on", todayYmd)
    .in("user_id", userIds);
  if (alreadyError) throw alreadyError;
  const done = new Set((already || []).map((row) => row.user_id));
  const pending = userIds.filter((id) => !done.has(id));
  if (!pending.length) return { sent: 0, shops: 0 };

  const [{ data: invoices, error: invoiceError }, { data: shares, error: shareError }, { data: customerRows, error: customerError }] =
    await Promise.all([
      admin
        .from("entries")
        .select("user_id, external_id, customer_id, created_at")
        .eq("kind", "invoice")
        .is("voided_at", null)
        .gte("created_at", start)
        .lt("created_at", end)
        .in("user_id", pending),
      admin
        .from("entry_shares")
        .select("user_id, entry_external_id")
        .in("user_id", pending),
      admin
        .from("customers")
        .select("id, user_id, external_id, name")
        .in("user_id", pending)
        .is("deleted_at", null),
    ]);
  if (invoiceError) throw invoiceError;
  if (shareError) throw shareError;
  if (customerError) throw customerError;

  const languageByUser = await languagesFor(admin, pending);
  const invoicesByUser = groupBy(invoices, "user_id");
  const sharesByUser = groupBy(shares, "user_id");
  const customersByUuid = Object.fromEntries(
    (customerRows || []).map((row) => [row.id, row])
  );
  const customersByUser = groupBy(customerRows, "user_id");

  let sent = 0;
  let shops = 0;
  for (const userId of pending) {
    const bills = pickUnsharedBills({
      todayYmd,
      sharedIds: (sharesByUser.get(userId) || []).map(
        (row) => row.entry_external_id
      ),
      invoices: (invoicesByUser.get(userId) || []).map((row) => ({
        externalId: row.external_id,
        customerExternalId: customersByUuid[row.customer_id]?.external_id,
        createdYmd: istYmd(row.created_at),
      })),
    }).filter((row) => row.customerExternalId);
    if (!bills.length) continue;

    const customersById = Object.fromEntries(
      (customersByUser.get(userId) || []).map((row) => [
        row.external_id,
        { name: row.name },
      ])
    );
    const payload = unsharedNotification(
      languageByUser[userId] || "en",
      bills,
      customersById
    );
    const n = await sendToUserSubscriptions(
      admin,
      byUser.get(userId) || [],
      payload
    );
    if (!n) continue;

    const { error: receiptError } = await admin
      .from("notification_receipts")
      .insert({
        user_id: userId,
        kind: "unshared",
        sent_on: todayYmd,
      });
    if (receiptError && receiptError.code !== "23505") throw receiptError;
    sent += n;
    shops += 1;
  }

  return { sent, shops };
}

export async function sendOldDueReminders(admin) {
  const todayYmd = istYmd();
  const nowMs = Date.now();
  const weekAgoIso = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { userIds, byUser } = await subscribedUsers(admin);
  if (!userIds.length) return { sent: 0, shops: 0 };

  const [{ data: customerRows, error: customerError }, { data: entryRows, error: entryError }, { data: receipts, error: receiptError }] =
    await Promise.all([
      admin
        .from("customers")
        .select("id, user_id, external_id, name")
        .in("user_id", userIds)
        .is("deleted_at", null),
      admin
        .from("entries")
        .select("user_id, customer_id, kind, occurred_on, amount_paise, due_paise")
        .in("user_id", userIds)
        .is("voided_at", null),
      admin
        .from("notification_receipts")
        .select("user_id, customer_external_id, sent_at")
        .eq("kind", "old_due")
        .gte("sent_at", weekAgoIso)
        .in("user_id", userIds),
    ]);
  if (customerError) throw customerError;
  if (entryError) throw entryError;
  if (receiptError) throw receiptError;

  const languageByUser = await languagesFor(admin, userIds);
  const customersByUser = groupBy(customerRows, "user_id");
  const entriesByUser = groupBy(entryRows, "user_id");
  const receiptsByUser = groupBy(receipts, "user_id");
  const customerByUuid = Object.fromEntries(
    (customerRows || []).map((row) => [row.id, row])
  );

  let sent = 0;
  let shops = 0;
  for (const userId of userIds) {
    const shopCustomers = customersByUser.get(userId) || [];
    const shopEntries = entriesByUser.get(userId) || [];
    const entriesByCustomerUuid = groupBy(shopEntries, "customer_id");

    const customers = shopCustomers.map((row) => ({
      externalId: row.external_id,
      name: row.name,
      outstandingPaise: outstandingFromEntries(
        entriesByCustomerUuid.get(row.id) || []
      ),
    }));
    const entries = shopEntries.map((row) => ({
      customerId: customerByUuid[row.customer_id]?.external_id,
      kind: row.kind,
      occurredOn: row.occurred_on,
    }));
    const remindedAtByCustomer = Object.fromEntries(
      (receiptsByUser.get(userId) || [])
        .filter((row) => row.customer_external_id)
        .map((row) => [row.customer_external_id, row.sent_at])
    );

    const dues = pickOldDueCustomers({
      customers,
      entries,
      remindedAtByCustomer,
      todayYmd,
      nowMs,
    });
    if (!dues.length) continue;

    const payload = oldDueNotification(languageByUser[userId] || "en", dues);
    const n = await sendToUserSubscriptions(
      admin,
      byUser.get(userId) || [],
      payload
    );
    if (!n) continue;

    const { error: insertError } = await admin
      .from("notification_receipts")
      .insert(
        dues.map((due) => ({
          user_id: userId,
          kind: "old_due",
          customer_external_id: due.externalId,
          sent_on: todayYmd,
        }))
      );
    if (insertError) throw insertError;
    sent += n;
    shops += 1;
  }

  return { sent, shops };
}

export async function sendShopReminderTest(admin, userId, kind) {
  const { data: subscriptions, error: subError } = await admin
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth")
    .eq("user_id", userId);
  if (subError) throw subError;
  if (!subscriptions?.length) {
    return { ok: false, sent: 0, reason: "no_subscription" };
  }

  const languageByUser = await languagesFor(admin, [userId]);
  const language = languageByUser[userId] || "en";

  if (kind === "ping") {
    const preview = testNotification(language);
    const sent = await sendToUserSubscriptions(admin, subscriptions, preview);
    return {
      ok: sent > 0,
      sent,
      preview,
      reason: sent > 0 ? "sent" : "push_failed",
    };
  }

  if (kind === "unshared") {
    const todayYmd = istYmd();
    const { start, end } = istDayUtcRange(todayYmd);
    const [
      { data: invoices, error: invoiceError },
      { data: shares, error: shareError },
      { data: customerRows, error: customerError },
    ] = await Promise.all([
      admin
        .from("entries")
        .select("external_id, customer_id, created_at")
        .eq("user_id", userId)
        .eq("kind", "invoice")
        .is("voided_at", null)
        .gte("created_at", start)
        .lt("created_at", end),
      admin
        .from("entry_shares")
        .select("entry_external_id")
        .eq("user_id", userId),
      admin
        .from("customers")
        .select("id, external_id, name")
        .eq("user_id", userId)
        .is("deleted_at", null),
    ]);
    if (invoiceError) throw invoiceError;
    if (shareError) throw shareError;
    if (customerError) throw customerError;

    const customersByUuid = Object.fromEntries(
      (customerRows || []).map((row) => [row.id, row])
    );
    const bills = pickUnsharedBills({
      todayYmd,
      sharedIds: (shares || []).map((row) => row.entry_external_id),
      invoices: (invoices || []).map((row) => ({
        externalId: row.external_id,
        customerExternalId: customersByUuid[row.customer_id]?.external_id,
        createdYmd: istYmd(row.created_at),
      })),
    }).filter((row) => row.customerExternalId);
    if (!bills.length) {
      return { ok: true, sent: 0, reason: "none_unshared" };
    }

    const customersById = Object.fromEntries(
      (customerRows || []).map((row) => [row.external_id, { name: row.name }])
    );
    const preview = unsharedNotification(language, bills, customersById);
    const sent = await sendToUserSubscriptions(admin, subscriptions, preview);
    return {
      ok: sent > 0,
      sent,
      preview,
      reason: sent > 0 ? "sent" : "push_failed",
    };
  }

  if (kind === "old_due") {
    const todayYmd = istYmd();
    const nowMs = Date.now();
    const [
      { data: customerRows, error: customerError },
      { data: entryRows, error: entryError },
    ] = await Promise.all([
      admin
        .from("customers")
        .select("id, external_id, name")
        .eq("user_id", userId)
        .is("deleted_at", null),
      admin
        .from("entries")
        .select("customer_id, kind, occurred_on, amount_paise, due_paise")
        .eq("user_id", userId)
        .is("voided_at", null),
    ]);
    if (customerError) throw customerError;
    if (entryError) throw entryError;

    const customerByUuid = Object.fromEntries(
      (customerRows || []).map((row) => [row.id, row])
    );
    const entriesByCustomerUuid = groupBy(entryRows, "customer_id");
    const customers = (customerRows || []).map((row) => ({
      externalId: row.external_id,
      name: row.name,
      outstandingPaise: outstandingFromEntries(
        entriesByCustomerUuid.get(row.id) || []
      ),
    }));
    const entries = (entryRows || []).map((row) => ({
      customerId: customerByUuid[row.customer_id]?.external_id,
      kind: row.kind,
      occurredOn: row.occurred_on,
    }));
    const dues = pickOldDueCustomers({
      customers,
      entries,
      remindedAtByCustomer: {},
      todayYmd,
      nowMs,
    });
    if (!dues.length) {
      return { ok: true, sent: 0, reason: "none_due" };
    }

    const preview = oldDueNotification(language, dues);
    const sent = await sendToUserSubscriptions(admin, subscriptions, preview);
    return {
      ok: sent > 0,
      sent,
      preview,
      reason: sent > 0 ? "sent" : "push_failed",
    };
  }

  return { ok: false, sent: 0, reason: "invalid" };
}
