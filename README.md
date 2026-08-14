# DVC Card Wars

A competitive DVC collectible card battle game — full rebuild of the dvcgamble.lol pack-opening experience into a real turn-based card game with a starter → crate progression loop and simulated matchmaking/lobbies.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (dark blood-red premium gaming theme, 19-tier rarity/foil system)
- Framer Motion for card hover, modal, matchmaking, and damage-number animations
- Zustand (with localStorage persistence) for game state — profile, decks, collection, coins, shards, battle history

## Progression loop implemented
- **First-time onboarding**: pick 1 of 5 starter cards (Blaze Knight / Frost Mage / Forest Guardian / Shadow Assassin / Light Paladin), each with a real ability → dramatic reveal → starter deck auto-granted (starter + 4 basic filler cards). New players do NOT start with the full collection.
- **Coins**: earned from battles (250 win / 75 loss + win-streak bonus), shown in the top nav and spent on crates.
- **Crates** (`/crates`): 4 tiers (Basic 500 / Rare 2,000 / Epic 7,500 / Legendary 25,000 coins) with disclosed drop-rate odds shown before opening. New cards unlock on first pull; duplicates convert to card shards (shard requirement scales with rarity tier).
- **Collection** (`/collection`): owned cards shown fully; locked cards render as silhouettes with an unlock hint (level/rank/boss/tournament/random-crate requirements defined in `lib/cards-data.ts` → `UNLOCK_HINTS`).
- **Battle rewards**: every battle ends with a Victory/Defeat modal showing coins earned, streak bonus, XP, and live progress toward the next crate tier.

## Battle & matchmaking
- `/battle`: a "Play" screen → matchmaking queue (simulated players in queue, rating search band that widens the longer you wait) → match-found VS transition with a 3-2-1 countdown → real turn-based battle arena.
- `/lobbies`: Create Battle (ranked/casual/custom, public/private) generates a room code; Join Battle lets you browse public lobbies or enter a code. All lobby/matchmaking functions (`joinQueue`, `findOpponent`, `createLobby`, `joinLobby`, etc., in `lib/matchmaking.ts` + `lib/use-matchmaking.ts`) are written as a clean local simulation behind the same function signatures a real backend/websocket layer would use later.
- Battle engine (`lib/battle-engine.ts`): damage calc with speed-scaled crits, dodges (Phantom), Blood Rage, Overcharge, Void Strike, Execution, Ambush (first-strike bonus), Burning Strike, shields (Shield/Holy Shield), burn/poison DOT, freeze/stun skip-turn, regen/regrowth healing, debuffs. AI opponent picks ability-vs-attack based on board state (low HP → shield/heal, target low HP → execution), not randomly.

## Structure
- `lib/types.ts` — shared types (cards, crates, matchmaking, lobbies)
- `lib/rarities.ts` — 19-tier rarity system (colors, foil effects, pull weights)
- `lib/cards-data.ts` — card definitions, starter cards, ability descriptions, unlock hints
- `lib/crates.ts` — crate tiers + odds + rarity roll
- `lib/progression.ts` — crate-opening logic, starter deck setup, coin rewards
- `lib/battle-engine.ts` — pure functions for damage calc, abilities, status effects
- `lib/use-battle.ts` — turn-based battle loop hook + AI
- `lib/matchmaking.ts` / `lib/use-matchmaking.ts` — queue + lobby simulation
- `store/game-store.ts` — Zustand store (persisted to localStorage)
- `components/` — Card, CardModal, onboarding, battle arena/matchmaking pieces, nav, buttons
- `app/` — Home, Battle, Lobbies, Crates, Collection, Decks, Ranked, Leaderboard, Profile

## Not yet wired up (next steps)
- No real backend — matchmaking/lobbies/coins/collection are all local simulation (architected so a backend can replace `lib/matchmaking.ts` + the store without touching UI)
- No real card artwork (placeholder glyph per card)
- Tournaments and Boss Raid are referenced (as unlock requirements / nav mentions) but not built as playable modes yet
- Daily login rewards and mission→shard payouts aren't implemented (Daily Missions on Home are still demo data)
- No audio yet, but engine has clean event points to hook sounds into

## Run locally
```bash
npm install
npm run dev
```

## Setting up Supabase (accounts, coins, cards — server-authoritative)

1. Create a project at supabase.com.
2. In the SQL Editor, paste and run `supabase/migrations/0001_init.sql` in full.
3. Project Settings → API → copy your Project URL and anon public key.
4. Copy `.env.local.example` to `.env.local` and fill in those two values.
5. Add the same two env vars to your Vercel project (Settings → Environment Variables) before deploying.
6. In Supabase → Authentication → Providers, email/password is on by default. If you don't want email confirmation required for quick local testing, turn off "Confirm email" under Authentication → Settings.

### What this actually locks down
- Coins, username, and card ownership live only in Postgres now — there is nothing left in the browser's localStorage for the Application/Storage devtools tab to edit. `store/game-store.ts` only persists deck composition, the recent-battles log, and demo lobby codes — none of which grant any advantage to tamper with.
- Usernames are auto-generated server-side (`AdjectiveNoun##`, e.g. "JigglyPanda57") by a Postgres trigger on signup. The only way to change one is the `reroll_username()` function, which picks a new random name server-side — there's no free-text rename, so there's nothing to fake either.
- Coin rewards and crate pulls are computed entirely inside SECURITY DEFINER SQL functions (`claim_battle_reward`, `open_crate`) — the client sends a battle-session id or a crate id, never an amount or a desired card, and Postgres RLS blocks any direct `UPDATE` on `profiles`/`owned_cards` from the client.
- **Honest limitation:** `claim_battle_reward` requires a real, single-use `battle_sessions` row (issued by `start_battle()` when a match begins) so the reward endpoint can't just be spammed from devtools' Network tab. It does *not* independently verify that you actually won the battle — that would require running the whole battle engine server-side, which is a larger project than this pass covers.
