/* ============================================================
   World Cup 2026 Tracker — engine + shared UI helpers
   ============================================================ */

const WC = window.WC;

/* ---------- lookups ---------- */
const TEAM_BY_SHORT = {};
const TEAM_BY_SLUG = {};
WC.TEAMS.forEach(t => { TEAM_BY_SHORT[t.s] = t; TEAM_BY_SLUG[t.slug] = t; });

function team(short) { return TEAM_BY_SHORT[short]; }

// Short display names for the longest countries, so compact tables stay one line.
const SHORT_NAME = {
  BOS: "Bosnia/Herz.", CZE: "Czech Rep.", DRC: "DR Congo",
  KOR: "South Korea", RSA: "South Africa", KSA: "Saudi Arabia"
};
function dispName(short) { return SHORT_NAME[short] || team(short).name; }

/* ---------- flags (offline emoji) ---------- */
function flag(code) {
  if (code === "gb-eng") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (code === "gb-sct") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
  if (!code || code.length !== 2) return "🏳️";
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));
}

function flagSpan(short, opts = {}) {
  const t = team(short);
  const cls = opts.lg ? "flag flag-lg" : "flag";
  return `<span class="${cls}" title="${t.name}">${flag(t.code)}</span>`;
}

/* ---------- formatting ---------- */
function pct(p) {
  if (p == null) return "—";
  if (p >= 0.9999) return "100%";
  if (p > 0.995) return ">99%";
  if (p > 0 && p < 0.005) return "<1%";
  return Math.round(p * 100) + "%";
}
function signed(n) { return n > 0 ? "+" + n : "" + n; }

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function dayKey(iso) { return iso.slice(0, 10); }

/* ---------- standings engine ---------- */
// ---- Live snapshot loader ----
// If the user enabled Live mode, overlay the cached live feed (fetched by live.js)
// on top of the bundled snapshot BEFORE anything renders. Off by default → fully offline.
(function applyLiveCache() {
  try {
    if (typeof localStorage === "undefined") return;
    if (localStorage.getItem("wc_live_on") !== "1") return;
    const raw = localStorage.getItem("wc_live_cache"); if (!raw) return;
    const c = JSON.parse(raw);
    if (c.feed) window.FEED = c.feed;
    if (c.matches) {
      WC.MATCHES.forEach(row => {
        const u = c.matches[row[0]]; if (!u) return;
        row[3] = u.g1; row[4] = u.g2;
        row[5] = u.status === "final" ? "F" : (u.live ? "L" : "S");
        row[9] = u.minute; row[10] = u.disp;
      });
    }
    if (c.lastUpdated) WC.LAST_UPDATED = c.lastUpdated;
  } catch (e) { console.warn("live cache apply failed", e); }
})();

function matchObj(row) {
  return {
    num: row[0], t1: row[1], t2: row[2], g1: row[3], g2: row[4],
    status: row[5], date: row[6], location: row[7], group: row[8],
    final: row[5] === "F", live: row[5] === "L", minute: row[9], disp: row[10]
  };
}
const ALL_MATCHES = WC.MATCHES.map(matchObj);

function matchesForGroup(g) { return ALL_MATCHES.filter(m => m.group === g); }
function matchesForTeam(short) { return ALL_MATCHES.filter(m => m.t1 === short || m.t2 === short); }

function blankRow(short) {
  return { s: short, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, played: 0, form: [] };
}

// Compute standings for a single group from finalized matches.
function groupStandings(g) {
  const rows = {};
  WC.TEAMS.filter(t => t.group === g).forEach(t => rows[t.s] = blankRow(t.s));
  matchesForGroup(g).filter(m => m.final).forEach(m => {
    const a = rows[m.t1], b = rows[m.t2];
    a.played++; b.played++;
    a.gf += m.g1; a.ga += m.g2; b.gf += m.g2; b.ga += m.g1;
    if (m.g1 > m.g2) { a.w++; b.l++; a.pts += 3; a.form.push("W"); b.form.push("L"); }
    else if (m.g1 < m.g2) { b.w++; a.l++; b.pts += 3; b.form.push("W"); a.form.push("L"); }
    else { a.d++; b.d++; a.pts++; b.pts++; a.form.push("D"); b.form.push("D"); }
  });
  Object.values(rows).forEach(r => r.gd = r.gf - r.ga);
  const arr = Object.values(rows);
  arr.sort(cmpStandings);
  applyHeadToHead(arr, g);          // FIFA step 4-7 among teams level on pts/GD/GF
  arr.forEach((r, i) => r.pos = i + 1);
  return arr;
}

