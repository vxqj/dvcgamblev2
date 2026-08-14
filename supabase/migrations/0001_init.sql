-- ============================================================================
-- DVC CARD WARS — Supabase schema, RLS, and server-authoritative game logic
-- ============================================================================
-- Run this once in your Supabase project's SQL Editor (or via `supabase db push`
-- if you're using the CLI). Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE.
--
-- WHY THIS EXISTS
-- The client (browser) can NEVER be trusted to report its own currency,
-- username, or card ownership — anyone can open devtools → Application →
-- Local Storage and edit the JSON directly. The fix is that coins, username,
-- and card ownership are no longer *stored* in the browser at all. They live
-- in this Postgres database, the client only ever *reads* them, and the only
-- way to *change* them is by calling one of the functions below — each of
-- which is SECURITY DEFINER (runs as the table owner, not the caller) and
-- independently re-checks and re-computes everything server-side. Editing
-- localStorage no longer does anything, because the browser isn't the source
-- of truth anymore.
-- ============================================================================

-- ---- Extensions ----
create extension if not exists "pgcrypto";

-- ---- Card catalog (mirrors lib/cards-data.ts CARDS — kept in sync manually) ----
create table if not exists public.card_catalog (
  id integer primary key,
  rarity text not null
);

insert into public.card_catalog (id, rarity) values
  (1,'common'),(2,'common'),(3,'common'),(4,'common'),
  (5,'uncommon'),(6,'uncommon'),(7,'uncommon'),
  (8,'rare'),(9,'rare'),(10,'rare'),
  (11,'epic'),(12,'epic'),(13,'epic'),
  (14,'legendary'),(15,'legendary'),
  (16,'mythical'),(17,'mythical'),(18,'mythical'),
  (19,'secret'),
  (20,'secret2'),
  (21,'relic'),
  (22,'sacred'),
  (23,'digital'),
  (24,'chaos'),
  (25,'revenant'),
  (26,'apex'),
  (27,'prime'),(28,'prime'),
  (29,'supreme'),
  (30,'forbidden'),
  (31,'hollow'),
  (32,'empyrean')
on conflict (id) do update set rarity = excluded.rarity;

-- ---- Profiles: one row per auth user. Coins & username live ONLY here. ----
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  has_chosen_starter boolean not null default false,
  starter_card_id integer,
  coins integer not null default 1000,
  gems integer not null default 40,
  level integer not null default 1,
  xp integer not null default 0,
  rank_points integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_streak integer not null default 0,
  best_win_streak integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Players can read their own profile. (Leaderboards, if wired to the DB later,
-- would use a separate narrow view — not direct table access.)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- IMPORTANT: there is deliberately NO insert/update/delete policy for regular
-- clients. Every write happens inside a SECURITY DEFINER function below,
-- which bypasses RLS internally but only ever touches auth.uid()'s own row.
-- The Supabase anon/authenticated key can never UPDATE coins or username
-- directly — Postgres will reject it, full stop.

-- ---- Owned cards: one row per (user, card). Only mutated via RPCs. ----
create table if not exists public.owned_cards (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id integer not null,
  state text not null default 'locked' check (state in ('locked','owned')),
  copies integer not null default 0,
  shards integer not null default 0,
  primary key (user_id, card_id)
);

alter table public.owned_cards enable row level security;

drop policy if exists "owned_cards_select_own" on public.owned_cards;
create policy "owned_cards_select_own" on public.owned_cards
  for select using (auth.uid() = user_id);

-- ---- Battle sessions: a lightweight "receipt" so reward claims can't be spammed. ----
-- start_battle() opens one; claim_battle_reward() can only close each one once.
create table if not exists public.battle_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  resolved boolean not null default false
);

alter table public.battle_sessions enable row level security;

drop policy if exists "battle_sessions_select_own" on public.battle_sessions;
create policy "battle_sessions_select_own" on public.battle_sessions
  for select using (auth.uid() = user_id);

