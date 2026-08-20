import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageSpinner({ className, compact = false }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "py-8" : "py-20",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn(
          "animate-spin text-[var(--forest)] dark:text-[var(--lime)]",
          compact ? "size-5" : "size-6"
        )}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
