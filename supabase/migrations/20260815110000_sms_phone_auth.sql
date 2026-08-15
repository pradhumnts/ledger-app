-- SMS OTP is the only login. Run this if the init migration already ran
-- with nullable / non-unique profiles.phone.
-- Identity = verified auth.users.phone (E.164). No email / magic-link users.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.phone is null or new.phone = '' then
    raise exception 'MoneyKit accounts require a mobile number (SMS login).';
  end if;

  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do update
    set phone = excluded.phone,
        updated_at = timezone('utc', now());

  insert into public.businesses (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.sync_profile_phone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.phone is distinct from old.phone then
    if new.phone is null or new.phone = '' then
      raise exception 'MoneyKit accounts require a mobile number (SMS login).';
    end if;
    update public.profiles
    set phone = new.phone
    where id = new.id;
  end if;
  return new;
end;
$$;

alter table public.profiles drop constraint if exists profiles_phone_e164;

update public.profiles p
set phone = u.phone
from auth.users u
where p.id = u.id
  and (p.phone is null or p.phone = '')
  and u.phone is not null
  and u.phone <> '';

-- Drop empty-phone shells left by the old unverified login path.
delete from public.profiles p
where (p.phone is null or p.phone = '')
  and not exists (
    select 1 from public.customers c where c.user_id = p.id
  )
  and not exists (
    select 1 from public.entries e where e.user_id = p.id
  );

do $$
begin
  if exists (
    select 1 from public.profiles where phone is null or phone = ''
  ) then
    raise exception
      'profiles.phone still has empty values. Give those auth users a phone or delete them, then rerun this migration.';
  end if;
end $$;

alter table public.profiles
  alter column phone set not null;

alter table public.profiles
  add constraint profiles_phone_e164
  check (phone ~ '^\+[1-9][0-9]{7,14}$');

create unique index if not exists profiles_phone_key
  on public.profiles (phone);

drop trigger if exists on_auth_user_phone_updated on auth.users;
create trigger on_auth_user_phone_updated
after update of phone on auth.users
for each row execute procedure public.sync_profile_phone();