-- ============================================================================
-- Random username generator: "JigglyPanda57" style
-- ============================================================================
create or replace function public.generate_random_username()
returns text
language plpgsql
as $$
declare
  adjectives text[] := array[
    'Jiggly','Feral','Blazing','Frosty','Shadowy','Rowdy','Sneaky','Mighty',
    'Cursed','Glowing','Rusty','Vivid','Turbo','Grim','Chaotic','Lucky',
    'Ancient','Radiant','Savage','Nimble','Cosmic','Rogue','Silent','Wild'
  ];
  nouns text[] := array[
    'Panda','Reaver','Wraith','Falcon','Gremlin','Knight','Golem','Viper',
    'Yeti','Phantom','Raptor','Warden','Goblin','Titan','Specter','Hydra',
    'Rogue','Sentinel','Drifter','Marauder','Oracle','Warlock','Ranger','Beast'
  ];
  candidate text;
  attempts int := 0;
begin
  loop
    candidate := adjectives[1 + floor(random() * array_length(adjectives,1))::int]
              || nouns[1 + floor(random() * array_length(nouns,1))::int]
              || floor(random() * 90 + 10)::text; -- 2-digit suffix
    attempts := attempts + 1;
    exit when not exists (select 1 from public.profiles where username = candidate) or attempts > 25;
  end loop;
  return candidate;
end;
$$;

-- ============================================================================
-- Trigger: create a profile (with a random username) the moment someone signs up.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, public.generate_random_username());

  insert into public.owned_cards (user_id, card_id, state)
  select new.id, id, 'locked' from public.card_catalog;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- reroll_username(): the ONLY way a username changes. Client cannot set an
-- arbitrary value — it can only ask the server to roll a new random one.
-- ============================================================================
create or replace function public.reroll_username()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  new_name := public.generate_random_username();

  update public.profiles set username = new_name where id = auth.uid();

  return new_name;
end;
$$;

