import { APP_NAME, APP_SITE_URL } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function CreatedWithMoneyKit({ className, href = APP_SITE_URL }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center text-center text-xs font-medium text-zinc-400 underline-offset-4 hover:text-zinc-600 hover:underline dark:text-zinc-500 dark:hover:text-zinc-300",
        className
      )}
    >
      Created with {APP_NAME}
    </a>
  );
}
