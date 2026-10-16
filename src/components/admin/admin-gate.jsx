"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isThemeAdminPhone } from "@/lib/admin-themes";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { indianMobileDigits } from "@/lib/supabase/phone";

/**
 * Signs the admin into the same MoneyKit Supabase session as the shop PWA.
 * Only phones in `isThemeAdminPhone` can open theme admin.
 */
export function AdminGate({ children, title = "QR themes" }) {
  const [state, setState] = useState({ status: "loading", phone: "" });

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function check() {
      if (!supabase) {
        if (active) setState({ status: "missing", phone: "" });
        return;
      }
      const { data } = await supabase.auth.getSession();
      const phone = indianMobileDigits(data?.session?.user?.phone || "");
      if (!active) return;
      if (!phone) {
        setState({ status: "signedOut", phone: "" });
        return;
      }
      if (!isThemeAdminPhone(phone)) {
        setState({ status: "forbidden", phone });
        return;
      }
      setState({ status: "ok", phone });
    }

    const { data: sub } = supabase?.auth.onAuthStateChange(() => check()) || {};
    void check();
    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
        Checking admin access…
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <Shell title={title}>
        <p className="text-sm text-zinc-600">Supabase is not configured in this environment.</p>
      </Shell>
    );
  }

  if (state.status === "signedOut") {
    return (
      <Shell title={title}>
        <p className="text-sm text-zinc-600">
          Sign in to MoneyKit with an admin phone, then open this page again.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-[#0b301f] px-4 py-2 text-sm font-semibold text-white"
        >
          Open MoneyKit
        </Link>
      </Shell>
    );
  }

  if (state.status === "forbidden") {
    return (
      <Shell title={title}>
        <p className="text-sm text-zinc-600">
          {state.phone} is signed in, but it is not on the theme-admin list.
        </p>
      </Shell>
    );
  }

  return children;
}

function Shell({ title, children }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#0b301f]/uppercase">
        MoneyKit admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}
