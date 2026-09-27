import { Geist } from "next/font/google";
import { APP_NAME } from "@/lib/branding";
import "./(app)/globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: `Page not found · ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} min-h-dvh bg-[var(--app-bg)] font-sans antialiased text-foreground`}
      >
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold text-[var(--mint)]">404</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            This page doesn&apos;t exist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link may be old or typed wrong.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-[var(--forest)] px-6 text-sm font-semibold text-white"
          >
            Go to {APP_NAME}
          </a>
        </main>
      </body>
    </html>
  );
}
