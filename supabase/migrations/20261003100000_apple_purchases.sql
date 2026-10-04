-- App Store purchases from the iPhone app. Safe to re-run.
-- Website plans share site_subscriptions with Play: an Apple row's
-- purchase_token is 'apple:' || originalTransactionId, stable across renewals
-- and plan switches.

alter table public.site_subscriptions
  add column if not exists provider text not null default 'play';

alter table public.site_subscriptions
  drop constraint if exists site_subscriptions_provider_check;

alter table public.site_subscriptions
  add constraint site_subscriptions_provider_check
  check (provider in ('play', 'apple'));

-- 'Production' or 'Sandbox' (TestFlight and App Review buy in Sandbox).
alter table public.site_subscriptions
  add column if not exists store_environment text;

comment on table public.site_subscriptions is
  'Website subscriptions from Google Play or the App Store, stored in Play''s subscription states. Service-role access only.';

alter table public.theme_purchases
  drop constraint if exists theme_purchases_provider_check;

alter table public.theme_purchases
  add constraint theme_purchases_provider_check
  check (provider in ('razorpay', 'play', 'apple'));

alter table public.theme_purchases
  add column if not exists apple_transaction_id text;

create unique index if not exists theme_purchases_apple_transaction
  on public.theme_purchases (apple_transaction_id)
  where apple_transaction_id is not null;

alter table public.bill_challenges
  drop constraint if exists bill_challenges_reward_via;

alter table public.bill_challenges
  add constraint bill_challenges_reward_via
  check (reward_via is null or reward_via in ('play_defer', 'apple_defer', 'grant'));
