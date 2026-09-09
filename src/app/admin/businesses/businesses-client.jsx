"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Search,
} from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import { AdminBusinessAvatar } from "@/components/admin/admin-business-avatar";
import {
  AdminIconChip,
  formatCount,
  formatShortDate,
} from "@/components/admin/admin-dashboard";
import { cn } from "@/lib/utils";

export default function AdminBusinessesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const qParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(qParam);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (qParam.trim()) params.set("q", qParam.trim());
        const res = await fetch(`/api/admin/businesses?${params}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(json.error || "Could not load businesses.");
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
  }, [page, qParam]);

  function pushParams({ nextPage = page, nextQ = query }) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextQ.trim()) params.set("q", nextQ.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/businesses?${qs}` : "/admin/businesses");
  }

  function onSearch(event) {
    event.preventDefault();
    pushParams({ nextPage: 1, nextQ: query });
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Overview
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <AdminIconChip icon={Building2} className="mt-1 size-10" />
          <div>
            <h1 className="text-[1.85rem] font-semibold tracking-tight text-zinc-950">
              All businesses
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {loading
                ? "Loading shops…"
                : `${formatCount(data?.total || 0)} shops on MoneyKit`}
            </p>
          </div>
        </div>

        <form onSubmit={onSearch} className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, type"
            className="h-11 w-full rounded-full border border-[var(--border)] bg-white pr-4 pl-10 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--forest)]/15"
          />
        </form>
      </div>

      {error ? (
        <p className="mb-6 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <SoftCard className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-[var(--well)]"
              />
            ))}
          </div>
        ) : data?.items?.length ? (
          <ul className="divide-y divide-zinc-100">
            {data.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/businesses/${item.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-zinc-50/80"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AdminBusinessAvatar
                      name={item.name}
                      logoUrl={item.logoUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-zinc-950">
                          {item.name}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            item.onboarded
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {item.onboarded ? (
                            <BadgeCheck className="size-3" />
                          ) : (
                            <CircleAlert className="size-3" />
                          )}
                          {item.onboarded ? "Onboarded" : "Incomplete"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-400">
                        {[item.businessTypeLabel || item.businessType, item.phone]
                          .filter(Boolean)
                          .join(" · ") || "No details yet"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-zinc-400">
                    <span>{formatShortDate(item.createdAt)}</span>
                    <ChevronRight className="size-4" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-sm text-zinc-500">No businesses found.</p>
        )}
      </SoftCard>

      {!loading && data && totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => pushParams({ nextPage: page - 1 })}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-zinc-700 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => pushParams({ nextPage: page + 1 })}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-zinc-700 disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
