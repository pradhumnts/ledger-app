-- Let in-app account deletion remove a shop in one statement. Safe to re-run.

-- Entries stay append-only, except when their shop's profile is gone, which
-- only happens when the account is deleted and cascades to its entries.
create or replace function public.protect_entry_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = old.user_id) then
    return old;
  end if;
  raise exception 'MoneyKit entries cannot be deleted. Set voided_at to reverse.';
end;
$$;

-- Entries still block deleting a customer who has bills, but NO ACTION is
-- checked at the end of the statement, after the cascade from the shop's
-- profile has removed its entries too. RESTRICT can fail mid-cascade.
alter table public.entries
  drop constraint if exists entries_customer_id_fkey;

alter table public.entries
  add constraint entries_customer_id_fkey
  foreign key (customer_id) references public.customers (id) on delete no action;

-- A deleted shop's referral code goes with it, along with the referral
-- records that named it.
alter table public.referrals
  drop constraint if exists referrals_code_fkey;

alter table public.referrals
  add constraint referrals_code_fkey
  foreign key (code) references public.referral_codes (code) on delete cascade;
