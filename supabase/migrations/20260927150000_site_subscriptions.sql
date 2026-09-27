-- Google Play subscriptions for shop websites. One row per purchase token;
-- a shop can publish while any of its rows is active and not expired.
-- Service-role access only. Safe to re-run.

create table if not exists public.site_subscriptions (
  purchase_token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null,
  base_plan_id text,
  state text not null,
  expires_at timestamptz,
  auto_renewing boolean not null default false,
  order_id text,
  linked_purchase_token text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_subscriptions_user
  on public.site_subscriptions (user_id, expires_at desc);

drop trigger if exists site_subscriptions_set_updated_at on public.site_subscriptions;
create trigger site_subscriptions_set_updated_at
before update on public.site_subscriptions
for each row execute procedure public.set_updated_at();

alter table public.site_subscriptions enable row level security;

revoke all on table public.site_subscriptions from anon, authenticated;
grant all on table public.site_subscriptions to service_role;

comment on table public.site_subscriptions is
  'Play Billing website subscriptions (subscriptionsv2 state). Service-role access only.';
