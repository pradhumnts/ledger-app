"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageSpinner } from "@/components/page-spinner";

function Redirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;
    router.replace(`/invoice/new?customerId=${id}`);
  }, [id, router]);

  return <PageSpinner />;
}

export default function CustomerEntryRedirect() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Redirect />
    </Suspense>
  );
}
