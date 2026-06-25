#!/usr/bin/env node
// Snapshots the public 2026 World Cup simulation feed into feed.js.
// Run `node update.mjs` to refresh. The site does NOT call out unless Live mode
// is turned on in the browser; this is an explicit, offline-friendly import.
const BASE = "https://static01.nytimes.com/newsgraphics/fifa-mens-world-cup-2026-tracker/data";
const get = async f => (await fetch(`${BASE}/${f}`, { headers: { "User-Agent": "wc-tracker" } })).json();

const [matchesRaw, forecastRaw, bracket] = await Promise.all([
  get("matches.json"), get("forecast.json"), get("bracket.json")
]);
const matches = matchesRaw.matches || matchesRaw;
const forecastList = forecastRaw.forecast || forecastRaw;
const N = bracket.n_sims || forecastRaw.n_sims || 100000;
const r = c => Math.round((c / N) * 1e5) / 1e5;
const r3 = x => Math.round((x || 0) * 1e3) / 1e3;

const br = {};
for (const m of bracket.matches) br[m.match_num] = {
  top: (m.top || []).map(([s, c]) => [s, r(c)]),
  bottom: (m.bottom || []).map(([s, c]) => [s, r(c)])
};
// winner distribution per knockout match (who advances OUT of it) — top 6
const win = {};
for (const w of (bracket.knockout_winners || []))
  win[w.match_num] = (w.winners || []).slice(0, 6).map(([s, c]) => [s, r(c)]);

const cards = {}, matchProb = {};
for (const m of matches) {
  for (const side of [1, 2]) {
    const s = m[`team${side}_short`], c = m[`team${side}_cards`] || {};
    cards[s] = cards[s] || { y: 0, r: 0 };
    cards[s].y += (c.yellow || 0); cards[s].r += (c.red || 0) + (c.second_yellow || 0);
  }
  if (m.team1_win_prob != null) matchProb[m.match_num] =
    { t1: r3(m.team1_win_prob), x: r3(m.draw_prob), t2: r3(m.team2_win_prob) };
}
const team = {};
for (const t of forecastList) {
  const cur = t.current || {}, opp = (t.forecast && t.forecast.opponents) || [];
  team[t.short] = {
    place: cur.place, tiebreaker: cur.tiebreaker || null, fairPlay: cur.fair_play_score,
    seed: cur.third_place_seed || null,
    yel: (cards[t.short] || {}).y || 0, red: (cards[t.short] || {}).r || 0,
    r32: t.r32Match ? t.r32Match.matchNum : null,
    opp: opp.slice(0, 4).map(([s, c]) => [s, r(c)])
  };
}
const out = "window.FEED = " + JSON.stringify({
  lastUpdated: bracket.generated_at, nSims: N, bracket: br, win, team, match: matchProb
}) + ";\n";
(await import("node:fs")).writeFileSync("feed.js", out);
console.log("Wrote feed.js — bracket " + Object.keys(br).length + ", winners " +
  Object.keys(win).length + ", teams " + Object.keys(team).length + ".");
