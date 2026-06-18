// Smart score updater — keeps API usage to the bare minimum.
//
// It reads the cached scores.json and only calls football-data.org when something
// actually needs updating: a match that is live, just kicked off, awaiting a final
// result, or starting within the next 15 minutes. Finished matches are cached and
// never re-fetched. If nothing is active, it exits without an API call or a commit.
//
// Env: FD_TOKEN (required), FORCE ("true" to bypass the gate, used by manual runs).

import fs from "node:fs";

const FILE = "scores.json";
const URL = "https://api.football-data.org/v4/competitions/WC/matches?season=2026";
const LIVE_AFTER  = 3 * 60 * 60 * 1000; // a match may still be live up to 3h after kickoff (ET + pens)
const SOON_BEFORE = 15 * 60 * 1000;     // refresh when a match starts within 15 min
const FORCE = process.env.FORCE === "true";

function readPrev(){ try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return null; } }

const prev = readPrev();
const now = Date.now();

function isActive(m){
  const ko = Date.parse(m.utcDate);
  if (isNaN(ko)) return false;
  const st = (m.status || "").toUpperCase();
  const settled = st === "FINISHED" || st === "CANCELLED" || st === "POSTPONED" || st === "AWARDED";
  if (!settled && now > ko && now < ko + LIVE_AFTER) return true; // in play / awaiting final
  if (!settled && now < ko && ko - now <= SOON_BEFORE) return true; // about to start
  return false;
}

const haveCache = prev && Array.isArray(prev.matches) && prev.matches.length;
const needRefresh = FORCE || !haveCache || prev.matches.some(isActive);

if (!needRefresh){
  console.log("No live, imminent, or pending matches — skipping API call. Cache untouched.");
  process.exit(0);
}

const TOKEN = process.env.FD_TOKEN;
if (!TOKEN){ console.error("FD_TOKEN secret is not set."); process.exit(1); }

const res = await fetch(URL, { headers: { "X-Auth-Token": TOKEN } });
if (!res.ok){ console.error("football-data API error:", res.status, await res.text()); process.exit(1); }
const fresh = await res.json();
if (!Array.isArray(fresh.matches)){ console.error("Unexpected payload."); process.exit(1); }

// Merge: once a match is FINISHED, keep the cached record (don't let a later hiccup blank it out).
const prevById = {};
if (haveCache) for (const m of prev.matches) prevById[m.id] = m;
const matches = fresh.matches.map(m => {
  const p = prevById[m.id];
  if (p && (p.status || "").toUpperCase() === "FINISHED") return p;
  return m;
});

const out = { updated: new Date().toISOString(), count: matches.length, matches };
fs.writeFileSync(FILE, JSON.stringify(out));
console.log(`Updated scores.json — ${matches.length} matches (API called).`);
