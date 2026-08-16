-- Theme one-time purchases (Razorpay). Safe to re-run if the table already exists.

create table if not exists public.theme_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('bill', 'qr')),
  theme_id text not null,
  amount_paise integer not null check (amount_paise > 0),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz
);

create unique index if not exists theme_purchases_user_theme
  on public.theme_purchases (user_id, kind, theme_id)
  where status = 'paid';

alter table public.theme_purchases enable row level security;

drop policy if exists "theme_purchases_own" on public.theme_purchases;
create policy "theme_purchases_own"
  on public.theme_purchases
  for select using (user_id = auth.uid());

grant select on table public.theme_purchases to authenticated;
grant all on table public.theme_purchases to service_role;