-- ============================================================================
-- choose_starter(): grants exactly one of the 5 starter cards + basic fillers.
-- Can only run once per account (has_chosen_starter guards it server-side).
-- ============================================================================
create or replace function public.choose_starter(starter_card_id integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  filler_ids integer[] := array[111,112,113,114];
  fid integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if starter_card_id not in (101,102,103,104,105) then
    raise exception 'Invalid starter card';
  end if;

  if (select has_chosen_starter from public.profiles where id = auth.uid()) then
    raise exception 'Starter already chosen';
  end if;

  insert into public.owned_cards (user_id, card_id, state, copies)
  values (auth.uid(), starter_card_id, 'owned', 1)
  on conflict (user_id, card_id) do update set state = 'owned', copies = 1;

  foreach fid in array filler_ids loop
    insert into public.owned_cards (user_id, card_id, state, copies)
    values (auth.uid(), fid, 'owned', 1)
    on conflict (user_id, card_id) do update set state = 'owned', copies = 1;
  end loop;

  update public.profiles
  set has_chosen_starter = true, starter_card_id = starter_card_id
  where id = auth.uid();
end;
$$;

-- ============================================================================
-- start_battle() / claim_battle_reward(): server-issued "receipt" pattern.
-- A battle_id must exist and be unresolved before a reward can be claimed,
-- and each battle_id can only ever be claimed once. This closes the specific
-- exploit of calling the reward endpoint over and over from devtools.
--
-- Honest limitation: this does not verify the battle was actually WON —
-- doing that requires the whole battle engine to run server-side, which is a
-- larger project. What this guarantees is that a claim requires a real,
-- server-issued, single-use session, so you can't just repeat one network
-- call to print unlimited coins.
-- ============================================================================
create or replace function public.start_battle()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.battle_sessions (user_id) values (auth.uid())
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.claim_battle_reward(battle_id uuid, result text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  session public.battle_sessions;
  base_coins integer;
  bonus_coins integer;
  new_streak integer;
  p public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if result not in ('win','loss') then
    raise exception 'Invalid result';
  end if;

  select * into session from public.battle_sessions
    where id = battle_id and user_id = auth.uid() and not resolved
    for update;

  if session is null then
    raise exception 'Battle session not found, already claimed, or not yours';
  end if;

  if now() - session.created_at > interval '15 minutes' then
    raise exception 'Battle session expired';
  end if;

  select * into p from public.profiles where id = auth.uid() for update;

  new_streak := case when result = 'win' then p.win_streak + 1 else 0 end;
  base_coins := case when result = 'win' then 250 else 75 end;
  bonus_coins := case when result = 'win' and new_streak >= 3
                       then least(400, new_streak * 25)
                       else 0 end;

  update public.profiles set
    coins = coins + base_coins + bonus_coins,
    xp = xp + case when result = 'win' then 150 else 50 end,
    wins = wins + case when result = 'win' then 1 else 0 end,
    losses = losses + case when result = 'loss' then 1 else 0 end,
    win_streak = new_streak,
    best_win_streak = greatest(best_win_streak, new_streak),
    rank_points = greatest(0, rank_points + case
      when result = 'win' then 15 + floor(random() * 15)::int
      else -(10 + floor(random() * 12)::int)
    end)
  where id = auth.uid();

  update public.battle_sessions set resolved = true where id = battle_id;

  return json_build_object('coinsGained', base_coins + bonus_coins, 'bonus', bonus_coins);
end;
$$;

-- ============================================================================
-- open_crate(): coins, the rarity roll, and the card pull ALL happen here.
-- The client sends only a crate id — never a coin amount or a desired card.
-- ============================================================================
create or replace function public.open_crate(crate_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  cost integer;
  roll numeric := random();
  acc numeric := 0;
  rarity_odds jsonb;
  chosen_rarity text;
  candidate_card integer;
  existing public.owned_cards;
  shards_needed integer;
  shards_gained integer;
  is_new boolean;
  entry jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  case crate_id
    when 'basic' then
      cost := 500;
      rarity_odds := '[["common",0.60],["uncommon",0.30],["rare",0.09],["epic",0.01]]'::jsonb;
    when 'rare' then
      cost := 2000;
      rarity_odds := '[["uncommon",0.45],["rare",0.35],["epic",0.17],["legendary",0.03]]'::jsonb;
    when 'epic' then
      cost := 7500;
      rarity_odds := '[["rare",0.40],["epic",0.38],["legendary",0.19],["mythical",0.03]]'::jsonb;
    when 'legendary' then
      cost := 25000;
      rarity_odds := '[["epic",0.35],["legendary",0.40],["mythical",0.20],["secret",0.05]]'::jsonb;
    else
      raise exception 'Unknown crate';
  end case;

  if (select coins from public.profiles where id = auth.uid()) < cost then
    raise exception 'Not enough coins';
  end if;

  for entry in select * from jsonb_array_elements(rarity_odds) loop
    acc := acc + (entry->>1)::numeric;
    if roll <= acc then
      chosen_rarity := entry->>0;
      exit;
    end if;
  end loop;
  if chosen_rarity is null then
    chosen_rarity := entry->>0; -- fallback: last tier in the table
  end if;

  select id into candidate_card from public.card_catalog
    where rarity = chosen_rarity
    order by random()
    limit 1;

  select * into existing from public.owned_cards
    where user_id = auth.uid() and card_id = candidate_card for update;

  shards_needed := 40 + (
    select case rarity
      when 'common' then 1 when 'uncommon' then 2 when 'rare' then 3 when 'epic' then 4
      when 'legendary' then 5 when 'mythical' then 6 when 'secret' then 7 when 'secret2' then 8
      when 'relic' then 9 when 'sacred' then 10 when 'digital' then 11 when 'chaos' then 12
      when 'revenant' then 13 when 'apex' then 14 when 'prime' then 15 when 'supreme' then 16
      when 'forbidden' then 17 when 'hollow' then 18 when 'empyrean' then 19 else 1 end * 20
    from public.card_catalog where id = candidate_card
  );

  if existing is null or existing.state = 'locked' then
    insert into public.owned_cards (user_id, card_id, state, copies, shards)
    values (auth.uid(), candidate_card, 'owned', 1, 0)
    on conflict (user_id, card_id) do update set state = 'owned', copies = 1;
    is_new := true;
    shards_gained := 0;
  else
    shards_gained := greatest(5, round(shards_needed * 0.12)::int);
    update public.owned_cards
      set copies = copies + 1, shards = shards + shards_gained
      where user_id = auth.uid() and card_id = candidate_card;
    is_new := false;
  end if;

  update public.profiles set coins = coins - cost where id = auth.uid();

  return json_build_object(
    'cardId', candidate_card,
    'rarity', chosen_rarity,
    'isNewCard', is_new,
    'shardsGained', shards_gained,
    'shardsNeeded', shards_needed
  );
end;
$$;
