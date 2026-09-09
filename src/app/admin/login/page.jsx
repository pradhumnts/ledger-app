import { AdminLoginForm } from "@/components/admin/admin-ui";
import { APP_NAME } from "@/lib/branding";

export const metadata = {
  title: `Admin login · ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
