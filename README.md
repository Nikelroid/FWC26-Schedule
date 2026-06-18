# 🏆 FIFA World Cup 2026 — Schedule (Pacific Time)

A clean, mobile-first single-page app for the 2026 World Cup (Canada · Mexico · USA).
All 72 group-stage matches in **Pacific Time (PDT, UTC−7)**, flags, four tabs, and my full predictions.

Tabs:

- **Matches** — Live & Next (default) / Results / All, with team search and group filters. Tap any match for live **goal scorers + minute**.
- **Tables** — live group standings (P/W/D/L/GF/GA/GD/Pts) plus a live **goals-by-team chart**.
- **Bracket** — a knockout tree (Round of 32 → Final) that fills in teams & scores from the API as rounds are played.
- **Picks** — my full predictions (champion, finalists, dark horse, group-by-group).

Everything lives in one file: **`index.html`**. The only external bits are the Chart.js CDN and your live-scores API.

## Live scores — easiest: GitHub Actions (no extra account)

The included workflow `.github/workflows/scores.yml` keeps `scores.json` in the repo up to date, and
the page reads that file directly (same-origin — no proxy, no exposed token). `PROXY_URL` stays empty.

**Designed to barely touch the API:**

- The schedule is derived from the fixture list: it wakes every 10 minutes only from
  15:45–07:00 UTC (the span the games actually occupy: 9:00 AM PT earliest kickoff →
  last game ends ~07:00 UTC) and is completely idle the other ~9 hours of the day.
- Each run (`scripts/update-scores.mjs`) calls football-data.org **only** when a match is live, just
  kicked off, awaiting its final result, or starting within 15 minutes. Finished matches are cached
  in `scores.json` and never re-fetched.
- A commit (and Pages rebuild) happens only when a score actually changes.
- Need a manual refresh? Actions tab → **Update scores** → **Run workflow** → tick **force**.

Setup (one time):

1. Get a free token: https://www.football-data.org/client/register
2. In your repo: **Settings → Secrets and variables → Actions → New repository secret**
   → Name `FD_TOKEN`, Value = your token.
3. **Settings → Actions → General → Workflow permissions** → select **Read and write permissions**.
4. Push these files, then go to the **Actions** tab → **Update scores** → **Run workflow** once to
   create `scores.json` immediately (after that it runs every ~10 minutes on its own).

Updates land within ~10 minutes — great for results and near-live scores. (Goal-scorer detail isn't
included in this mode; scores, live status, minute and full-time results are.)

## Live scores — alternative: real-time via a proxy (Cloudflare / Val.town)

Live scores come from **football-data.org** (free tier, covers the FIFA World Cup, 10 requests/min).
Its token must stay secret and it doesn't send CORS headers, so `worker.js` is a tiny **Cloudflare
Worker** that holds the token, adds CORS, and caches responses ~45s (all visitors share one upstream
request, so you stay well within the free limit).

One-time setup (~5 min) — full steps are in the comments at the top of `worker.js`:

1. Get a free token: https://www.football-data.org/client/register
2. Create a free Cloudflare Worker, paste `worker.js`, deploy
3. Add a **secret** variable `API_KEY` = your token
4. Copy the Worker URL and set `PROXY_URL` near the top of `index.html`

Once `PROXY_URL` is set, results, live status and (where the plan allows) goal scorers update
automatically. Polling is adaptive — frequent only when a match is live or about to start, otherwise
every 10 minutes — so it never burns through the rate limit.

> Until `PROXY_URL` is set, the page shows the full schedule/timezone/predictions but cannot show
> live scores (the old free TheSportsDB feed has been locked behind a paid key).

## Deploy to GitHub Pages (private repo)

A helper script is included. From this folder:

```bash
# Requires the GitHub CLI (https://cli.github.com) — one-time: gh auth login
./deploy.sh YOUR_REPO_NAME
```

Or do it manually:

```bash
git init && git add -A && git commit -m "World Cup 2026 schedule"
gh repo create fwc2026-schedule --private --source=. --push
gh api -X POST repos/:owner/fwc2026-schedule/pages -f "source[branch]=main" -f "source[path]=/"
```

Your site will be live at `https://<your-username>.github.io/fwc2026-schedule/`
(give Pages ~1 minute on the first deploy).

> Note: GitHub Pages sites are **publicly viewable by URL** even when the repository is private.
> The repo (your code) stays private; the rendered page is reachable by anyone with the link.
> For a truly private page you'd need GitHub Enterprise Pages access control.

## Updating after the group stage

The Knockouts tab shows confirmed dates and host cities with `TBD` slots.
Once groups finish (June 27), just ask: **"update the knockouts for FWC2026"** and the
bracket (Round of 32 → Final) gets filled in with the actual matchups and results.

## Data

Groups from the FIFA final draw (Dec 5, 2025). Fixtures/kickoff times converted from the
published GMT times to Pacific. Predictions are personal picks — for fun, not betting advice.
