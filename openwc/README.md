# World Cup 2026 Tracker

A self-contained website that tracks every scenario, bracket outcome, and group
finishing position for the 48-team 2026 FIFA World Cup — plus group results,
per-team rooting guides, a what-if sandbox, and an optional Live mode.

No build step, no framework, no dependencies. Open `index.html` in a browser
(or run `python3 -m http.server` in this folder and visit the printed URL).

## Pages

| Page | What it does |
|------|--------------|
| `index.html` | Overview: latest results / up next, all 12 group tables with clinch + elimination status and R32 odds, and the live third-place table. |
| `forecast.html` | Full Monte-Carlo forecast — each team's chance of reaching every round, sortable, heat-shaded. |
| `bracket.html` | Classic symmetric bracket, Final centered. A single confidence slider (default 100% = locked only); drag it down to project open slots with the most likely team and its probability. Round-of-32 matchups come from the real simulation, including the FIFA third-place allocation. |
| `sandbox.html` | **Scenario sandbox** — call the remaining group games and watch the tables update live; a second tab is the **third-place permutation explorer**, showing the eight-berth cut line move. "Most likely" fills picks by win probability. |
| `schedule.html` | Every match by day with scores; group filters; live score + minute when Live mode is on. |
| `third-place.html` | The 8-of-12 race: live table, advancement odds by points/GD, and which group is likeliest to send a third through. |
| `teams.html` | Index of all 48 teams by group. |
| `team.html?team=<slug>` | Per-team detail: status, finishing-position distribution, run-to-the-trophy odds, **projected path to the Final** (real opponents + reach odds), **win/draw/lose scenarios**, a **day-by-day rooting guide**, the group table, and a **tiebreaker explainer** (how the group is separated under FIFA's order). |

## Live mode

Off by default — the site is a static snapshot and makes **no network calls**.
Click the pill in the bottom-right to go live: it fetches the public, CORS-open
feed directly, overlays fresh scores/standings/bracket, and refreshes every ~30s
(scroll position preserved). Click again to return to the snapshot.

## Data & how it works

- `data.js` — static structure: 48 teams (flag, group, slug), the 32-match
  knockout schedule, group fixtures and results, and the simulated odds snapshot.
- `feed.js` — a one-time snapshot of the simulation feed: per-match bracket
  opponents with probabilities (drives the bracket and projected paths), per-team
  current standing / tiebreaker / cards / R32 opponent distribution, and match win
  probabilities. Regenerate with `node update.mjs`.
- `app.js` — the engine: live group standings from results (FIFA tiebreakers,
  including head-to-head), the third-place table, brute-forced group scenarios,
  and the Live-cache loader.
- `live.js` — opt-in Live mode (fetch → cache → refresh).
- `styles.css` — the look (green = clinched, maroon = eliminated; NYT-style fixed tables).

### A note on the bracket and "why a feed at all"

- Group winner/runner-up matchups are pure schedule logic.
- **Which third-place team goes to which Round-of-32 match** is *not* derivable
  from rules alone — FIFA publishes a fixed allocation table for each combination
  of qualifying groups. And the matchup *probabilities* (e.g., "USA vs Bosnia,
  99.9%") require simulating the remaining games.
- So those two things are imported as a snapshot (same status as importing the
  results), and Live mode can refresh them. Everything else — standings, the
  third-place cut, scenarios — is computed locally from the rules.

## Accuracy notes

- **Standings** are computed from results and update if you edit a score in `data.js`.
- **Scenarios** enumerate win/draw/loss of the remaining games; goal-difference
  ties within a scenario are reported as a range rather than overstated. The
  sandbox scores wins as a one-goal margin for GD purposes.
- **Odds** come from the upstream simulation snapshot; Live mode refreshes the
  scores, standings, bracket and current tiebreakers (headline reach-round odds
  remain the snapshot until you regenerate `feed.js`).
