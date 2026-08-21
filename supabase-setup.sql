-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- 1. The votes table
create table if not exists votes (
  slug text primary key,
  name text not null,
  count integer not null default 0
);

-- 2. Lock it down: anyone can read, nobody can write directly.
--    Writes only happen through the RPC functions below, which can
--    only move a count by exactly +1 or -1.
alter table votes enable row level security;

drop policy if exists "Public read access" on votes;
create policy "Public read access"
  on votes for select
  using (true);

-- 3. Atomic increment/decrement functions
create or replace function increment_vote(vote_slug text, vote_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into votes (slug, name, count)
  values (vote_slug, vote_name, 1)
  on conflict (slug) do update set count = votes.count + 1;
end;
$$;

create or replace function decrement_vote(vote_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update votes set count = greatest(count - 1, 0) where slug = vote_slug;
end;
$$;

grant execute on function increment_vote(text, text) to anon;
grant execute on function decrement_vote(text) to anon;

-- 4. Turn on Realtime for this table so every visitor sees live updates.
--    (Dashboard → Database → Replication → toggle "votes" on)
--    Or via SQL:
alter publication supabase_realtime add table votes;
