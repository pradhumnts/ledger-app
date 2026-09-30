-- Referrals: affiliate codes (₹300 per yearly subscriber) and shop codes
-- (+1 free website month per yearly subscriber). Rewards sit in a 14-day hold
-- so refunds can void them. Service-role access only. Safe to re-run.

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  upi_id text not null default '',
  note text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint affiliates_phone_in check (phone ~ '^[6-9][0-9]{9}$'),
  constraint affiliates_name_len check (char_length(name) between 1 and 120)
);

create table if not exists public.referral_codes (
  code text primary key,
  affiliate_id uuid references public.affiliates (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint referral_codes_format check (code ~ '^[A-Z0-9]{3,20}$'),
  constraint referral_codes_one_owner check (num_nonnulls(affiliate_id, user_id) = 1)
);

create unique index if not exists referral_codes_user
  on public.referral_codes (user_id) where user_id is not null;
create index if not exists referral_codes_affiliate
  on public.referral_codes (affiliate_id) where affiliate_id is not null;

create table if not exists public.referral_clicks (
  id bigint generated always as identity primary key,
  code text not null references public.referral_codes (code) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists referral_clicks_code
  on public.referral_clicks (code, created_at desc);

-- One referrer per shop. `joined` can still be changed; `subscribed` is locked.
create table if not exists public.referrals (
  referred_user_id uuid primary key references public.profiles (id) on delete cascade,
  code text not null references public.referral_codes (code),
  affiliate_id uuid references public.affiliates (id) on delete set null,
  referrer_user_id uuid references public.profiles (id) on delete set null,
  source text not null default 'typed',
  status text not null default 'joined',
  purchase_token text,
  order_id text,
  base_plan_id text,
  offer_id text,
  subscribed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint referrals_source check (source in ('link', 'typed')),
  constraint referrals_status check (status in ('joined', 'subscribed', 'void')),
  constraint referrals_not_self check (referrer_user_id is distinct from referred_user_id)
);

create index if not exists referrals_affiliate
  on public.referrals (affiliate_id, created_at desc) where affiliate_id is not null;
create index if not exists referrals_referrer
  on public.referrals (referrer_user_id, created_at desc) where referrer_user_id is not null;

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  amount_paise integer not null,
  upi_id text not null,
  status text not null default 'requested',
  reference text not null default '',
  note text not null default '',
  requested_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz,
  constraint affiliate_payouts_amount check (amount_paise > 0),
  constraint affiliate_payouts_status check (status in ('requested', 'paid', 'rejected'))
);

create index if not exists affiliate_payouts_affiliate
  on public.affiliate_payouts (affiliate_id, requested_at desc);

-- cash: ₹ for an affiliate. free_month: website month for a referring shop.
-- held → ready after the hold; cash then requested → paid, months → used.
create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referred_user_id uuid not null references public.referrals (referred_user_id) on delete cascade,
  kind text not null,
  affiliate_id uuid references public.affiliates (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  amount_paise integer not null default 0,
  months integer not null default 0,
  status text not null default 'held',
  hold_until timestamptz not null,
  purchase_token text not null,
  payout_id uuid references public.affiliate_payouts (id) on delete set null,
  used_via text,
  used_at timestamptz,
  void_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint referral_rewards_kind check (kind in ('cash', 'free_month')),
  constraint referral_rewards_owner check (
    (kind = 'cash' and affiliate_id is not null and user_id is null)
    or (kind = 'free_month' and user_id is not null and affiliate_id is null)
  ),
  constraint referral_rewards_status check (
    status in ('held', 'ready', 'applying', 'requested', 'paid', 'used', 'void')
  ),
  constraint referral_rewards_used_via check (used_via is null or used_via in ('play_defer', 'grant')),
  constraint referral_rewards_one unique (referred_user_id, kind)
);

create index if not exists referral_rewards_affiliate
  on public.referral_rewards (affiliate_id, status) where affiliate_id is not null;
create index if not exists referral_rewards_user
  on public.referral_rewards (user_id, status) where user_id is not null;
create index if not exists referral_rewards_held
  on public.referral_rewards (hold_until) where status = 'held';
create index if not exists referral_rewards_token
  on public.referral_rewards (purchase_token);

-- Website access from a free month used without a Play subscription.
create table if not exists public.site_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reward_id uuid references public.referral_rewards (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint site_access_grants_range check (ends_at > starts_at)
);

create index if not exists site_access_grants_user
  on public.site_access_grants (user_id, ends_at desc);

do $$
declare
  t text;
begin
  foreach t in array array['affiliates', 'referrals', 'referral_rewards'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I '
      'for each row execute procedure public.set_updated_at()',
      t, t
    );
  end loop;

  foreach t in array array[
    'affiliates', 'referral_codes', 'referral_clicks', 'referrals',
    'affiliate_payouts', 'referral_rewards', 'site_access_grants'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Payouts
-- ---------------------------------------------------------------------------

/** Move every ready cash reward into one payout request. Returns the payout, or null. */
create or replace function public.request_affiliate_payout(p_affiliate uuid, p_upi text)
returns public.affiliate_payouts
language plpgsql
as $$
declare
  payout public.affiliate_payouts;
  total integer;
begin
  perform 1 from public.affiliates where id = p_affiliate and active for update;
  if not found then
    return null;
  end if;

  select coalesce(sum(amount_paise), 0) into total
  from public.referral_rewards
  where affiliate_id = p_affiliate and kind = 'cash' and status = 'ready';
  if total <= 0 then
    return null;
  end if;

  insert into public.affiliate_payouts (affiliate_id, amount_paise, upi_id)
  values (p_affiliate, total, p_upi)
  returning * into payout;

  update public.referral_rewards
  set status = 'requested', payout_id = payout.id
  where affiliate_id = p_affiliate and kind = 'cash' and status = 'ready';

  update public.affiliates set upi_id = p_upi where id = p_affiliate;
  return payout;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin helpers (Supabase SQL editor until moneykit-admin has screens)
-- ---------------------------------------------------------------------------

/** select public.create_affiliate('Rahul Sharma', '9876543210', 'RAHUL', 'rahul@okaxis'); */
create or replace function public.create_affiliate(
  p_name text,
  p_phone text,
  p_code text,
  p_upi text default ''
)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
  clean_phone text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
begin
  insert into public.affiliates (name, phone, upi_id)
  values (trim(p_name), clean_phone, trim(coalesce(p_upi, '')))
  on conflict (phone) do update set name = excluded.name, active = true
  returning id into new_id;

  insert into public.referral_codes (code, affiliate_id)
  values (upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')), new_id);
  return new_id;
end;
$$;

/** select public.mark_affiliate_payout_paid('<payout id>', '<UPI reference / UTR>'); */
create or replace function public.mark_affiliate_payout_paid(p_payout uuid, p_reference text)
returns void
language plpgsql
as $$
begin
  update public.affiliate_payouts
  set status = 'paid', reference = coalesce(p_reference, ''), paid_at = timezone('utc', now())
  where id = p_payout and status = 'requested';
  if not found then
    raise exception 'Payout % is not waiting to be paid', p_payout;
  end if;
  update public.referral_rewards set status = 'paid' where payout_id = p_payout;
end;
$$;

/** select public.reject_affiliate_payout('<payout id>', 'Wrong UPI ID'); rewards go back to ready. */
create or replace function public.reject_affiliate_payout(p_payout uuid, p_note text)
returns void
language plpgsql
as $$
begin
  update public.affiliate_payouts
  set status = 'rejected', note = coalesce(p_note, '')
  where id = p_payout and status = 'requested';
  if not found then
    raise exception 'Payout % is not waiting to be paid', p_payout;
  end if;
  update public.referral_rewards
  set status = 'ready', payout_id = null
  where payout_id = p_payout;
end;
$$;

revoke all on function public.request_affiliate_payout(uuid, text) from public, anon, authenticated;
revoke all on function public.create_affiliate(text, text, text, text) from public, anon, authenticated;
revoke all on function public.mark_affiliate_payout_paid(uuid, text) from public, anon, authenticated;
revoke all on function public.reject_affiliate_payout(uuid, text) from public, anon, authenticated;
grant execute on function public.request_affiliate_payout(uuid, text) to service_role;
grant execute on function public.create_affiliate(text, text, text, text) to service_role;
grant execute on function public.mark_affiliate_payout_paid(uuid, text) to service_role;
grant execute on function public.reject_affiliate_payout(uuid, text) to service_role;

/** Payout requests to send by UPI, oldest first. */
create or replace view public.affiliate_payout_queue
with (security_invoker = true) as
select
  p.id as payout_id,
  a.name,
  a.phone,
  p.upi_id,
  p.amount_paise / 100 as amount_rupees,
  p.requested_at
from public.affiliate_payouts p
join public.affiliates a on a.id = p.affiliate_id
where p.status = 'requested'
order by p.requested_at;

revoke all on public.affiliate_payout_queue from public, anon, authenticated;
grant select on public.affiliate_payout_queue to service_role;

comment on table public.referrals is
  'Who referred each shop (affiliate or shop code). Locked once the shop buys a yearly website plan.';
comment on table public.referral_rewards is
  'Affiliate cash and shop free months from yearly subscribers, held 14 days for refunds.';
