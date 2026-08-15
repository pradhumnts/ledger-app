-- MoneyKit ledger (current product: bills, deposit-due payments, shop settings).
-- Money is stored as integer paise. Balances are computed, never stored.
-- Entries are append-only. Customers are soft-deleted so history stays intact.
-- external_id is the local app id (cus_… / ent_…) so a later backup/sync can upsert.
--
-- Login is SMS OTP only (Supabase Auth → Phone provider).
-- A session exists only after the SMS code is verified. profiles.phone is the
-- E.164 number copied from auth.users — that is the shop identity.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (current app, plus legacy due/gave so old local rows can be imported)
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.entry_kind as enum ('invoice', 'got', 'due', 'gave');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.app_language as enum ('en', 'hi', 'hinglish');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.app_appearance as enum ('light', 'dark');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Financial facts on an entry must not change after insert.
-- Description / voiding can be added later without rewriting history.
create or replace function public.protect_entry_facts()
returns trigger
language plpgsql
as $$
begin
  if
    new.user_id is distinct from old.user_id
    or new.customer_id is distinct from old.customer_id
    or new.external_id is distinct from old.external_id
    or new.kind is distinct from old.kind
    or new.amount_paise is distinct from old.amount_paise
    or new.due_paise is distinct from old.due_paise
    or new.occurred_on is distinct from old.occurred_on
    or new.created_at is distinct from old.created_at
  then
    raise exception 'MoneyKit entries are append-only. Void and insert a correction instead of updating amounts.';
  end if;
  return new;
end;
$$;

create or replace function public.protect_entry_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'MoneyKit entries cannot be deleted. Set voided_at to reverse.';
end;
$$;

-- New Auth user → empty shop row so RLS has a home as soon as SMS OTP creates the user.
-- Auth may insert the row at send-OTP time (phone can still be empty / not E.164).
-- Normalize and never raise — a failed trigger becomes "Database error saving new user".
create or replace function public.normalize_auth_phone(raw text)
returns text
language plpgsql
immutable
as $$
declare
  digits text;
begin
  digits := nullif(regexp_replace(coalesce(raw, ''), '\D', '', 'g'), '');
  if digits is null then
    return null;
  end if;
  if length(digits) = 10 then
    digits := '91' || digits;
  end if;
  if length(digits) between 8 and 15 then
    return '+' || digits;
  end if;
  return null;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
begin
  normalized := public.normalize_auth_phone(new.phone);

  insert into public.profiles (id, phone)
  values (new.id, normalized)
  on conflict (id) do update
    set phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = timezone('utc', now());

  insert into public.businesses (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
exception
  when unique_violation then
    return new;
end;
$$;

-- Keep profiles.phone in lockstep if Auth updates the number after verify / change.
create or replace function public.sync_profile_phone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
begin
  if new.phone is not distinct from old.phone then
    return new;
  end if;

  normalized := public.normalize_auth_phone(new.phone);
  if normalized is null then
    return new;
  end if;

  update public.profiles
  set phone = normalized
  where id = new.id;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_phone_e164
    check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$')
);

create unique index if not exists profiles_phone_key
  on public.profiles (phone)
  where phone is not null;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  address text not null default '',
  logo_path text,
  upi_id text not null default '',
  business_type text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint businesses_name_len check (char_length(name) <= 120),
  constraint businesses_phone_in
    check (phone = '' or phone ~ '^[6-9][0-9]{9}$'),
  constraint businesses_upi
    check (upi_id = '' or upi_id ~ '^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$'),
  constraint businesses_type_len check (char_length(business_type) <= 40)
);

create table if not exists public.settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  appearance public.app_appearance not null default 'light',
  language public.app_language not null default 'en',
  bill_theme text not null default 'classic',
  qr_theme text,
  unlocked_bill_themes text[] not null default '{}',
  unlocked_qr_themes text[] not null default '{}',
  qr_settings_version integer not null default 2,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint settings_bill_theme_len check (char_length(bill_theme) <= 40),
  constraint settings_qr_theme_len check (qr_theme is null or char_length(qr_theme) <= 40)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  external_id text not null,
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint customers_name_ok
    check (char_length(btrim(name)) >= 2 and char_length(name) <= 120),
  constraint customers_phone_in
    check (phone = '' or phone ~ '^[6-9][0-9]{9}$'),
  constraint customers_external_id_ok
    check (char_length(external_id) between 4 and 80)
);

create unique index if not exists customers_user_external_id_uidx
  on public.customers (user_id, external_id);

