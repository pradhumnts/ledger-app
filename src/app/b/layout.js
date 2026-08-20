import { APP_NAME } from "@/lib/branding";

export const metadata = {
  title: `Bill · ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default function PublicBillLayout({ children }) {
  return children;
}
