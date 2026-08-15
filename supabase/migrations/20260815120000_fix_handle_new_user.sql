-- Fix "Database error saving new user" on Phone OTP.
-- Auth inserts the user first (phone may be missing or not +E.164 yet).
-- Do not raise; normalize the number and create the empty shop rows.

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

alter table public.profiles drop constraint if exists profiles_phone_e164;

alter table public.profiles
  alter column phone drop not null;

alter table public.profiles
  add constraint profiles_phone_e164
  check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$');

drop index if exists public.profiles_phone_key;
create unique index if not exists profiles_phone_key
  on public.profiles (phone)
  where phone is not null;

grant usage on schema public to supabase_auth_admin;
grant insert, update, select on table public.profiles to supabase_auth_admin;
grant insert, update, select on table public.businesses to supabase_auth_admin;
grant insert, update, select on table public.settings to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.sync_profile_phone() to supabase_auth_admin;
grant execute on function public.normalize_auth_phone(text) to supabase_auth_admin;
