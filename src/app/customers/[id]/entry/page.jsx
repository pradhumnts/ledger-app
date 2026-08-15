"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";

function Redirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;
    router.replace(`/invoice/new?customerId=${id}`);
  }, [id, router]);

  return null;
}

export default function CustomerEntryRedirect() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">{t("common.loading")}</p>}>
      <Redirect />
      <p className="text-sm text-zinc-500">{t("common.loading")}</p>
    </Suspense>
  );
}
