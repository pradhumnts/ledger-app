import { firstName } from "@/lib/format";
import { translate } from "@/lib/i18n";

function entryId(row) {
  return row.externalId || row.external_id || row.id || "";
}

function customerId(row) {
  return row.customerExternalId || row.customer_external_id || row.customerId || "";
}

export function unsharedNotification(language, bills, customersById) {
  const count = bills.length;
  const title = translate(language, "notify.unsharedTitle");
  if (count === 1) {
    const bill = bills[0];
    const customer = customersById[customerId(bill)] || {};
    const name =
      firstName(customer.name) || translate(language, "common.customer");
    return {
      title,
      body: translate(language, "notify.unsharedOne", { name }),
      url: `/customers/${customerId(bill)}/entry/${entryId(bill)}?from=home`,
      tag: "unshared",
    };
  }
  return {
    title,
    body: translate(language, "notify.unsharedMany", { count }),
    url: "/",
    tag: "unshared",
  };
}

export function oldDueNotification(language, dues) {
  const count = dues.length;
  const title = translate(language, "notify.dueTitle");
  if (count === 1) {
    const name =
      firstName(dues[0].name) || translate(language, "common.customer");
    return {
      title,
      body: translate(language, "notify.dueOne", { name }),
      url: `/customers/${dues[0].externalId}?share=1`,
      tag: "old-due",
    };
  }
  return {
    title,
    body: translate(language, "notify.dueMany", { count }),
    url: "/customers",
    tag: "old-due",
  };
}

export function testNotification(language) {
  return {
    title: translate(language, "notify.testTitle"),
    body: translate(language, "notify.testBody"),
    url: "/settings",
    tag: "test",
  };
}