// Fair-play score (fewer cards is better). From the bundled feed snapshot if present.
function fairPlay(short) {
  const f = window.FEED && window.FEED.team && window.FEED.team[short];
  return f && typeof f.fairPlay === "number" ? f.fairPlay : 0; // higher (less negative) = cleaner
}

// Re-order any run of teams tied on points, overall GD and overall GF using the
// FIFA sequence: head-to-head points → H2H goal difference → H2H goals for → fair play.
function applyHeadToHead(arr, g) {
  let i = 0;
  while (i < arr.length) {
    let j = i + 1;
    while (j < arr.length &&
      arr[j].pts === arr[i].pts && arr[j].gd === arr[i].gd && arr[j].gf === arr[i].gf) j++;
    if (j - i > 1) {
      const tied = arr.slice(i, j).map(r => r.s);
      const set = new Set(tied);
      const h = {}; tied.forEach(s => h[s] = { pts: 0, gd: 0, gf: 0 });
      matchesForGroup(g).filter(m => m.final && set.has(m.t1) && set.has(m.t2)).forEach(m => {
        const a = h[m.t1], b = h[m.t2];
        a.gf += m.g1; a.gd += m.g1 - m.g2; b.gf += m.g2; b.gd += m.g2 - m.g1;
        if (m.g1 > m.g2) a.pts += 3; else if (m.g1 < m.g2) b.pts += 3; else { a.pts++; b.pts++; }
      });
      const sub = arr.slice(i, j).sort((x, y) =>
        h[y.s].pts - h[x.s].pts || h[y.s].gd - h[x.s].gd || h[y.s].gf - h[x.s].gf ||
        fairPlay(y.s) - fairPlay(x.s) || team(x.s).name.localeCompare(team(y.s).name));
      for (let k = 0; k < sub.length; k++) arr[i + k] = sub[k];
    }
    i = j;
  }
}

// Why is `above` ranked ahead of `below` in group g? Returns the deciding criterion.
function separatingCriterion(above, below, g) {
  if (above.pts !== below.pts) return "more points";
  if (above.gd !== below.gd) return "goal difference";
  if (above.gf !== below.gf) return "goals scored";
  // tied on all three — head-to-head among the tied cluster
  const set = new Set([above.s, below.s]);
  const h = { [above.s]: { pts:0, gd:0, gf:0 }, [below.s]: { pts:0, gd:0, gf:0 } };
  matchesForGroup(g).filter(m => m.final && set.has(m.t1) && set.has(m.t2)).forEach(m => {
    const a = h[m.t1], b = h[m.t2];
    a.gf += m.g1; a.gd += m.g1 - m.g2; b.gf += m.g2; b.gd += m.g2 - m.g1;
    if (m.g1 > m.g2) a.pts += 3; else if (m.g1 < m.g2) b.pts += 3; else { a.pts++; b.pts++; }
  });
  const A = h[above.s], B = h[below.s];
  if (A.pts !== B.pts) return "head-to-head points";
  if (A.gd !== B.gd) return "head-to-head goal difference";
  if (A.gf !== B.gf) return "head-to-head goals";
  if (fairPlay(above.s) !== fairPlay(below.s)) return "fair-play record (fewer cards)";
  return "drawing of lots";
}

// FIFA-style sort: points, goal difference, goals for, then name.
function cmpStandings(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return team(a.s).name.localeCompare(team(b.s).name);
}

// Current "as it stands" third-place table across all groups.
function thirdPlaceTable() {
  const thirds = WC.GROUPS.map(g => {
    const st = groupStandings(g);
    const r = st[2];
    const groupDone = matchesForGroup(g).every(m => m.final);
    return { ...r, group: g, groupDone };
  });
  thirds.sort(cmpStandings);
  thirds.forEach((r, i) => r.rank = i + 1);
  return thirds; // top 8 advance
}

