import { randomUUID } from "node:crypto";
import {
  AppStoreServerAPIClient,
  AutoRenewStatus,
  Environment,
  ExtendReasonCode,
  SignedDataVerifier,
  Status,
} from "@apple/app-store-server-library";
import { referralOfferId } from "@/lib/referrals/rules";
import { appleSitePlan } from "@/lib/sites/apple-plans";

// Apple Root CA - G3 (DER, base64), from apple.com/certificateauthority.
// SHA-256 63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79
const APPLE_ROOT_CA_G3 =
  "MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9v" +
  "dCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UE" +
  "CgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2" +
  "WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmlj" +
  "YXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqG" +
  "SM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtfTjjTuxxE" +
  "tX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNC" +
  "MEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySrMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0P" +
  "AQH/BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3m" +
  "eoyhpmvOwgPUnPWTxnS4at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkL" +
  "F1vLUagM6BgD56KyKA==";

const ENVIRONMENTS = [Environment.PRODUCTION, Environment.SANDBOX];
const TOKEN_PREFIX = "apple:";

export function appStoreConfig() {
  const bundleId = String(process.env.APPLE_BUNDLE_ID || "app.moneykit.ios").trim();
  const appAppleId = Number(process.env.APPLE_APP_ID || 0) || 0;
  const issuerId = String(process.env.APPLE_IAP_ISSUER_ID || "").trim();
  const keyId = String(process.env.APPLE_IAP_KEY_ID || "").trim();
  const privateKey = String(process.env.APPLE_IAP_PRIVATE_KEY || "")
    .replace(/\\n/g, "\n")
    .trim();
  return {
    bundleId,
    appAppleId,
    issuerId,
    keyId,
    privateKey,
    configured: Boolean(bundleId && appAppleId && issuerId && keyId && privateKey),
  };
}

/** site_subscriptions key for an App Store subscription. */
export function appleToken(originalTransactionId) {
  return `${TOKEN_PREFIX}${originalTransactionId}`;
}

export function isAppleToken(purchaseToken) {
  return String(purchaseToken || "").startsWith(TOKEN_PREFIX);
}

export function appleOriginalId(purchaseToken) {
  return isAppleToken(purchaseToken) ? purchaseToken.slice(TOKEN_PREFIX.length) : "";
}

const verifiers = new Map();

function verifierFor(environment) {
  if (!ENVIRONMENTS.includes(environment)) {
    throw new Error("Unknown App Store environment.");
  }
  if (!verifiers.has(environment)) {
    const { bundleId, appAppleId } = appStoreConfig();
    verifiers.set(
      environment,
      new SignedDataVerifier(
        [Buffer.from(APPLE_ROOT_CA_G3, "base64")],
        false,
        environment,
        bundleId,
        appAppleId || undefined
      )
    );
  }
  return verifiers.get(environment);
}

function clientFor(environment) {
  const { privateKey, keyId, issuerId, bundleId, configured } = appStoreConfig();
  if (!configured) throw new Error("App Store purchases are not configured on the server.");
  return new AppStoreServerAPIClient(privateKey, keyId, issuerId, bundleId, environment);
}

/** Environment a signed payload says it's from; the verifier for it then checks the signature. */
function claimedEnvironment(jws) {
  try {
    const part = String(jws || "").split(".")[1] || "";
    const payload = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
    return String(payload.environment || payload.data?.environment || "");
  } catch {
    return "";
  }
}

/** Verify a signed transaction from the app (StoreKit 2 `jwsRepresentation`). */
export async function verifyAppleTransaction(signedTransaction) {
  const environment = claimedEnvironment(signedTransaction);
  const transaction = await verifierFor(environment).verifyAndDecodeTransaction(signedTransaction);
  return { ...transaction, environment };
}

/** Verify an App Store Server Notification V2 and decode the transaction inside it. */
export async function verifyAppleNotification(signedPayload) {
  const environment = claimedEnvironment(signedPayload);
  const verifier = verifierFor(environment);
  const notification = await verifier.verifyAndDecodeNotification(signedPayload);
  const signed = notification.data?.signedTransactionInfo;
  const transaction = signed ? await verifier.verifyAndDecodeTransaction(signed) : null;
  return { notification, transaction, environment };
}

