import { shopSitePlayUrl } from "@/lib/branding";

export const metadata = {
  title: "Website not found",
  robots: { index: false },
};

export default function SiteNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f3ec] px-6 text-center text-[#1f1b16]">
      <div>
        <p className="font-serif text-6xl font-semibold">404</p>
        <h1 className="mt-4 text-lg font-medium">This website is not available</h1>
        <p className="mt-2 text-sm text-[#6f685e]">
          The link may be wrong, or the business has not published it yet.
        </p>
        <a
          href={shopSitePlayUrl("not_found")}
          className="mt-8 inline-flex rounded-full bg-[#1f1b16] px-6 py-3 text-sm font-medium text-[#f7f3ec]"
        >
          Make your own website with MoneyKit
        </a>
      </div>
    </main>
  );
}
