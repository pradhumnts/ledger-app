"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ERRORS = {
  phone: "Enter your 10-digit mobile number.",
  notPartner: "This number isn't registered as a MoneyKit partner. Message us on WhatsApp to join.",
  sendFailed: "Couldn't send the code. Try again in a minute.",
  otp: "That code didn't work. Check the SMS and try again.",
};

async function post(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "sendFailed");
  return payload;
}

export function PartnerLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!request) {
        setRequest(await post("/api/partner/otp/send", { phone }));
      } else {
        await post("/api/partner/otp/verify", { phone, otp, ...request });
        router.refresh();
      }
    } catch (err) {
      setError(ERRORS[err.message] || ERRORS.sendFailed);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-base outline-none focus:border-[#0b301f]";

  return (
    <div className="pt-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0b301f] text-lg font-bold text-[#c8e86a]">
          M
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">MoneyKit Partners</p>
          <p className="text-sm text-black/55">Your referral code, installs and payouts</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          {request ? "Enter the code" : "Log in with your phone"}
        </h1>
        <p className="mt-1 text-sm text-black/55">
          {request ? `We sent a 6-digit code to +91 ${phone}.` : "Use the number you registered with MoneyKit."}
        </p>

        {request ? (
          <input
            key="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            className={`${input} mt-5 text-center text-xl tracking-[0.5em]`}
          />
        ) : (
          <div className="mt-5 flex gap-3">
            <span className="flex h-12 w-16 items-center justify-center rounded-2xl border border-black/10 text-sm font-semibold text-black/55">
              +91
            </span>
            <input
              key="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              placeholder="98765 43210"
              className={input}
            />
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-12 w-full rounded-full bg-[#0b301f] font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Please wait…" : request ? "Log in" : "Send code"}
        </button>

        {request ? (
          <button
            type="button"
            onClick={() => {
              setRequest(null);
              setOtp("");
              setError("");
            }}
            className="mt-3 w-full text-sm font-medium text-black/55"
          >
            Change number
          </button>
        ) : null}
      </form>
    </div>
  );
}