async function subscriptionIn(environment, originalTransactionId) {
  const response = await clientFor(environment).getAllSubscriptionStatuses(originalTransactionId);
  const items = (response.data || []).flatMap((group) => group.lastTransactions || []);
  const item =
    items.find((entry) => entry.originalTransactionId === originalTransactionId) || items[0];
  if (!item?.signedTransactionInfo) {
    throw new Error("No App Store subscription for that transaction.");
  }
  const verifier = verifierFor(environment);
  const [transaction, renewal] = await Promise.all([
    verifier.verifyAndDecodeTransaction(item.signedTransactionInfo),
    item.signedRenewalInfo ? verifier.verifyAndDecodeRenewalInfo(item.signedRenewalInfo) : null,
  ]);
  return { status: Number(item.status || 0), transaction, renewal, environment };
}

/**
 * Latest state of a subscription from the App Store Server API. Without a
 * known environment, Production is asked first, then Sandbox.
 */
export async function getAppleSubscription(originalTransactionId, environment) {
  if (ENVIRONMENTS.includes(environment)) {
    return subscriptionIn(environment, originalTransactionId);
  }
  try {
    return await subscriptionIn(Environment.PRODUCTION, originalTransactionId);
  } catch {
    return subscriptionIn(Environment.SANDBOX, originalTransactionId);
  }
}

/** Move the next renewal back (Apple allows two extensions a year, up to 90 days each). */
export async function extendAppleSubscription(originalTransactionId, environment, days) {
  const env = ENVIRONMENTS.includes(environment) ? environment : Environment.PRODUCTION;
  const result = await clientFor(env).extendSubscriptionRenewalDate(originalTransactionId, {
    extendByDays: days,
    extendReasonCode: ExtendReasonCode.CUSTOMER_SATISFACTION,
    requestIdentifier: randomUUID(),
  });
  if (!result?.success) throw new Error("The App Store did not extend that subscription.");
  return result;
}

function isoFromMs(value) {
  const time = Number(value);
  return Number.isFinite(time) && time > 0 ? new Date(time).toISOString() : null;
}

function appleState(status, transaction, renewal) {
  if (transaction?.revocationDate) return "SUBSCRIPTION_STATE_EXPIRED";
  if (status === Status.ACTIVE) {
    return renewal?.autoRenewStatus === AutoRenewStatus.ON
      ? "SUBSCRIPTION_STATE_ACTIVE"
      : "SUBSCRIPTION_STATE_CANCELED";
  }
  if (status === Status.BILLING_GRACE_PERIOD) return "SUBSCRIPTION_STATE_IN_GRACE_PERIOD";
  if (status === Status.BILLING_RETRY) return "SUBSCRIPTION_STATE_ON_HOLD";
  return "SUBSCRIPTION_STATE_EXPIRED";
}

/**
 * An App Store subscription in the shape `fromPlay` returns, so access,
 * referrals and free months treat both stores alike. Refunds map to EXPIRED,
 * as Play reports them.
 */
export function fromAppleSubscription({ status, transaction, renewal }) {
  const productId = String(transaction?.productId || "");
  const inGrace = status === Status.BILLING_GRACE_PERIOD && renewal?.gracePeriodExpiresDate;
  return {
    productId,
    basePlanId: productId,
    offerId: appleSitePlan(productId)?.referral ? referralOfferId() : null,
    startTime: isoFromMs(transaction?.originalPurchaseDate),
    expiresAt: isoFromMs(inGrace ? renewal.gracePeriodExpiresDate : transaction?.expiresDate),
    autoRenewing: renewal?.autoRenewStatus === AutoRenewStatus.ON,
    orderId: transaction?.transactionId ? String(transaction.transactionId) : null,
    state: appleState(status, transaction, renewal),
    linkedPurchaseToken: null,
    accountId: String(transaction?.appAccountToken || renewal?.appAccountToken || "").toLowerCase(),
    acknowledged: true,
  };
}
