-- Referring shops earn ₹100 per yearly subscriber instead of a free website
-- month. Like affiliate cash, it clears after the 14-day hold; the shop asks
-- for a payout from the app and the team sends it by UPI from the admin.
-- Fails (on purpose) if any free-month rewards exist. Safe to re-run.

alter table public.referral_rewards drop constraint if exists referral_rewards_kind;
alter table public.referral_rewards drop constraint if exists referral_rewards_owner;
alter table public.referral_rewards drop constraint if exists referral_rewards_status;
alter table public.referral_rewards drop constraint if exists referral_rewards_used_via;

alter table public.referral_rewards
  add constraint referral_rewards_kind check (kind = 'cash'),
  add constraint referral_rewards_owner check (num_nonnulls(affiliate_id, user_id) = 1),
  add constraint referral_rewards_status
    check (status in ('held', 'ready', 'requested', 'paid', 'void'));

alter table public.referral_rewards
  drop column if exists months,
  drop column if exists used_via,
  drop column if exists used_at;

-- Payout requests now come from affiliates or shops.
alter table public.affiliate_payouts alter column affiliate_id drop not null;
alter table public.affiliate_payouts
  add column if not exists user_id uuid references public.profiles (id) on delete cascade;
alter table public.affiliate_payouts drop constraint if exists affiliate_payouts_one_owner;
alter table public.affiliate_payouts
  add constraint affiliate_payouts_one_owner check (num_nonnulls(affiliate_id, user_id) = 1);

create index if not exists affiliate_payouts_user
  on public.affiliate_payouts (user_id, requested_at desc) where user_id is not null;

/** Move a shop's ready cash into one payout request once it reaches `p_min_paise`. Returns the payout, or null. */
create or replace function public.request_shop_payout(p_user uuid, p_upi text, p_min_paise integer)
returns public.affiliate_payouts
language plpgsql
as $$
declare
  payout public.affiliate_payouts;
  total integer;
begin
  perform pg_advisory_xact_lock(hashtext('shop_payout:' || p_user::text));

  select coalesce(sum(amount_paise), 0) into total
  from public.referral_rewards
  where user_id = p_user and kind = 'cash' and status = 'ready';
  if total <= 0 or total < coalesce(p_min_paise, 0) then
    return null;
  end if;

  insert into public.affiliate_payouts (user_id, amount_paise, upi_id)
  values (p_user, total, p_upi)
  returning * into payout;

  update public.referral_rewards
  set status = 'requested', payout_id = payout.id
  where user_id = p_user and kind = 'cash' and status = 'ready';
  return payout;
end;
$$;

revoke all on function public.request_shop_payout(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.request_shop_payout(uuid, text, integer) to service_role;

drop view if exists public.affiliate_payout_queue;
create view public.affiliate_payout_queue
with (security_invoker = true) as
select
  p.id as payout_id,
  case when p.user_id is null then 'affiliate' else 'shop' end as payee,
  coalesce(a.name, b.name, '') as name,
  coalesce(a.phone, b.phone, '') as phone,
  p.upi_id,
  p.amount_paise / 100 as amount_rupees,
  p.requested_at
from public.affiliate_payouts p
left join public.affiliates a on a.id = p.affiliate_id
left join public.businesses b on b.user_id = p.user_id
where p.status = 'requested'
order by p.requested_at;

revoke all on public.affiliate_payout_queue from public, anon, authenticated;
grant select on public.affiliate_payout_queue to service_role;

comment on table public.affiliate_payouts is
  'UPI payout requests from affiliates (affiliate_id) and referring shops (user_id).';
comment on table public.referral_rewards is
  'Cash from yearly subscribers: ₹300 to an affiliate or ₹100 to a referring shop, held 14 days for refunds.';
