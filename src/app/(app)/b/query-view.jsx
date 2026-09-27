"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PublicBillScreen } from "@/components/public-bill-screen";
import { decodePublicShare } from "@/lib/public-bill";

function PublicBillFromQuery() {
  const searchParams = useSearchParams();
  const snapshot = useMemo(
    () => decodePublicShare(searchParams.get("d") || ""),
    [searchParams]
  );
  return <PublicBillScreen snapshot={snapshot} />;
}

export function PublicBillQueryView() {
  return (
    <Suspense fallback={<PublicBillScreen loading />}>
      <PublicBillFromQuery />
    </Suspense>
  );
}
