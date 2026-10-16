"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { adminJson } from "@/lib/admin/qr-theme-admin-client";
import { cn } from "@/lib/utils";

export default function AdminQrThemesPage() {
  return (
    <AdminGate title="QR themes">
      <ThemeList />
    </AdminGate>
  );
}

function ThemeList() {
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await adminJson("/api/admin/qr-themes");
        if (cancelled) return;
        setThemes(payload.themes || []);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message || "loadFailed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id) {
    if (!window.confirm(`Delete theme “${id}”? This cannot be undone.`)) return;
    try {
      await adminJson(`/api/admin/qr-themes/${id}`, { method: "DELETE" });
      setThemes((list) => list.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message || "deleteFailed");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#0b301f]/uppercase">
            MoneyKit admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">QR themes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload poster art, drag name / QR / UPI, pick fonts, tag business types, publish.
          </p>
        </div>
        <Link
          href="/admin/qr-themes/new"
          className="rounded-full bg-[#0b301f] px-4 py-2 text-sm font-semibold text-white"
        >
          New theme
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="mt-8 text-sm text-zinc-500">Loading…</p> : null}

      {!loading && themes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <p className="text-sm text-zinc-600">No server themes yet.</p>
          <Link
            href="/admin/qr-themes/new"
            className="mt-4 inline-flex rounded-full bg-[#0b301f] px-4 py-2 text-sm font-semibold text-white"
          >
            Create the first one
          </Link>
        </div>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <li
            key={theme.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <Link href={`/admin/qr-themes/${theme.id}`} className="block">
              <div className="aspect-[390/843] max-h-56 overflow-hidden bg-zinc-100">
                {theme.previewUrl || theme.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.previewUrl || theme.posterUrl}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    No poster
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{theme.name}</h2>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      theme.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {theme.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{theme.id}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {(theme.businessTypes || []).join(", ") || "No business types"}
                  {" · "}
                  {theme.free ? "Free" : `₹${theme.priceInr}`}
                </p>
              </div>
            </Link>
            <div className="flex border-t border-zinc-100">
              <Link
                href={`/admin/qr-themes/${theme.id}`}
                className="flex-1 px-4 py-2.5 text-center text-sm font-medium text-[#0b301f]"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => remove(theme.id)}
                className="flex-1 border-l border-zinc-100 px-4 py-2.5 text-sm text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
