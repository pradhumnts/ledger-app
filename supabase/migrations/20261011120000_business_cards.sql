-- Digital business cards (moneykitapp.com/c/SLUG). Not launched yet: the only
-- card belongs to the admin account and is edited from the admin panel. The
-- slug is random and unlisted, so the page is only reachable from its QR/link.
-- Service-role access only. Safe to re-run.

create table if not exists public.business_cards (
  slug text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  card jsonb not null default '{}'::jsonb,
  view_count integer not null default 0,
  save_count integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_cards_slug_format check (slug ~ '^[a-z0-9]{8,32}$'),
  constraint business_cards_card_object check (jsonb_typeof(card) = 'object'),
  constraint business_cards_card_size check (pg_column_size(card) <= 20000)
);

-- A business can have several cards (one per team member), so user_id isn't unique.
alter table public.business_cards drop constraint if exists business_cards_user_id_key;
create index if not exists business_cards_user
  on public.business_cards (user_id, created_at);

drop trigger if exists business_cards_set_updated_at on public.business_cards;
create trigger business_cards_set_updated_at before update on public.business_cards
  for each row execute procedure public.set_updated_at();

-- 'view' when the card opens, 'save' when someone downloads the contact.
create or replace function public.record_business_card_event(p_slug text, p_kind text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.business_cards
  set view_count = view_count + case when p_kind = 'view' then 1 else 0 end,
      save_count = save_count + case when p_kind = 'save' then 1 else 0 end,
      last_viewed_at = case when p_kind = 'view' then timezone('utc', now()) else last_viewed_at end
  where slug = p_slug and p_kind in ('view', 'save');
$$;

alter table public.business_cards enable row level security;
revoke all on table public.business_cards from anon, authenticated;
grant all on table public.business_cards to service_role;

revoke execute on function public.record_business_card_event(text, text) from public, anon, authenticated;
grant execute on function public.record_business_card_event(text, text) to service_role;

comment on table public.business_cards is
  'Digital business cards at moneykitapp.com/c/SLUG (private preview). Service-role access only.';

-- The admin account's card. Its QR code is already printed, so the slug must not change.
insert into public.business_cards (slug, user_id, card)
select
  'kzugk7aeysws',
  p.id,
  jsonb_build_object(
    'name', 'Pradyumn Vaishnav',
    'title', 'Founder',
    'company', 'MoneyKit',
    'phone', '8740074255',
    'email', 'pradhumnts@gmail.com',
    'website', 'https://moneykitapp.com',
    'theme', 'midnight'
  )
from public.profiles p
where p.phone = '+918740074255'
on conflict do nothing;
