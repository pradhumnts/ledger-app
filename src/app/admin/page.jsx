"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  FileText,
  IndianRupee,
  LayoutDashboard,
  Palette,
} from "lucide-react";
import {
  AdminActivityChart,
  AdminPageHeader,
  AdminPeriodSummary,
  AdminRangeFilter,
  AdminRecentBusinesses,
  AdminRecentPurchases,
  AdminStatCard,
  AdminTopThemes,
  formatCount,
  formatRupeesFromPaise,
} from "@/components/admin/admin-dashboard";

export default function AdminDashboardPage() {
  const [range, setRange] = useState("30d");
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/metrics?range=${range}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(data.error || "Could not load metrics.");
            setMetrics(null);
          }
          return;
        }
        if (!cancelled) setMetrics(data);
      } catch {
        if (!cancelled) {
          setError("Could not reach the server.");
          setMetrics(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const totals = metrics?.totals;
  const period = metrics?.period;
  const change = period?.change;

  return (
    <div>
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Overview"
        subtitle="Platform activity across all shops."
      >
        <AdminRangeFilter value={range} onChange={setRange} />
      </AdminPageHeader>

      {error ? (
        <p className="mb-3 text-sm font-medium text-red-600 sm:mb-6" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-4">
        <AdminStatCard
          icon={Building2}
          label="Businesses"
          loading={loading}
          value={formatCount(totals?.businesses)}
          change={change?.businesses}
          hint={`${formatCount(period?.businesses)} new · ${formatCount(totals?.onboarded)} onboarded`}
        />
        <AdminStatCard
          icon={FileText}
          label="Bills created"
          loading={loading}
          value={formatCount(totals?.bills)}
          change={change?.bills}
          hint={`${formatCount(period?.bills)} in range`}
        />
        <AdminStatCard
          icon={Palette}
          label="Theme purchases"
          loading={loading}
          value={formatCount(totals?.themePurchases)}
          change={change?.themePurchases}
          hint={`${formatCount(period?.themePurchases)} in range`}
        />
        <AdminStatCard
          icon={IndianRupee}
          label="Theme revenue"
          loading={loading}
          value={formatRupeesFromPaise(totals?.themeRevenuePaise)}
          change={change?.themeRevenuePaise}
          hint={`${formatRupeesFromPaise(period?.themeRevenuePaise)} in range`}
        />
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:mt-5 sm:gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AdminActivityChart series={metrics?.series} loading={loading} />
        </div>
        <AdminPeriodSummary period={period} loading={loading} />
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:mt-5 sm:gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AdminRecentBusinesses
            items={metrics?.recentBusinesses}
            loading={loading}
          />
        </div>
        <div className="flex flex-col gap-2.5 sm:gap-5">
          <AdminRecentPurchases
            items={metrics?.recentPurchases}
            loading={loading}
          />
          <AdminTopThemes themes={metrics?.topThemes} loading={loading} />
        </div>
      </div>
    </div>
  );
}
