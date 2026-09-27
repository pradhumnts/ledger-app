import { Suspense } from "react";
import { PreviewClient } from "./preview-client";

export const metadata = {
  title: "Website preview",
  robots: { index: false, follow: false },
};

export default function SitePreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewClient />
    </Suspense>
  );
}
