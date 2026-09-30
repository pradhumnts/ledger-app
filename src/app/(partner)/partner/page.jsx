import { cookies } from "next/headers";
import { PARTNER_COOKIE, readPartnerSession } from "@/lib/referrals/partner-session";
import { affiliateSummary, unlockDueRewards } from "@/lib/referrals/store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PartnerDashboard } from "./partner-dashboard";
import { PartnerLogin } from "./partner-login";

async function loadSummary() {
  const store = await cookies();
  const affiliateId = readPartnerSession(store.get(PARTNER_COOKIE)?.value);
  const admin = getSupabaseAdmin();
  if (!affiliateId || !admin) return null;
  await unlockDueRewards(admin, { affiliateId }).catch(() => {});
  return affiliateSummary(admin, affiliateId);
}

export default async function PartnerPage() {
  const summary = await loadSummary();
  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-5 pb-16 pt-8">
      {summary ? <PartnerDashboard summary={summary} /> : <PartnerLogin />}
    </main>
  );
}
