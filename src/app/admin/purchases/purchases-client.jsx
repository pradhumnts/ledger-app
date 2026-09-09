"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
} from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import {
  AdminIconChip,
  formatCount,
  formatRupeesFromPaise,
  formatShortDate,
} from "@/components/admin/admin-dashboard";
import { cn } from "@/lib/utils";

const KIND_FILTERS = [
  { id: "all", label: "All" },
  { id: "bill", label: "Bill" },
  { id: "qr", label: "QR" },
];

export default function AdminPurchasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const qParam = searchParams.get("q") || "";
  const kindParam = searchParams.get("kind") || "all";

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
        if (kindParam && kindParam !== "all") params.set("kind", kindParam);
        const res = await fetch(`/api/admin/purchases?${params}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setError(json.error || "Could not load purchases.");
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
  }, [page, qParam, kindParam]);

  function pushParams({
    nextPage = page,
    nextQ = query,
    nextKind = kindParam,
  }) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextKind && nextKind !== "all") params.set("kind", nextKind);
    const qs = params.toString();
    router.push(qs ? `/admin/purchases?${qs}` : "/admin/purchases");
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
          <AdminIconChip icon={Receipt} className="mt-1 size-10" />
          <div>
            <h1 className="text-[1.85rem] font-semibold tracking-tight text-zinc-950">
              All purchases
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {loading
                ? "Loading purchases…"
                : `${formatCount(data?.total || 0)} paid theme unlocks`}
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-[var(--well)] p-1">
            {KIND_FILTERS.map((option) => {
              const active = kindParam === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    pushParams({ nextPage: 1, nextKind: option.id })
                  }
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
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
          <form onSubmit={onSearch} className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shop or theme"
              className="h-11 w-full rounded-full border border-[var(--border)] bg-white pr-4 pl-10 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--forest)]/15"
            />
          </form>
        </div>
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-6 py-3 font-semibold">Theme</th>
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-6 py-3 text-right font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-50 last:border-0"
                  >
                    <td className="px-6 py-4 font-semibold text-zinc-950">
                      {item.themeName}
                    </td>
                    <td className="px-4 py-4">
                      {item.businessId ? (
                        <Link
                          href={`/admin/businesses/${item.businessId}`}
                          className="font-medium text-[var(--forest)] hover:underline"
                        >
                          {item.businessName}
                        </Link>
                      ) : (
                        <span className="text-zinc-500">{item.businessName}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 capitalize text-zinc-500">
                      {item.kind}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums text-zinc-950">
                      {formatRupeesFromPaise(item.amountPaise)}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
                      {formatShortDate(item.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-sm text-zinc-500">No purchases found.</p>
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
