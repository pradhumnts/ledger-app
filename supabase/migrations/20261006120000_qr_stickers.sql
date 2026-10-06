-- Printed QR stickers (moneykitapp.com/q/CODE). They're printed in bulk with no
-- shop on them; the admin links each one to a shop later. A payment sticker opens
-- the shop's current UPI ID, a website sticker opens its live site.
-- Service-role access only. Safe to re-run.

create table if not exists public.qr_sticker_batches (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  quantity integer not null,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  constraint qr_sticker_batches_kind check (kind in ('payment', 'website')),
  constraint qr_sticker_batches_quantity check (quantity between 1 and 5000),
  constraint qr_sticker_batches_note_len check (char_length(note) <= 200)
);

create table if not exists public.qr_stickers (
  code text primary key,
  kind text not null,
  batch_id uuid references public.qr_sticker_batches (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  linked_at timestamptz,
  scan_count integer not null default 0,
  last_scanned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint qr_stickers_kind check (kind in ('payment', 'website')),
  -- P = payment, W = website, then 7 characters with no 0/O, 1/I/L or U.
  constraint qr_stickers_format check (code ~ '^[PW][23456789ABCDEFGHJKMNPQRSTVWXYZ]{7}$'),
  constraint qr_stickers_kind_prefix check (
    left(code, 1) = case kind when 'payment' then 'P' else 'W' end
  )
);

create index if not exists qr_stickers_batch
  on public.qr_stickers (batch_id, code);
create index if not exists qr_stickers_user
  on public.qr_stickers (user_id) where user_id is not null;
create index if not exists qr_stickers_created
  on public.qr_stickers (created_at desc);

drop trigger if exists qr_stickers_set_updated_at on public.qr_stickers;
create trigger qr_stickers_set_updated_at before update on public.qr_stickers
  for each row execute procedure public.set_updated_at();

create or replace function public.record_qr_sticker_scan(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.qr_stickers
  set scan_count = scan_count + 1,
      last_scanned_at = timezone('utc', now())
  where code = p_code;
$$;

alter table public.qr_sticker_batches enable row level security;
alter table public.qr_stickers enable row level security;
revoke all on table public.qr_sticker_batches from anon, authenticated;
revoke all on table public.qr_stickers from anon, authenticated;
grant all on table public.qr_sticker_batches to service_role;
grant all on table public.qr_stickers to service_role;

revoke execute on function public.record_qr_sticker_scan(text) from public, anon, authenticated;
grant execute on function public.record_qr_sticker_scan(text) to service_role;

comment on table public.qr_stickers is
  'Printed QR stickers for moneykitapp.com/q/CODE. Linked to a shop by the admin. Service-role access only.';
comment on table public.qr_sticker_batches is
  'One row per print run of QR stickers. Service-role access only.';
