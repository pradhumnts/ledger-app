"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
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
import { AdminBusinessAvatar } from "@/components/admin/admin-business-avatar";
import {
  AdminBackLink,
  AdminCard,
  AdminDate,
  AdminSectionTitle,
  adminCardPad,
  formatCount,
  formatRupeesFromPaise,
  formatShortDate,
} from "@/components/admin/admin-dashboard";
import { cn } from "@/lib/utils";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 sm:gap-4 sm:py-3.5">
      <dt className="inline-flex min-w-0 shrink-0 items-center gap-2 text-sm text-zinc-500 sm:gap-2.5">
        {Icon ? (
          <span className="inline-flex size-6 items-center justify-center rounded-lg bg-[var(--well)] text-zinc-500 sm:size-7 sm:rounded-xl">
            <Icon className="size-3.5" strokeWidth={2.25} />
          </span>
        ) : null}
        {label}
      </dt>
      <dd className="max-w-[58%] break-words pt-0.5 text-right text-sm font-semibold text-zinc-950 sm:pt-1">
        {value || "—"}
      </dd>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tone = "default" }) {
  return (
    <AdminCard className="p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <p className="text-xs font-medium text-zinc-500 sm:text-sm">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-xl sm:size-9 sm:rounded-2xl",
              tone === "warn" && "bg-amber-50 text-amber-700",
              tone === "success" && "bg-emerald-50 text-emerald-700",
              tone === "default" &&
                "bg-[var(--forest)]/8 text-[var(--forest)]"
            )}
          >
            <Icon className="size-3.5 sm:size-4" strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight tabular-nums text-zinc-950 sm:mt-4 sm:text-[1.65rem]">
        {value}
      </p>
    </AdminCard>
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
      <AdminBackLink href="/admin/businesses" label="Shops" showOnMobile />

      {error ? (
        <p className="mb-3 text-sm font-medium text-red-600 sm:mb-6" role="alert">
          {error}
        </p>
      ) : null}

      <AdminCard className="mb-2.5 overflow-hidden sm:mb-5">
        {loading ? (
          <div className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-6">
            <div className="size-12 animate-pulse rounded-full bg-[var(--well)] sm:size-16" />
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded-lg bg-[var(--well)] sm:h-7 sm:w-48" />
              <div className="h-4 w-28 animate-pulse rounded-lg bg-[var(--well)] sm:w-32" />
            </div>
          </div>
        ) : business ? (
          <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <AdminBusinessAvatar
                name={business.name}
                logoUrl={business.logoUrl}
                size="lg"
                className="size-12 text-base sm:size-16 sm:text-lg"
              />
              <div className="min-w-0">
                <h1 className="truncate text-[1.35rem] font-semibold tracking-tight text-zinc-950 sm:text-[1.85rem]">
                  {business.name}
                </h1>
                <p className="mt-1 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 sm:mt-1.5 sm:gap-x-3">
                  {business.businessTypeLabel ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--well)] px-2 py-0.5 text-xs font-semibold text-zinc-600 sm:px-2.5 sm:py-1">
                      <Store className="size-3.5" />
                      {business.businessTypeLabel}
                    </span>
                  ) : null}
                  {business.phone ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--well)] px-2 py-0.5 text-xs font-semibold text-zinc-600 sm:px-2.5 sm:py-1">
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
      </AdminCard>

      <div className="mb-2.5 grid grid-cols-2 gap-2.5 sm:mb-5 sm:gap-4 md:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-2.5 sm:gap-5 xl:grid-cols-3">
        <AdminCard className={cn(adminCardPad, "xl:col-span-1")}>
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
        </AdminCard>

        <AdminCard className={cn(adminCardPad, "xl:col-span-1")}>
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
        </AdminCard>

        <AdminCard className={cn(adminCardPad, "xl:col-span-1")}>
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
        </AdminCard>
      </div>

      <AdminCard className={cn("mt-2.5 sm:mt-5", adminCardPad)}>
        <AdminSectionTitle
          icon={FileText}
          title="Recent bills"
          subtitle="Latest invoices created by this shop"
        />
        {loading ? (
          <div className="space-y-2.5 sm:space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-[var(--well)]"
              />
            ))}
          </div>
        ) : data?.recentBills?.length ? (
          <>
            <ul className="divide-y divide-zinc-100 sm:hidden">
              {data.recentBills.map((bill) => (
                <li key={bill.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-950">
                        {bill.customerName || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {formatDay(bill.occurredOn || bill.createdAt)}
                        {bill.customerPhone ? ` · ${bill.customerPhone}` : ""}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {bill.description || "Bill"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-zinc-950">
                        {formatRupeesFromPaise(bill.amountPaise)}
                      </p>
                      <p className="text-xs tabular-nums text-zinc-400">
                        due {formatRupeesFromPaise(bill.duePaise)}
                      </p>
                      {bill.publicUrl ? (
                        <a
                          href={bill.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--forest)]"
                        >
                          Open
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-400">Not shared</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto sm:block">
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
          </>
        ) : (
          <p className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-zinc-500 sm:py-10">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--well)] text-zinc-400">
              <FileText className="size-4" />
            </span>
            No bills yet.
          </p>
        )}
      </AdminCard>
    </div>
  );
}
