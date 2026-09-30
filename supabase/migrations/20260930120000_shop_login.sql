-- Shop SMS login hardening and speed. Service-role access only. Safe to re-run.

-- Which phone each MSG91 request id was sent to, so a code received on one
-- number can't sign in another. Rows are deleted once used or after a day.
create table if not exists public.otp_requests (
  req_id text primary key,
  phone text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint otp_requests_phone check (phone ~ '^[0-9]{10}$')
);

create index if not exists otp_requests_created on public.otp_requests (created_at);

alter table public.otp_requests enable row level security;
revoke all on table public.otp_requests from anon, authenticated;
grant all on table public.otp_requests to service_role;

-- Auth users for a shop login (phone or login email) via indexed lookups,
-- instead of paging through every auth user on each sign-in.
create or replace function public.shop_login_user_ids(p_digits text, p_email text)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users
  where phone in ('91' || p_digits, '+91' || p_digits, p_digits)
  union
  select id from auth.users
  where email = lower(p_email) and is_sso_user = false
$$;

revoke all on function public.shop_login_user_ids(text, text) from public, anon, authenticated;
grant execute on function public.shop_login_user_ids(text, text) to service_role;
