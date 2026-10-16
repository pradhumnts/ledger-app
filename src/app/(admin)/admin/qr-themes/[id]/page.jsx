"use client";

import { use } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { QrThemeEditor } from "@/components/admin/qr-theme-editor";

export default function AdminQrThemeEditPage({ params }) {
  const { id } = use(params);
  return (
    <AdminGate title="Edit QR theme">
      <QrThemeEditor themeId={id} />
    </AdminGate>
  );
}
