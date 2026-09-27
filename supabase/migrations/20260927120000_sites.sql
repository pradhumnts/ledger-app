-- Shop websites (one per shop for now). `draft` is what the app edits,
-- `published` is what visitors see. Service-role access only; the app talks
-- to /api/sites/*. Safe to re-run.

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  slug text unique,
  template_id text not null,
  template_version integer not null default 1,
  status text not null default 'draft',
  draft jsonb not null default '{}'::jsonb,
  published jsonb,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sites_status_check
    check (status in ('draft', 'live', 'paused', 'suspended')),
  constraint sites_slug_ok
    check (slug is null or slug ~ '^[a-z0-9]([a-z0-9-]{1,28})[a-z0-9]$'),
  constraint sites_draft_obj check (jsonb_typeof(draft) = 'object'),
  constraint sites_published_obj
    check (published is null or jsonb_typeof(published) = 'object')
);

drop trigger if exists sites_set_updated_at on public.sites;
create trigger sites_set_updated_at
before update on public.sites
for each row execute procedure public.set_updated_at();

alter table public.sites enable row level security;

revoke all on table public.sites from anon, authenticated;
grant all on table public.sites to service_role;

comment on table public.sites is
  'Shop websites served on {slug}.{SITES_DOMAIN}. Service-role access only.';

-- ---------------------------------------------------------------------------
-- Storage: website photos (path = {user_id}/{file}). Public read so live
-- sites can show them; shops can only write inside their own folder.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "site_media_write_own" on storage.objects;
create policy "site_media_write_own" on storage.objects
  for insert with check (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "site_media_update_own" on storage.objects;
create policy "site_media_update_own" on storage.objects
  for update using (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "site_media_delete_own" on storage.objects;
create policy "site_media_delete_own" on storage.objects
  for delete using (
    bucket_id = 'site-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
