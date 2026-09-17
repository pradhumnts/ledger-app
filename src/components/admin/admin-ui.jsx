"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogOut, Mail } from "lucide-react";
import { SoftCard } from "@/components/ui-kit";
import { MoneyKitLogo } from "@/components/moneykit-logo";
import { APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function AdminLogoutButton({ className }) {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Still clear local navigation even if the request fails.
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-black/[0.04] hover:text-zinc-950",
        className
      )}
    >
      <LogOut className="size-4" strokeWidth={2.25} />
      Log out
    </button>
  );
}

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not sign in.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 text-center sm:mb-8">
          <MoneyKitLogo
            variant="badge"
            badgeSize="lg"
            priority
            className="mx-auto mb-5 rounded-[1.5rem] shadow-[0_12px_32px_rgba(11,48,31,0.18)]"
          />
          <h1 className="text-[1.85rem] font-semibold tracking-tight text-zinc-950">
            {APP_NAME} Admin
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to view platform metrics.
          </p>
        </div>

        <SoftCard className="p-5 sm:p-7">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white pr-4 pl-11 text-[15px] text-zinc-950 outline-none transition-[box-shadow,border-color] placeholder:text-zinc-400 focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--forest)]/15"
                  placeholder="admin@moneykit.app"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white pr-4 pl-11 text-[15px] text-zinc-950 outline-none transition-[box-shadow,border-color] placeholder:text-zinc-400 focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--forest)]/15"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--forest)] text-[15px] font-semibold text-white transition-[opacity,transform] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </SoftCard>
      </div>
    </div>
  );
}
