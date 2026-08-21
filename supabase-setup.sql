-- Run this in your Supabase project's SQL Editor (SQL Editor → New query → Run).
-- Safe to run multiple times — every statement either uses IF NOT EXISTS,
-- OR REPLACE, or its own guard, so re-running this after a partial failure
-- will not error out or duplicate anything.

-- 1. The votes table
create table if not exists votes (
  slug text primary key,
  name text not null,
  count integer not null default 0
);

-- 2. Lock it down: anyone can read, nobody can write directly.
--    Writes only happen through the RPC functions below.
alter table votes enable row level security;

drop policy if exists "Public read access" on votes;
create policy "Public read access"
  on votes for select
  using (true);

-- 3. Atomic increment/decrement functions.
--    security definer + a bypassrls-capable owner (the default when
--    created via the SQL Editor) means these can write despite RLS
--    being enabled above — but only by exactly +1 or -1 per call.
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

-- Grants placed immediately after each function so they always run even
-- if a later statement in this script (e.g. the publication step below)
-- fails on a re-run — the SQL Editor runs a whole script as one
-- transaction, so ordering like this matters.
grant execute on function increment_vote(text, text) to anon;
grant execute on function decrement_vote(text) to anon;
grant execute on function increment_vote(text, text) to authenticated;
grant execute on function decrement_vote(text) to authenticated;

-- 4. Turn on Realtime for this table so every visitor sees live updates,
--    guarded so it won't error if it's already enabled.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table votes;
  end if;
end $$;

-- After running this, also double-check in the dashboard:
-- Database → Replication → the "votes" table toggle should be ON.
-- That toggle is the source of truth — this script's alter publication
-- step and the dashboard toggle control the same setting, but if you
-- ever see them disagree, trust the dashboard toggle.
