# Nugget List

A public voting board. Black-and-white ballot layout, live-reordering
leaderboard, votes shared globally across every visitor via Firebase.

## 1. Edit the candidates

Open `nugget.config.js` and edit the `NUGGET_NAMES` array. That's the whole
config.

## 2. Set up Firebase (free, ~3 minutes)

This is what makes votes global — without it, the site runs but nobody's
vote counts sync between visitors.

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and create a new project (free "Spark" plan is enough).
2. In the project, click **Build → Realtime Database → Create Database**.
   Choose a location, start in **locked mode**.
3. Go to the **Rules** tab of the Realtime Database and paste:

   ```json
   {
     "rules": {
       "votes": {
         ".read": true,
         "$slug": {
           ".write": true,
           ".validate": "newData.isNumber() && newData.val() >= 0"
         }
       }
     }
   }
   ```

   This lets anyone read the tallies and increment/decrement a vote count,
   but nothing else in your database.

4. Go to **Project settings → General → Your apps**, click the web icon
   (`</>`) to register a web app, and copy the config values it gives you.
5. Copy `.env.local.example` to `.env.local` and paste in those values:

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
3. Add the same `NEXT_PUBLIC_FIREBASE_*` variables from `.env.local` in
   Vercel's **Environment Variables** settings.
4. Deploy.
5. In Vercel's project **Settings → Domains**, add `jarrah.lol` and follow
   the DNS instructions it gives you (usually an A record or CNAME at your
   domain registrar).

Any other Next.js-friendly host (Netlify, Cloudflare Pages, your own server
with `npm run build && npm start`) works the same way — just make sure the
`NEXT_PUBLIC_FIREBASE_*` env vars are set wherever it's hosted.

## Notes

- One vote per browser, switchable any time — voting for a new name moves
  your vote rather than adding a second one.
- "My vote" is remembered locally per browser (not tied to an account), the
  vote **counts** are what's global and shared.
- Reduced-motion is respected automatically.
