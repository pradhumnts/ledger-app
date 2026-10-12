-- Business cards are created in the admin panel. A card can be given to a shop
-- (user_id) or left unassigned, e.g. for staff, partners or demos. Safe to re-run.

alter table public.business_cards alter column user_id drop not null;

create index if not exists business_cards_created
  on public.business_cards (created_at desc);

comment on table public.business_cards is
  'Digital business cards at moneykitapp.com/c/SLUG (private preview). user_id is the shop the card belongs to, if any. Service-role access only.';
