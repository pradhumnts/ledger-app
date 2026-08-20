-- Short public bill links. Payload is a frozen snapshot; the URL only has an
-- unguessable id. No anon/authenticated policies — the app reads/writes via
-- the service role. Safe to re-run.

create table if not exists public.public_bills (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  entry_external_id text,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint public_bills_id_ok check (
    id ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{8}$'
  ),
  constraint public_bills_payload_obj check (jsonb_typeof(payload) = 'object')
);

create unique index if not exists public_bills_user_entry_uidx
  on public.public_bills (user_id, entry_external_id)
  where user_id is not null and entry_external_id is not null;

drop trigger if exists public_bills_set_updated_at on public.public_bills;
create trigger public_bills_set_updated_at
before update on public.public_bills
for each row execute procedure public.set_updated_at();

alter table public.public_bills enable row level security;

revoke all on table public.public_bills from anon, authenticated;
grant all on table public.public_bills to service_role;

comment on table public.public_bills is
  'Public bill snapshots keyed by short unguessable ids. Service-role access only.';
