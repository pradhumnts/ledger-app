"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUBMIT_CLASS =
  "h-12 w-full rounded-full bg-[var(--forest)] text-base font-semibold text-white hover:bg-[var(--forest-soft)] dark:bg-[var(--lime)] dark:text-[var(--forest)] dark:hover:bg-[var(--lime)]/90";

export function SubmitButton({
  loading,
  children,
  loadingLabel,
  className,
  disabled,
  ...props
}) {
  return (
    <Button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading}
      className={cn(SUBMIT_CLASS, className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {loadingLabel || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
