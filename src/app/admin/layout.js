import { AdminShell } from "@/components/admin/admin-shell";
import { APP_NAME, BACKGROUND_COLOR, THEME_COLOR } from "@/lib/branding";
import { ADMIN_MANIFEST_PATH } from "@/lib/web-manifests";

export const metadata = {
  title: {
    default: `${APP_NAME} Admin`,
    template: `%s · ${APP_NAME} Admin`,
    absolute: `${APP_NAME} Admin`,
  },
  applicationName: `${APP_NAME} Admin`,
  manifest: ADMIN_MANIFEST_PATH,
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: `${APP_NAME} Admin`,
  },
};

export const viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(display-mode: standalone)", color: THEME_COLOR },
    { color: BACKGROUND_COLOR },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
