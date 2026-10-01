import { giveFreeMonth } from "@/lib/referrals/free-months";

export const CHALLENGE_TARGET = 25;
export const CHALLENGE_DAYS = 7;
// Bills from before the offer went live never count.
export const CHALLENGE_LAUNCH = "2026-10-01T00:00:00+05:30";

const DAY_MS = 24 * 60 * 60 * 1000;
// Phone clocks run a little ahead; bills stamped just past "now" still count.
const CLOCK_SLACK_MS = 60 * 60 * 1000;

/** The rolling window: the last 7 days, never before launch. */
export function challengeWindow(now = Date.now()) {
  const from = Math.max(now - CHALLENGE_DAYS * DAY_MS, Date.parse(CHALLENGE_LAUNCH));
  return { from: new Date(from).toISOString(), to: new Date(now + CLOCK_SLACK_MS).toISOString() };
}

function summary(row, progress, now) {
  const completed = Boolean(row?.completed_at);
  return {
    target: CHALLENGE_TARGET,
    days: CHALLENGE_DAYS,
    state: completed ? "completed" : "active",
    progress: completed ? CHALLENGE_TARGET : Math.min(progress, CHALLENGE_TARGET),
    since: challengeWindow(now).from,
    completedAt: row?.completed_at || null,
    rewardVia: row?.reward_via || null,
  };
}

async function challengeRow(admin, userId) {
  const { data, error } = await admin
    .from("bill_challenges")
    .select("user_id, completed_at, reward_via")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("load");
  return data || null;
}

async function customersBilled(admin, userId, window) {
  const { data, error } = await admin.rpc("bill_challenge_customers", {
    p_user: userId,
    p_from: window.from,
    p_to: window.to,
  });
  if (error) throw new Error("count");
  return Number(data) || 0;
}

/** Mark the challenge won; false when another request already did. */
async function claim(admin, userId, window, completedAt) {
  const won = { started_at: window.from, ends_at: window.to, completed_at: completedAt };
  const { error } = await admin.from("bill_challenges").insert({ user_id: userId, ...won });
  if (!error) return true;
  if (error.code !== "23505") throw new Error("save");
  const { data } = await admin
    .from("bill_challenges")
    .update(won)
    .eq("user_id", userId)
    .is("completed_at", null)
    .select("user_id")
    .maybeSingle();
  return Boolean(data);
}

/**
 * The shop's challenge. Once 25 different customers have a bill made and
 * shared within the last 7 days, it completes exactly once and the free
 * month is given.
 */
export async function checkBillChallenge(admin, userId, now = Date.now()) {
  const row = await challengeRow(admin, userId);
  if (row?.completed_at) return summary(row, CHALLENGE_TARGET, now);

  const window = challengeWindow(now);
  const progress = await customersBilled(admin, userId, window);
  if (progress < CHALLENGE_TARGET) return summary(row, progress, now);

  const completedAt = new Date(now).toISOString();
  if (!(await claim(admin, userId, window, completedAt))) {
    return summary(await challengeRow(admin, userId), progress, now);
  }

  try {
    const via = await giveFreeMonth(admin, userId);
    await admin.from("bill_challenges").update({ reward_via: via }).eq("user_id", userId);
    return summary({ completed_at: completedAt, reward_via: via }, progress, now);
  } catch (error) {
    await admin.from("bill_challenges").update({ completed_at: null }).eq("user_id", userId);
    throw error;
  }
}
