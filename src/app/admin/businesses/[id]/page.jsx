"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  ExternalLink,
  FileText,
  IndianRupee,
  Languages,
  LayoutTemplate,
  MapPin,
  Palette,
  Phone,
  QrCode,
  Settings2,
  Share2,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import { AdminBusinessAvatar } from "@/components/admin/admin-business-avatar";
import {
  AdminSectionTitle,
  formatCount,
  formatRupeesFromPaise,
  formatShortDate,
} from "@/components/admin/admin-dashboard";
import { cn } from "@/lib/utils";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <dt className="inline-flex min-w-0 shrink-0 items-center gap-2.5 text-sm text-zinc-500">
        {Icon ? (
          <span className="inline-flex size-7 items-center justify-center rounded-xl bg-[var(--well)] text-zinc-500">
            <Icon className="size-3.5" strokeWidth={2.25} />
          </span>
        ) : null}
        {label}
      </dt>
      <dd className="pt-1 text-right text-sm font-semibold text-zinc-950">
        {value || "—"}
      </dd>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tone = "default" }) {
  return (
    <SoftCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-2xl",
              tone === "warn" && "bg-amber-50 text-amber-700",
              tone === "success" && "bg-emerald-50 text-emerald-700",
              tone === "default" &&
                "bg-[var(--forest)]/8 text-[var(--forest)]"
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[1.65rem] font-semibold tracking-tight tabular-nums text-zinc-950">
        {value}
      </p>
    </SoftCard>
  );
}

