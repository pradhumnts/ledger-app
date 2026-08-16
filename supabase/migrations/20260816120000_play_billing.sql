-- Play Billing one-time theme purchases. Safe to re-run.

alter table public.theme_purchases
  alter column razorpay_order_id drop not null;

alter table public.theme_purchases
  add column if not exists provider text not null default 'razorpay';

alter table public.theme_purchases
  drop constraint if exists theme_purchases_provider_check;

alter table public.theme_purchases
  add constraint theme_purchases_provider_check
  check (provider in ('razorpay', 'play'));

alter table public.theme_purchases
  add column if not exists play_sku text;

alter table public.theme_purchases
  add column if not exists play_purchase_token text;

alter table public.theme_purchases
  add column if not exists play_order_id text;

create unique index if not exists theme_purchases_play_token
  on public.theme_purchases (play_purchase_token)
  where play_purchase_token is not null;
