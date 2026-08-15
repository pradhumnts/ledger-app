import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_LOGO_WEBP, APP_NAME } from "@/lib/branding";

const BADGE_SIZES = {
  sm: 40,
  md: 45,
  lg: 64,
  xl: 88,
};

export function MoneyKitLogo({
  className,
  size = 32,
  priority = false,
  alt = APP_NAME,
  variant = "plain",
  badgeSize = "md",
}) {
  if (variant !== "badge") {
    return (
      <Image
        src={APP_LOGO_WEBP}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  const badgeSizePx = BADGE_SIZES[badgeSize] ?? BADGE_SIZES.md;

  return (
    <Image
      src={APP_LOGO_WEBP}
      alt={alt}
      width={badgeSizePx}
      height={badgeSizePx}
      priority={priority}
      className={cn(
        "shrink-0 rounded-[1.25rem] border border-black/5 bg-white object-contain shadow-sm dark:border-white/10",
        className
      )}
    />
  );
}
