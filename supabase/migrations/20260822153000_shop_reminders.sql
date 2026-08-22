-- Signed-in shop reminders: unshared bills (~8pm IST) and old dues (~3pm IST).
-- Share state lives here because ledger entries are append-only.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Push subscriptions (Web Push). One row per browser/device endpoint.
-- ---------------------------------------------------------------------------

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint push_subscriptions_endpoint_len check (char_length(endpoint) between 20 and 2048),
  constraint push_subscriptions_p256dh_len check (char_length(p256dh) between 20 and 200),
  constraint push_subscriptions_auth_len check (char_length(auth) between 8 and 200)
);

create unique index if not exists push_subscriptions_endpoint_uidx
  on public.push_subscriptions (endpoint);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row execute procedure public.set_updated_at();

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_own" on public.push_subscriptions;
create policy "push_subscriptions_own" on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Which bills this shop already shared (WhatsApp / SMS / PDF).
-- ---------------------------------------------------------------------------

create table if not exists public.entry_shares (
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_external_id text not null,
  shared_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, entry_external_id),
  constraint entry_shares_external_id_ok
    check (char_length(entry_external_id) between 4 and 80)
);

create index if not exists entry_shares_user_idx
  on public.entry_shares (user_id, shared_at desc);

alter table public.entry_shares enable row level security;

drop policy if exists "entry_shares_own" on public.entry_shares;
create policy "entry_shares_own" on public.entry_shares
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Dedupe: unshared once per IST day; old-due once per customer per week.
-- Cron writes with the service role. Shops cannot insert their own receipts.
-- ---------------------------------------------------------------------------

create table if not exists public.notification_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  customer_external_id text,
  sent_on date not null,
  sent_at timestamptz not null default timezone('utc', now()),
  constraint notification_receipts_kind_ok
    check (kind in ('unshared', 'old_due')),
  constraint notification_receipts_customer_ok
    check (
      customer_external_id is null
      or char_length(customer_external_id) between 4 and 80
    )
);

create unique index if not exists notification_receipts_unshared_day_uidx
  on public.notification_receipts (user_id, sent_on)
  where kind = 'unshared';

create index if not exists notification_receipts_due_customer_idx
  on public.notification_receipts (user_id, customer_external_id, sent_at desc)
  where kind = 'old_due';

alter table public.notification_receipts enable row level security;

revoke all on table public.notification_receipts from anon, authenticated;
grant all on table public.notification_receipts to service_role;

comment on table public.push_subscriptions is
  'Web Push endpoints for signed-in shops. Used by 8pm unshared-bill and 3pm old-due crons.';

comment on table public.entry_shares is
  'Marks bills the shop already shared so the 8pm reminder can skip them.';

comment on table public.notification_receipts is
  'Prevents duplicate reminders. Service-role (cron) writes only.';
