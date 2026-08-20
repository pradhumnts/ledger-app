"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PublicBillScreen } from "@/components/public-bill-screen";
import { decodePublicBill } from "@/lib/public-bill";

function PublicBillFromQuery() {
  const searchParams = useSearchParams();
  const snapshot = useMemo(
    () => decodePublicBill(searchParams.get("d") || ""),
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
