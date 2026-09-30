const TTL_MS = 15 * 60 * 1000;
const KEEP_MS = 24 * 60 * 60 * 1000;

export async function rememberOtpRequest(admin, reqId, phoneDigits) {
  const { error } = await admin
    .from("otp_requests")
    .upsert({ req_id: String(reqId), phone: phoneDigits });
  if (error) throw new Error("Could not send the SMS code. Try again.");
}

/** Phone digits the request id was sent to, or null if unknown / expired. */
export async function otpRequestPhone(admin, reqId) {
  const { data, error } = await admin
    .from("otp_requests")
    .select("phone, created_at")
    .eq("req_id", String(reqId))
    .maybeSingle();
  if (error || !data) return null;
  if (Date.now() - new Date(data.created_at).getTime() > TTL_MS) return null;
  return data.phone;
}

export async function forgetOtpRequest(admin, reqId) {
  await admin.from("otp_requests").delete().eq("req_id", String(reqId));
}

export async function pruneOtpRequests(admin) {
  await admin
    .from("otp_requests")
    .delete()
    .lt("created_at", new Date(Date.now() - KEEP_MS).toISOString());
}