/* ---------- scenario brute-force for a group ---------- */
// Enumerate outcomes of remaining group matches to find each team's possible
// finishing positions. Ties (equal pts/gd/gf after enumeration) are reported as
// a range, so a team that could finish 2nd or 3rd shows both.
// Enumerate every win/draw/loss combination of a group's remaining matches.
// `fixed` optionally pins outcomes: { matchNum: "home"|"draw"|"away" }.
// Returns { short: sortedArray-of-possible-finishing-positions }.
function enumerateGroupPositions(g, fixed) {
  fixed = fixed || {};
  const teams = WC.TEAMS.filter(t => t.group === g).map(t => t.s);
  const base = {};
  groupStandings(g).forEach(r => base[r.s] = { pts: r.pts, gd: r.gd, gf: r.gf });

  // Only enumerate matches whose outcome isn't pinned.
  const remaining = matchesForGroup(g).filter(m => !m.final);
  const free = remaining.filter(m => !fixed[m.num]);
  const combos = Math.pow(3, free.length);
  const possible = {}; teams.forEach(s => possible[s] = new Set());

  const applyOutcome = (st, m, o) => {
    // o: 0 home win, 1 draw, 2 away win — representative 1-goal swing.
    if (o === 0) { st[m.t1].pts += 3; st[m.t1].gd++; st[m.t1].gf++; st[m.t2].gd--; }
    else if (o === 2) { st[m.t2].pts += 3; st[m.t2].gd++; st[m.t2].gf++; st[m.t1].gd--; }
    else { st[m.t1].pts++; st[m.t2].pts++; }
  };
  const fixedCode = (m) => {
    const f = fixed[m.num];
    return f === "home" ? 0 : f === "away" ? 2 : 1;
  };

  for (let c = 0; c < combos; c++) {
    const st = {}; teams.forEach(s => st[s] = { ...base[s] });
    remaining.forEach(m => { if (fixed[m.num]) applyOutcome(st, m, fixedCode(m)); });
    let n = c;
    for (const m of free) { applyOutcome(st, m, n % 3); n = Math.floor(n / 3); }

    const ranked = teams.slice().sort((x, y) =>
      st[y].pts - st[x].pts || st[y].gd - st[x].gd || st[y].gf - st[x].gf);
    for (let i = 0; i < ranked.length; i++) {
      const s = ranked[i];
      let ahead = 0, tie = 0;
      for (let j = 0; j < ranked.length; j++) {
        if (j === i) continue;
        const o = ranked[j];
        const cmp = st[o].pts - st[s].pts || st[o].gd - st[s].gd || st[o].gf - st[s].gf;
        if (cmp > 0) ahead++; else if (cmp === 0) tie++;
      }
      for (let p = ahead + 1; p <= ahead + 1 + tie; p++) possible[s].add(p);
    }
  }
  const out = {};
  teams.forEach(s => out[s] = Array.from(possible[s]).sort((a, b) => a - b));
  return out;
}
function groupScenarios(g) { return enumerateGroupPositions(g, {}); }

/* ---------- status helpers ---------- */
function teamStatus(short) {
  const t = team(short);
  const st = groupStandings(t.group);
  const groupDone = matchesForGroup(t.group).every(m => m.final);
  let label = "In contention", cls = "live";
  if (t.mk >= 0.9999 && t.pp.length === 1 && t.pp[0] <= 2) { label = "Through to Round of 32"; cls = "clinched"; }
  else if (t.mk >= 0.9999) { label = "Qualified for Round of 32"; cls = "clinched"; }
  else if (t.mk <= 0.0001) { label = "Eliminated"; cls = "out"; }
  else if (t.pp.length === 1 && t.pp[0] === 3) { label = "Awaiting third-place verdict"; cls = "live"; }
  return { label, cls, groupDone };
}

/* ---------- nav ---------- */
function renderNav(active) {
  const links = [
    ["index.html", "Standings"],
    ["forecast.html", "Forecast"],
    ["bracket.html", "Bracket"],
    ["sandbox.html", "Scenarios"],
    ["schedule.html", "Schedule"],
    ["third-place.html", "Third-place"]
  ];
  const teamChips = ["USA", "ENG", "CAN", "GER", "ARG", "FRA", "ESP", "MEX"];
  const linkHtml = links.map(([href, label]) =>
    `<a class="nav-link ${active === href ? "active" : ""}" href="${href}">${label}</a>`).join("");
  const chipHtml = teamChips.map(s => {
    const t = team(s);
    return `<a class="nav-team" href="team.html?team=${t.slug}">${flag(t.code)} ${s === "USA" ? "USA" : t.name.split(" ")[0]}</a>`;
  }).join("");

  document.getElementById("nav").innerHTML = `
    <nav class="topnav">
      <div class="topnav-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">★</span>
          <span class="brand-text"><b>World Cup</b><span>2026 Tracker</span></span>
        </a>
        <div class="nav-links">${linkHtml}</div>
        <div class="nav-divider"></div>
        <div class="nav-teams">${chipHtml}
          <a class="nav-team nav-team-all" href="teams.html">All teams →</a>
        </div>
      </div>
    </nav>`;
}

function renderFooter() {
  const el = document.getElementById("footer");
  if (!el) return;
  const d = new Date(WC.LAST_UPDATED);
  el.innerHTML = `
    <footer class="site-footer">
      <p>An independent World Cup 2026 scenario tracker. Group results are live;
      qualification odds come from a Monte-Carlo simulation of the remaining schedule.</p>
      <p class="muted">Data snapshot: ${d.toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"})}</p>
    </footer>`;
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}
