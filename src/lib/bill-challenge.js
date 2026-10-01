import { giveFreeMonth } from "@/lib/referrals/free-months";

export const CHALLENGE_TARGET = 25;
export const CHALLENGE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
// Bills shared offline reach us late; their own timestamps must still fall in the window.
const LATE_SYNC_MS = 2 * DAY_MS;

function summary(row, progress = 0, now = Date.now()) {
  const base = { target: CHALLENGE_TARGET, days: CHALLENGE_DAYS };
  if (!row) {
    return { ...base, state: "available", progress: 0, startedAt: null, endsAt: null, completedAt: null, rewardVia: null };
  }
  const completed = Boolean(row.completed_at);
  return {
    ...base,
    state: completed ? "completed" : now >= Date.parse(row.ends_at) ? "ended" : "active",
    progress: completed ? Math.max(progress, CHALLENGE_TARGET) : Math.min(progress, CHALLENGE_TARGET),
    startedAt: row.started_at,
    endsAt: row.ends_at,
    completedAt: row.completed_at || null,
    rewardVia: row.reward_via || null,
  };
}

async function challengeRow(admin, userId) {
  const { data, error } = await admin
    .from("bill_challenges")
    .select("user_id, started_at, ends_at, completed_at, reward_via")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("load");
  return data || null;
}

async function customersBilled(admin, row) {
  const { data, error } = await admin.rpc("bill_challenge_customers", {
    p_user: row.user_id,
    p_from: row.started_at,
    p_to: row.ends_at,
  });
  if (error) throw new Error("count");
  return Number(data) || 0;
}

/**
 * The shop's challenge. Once 25 customers have a bill created and shared in
 * the window, it completes exactly once and the free month is given.
 */
export async function checkBillChallenge(admin, userId, now = Date.now()) {
  const row = await challengeRow(admin, userId);
  if (!row) return summary(null, 0, now);
  if (row.completed_at) return summary(row, CHALLENGE_TARGET, now);

  const progress = await customersBilled(admin, row);
  const canComplete = now < Date.parse(row.ends_at) + LATE_SYNC_MS;
  if (progress < CHALLENGE_TARGET || !canComplete) return summary(row, progress, now);

  const completedAt = new Date(now).toISOString();
  const { data: won } = await admin
    .from("bill_challenges")
    .update({ completed_at: completedAt })
    .eq("user_id", userId)
    .is("completed_at", null)
    .select("user_id")
    .maybeSingle();
  if (!won) return summary(await challengeRow(admin, userId), progress, now);

  try {
    const via = await giveFreeMonth(admin, userId);
    await admin.from("bill_challenges").update({ reward_via: via }).eq("user_id", userId);
    return summary({ ...row, completed_at: completedAt, reward_via: via }, progress, now);
  } catch (error) {
    await admin.from("bill_challenges").update({ completed_at: null }).eq("user_id", userId);
    throw error;
  }
}

/** Start the 7 days now. A shop gets one challenge; starting again returns the same one. */
export async function startBillChallenge(admin, userId, now = Date.now()) {
  const { error } = await admin.from("bill_challenges").insert({
    user_id: userId,
    started_at: new Date(now).toISOString(),
    ends_at: new Date(now + CHALLENGE_DAYS * DAY_MS).toISOString(),
  });
  if (error && error.code !== "23505") throw new Error("save");
  return checkBillChallenge(admin, userId, now);
}
