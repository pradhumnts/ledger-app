"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
};

export function AdminBusinessAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}) {
  const label = name || "Shop";
  return (
    <Avatar className={cn(SIZE_CLASS[size] || SIZE_CLASS.md, className)}>
      {logoUrl ? <AvatarImage src={logoUrl} alt={label} /> : null}
      <AvatarFallback className="bg-[var(--forest)] font-semibold text-white">
        {initials(label)}
      </AvatarFallback>
    </Avatar>
  );
}
