-- Server-hosted QR payment poster themes + custom fonts for the admin editor.
-- Service-role access only (admin APIs). Safe to re-run.

create table if not exists public.qr_theme_fonts (
  id text primary key,
  name text not null,
  family text not null,
  source text not null default 'file',
  file_url text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  constraint qr_theme_fonts_source check (source in ('file')),
  constraint qr_theme_fonts_name_len check (char_length(name) between 1 and 80),
  constraint qr_theme_fonts_family_len check (char_length(family) between 1 and 120),
  constraint qr_theme_fonts_id_format check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$')
);

create table if not exists public.qr_themes (
  id text primary key,
  name text not null,
  tagline text not null default '',
  status text not null default 'draft',
  free boolean not null default false,
  price_inr integer not null default 40,
  business_types text[] not null default '{}',
  poster_url text not null default '',
  preview_url text not null default '',
  style jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint qr_themes_status check (status in ('draft', 'published')),
  constraint qr_themes_name_len check (char_length(name) between 1 and 80),
  constraint qr_themes_tagline_len check (char_length(tagline) <= 120),
  constraint qr_themes_id_format check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  constraint qr_themes_price check (price_inr between 0 and 9999)
);

create index if not exists qr_themes_status_sort
  on public.qr_themes (status, sort_order, name);
create index if not exists qr_themes_business_types
  on public.qr_themes using gin (business_types);

drop trigger if exists qr_themes_set_updated_at on public.qr_themes;
create trigger qr_themes_set_updated_at before update on public.qr_themes
  for each row execute procedure public.set_updated_at();

alter table public.qr_theme_fonts enable row level security;
alter table public.qr_themes enable row level security;
revoke all on table public.qr_theme_fonts from anon, authenticated;
revoke all on table public.qr_themes from anon, authenticated;
grant all on table public.qr_theme_fonts to service_role;
grant all on table public.qr_themes to service_role;

comment on table public.qr_theme_fonts is
  'Custom font files for QR poster themes. Google fonts stay in app code.';
comment on table public.qr_themes is
  'QR payment poster themes (draft/published). Style JSON matches QR_THEME_STYLES shape.';

-- Public asset bucket for posters, previews, and font files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'qr-theme-assets',
  'qr-theme-assets',
  true,
  8388608,
  array[
    'image/webp',
    'image/jpeg',
    'image/png',
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/font-sfnt',
    'application/octet-stream',
    'application/x-font-ttf',
    'application/x-font-opentype'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
