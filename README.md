# 🏆 FIFA World Cup 2026 — Schedule (Pacific Time)

A clean, mobile-first single-page app for the 2026 World Cup (Canada · Mexico · USA).
All 72 group-stage matches in **Pacific Time (PDT, UTC−7)**, flags, four tabs, and my full predictions.

Tabs:

- **Matches** — Live & Next (default) / Results / All, with team search and group filters. Tap any match for live **goal scorers + minute**.
- **Tables** — live group standings (P/W/D/L/GF/GA/GD/Pts) plus a live **goals-by-team chart**.
- **Bracket** — a knockout tree (Round of 32 → Final) that fills in teams & scores from the API as rounds are played.
- **Picks** — my full predictions (champion, finalists, dark horse, group-by-group).

Everything lives in one file: **`index.html`**. The only external bits are the Chart.js CDN and your live-scores API.

## Live scores (API-Football via a free Cloudflare proxy)

For real goal-by-goal live scores, the page uses **API-Football**. Its key must stay secret, so
`worker.js` is a tiny **Cloudflare Worker** that holds the key, adds CORS, and caches responses for
60s (so all visitors share one upstream request and you stay under the free quota).

One-time setup (~5 min) — full steps are in the comments at the top of `worker.js`:

1. Get a free key at https://www.api-football.com
2. Create a free Cloudflare Worker, paste `worker.js`, deploy
3. Add a **secret** variable `API_KEY` = your key
4. Copy the Worker URL and set `PROXY_URL` near the top of `index.html`

**Until you set `PROXY_URL`, the page automatically falls back to the free, keyless
[TheSportsDB](https://www.thesportsdb.com)** — so it works the moment you deploy, just without
in-play goal detail. If the proxy is ever unreachable, it falls back too.

> Note: API-Football's free tier is 100 requests/day. The Worker's 60s cache makes that go a long
> way for a personal page, but for a heavy match day you may want a cheap paid tier — no page
> changes needed, just a higher-limit key on the same Worker.

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
