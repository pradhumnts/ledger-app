import { APP_NAME } from "@/lib/branding";

export const metadata = {
  title: `Pay with UPI · ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default function PayLinkLayout({ children }) {
  return children;
}
