import { AdminLoginForm } from "@/components/admin/admin-ui";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
