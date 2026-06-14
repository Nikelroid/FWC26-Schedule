# 🏆 FIFA World Cup 2026 — Schedule (Pacific Time)

A clean, mobile-first single-page schedule for the 2026 World Cup (Canada · Mexico · USA).
All 72 group-stage matches with kickoff times converted to **Pacific Time (PDT, UTC−7)**, flags,
group filters, team search, live/next-match highlighting, a knockout bracket, and my full predictions.

Everything lives in one file: **`index.html`** — no build step, no dependencies.

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
