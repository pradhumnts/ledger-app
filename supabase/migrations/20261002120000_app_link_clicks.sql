-- Taps on the app's short install links (moneykitapp.com/get/<tag>).
-- Installs per tag are in Play Console (utm_source / utm_campaign); this counts the taps.

create table if not exists public.app_link_clicks (
  id bigint generated always as identity primary key,
  tag text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists app_link_clicks_tag
  on public.app_link_clicks (tag, created_at desc);

alter table public.app_link_clicks enable row level security;
revoke all on table public.app_link_clicks from anon, authenticated;
grant all on table public.app_link_clicks to service_role;
