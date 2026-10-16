"use client";

import { AdminGate } from "@/components/admin/admin-gate";
import { QrThemeEditor } from "@/components/admin/qr-theme-editor";

export default function AdminQrThemeNewPage() {
  return (
    <AdminGate title="New QR theme">
      <QrThemeEditor themeId="new" />
    </AdminGate>
  );
}
