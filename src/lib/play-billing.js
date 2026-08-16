const PLAY_METHOD = "https://play.google.com/billing";

export async function isPlayBillingAvailable() {
  if (typeof window === "undefined") return false;
  if (typeof window.getDigitalGoodsService !== "function") return false;
  try {
    const service = await window.getDigitalGoodsService(PLAY_METHOD);
    return Boolean(service);
  } catch {
    return false;
  }
}

async function getPlayService() {
  if (typeof window.getDigitalGoodsService !== "function") {
    throw new Error("buyFailed");
  }
  try {
    return await window.getDigitalGoodsService(PLAY_METHOD);
  } catch {
    throw new Error("buyFailed");
  }
}

export async function requestPlayPurchase(sku) {
  const service = await getPlayService();
  const details = await service.getDetails([sku]);
  const item = details?.[0];
  if (!item) throw new Error("buyFailed");

  const request = new PaymentRequest(
    [
      {
        supportedMethods: PLAY_METHOD,
        data: { sku: item.itemId || sku },
      },
    ],
    {
      total: {
        label: item.title || "Total",
        amount: {
          currency: item.price?.currency || "INR",
          value: String(item.price?.value || "0"),
        },
      },
    }
  );

  let response;
  try {
    response = await request.show();
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("cancelled");
    throw new Error("buyFailed");
  }

  const purchaseToken = response?.details?.purchaseToken;
  if (!purchaseToken) {
    try {
      await response.complete("fail");
    } catch {
      // Ignore complete failures after a missing token.
    }
    throw new Error("buyFailed");
  }

  return {
    sku: item.itemId || sku,
    purchaseToken,
    complete: (ok) => response.complete(ok ? "success" : "fail"),
  };
}

export async function listPlayPurchases() {
  try {
    const service = await getPlayService();
    const purchases = await service.listPurchases();
    return Array.isArray(purchases) ? purchases : [];
  } catch {
    return [];
  }
}
