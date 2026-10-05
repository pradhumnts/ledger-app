-- A shop's connected Instagram professional account (Standard plan): live sites
-- show its latest posts. Tokens are long-lived (60 days) and refreshed by
-- /api/cron/instagram. Service-role access only. Safe to re-run.

create table if not exists public.site_instagram (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  -- `user_id` from the token exchange (app-scoped) and the account's `user_id` from /me;
  -- Meta's deauthorize / data deletion callbacks may send either.
  ig_user_id text not null,
  ig_account_id text not null default '',
  username text not null default '',
  access_token text not null,
  expires_at timestamptz not null,
  refreshed_at timestamptz not null default timezone('utc', now()),
  connected_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_instagram_ig_user_id on public.site_instagram (ig_user_id);
create index if not exists site_instagram_ig_account_id on public.site_instagram (ig_account_id);
create index if not exists site_instagram_refreshed_at on public.site_instagram (refreshed_at);

alter table public.site_instagram enable row level security;
revoke all on table public.site_instagram from anon, authenticated;
grant all on table public.site_instagram to service_role;

comment on table public.site_instagram is
  'Instagram accounts connected to shop websites (access tokens). Service-role access only.';
