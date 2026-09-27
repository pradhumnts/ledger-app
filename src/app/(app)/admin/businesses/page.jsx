import { Suspense } from "react";
import AdminBusinessesPage from "./businesses-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] animate-pulse rounded-[1.75rem] bg-white" />
      }
    >
      <AdminBusinessesPage />
    </Suspense>
  );
}
