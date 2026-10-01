-- Bill challenge: bill 25 different customers (created and shared) within 7 days
-- of starting, once per shop, for one free website month.

create table if not exists public.bill_challenges (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  started_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz not null,
  completed_at timestamptz,
  reward_via text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bill_challenges_range check (ends_at > started_at),
  constraint bill_challenges_reward_via check (reward_via is null or reward_via in ('play_defer', 'grant'))
);

drop trigger if exists bill_challenges_set_updated_at on public.bill_challenges;
create trigger bill_challenges_set_updated_at before update on public.bill_challenges
  for each row execute procedure public.set_updated_at();

alter table public.bill_challenges enable row level security;
revoke all on table public.bill_challenges from anon, authenticated;
grant all on table public.bill_challenges to service_role;

-- Customers with at least one bill both created and shared in [p_from, p_to).
create or replace function public.bill_challenge_customers(p_user uuid, p_from timestamptz, p_to timestamptz)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct e.customer_id)::integer
  from public.entries e
  join public.entry_shares s
    on s.user_id = e.user_id and s.entry_external_id = e.external_id
  where e.user_id = p_user
    and e.kind = 'invoice'
    and e.voided_at is null
    and e.created_at >= p_from and e.created_at < p_to
    and s.shared_at >= p_from and s.shared_at < p_to
$$;

revoke all on function public.bill_challenge_customers(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.bill_challenge_customers(uuid, timestamptz, timestamptz) to service_role;
