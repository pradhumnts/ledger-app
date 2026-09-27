"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Search,
} from "lucide-react";
import { AdminBusinessAvatar } from "@/components/admin/admin-business-avatar";
import {
  AdminBackLink,
  AdminCard,
  AdminDate,
  AdminPageHeader,
  formatCount,
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
      <AdminBackLink />

      <AdminPageHeader
        icon={Building2}
        title="All businesses"
        subtitle={
          loading
            ? "Loading shops…"
            : `${formatCount(data?.total || 0)} shops on MoneyKit`
        }
      >
        <form onSubmit={onSearch} className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, type"
            className="h-11 w-full rounded-full border border-[var(--border)] bg-white pr-4 pl-10 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--forest)]/15"
          />
        </form>
      </AdminPageHeader>

      {error ? (
        <p className="mb-3 text-sm font-medium text-red-600 sm:mb-6" role="alert">
          {error}
        </p>
      ) : null}

      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="space-y-2.5 p-3.5 sm:space-y-3 sm:p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-[var(--well)] sm:h-14"
              />
            ))}
          </div>
        ) : data?.items?.length ? (
          <ul className="divide-y divide-zinc-100">
            {data.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/businesses/${item.id}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-zinc-50/80 sm:gap-4 sm:px-6 sm:py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AdminBusinessAvatar
                      name={item.name}
                      logoUrl={item.logoUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
          <p className="p-6 text-sm text-zinc-500 sm:p-8">No businesses found.</p>
        )}
      </AdminCard>

      {!loading && data && totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-5">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => pushParams({ nextPage: page - 1 })}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3.5 text-sm font-semibold text-zinc-700 disabled:opacity-40 sm:px-4"
            >
              <ChevronLeft className="size-4" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => pushParams({ nextPage: page + 1 })}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3.5 text-sm font-semibold text-zinc-700 disabled:opacity-40 sm:px-4"
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