create unique index if not exists customers_user_phone_uidx
  on public.customers (user_id, phone)
  where phone <> '' and deleted_at is null;

create index if not exists customers_user_active_idx
  on public.customers (user_id, created_at desc)
  where deleted_at is null;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  external_id text not null,
  kind public.entry_kind not null,
  -- invoice: billed total. got: amount received. due/gave: outstanding-only (legacy).
  amount_paise bigint not null,
  -- invoice: unpaid slice of this bill. got: remaining customer due after this payment.
  -- due/gave: same as amount_paise.
  due_paise bigint not null,
  description text not null default '',
  occurred_on date not null,
  created_at timestamptz not null default timezone('utc', now()),
  voided_at timestamptz,
  void_reason text,
  constraint entries_amount_positive check (amount_paise > 0),
  constraint entries_due_nonneg check (due_paise >= 0),
  constraint entries_invoice_due_cap
    check (kind <> 'invoice' or due_paise <= amount_paise),
  constraint entries_legacy_due_matches
    check (kind not in ('due', 'gave') or due_paise = amount_paise),
  constraint entries_description_len check (char_length(description) <= 500),
  constraint entries_external_id_ok
    check (char_length(external_id) between 4 and 80),
  constraint entries_void_reason
    check (voided_at is null or char_length(coalesce(void_reason, '')) <= 200)
);

create unique index if not exists entries_user_external_id_uidx
  on public.entries (user_id, external_id);

create index if not exists entries_user_occurred_idx
  on public.entries (user_id, occurred_on desc, created_at desc)
  where voided_at is null;

create index if not exists entries_customer_idx
  on public.entries (customer_id, occurred_on desc)
  where voided_at is null;

-- Same shop cannot attach an entry to someone else's customer.
create or replace function public.entries_match_customer_owner()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.customers c
    where c.id = new.customer_id
      and c.user_id = new.user_id
  ) then
    raise exception 'Entry customer must belong to the same shop.';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row execute procedure public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute procedure public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute procedure public.set_updated_at();

drop trigger if exists entries_match_customer_owner on public.entries;
create trigger entries_match_customer_owner
before insert or update on public.entries
for each row execute procedure public.entries_match_customer_owner();

drop trigger if exists entries_protect_facts on public.entries;
create trigger entries_protect_facts
before update on public.entries
for each row execute procedure public.protect_entry_facts();

drop trigger if exists entries_protect_delete on public.entries;
create trigger entries_protect_delete
before delete on public.entries
for each row execute procedure public.protect_entry_delete();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_phone_updated on auth.users;
create trigger on_auth_user_phone_updated
after update of phone on auth.users
for each row execute procedure public.sync_profile_phone();

-- ---------------------------------------------------------------------------
-- Computed balances (source of truth stays the entries table)
-- ---------------------------------------------------------------------------

create or replace view public.customer_totals
with (security_invoker = true)
as
select
  e.user_id,
  e.customer_id,
  coalesce(sum(
    case
      when e.kind = 'got' then 0
      else e.amount_paise
    end
  ), 0)::bigint as billed_paise,
  coalesce(sum(
    case
      when e.kind = 'got' then -e.amount_paise
      when e.kind = 'invoice' then e.due_paise
      else e.amount_paise
    end
  ), 0)::bigint as outstanding_paise
from public.entries e
where e.voided_at is null
group by e.user_id, e.customer_id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.settings enable row level security;
alter table public.customers enable row level security;
alter table public.entries enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "businesses_own" on public.businesses;
create policy "businesses_own" on public.businesses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "settings_own" on public.settings;
create policy "settings_own" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "customers_own" on public.customers;
create policy "customers_own" on public.customers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "entries_own" on public.entries;
create policy "entries_own" on public.entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: shop logos (path = {user_id}/logo.jpg)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-logos',
  'business-logos',
  false,
  2621440,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "logo_read_own" on storage.objects;
create policy "logo_read_own" on storage.objects
  for select using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_write_own" on storage.objects;
create policy "logo_write_own" on storage.objects
  for insert with check (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_update_own" on storage.objects;
create policy "logo_update_own" on storage.objects
  for update using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "logo_delete_own" on storage.objects;
create policy "logo_delete_own" on storage.objects
  for delete using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

grant usage on schema public to supabase_auth_admin;
grant insert, update, select on table public.profiles to supabase_auth_admin;
grant insert, update, select on table public.businesses to supabase_auth_admin;
grant insert, update, select on table public.settings to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.sync_profile_phone() to supabase_auth_admin;
grant execute on function public.normalize_auth_phone(text) to supabase_auth_admin;
