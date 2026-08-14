"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCustomerOrigin, getPreviousPath } from "@/lib/nav-memory";
import { cn } from "@/lib/utils";

export function BackLink({
  fallback = "/",
  to,
  nestedPrefix,
  origin,
  originForCustomerId,
  children,
  className,
}) {
  const router = useRouter();

  function goBack() {
    if (to) {
      router.replace(to);
      return;
    }

    if (nestedPrefix) {
      const prev = getPreviousPath();
      if (prev.startsWith(nestedPrefix)) {
        const target = originForCustomerId
          ? getCustomerOrigin(originForCustomerId)
          : origin || fallback;
        router.replace(target);
        return;
      }
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        "inline-flex items-center gap-0.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-800 dark:hover:text-zinc-200",
        className
      )}
    >
      <ChevronLeft className="size-4" />
      {children}
    </button>
  );
}