function formatDay(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function AdminBusinessProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/businesses/${id}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(json.error || "Could not load business.");
            setData(null);
          }
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setError("Could not reach the server.");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const business = data?.business;
  const settings = data?.settings;
  const stats = data?.stats;

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Overview
      </Link>

      {error ? (
        <p className="mb-6 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <SoftCard className="mb-5 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-4 p-6">
            <div className="size-16 animate-pulse rounded-full bg-[var(--well)]" />
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-[var(--well)]" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-[var(--well)]" />
            </div>
          </div>
        ) : business ? (
          <div className="flex flex-wrap items-start justify-between gap-5 p-6">
            <div className="flex min-w-0 items-center gap-4">
              <AdminBusinessAvatar
                name={business.name}
                logoUrl={business.logoUrl}
                size="lg"
              />
              <div className="min-w-0">
                <h1 className="truncate text-[1.85rem] font-semibold tracking-tight text-zinc-950">
                  {business.name}
                </h1>
                <p className="mt-1.5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                  {business.businessTypeLabel ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--well)] px-2.5 py-1 text-xs font-semibold text-zinc-600">
                      <Store className="size-3.5" />
                      {business.businessTypeLabel}
                    </span>
                  ) : null}
                  {business.phone ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--well)] px-2.5 py-1 text-xs font-semibold text-zinc-600">
                      <Phone className="size-3.5" />
                      {business.phone}
                    </span>
                  ) : null}
                  {!business.businessTypeLabel && !business.phone
                    ? "No shop details yet"
                    : null}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                  settings?.onboardingComplete
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {settings?.onboardingComplete ? (
                  <BadgeCheck className="size-3.5" />
                ) : (
                  <CircleAlert className="size-3.5" />
                )}
                {settings?.onboardingComplete ? "Onboarded" : "Incomplete"}
              </span>
              {business.upiId ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--forest)]/8 px-3 py-1.5 text-xs font-semibold text-[var(--forest)]">
                  <Wallet className="size-3.5" />
                  UPI set
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--well)] px-3 py-1.5 text-xs font-semibold text-zinc-500">
                  <Wallet className="size-3.5" />
                  No UPI
                </span>
              )}
            </div>
          </div>
        ) : null}
      </SoftCard>

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile
          icon={Users}
          label="Customers"
          value={loading ? "—" : formatCount(stats?.customers)}
        />
        <StatTile
          icon={FileText}
          label="Bills"
          value={loading ? "—" : formatCount(stats?.bills)}
        />
        <StatTile
          icon={IndianRupee}
          label="Billed"
          value={loading ? "—" : formatRupeesFromPaise(stats?.billedPaise)}
        />
        <StatTile
          icon={CircleAlert}
          label="Outstanding"
          tone="warn"
          value={
            loading ? "—" : formatRupeesFromPaise(stats?.outstandingPaise)
          }
        />
        <StatTile
          icon={Wallet}
          label="Collected"
          tone="success"
          value={loading ? "—" : formatRupeesFromPaise(stats?.collectedPaise)}
        />
        <StatTile
          icon={Palette}
          label="Theme spend"
          value={loading ? "—" : formatRupeesFromPaise(stats?.themeSpendPaise)}
        />
        <StatTile
          icon={ShoppingBag}
          label="Theme buys"
          value={loading ? "—" : formatCount(stats?.themePurchases)}
        />
        <StatTile
          icon={Share2}
          label="Shared bills"
          value={loading ? "—" : formatCount(stats?.publicBills)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SoftCard className="p-6 xl:col-span-1">
          <AdminSectionTitle icon={Store} title="Shop details" />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-[var(--well)]"
                />
              ))}
            </div>
          ) : (
            <dl className="divide-y divide-zinc-100">
              <DetailRow icon={Phone} label="Phone" value={business?.phone} />
              <DetailRow
                icon={Phone}
                label="Login phone"
                value={data?.profile?.phone}
              />
              <DetailRow
                icon={Store}
                label="Type"
                value={business?.businessTypeLabel}
              />
              <DetailRow
                icon={MapPin}
                label="Address"
                value={business?.address}
              />
              <DetailRow icon={Wallet} label="UPI" value={business?.upiId} />
              <DetailRow
                icon={CalendarDays}
                label="Joined"
                value={formatDay(business?.createdAt)}
              />
              <DetailRow
                icon={Activity}
                label="Last activity"
                value={formatShortDate(stats?.lastActivityAt)}
              />
            </dl>
          )}
        </SoftCard>

        <SoftCard className="p-6 xl:col-span-1">
          <AdminSectionTitle icon={Settings2} title="Settings" />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-[var(--well)]"
                />
              ))}
            </div>
          ) : (
            <dl className="divide-y divide-zinc-100">
              <DetailRow
                icon={LayoutTemplate}
                label="Bill theme"
                value={settings?.billThemeName}
              />
              <DetailRow
                icon={QrCode}
                label="QR theme"
                value={settings?.qrThemeName || "—"}
              />
              <DetailRow
                icon={Languages}
                label="Language"
                value={(settings?.language || "en").toUpperCase()}
              />
              <DetailRow
                icon={Palette}
                label="Appearance"
                value={settings?.appearance || "light"}
              />
              <DetailRow
                icon={LayoutTemplate}
                label="Unlocked bill"
                value={
                  settings?.unlockedBillThemes?.length
                    ? settings.unlockedBillThemes
                        .map((theme) => theme.name)
                        .join(", ")
                    : "None"
                }
              />
              <DetailRow
                icon={QrCode}
                label="Unlocked QR"
                value={
                  settings?.unlockedQrThemes?.length
                    ? settings.unlockedQrThemes
                        .map((theme) => theme.name)
                        .join(", ")
                    : "None"
                }
              />
            </dl>
          )}
        </SoftCard>

        <SoftCard className="p-6 xl:col-span-1">
          <AdminSectionTitle icon={ShoppingBag} title="Theme purchases" />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-[var(--well)]"
                />
              ))}
            </div>
          ) : data?.purchases?.length ? (
            <ul className="divide-y divide-zinc-100">
              {data.purchases.map((item) => {
                const KindIcon =
                  item.kind === "qr" ? QrCode : LayoutTemplate;
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--well)] text-zinc-600">
                        <KindIcon className="size-3.5" strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-950">
                          {item.themeName}
                        </p>
                        <p className="text-xs capitalize text-zinc-400">
                          {item.kind} · {formatShortDate(item.paidAt)}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-950">
                      {formatRupeesFromPaise(item.amountPaise)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-zinc-500">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--well)] text-zinc-400">
                <ShoppingBag className="size-4" />
              </span>
              No paid themes yet.
            </p>
          )}
        </SoftCard>
      </div>

      <SoftCard className="mt-5 p-6">
        <AdminSectionTitle
          icon={FileText}
          title="Recent bills"
          subtitle="Latest invoices created by this shop"
        />
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-[var(--well)]"
              />
            ))}
          </div>
        ) : data?.recentBills?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Customer</th>
                  <th className="pb-3 pr-4 font-semibold">Mobile</th>
                  <th className="pb-3 pr-4 font-semibold">Description</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Amount</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Due</th>
                  <th className="pb-3 text-right font-semibold">Preview</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-zinc-50">
                    <td className="py-3.5 pr-4 text-zinc-500">
                      {formatDay(bill.occurredOn || bill.createdAt)}
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-zinc-950">
                      {bill.customerName || "—"}
                    </td>
                    <td className="py-3.5 pr-4 tabular-nums text-zinc-500">
                      {bill.customerPhone || "—"}
                    </td>
                    <td className="py-3.5 pr-4 text-zinc-600">
                      {bill.description || "Bill"}
                    </td>
                    <td className="py-3.5 pr-4 text-right tabular-nums font-semibold text-zinc-950">
                      {formatRupeesFromPaise(bill.amountPaise)}
                    </td>
                    <td className="py-3.5 pr-4 text-right tabular-nums text-zinc-500">
                      {formatRupeesFromPaise(bill.duePaise)}
                    </td>
                    <td className="py-3.5 text-right">
                      {bill.publicUrl ? (
                        <a
                          href={bill.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-[var(--forest)] hover:underline"
                        >
                          Open
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        <span className="text-zinc-400">Not shared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-zinc-500">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--well)] text-zinc-400">
              <FileText className="size-4" />
            </span>
            No bills yet.
          </p>
        )}
      </SoftCard>
    </div>
  );
}
