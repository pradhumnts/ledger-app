import { cn } from "@/lib/utils";

export function FieldError({ id, children, className }) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn("text-xs text-rose-600 dark:text-rose-400", className)}
    >
      {children}
    </p>
  );
}
