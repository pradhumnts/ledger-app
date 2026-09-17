"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  IndianRupee,
  Palette,
  Receipt,
  Store,
  TrendingUp,
} from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import { AdminBusinessAvatar } from "@/components/admin/admin-business-avatar";
import { cn } from "@/lib/utils";

export const adminCardClass =
  "rounded-[1.35rem] sm:rounded-[1.75rem]";
export const adminCardPad = "p-3.5 sm:p-6";

export function AdminCard({ children, className }) {
  return (
    <SoftCard className={cn(adminCardClass, className)}>{children}</SoftCard>
  );
}

export function AdminPageHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
        {Icon ? (
          <AdminIconChip
            icon={Icon}
            className="mt-0.5 hidden size-9 sm:mt-1 sm:inline-flex sm:size-10"
          />
        ) : null}
        <div className="min-w-0">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-zinc-950 sm:text-[1.85rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-zinc-500 sm:mt-1">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="w-full min-w-0 sm:w-auto">{children}</div> : null}
    </div>
  );
}

export function AdminBackLink({
  href = "/admin",
  label = "Overview",
  showOnMobile = false,
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-950 sm:mb-5",
        !showOnMobile && "hidden md:inline-flex"
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}

export function formatCount(n) {
  return new Intl.NumberFormat("en-IN").format(Number(n) || 0);
}

export function formatRupeesFromPaise(paise) {
  const rupees = (Number(paise) || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatShortDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatMobileDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export function AdminDate({ value }) {
  return (
    <>
      <span className="sm:hidden">{formatMobileDate(value)}</span>
      <span className="hidden sm:inline">{formatShortDate(value)}</span>
    </>
  );
}

export function AdminIconChip({ icon: Icon, className }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--forest)]/8 text-[var(--forest)]",
        className
      )}
    >
      <Icon className="size-4" strokeWidth={2.25} />
    </span>
  );
}

export function AdminSectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-5 sm:gap-3">
      <div className="flex min-w-0 items-start gap-2 sm:gap-3">
        {Icon ? (
          <AdminIconChip
            icon={Icon}
            className="hidden size-8 rounded-xl sm:inline-flex sm:size-9 sm:rounded-2xl"
          />
        ) : null}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action || null}
    </div>
  );
}

export function AdminRangeFilter({ value, onChange }) {
  const options = [
    { id: "today", label: "Today" },
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
  ];

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <CalendarDays className="hidden size-4 text-zinc-400 sm:block" strokeWidth={2.25} />
      <div className="inline-flex w-full rounded-full bg-[var(--well)] p-0.5 sm:w-auto sm:p-1">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors sm:flex-none sm:px-4",
                active
                  ? "bg-[var(--forest)] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  loading,
  hint,
  change,
  icon: Icon,
}) {
  const hasChange = typeof change === "number" && !Number.isNaN(change);
  const up = hasChange && change > 0;
  const down = hasChange && change < 0;
  const ChangeIcon = up ? ArrowUpRight : down ? ArrowDownRight : ArrowRight;

  return (
    <AdminCard className={adminCardPad}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-zinc-500 sm:text-sm">{label}</p>
        {Icon ? <AdminIconChip icon={Icon} className="size-7 rounded-xl sm:size-8" /> : null}
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-20 animate-pulse rounded-xl bg-[var(--well)] sm:mt-3 sm:h-10 sm:w-28" />
      ) : (
        <p className="mt-1 text-[1.55rem] font-semibold tracking-tight tabular-nums text-zinc-950 sm:mt-2 sm:text-[2.25rem]">
          {value}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium sm:mt-3 sm:gap-2 sm:text-xs">
        {loading ? (
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--well)]" />
        ) : (
          <>
            {hasChange ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5",
                  up && "bg-emerald-50 text-emerald-700",
                  down && "bg-red-50 text-red-600",
                  !up && !down && "bg-zinc-100 text-zinc-600"
                )}
              >
                <ChangeIcon className="size-3.5" strokeWidth={2.5} />
                {Math.abs(change)}%
              </span>
            ) : null}
            {hint ? <span className="min-w-0 leading-tight text-zinc-400">{hint}</span> : null}
          </>
        )}
      </div>
    </AdminCard>
  );
}

