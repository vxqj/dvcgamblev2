# Nugget List

A public voting board. Black-and-white ballot layout, live-reordering
leaderboard, votes shared globally across every visitor via Supabase.

## 1. Edit the candidates

Open `nugget.config.js` and edit the `NUGGET_NAMES` array. That's the whole
config.

## 2. Set up Supabase (free, ~3 minutes)

This is what makes votes global — without it, the site runs but nobody's
vote counts sync between visitors.

1. Go to [supabase.com](https://supabase.com) and create a new project
   (free tier is enough).
2. Once it's provisioned, open the **SQL Editor** and run the contents of
   `supabase-setup.sql` (in this project). It creates the `votes` table,
   locks it down with row-level security, adds two RPC functions that are
   the only way to move a vote count (by exactly +1 or -1), and turns on
   Realtime for the table.
3. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon public** key.
4. Copy `.env.local.example` to `.env.local` and paste them in:

   ```bash
   cp .env.local.example .env.local
   ```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — open it in two browser windows/devices and
vote in one to watch the other update live.

## 4. Deploy to jarrah.lol

The easiest path for a Next.js app is [Vercel](https://vercel.com):

1. Push this project to a GitHub repo.
2. Import it in Vercel (New Project → your repo).
3. Add the same `NEXT_PUBLIC_SUPABASE_*` variables from `.env.local` in
   Vercel's **Environment Variables** settings.
4. Deploy.
5. In Vercel's project **Settings → Domains**, add `jarrah.lol` and follow
   the DNS instructions it gives you (usually an A record or CNAME at your
   domain registrar).

Any other Next.js-friendly host (Netlify, Cloudflare Pages, your own server
with `npm run build && npm start`) works the same way — just make sure the
`NEXT_PUBLIC_SUPABASE_*` env vars are set wherever it's hosted.

## Notes

- One vote per browser, switchable any time — voting for a new name moves
  your vote rather than adding a second one.
- "My vote" is remembered locally per browser (not tied to an account), the
  vote **counts** are what's global and shared.
- Row-level security means clients can only read the table and call the two
  RPC functions — nobody can write arbitrary vote counts even with the anon
  key, since it's public by design in a client-side app.
- Reduced-motion is respected automatically.
