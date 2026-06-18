# 🏆 World Cup 2026 — Schedule & Live Scores

A clean, installable web app for the **2026 FIFA World Cup** (Canada · Mexico · USA).
Schedule, live scores, group tables, knockout bracket and predictions — in **your timezone**,
in **English & فارسی**.

🔗 **Live:** https://kelidari.com/FWC26-Schedule

It's a single static page — no build step, no framework. Just open `index.html`.

## ✨ Features

- 📅 **All 104 fixtures** in your local timezone (auto-detected, switchable).
- 🔴 **Live & Next / Results / All** filters, plus search and group chips.
- 📊 **Group tables** (live) + a **best third-placed teams** table and a goals chart.
- 🌳 **Knockout bracket** that fills in as rounds are played.
- ⭐ **Follow teams** (star them in the Tables tab) and filter to your favourites.
- 🗓️ **Add any match to your calendar** and 📤 **share a match as an image**.
- 🤖 **Predictions** (champion, finalists, group-by-group).
- 🌍 **English / Persian** with full right-to-left support.
- 📲 **Installable** like a native app (Add to Home Screen).

## 🧩 How it's built (1-minute tour)

Everything lives in **`index.html`** — data, styles, and logic in one file.

| File | What it is |
|------|------------|
| `index.html` | The whole app. Edit this for 99% of changes. |
| `scores.json` | Live scores, written automatically (don't edit by hand). |
| `scripts/update-scores.mjs` | The script the robot runs to refresh `scores.json`. |
| `.github/workflows/scores.yml` | Schedules that script during match hours. |
| `valtown-proxy.js` / `worker.js` | Optional proxies for real-time live scores. |
| `site.webmanifest`, `icon.png` | App icon + "install to home screen" config. |

**Where scores come from:** the page shows live scores from a small proxy (real-time) and
falls back to `scores.json` (updated by a scheduled GitHub Action). The secret API token is
never in the page — it lives only in the proxy / GitHub Secret.

## 🛠️ Run it locally

```bash
git clone https://github.com/Nikelroid/FWC26-Schedule.git
cd FWC26-Schedule
```

Then just **open `index.html`** in your browser. That's it — the schedule, tables, bracket,
predictions, timezone and language switch all work offline. (Live scores need the deployed
`scores.json` or a proxy, so locally they may be empty — that's normal.)

Want a local server (optional)?

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## 🤝 Contributing — it's easy!

Almost everything is plain HTML/CSS/JS in `index.html`. Here's where common things live:

- **Fix a fixture / time / venue** → the `M` array near the top of the `<script>`.
- **Change a prediction** → the `GPRED` object (group picks) and `renderPred()` (champion etc.).
- **Edit wording / translations** → the `I18N` object (both `en` and `fa`).
- **Tweak the look** → the `<style>` block at the top.

Steps:

1. **Fork** this repo (button at the top-right of GitHub).
2. Edit `index.html` (open it in any editor — VS Code is great).
3. Test by opening the file in your browser.
4. Commit, push to your fork, and open a **Pull Request**. Describe what you changed.

No tooling to install, no build to run. If you're unsure about something, open an **Issue**
and ask — small PRs are very welcome. 🙌

## 🚀 Deploy your own copy

1. Fork the repo → **Settings → Pages** → Source: `main` / root.
2. (Optional) point a custom domain in **Settings → Pages**.
3. (Optional, for live scores) deploy `valtown-proxy.js` to a free [Val.town](https://val.town)
   HTTP val, add your free [football-data.org](https://www.football-data.org) token as the
   `FD_TOKEN` env var, and put the val URL in `PROXY_URL` near the top of `index.html`.

Full proxy + GitHub Action setup notes are in the comments of `valtown-proxy.js` and
`.github/workflows/scores.yml`.

## 📄 License

MIT — do whatever you like, no warranty. Fixture data from public sources; scores via
[football-data.org](https://www.football-data.org).
