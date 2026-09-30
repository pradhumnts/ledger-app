"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function shortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const REFERRAL_STATUS = {
  joined: { text: "Installed", tone: "text-black/55" },
  subscribed: { text: "Yearly plan", tone: "text-[#1f8a4c]" },
  void: { text: "Refunded", tone: "text-red-600" },
};

const REWARD_STATUS = {
  held: "On hold",
  ready: "Ready",
  requested: "Requested",
  paid: "Paid",
  void: "Cancelled",
};

const PAYOUT_STATUS = {
  requested: { text: "Processing", tone: "bg-amber-100 text-amber-800" },
  paid: { text: "Paid", tone: "bg-[#c8e86a] text-[#0b301f]" },
  rejected: { text: "Needs fixing", tone: "bg-red-100 text-red-700" },
};

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#eef1ec] px-3 py-3">
      <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-black/55">{label}</p>
    </div>
  );
}

function CodeCard({ entry, summary }) {
  const [copied, setCopied] = useState("");
  const message =
    `MoneyKit se apni dukaan ke bills aur UPI QR banao, bilkul free.\n` +
    `Yearly website plan pe ${summary.discountPercent}% off — code ${entry.code}\n${entry.link}`;

  async function copy(value, what) {
    await navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(what);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b301f] p-5 text-white">
      <div className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/10" />
      <p className="text-sm text-white/70">Your code</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-3xl font-bold tracking-wider text-[#c8e86a]">{entry.code}</p>
        <button
          type="button"
          onClick={() => copy(entry.code, "code")}
          className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold"
        >
          {copied === "code" ? "Copied" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => copy(entry.link, "link")}
        className="mt-4 block w-full truncate rounded-2xl bg-white/10 px-4 py-3 text-left text-sm text-white/85"
      >
        {copied === "link" ? "Link copied" : entry.link}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex h-11 items-center justify-center rounded-full bg-[#c8e86a] text-sm font-semibold text-[#0b301f]"
      >
        Share on WhatsApp
      </a>
    </div>
  );
}

function PayoutForm({ summary }) {
  const router = useRouter();
  const [upiId, setUpiId] = useState(summary.upiId || "");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const ready = summary.earnings.ready;

  async function request(event) {
    event.preventDefault();
    if (busy || !ready) return;
    setBusy(true);
    setNote("");
    const response = await fetch("/api/partner/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upiId }),
    }).catch(() => null);
    const payload = (await response?.json().catch(() => ({}))) || {};
    setBusy(false);
    if (response?.ok) {
      setNote(`Requested ${rupees(payload.payout?.amount)}. We'll send it to ${upiId} within 3 working days.`);
      router.refresh();
      return;
    }
    setNote(
      payload.error === "upi"
        ? "Enter a valid UPI ID, like name@okaxis."
        : payload.error === "nothingReady"
          ? "Nothing is ready to withdraw yet."
          : "Couldn't request the payout. Try again."
    );
  }

  return (
    <form onSubmit={request} className="mt-4">
      <label className="text-sm font-medium" htmlFor="upi">
        UPI ID for payouts
      </label>
      <input
        id="upi"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value.trim())}
        placeholder="name@okaxis"
        autoComplete="off"
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 px-4 outline-none focus:border-[#0b301f]"
      />
      <button
        type="submit"
        disabled={busy || !ready}
        className="mt-3 h-12 w-full rounded-full bg-[#0b301f] font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Requesting…" : ready ? `Request ${rupees(ready)}` : "Nothing to withdraw yet"}
      </button>
      {note ? <p className="mt-2 text-sm text-black/65">{note}</p> : null}
    </form>
  );
}

export function PartnerDashboard({ summary }) {
  const router = useRouter();
  const { stats, earnings } = summary;

  async function logOut() {
    await fetch("/api/partner/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black/55">MoneyKit Partners</p>
          <h1 className="text-2xl font-semibold tracking-tight">Hi, {summary.name.split(" ")[0]}</h1>
        </div>
        <button type="button" onClick={logOut} className="text-sm font-medium text-black/55">
          Log out
        </button>
      </header>

      {summary.codes.map((entry) => (
        <CodeCard key={entry.code} entry={entry} summary={summary} />
      ))}

      <Card>
        <h2 className="font-semibold">Your numbers</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Link opens" value={stats.clicks} />
          <Stat label="Shops joined" value={stats.joined} />
          <Stat label="Yearly plans" value={stats.subscribed} />
          <Stat label="Earned" value={rupees(earnings.held + earnings.ready + earnings.requested + earnings.paid)} />
        </div>
        <p className="mt-3 text-xs text-black/45">{stats.clicks30} link opens in the last 30 days.</p>
      </Card>

      <Card>
        <h2 className="font-semibold">Earnings</h2>
        <div className="mt-3 divide-y divide-black/5 text-sm">
          <div className="flex justify-between py-2.5">
            <span className="text-black/60">
              On hold{earnings.nextReadyAt ? ` · next ready ${shortDate(earnings.nextReadyAt)}` : ""}
            </span>
            <span className="font-semibold tabular-nums">{rupees(earnings.held)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-black/60">Ready to withdraw</span>
            <span className="font-semibold tabular-nums text-[#1f8a4c]">{rupees(earnings.ready)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-black/60">Requested</span>
            <span className="font-semibold tabular-nums">{rupees(earnings.requested)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-black/60">Paid to you</span>
            <span className="font-semibold tabular-nums">{rupees(earnings.paid)}</span>
          </div>
        </div>
        <PayoutForm summary={summary} />
      </Card>

      <Card>
        <h2 className="font-semibold">Shops you brought</h2>
        {summary.referrals.length ? (
          <ul className="mt-2 divide-y divide-black/5">
            {summary.referrals.map((item, index) => {
              const status = REFERRAL_STATUS[item.status] || REFERRAL_STATUS.joined;
              return (
                <li key={index} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name || "New shop"}</p>
                    <p className="text-xs text-black/45">Joined {shortDate(item.joinedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${status.tone}`}>{status.text}</p>
                    {item.reward ? (
                      <p className="text-xs text-black/45">
                        {rupees(summary.rewardRupees)} · {REWARD_STATUS[item.reward] || item.reward}
                        {item.readyAt ? ` till ${shortDate(item.readyAt)}` : ""}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/55">
            No shops yet. Share your link or tell people your code — they can type it in the app.
          </p>
        )}
      </Card>

      {summary.payouts.length ? (
        <Card>
          <h2 className="font-semibold">Payouts</h2>
          <ul className="mt-2 divide-y divide-black/5">
            {summary.payouts.map((payout) => {
              const status = PAYOUT_STATUS[payout.status] || PAYOUT_STATUS.requested;
              return (
                <li key={payout.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold tabular-nums">{rupees(payout.amount)}</p>
                    <p className="truncate text-xs text-black/45">
                      {shortDate(payout.requestedAt)} · {payout.upiId}
                      {payout.reference ? ` · Ref ${payout.reference}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>
                    {status.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <Card>
        <h2 className="font-semibold">How it works</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-black/70">
          <li>A shop installs MoneyKit from your link, or types your code in the app.</li>
          <li>
            When that shop buys the yearly website plan, they get {summary.discountPercent}% off the
            first year and you earn {rupees(summary.rewardRupees)}.
          </li>
          <li>
            Earnings stay on hold for {summary.holdDays} days in case of refunds, then you can
            request a payout to your UPI ID.
          </li>
          <li>Installs and monthly plans don&apos;t earn — only yearly plans.</li>
        </ol>
      </Card>
    </div>
  );
}