function buildPath(points, width, height, padX, padY) {
  if (!points.length) return "";
  const max = Math.max(...points.map((p) => p.value), 1);
  return points
    .map((point, index) => {
      const x =
        padX +
        (points.length === 1
          ? width / 2
          : (index / (points.length - 1)) * (width - padX * 2));
      const y = height - padY - (point.value / max) * (height - padY * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function AdminActivityChart({ series, loading }) {
  const width = 640;
  const height = 240;
  const padX = 16;
  const padY = 24;
  const bills = (series || []).map((row) => ({
    date: row.date,
    value: row.bills || 0,
  }));
  const shops = (series || []).map((row) => ({
    date: row.date,
    value: row.businesses || 0,
  }));
  const billsPath = buildPath(bills, width, height, padX, padY);
  const shopsPath = buildPath(shops, width, height, padX, padY);
  const labelEvery = Math.max(1, Math.ceil((series?.length || 1) / 6));

  return (
    <AdminCard className={adminCardPad}>
      <AdminSectionTitle
        icon={TrendingUp}
        title="Activity"
        subtitle="Bills created vs new businesses"
        action={
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-3.5 text-[var(--forest)]" />
              Bills
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Store className="size-3.5 text-[var(--forest)]" />
              Businesses
            </span>
          </div>
        }
      />

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--well)] sm:h-56" />
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-40 w-full sm:h-56"
            role="img"
            aria-label="Activity chart"
          >
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1={padX}
                x2={width - padX}
                y1={height - padY - (height - padY * 2) * ratio}
                y2={height - padY - (height - padY * 2) * ratio}
                stroke="currentColor"
                className="text-zinc-200"
                strokeWidth="1"
              />
            ))}
            {shopsPath ? (
              <path
                d={shopsPath}
                fill="none"
                stroke="var(--lime)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {billsPath ? (
              <path
                d={billsPath}
                fill="none"
                stroke="var(--forest)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {(series || []).map((row, index) => {
              if (index % labelEvery !== 0 && index !== series.length - 1) {
                return null;
              }
              const x =
                padX +
                (series.length === 1
                  ? width / 2
                  : (index / (series.length - 1)) * (width - padX * 2));
              const label = row.date?.slice(5) || "";
              return (
                <text
                  key={row.date}
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-zinc-400 text-[10px]"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </AdminCard>
  );
}

export function AdminTopThemes({ themes, loading }) {
  const max = Math.max(...(themes || []).map((t) => t.count), 1);

  return (
    <AdminCard className={adminCardPad}>
      <AdminSectionTitle
        icon={Palette}
        title="Top themes"
        subtitle="Paid unlocks by theme"
      />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-[var(--well)]"
            />
          ))}
        </div>
      ) : themes?.length ? (
        <ul className="space-y-4">
          {themes.map((theme) => (
            <li key={`${theme.kind}-${theme.themeId}`}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-950">
                    {theme.themeName}
                  </p>
                  <p className="text-xs capitalize text-zinc-400">
                    {theme.kind} theme
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold tabular-nums text-zinc-950">
                    {formatCount(theme.count)}
                  </p>
                  <p className="text-xs tabular-nums text-zinc-400">
                    {formatRupeesFromPaise(theme.revenuePaise)}
                  </p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--well)]">
                <div
                  className="h-full rounded-full bg-[var(--forest)]"
                  style={{ width: `${(theme.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No theme purchases yet.</p>
      )}
    </AdminCard>
  );
}

export function AdminRecentBusinesses({ items, loading }) {
  return (
    <AdminCard className={adminCardPad}>
      <AdminSectionTitle
        icon={Building2}
        title="Recent businesses"
        subtitle="Newest shops on MoneyKit"
        action={
          <Link
            href="/admin/businesses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--forest)] hover:underline"
          >
            View all
            <ChevronRight className="size-4" />
          </Link>
        }
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
      ) : items?.length ? (
        <ul className="divide-y divide-zinc-100">
          {items.map((item) => (
            <li key={item.id} className="first:pt-0 last:pb-0">
              <Link
                href={`/admin/businesses/${item.id}`}
                className="-mx-1 flex items-center justify-between gap-2 rounded-xl px-1 py-2.5 transition-colors hover:bg-zinc-50/80 sm:gap-3 sm:py-3"
              >
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <AdminBusinessAvatar
                    name={item.name}
                    logoUrl={item.logoUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-zinc-950">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {[item.businessType, item.phone]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                      <span className="sm:hidden">
                        {` · `}
                        <AdminDate value={item.createdAt} />
                      </span>
                    </p>
                  </div>
                </div>
                <div className="hidden shrink-0 items-center gap-2 text-xs font-medium text-zinc-400 sm:flex">
                  <AdminDate value={item.createdAt} />
                  <ChevronRight className="size-4" />
                </div>
                <ChevronRight className="size-4 shrink-0 text-zinc-300 sm:hidden" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No businesses yet.</p>
      )}
    </AdminCard>
  );
}

export function AdminRecentPurchases({ items, loading }) {
  return (
    <AdminCard className={adminCardPad}>
      <AdminSectionTitle
        icon={Receipt}
        title="Recent purchases"
        subtitle="Latest paid theme unlocks"
        action={
          <Link
            href="/admin/purchases"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--forest)] hover:underline"
          >
            View all
            <ChevronRight className="size-4" />
          </Link>
        }
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
      ) : items?.length ? (
        <ul className="divide-y divide-zinc-100">
          {items.map((item) => {
            const content = (
              <>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-zinc-950">
                    {item.themeName}
                  </p>
                    <p className="truncate text-xs text-zinc-400">
                      {item.businessName} · {item.kind} theme
                      <span className="sm:hidden">
                        {` · `}
                        <AdminDate value={item.paidAt} />
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-zinc-950">
                        {formatRupeesFromPaise(item.amountPaise)}
                      </p>
                      <p className="hidden text-xs text-zinc-400 sm:block">
                        <AdminDate value={item.paidAt} />
                      </p>
                    </div>
                  {item.businessId ? (
                    <ChevronRight className="size-4 text-zinc-400" />
                  ) : null}
                </div>
              </>
            );

            return (
              <li key={item.id} className="first:pt-0 last:pb-0">
                {item.businessId ? (
                  <Link
                    href={`/admin/businesses/${item.businessId}`}
                    className="-mx-1 flex items-center justify-between gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-zinc-50/80 sm:py-3"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No purchases yet.</p>
      )}
    </AdminCard>
  );
}

export function AdminPeriodSummary({ period, loading }) {
  const rows = [
    {
      label: "New businesses",
      value: formatCount(period?.businesses),
      icon: Store,
    },
    {
      label: "Bills created",
      value: formatCount(period?.bills),
      icon: FileText,
    },
    {
      label: "Theme purchases",
      value: formatCount(period?.themePurchases),
      icon: Palette,
    },
    {
      label: "Theme revenue",
      value: formatRupeesFromPaise(period?.themeRevenuePaise),
      icon: IndianRupee,
    },
  ];

  return (
    <AdminCard className={cn("flex h-full flex-col", adminCardPad)}>
      <AdminSectionTitle
        icon={CalendarDays}
        title="This period"
        subtitle="Totals inside the selected range"
      />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl bg-[var(--well)]"
            />
          ))}
        </div>
      ) : (
        <ul className="grid flex-1 gap-3">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-[var(--well)] px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3"
              >
                <span className="inline-flex items-center gap-2.5 text-sm text-zinc-500">
                  <Icon className="size-4 text-[var(--forest)]" strokeWidth={2.25} />
                  {row.label}
                </span>
                <span className="text-base font-semibold tabular-nums text-zinc-950">
                  {row.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </AdminCard>
  );
}
