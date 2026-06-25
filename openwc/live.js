/* ============================================================
   World Cup 2026 Tracker — Live mode (opt-in)
   The site is a static snapshot by default. When the user clicks the Live
   pill, this fetches the public feed directly (CORS-open), caches it, and
   reloads so app.js overlays it on the bundled data. Nothing is fetched
   unless Live mode is explicitly enabled.
   ============================================================ */
(function () {
  const BASE = "https://static01.nytimes.com/newsgraphics/fifa-mens-world-cup-2026-tracker/data";
  const LS_ON = "wc_live_on", LS_CACHE = "wc_live_cache", LS_SCROLL = "wc_scroll";
  const isOn = () => { try { return localStorage.getItem(LS_ON) === "1"; } catch { return false; } };

  // Mirror of update.mjs: turn the three feeds into the cache shape app.js expects.
  function process(matchesRaw, forecastRaw, bracket) {
    const matches = matchesRaw.matches || matchesRaw;
    const flist = forecastRaw.forecast || forecastRaw;
    const N = bracket.n_sims || forecastRaw.n_sims || 100000;
    const r = c => Math.round((c / N) * 1e5) / 1e5, r3 = x => Math.round((x || 0) * 1e3) / 1e3;
    const br = {}; (bracket.matches || []).forEach(m => br[m.match_num] = {
      top: (m.top || []).map(([s, c]) => [s, r(c)]), bottom: (m.bottom || []).map(([s, c]) => [s, r(c)])
    });
    const win = {}; (bracket.knockout_winners || []).forEach(w =>
      win[w.match_num] = (w.winners || []).slice(0, 6).map(([s, c]) => [s, r(c)]));
    const cards = {}, mp = {}, mm = {};
    matches.forEach(m => {
      [1, 2].forEach(side => {
        const s = m["team" + side + "_short"], c = m["team" + side + "_cards"] || {};
        cards[s] = cards[s] || { y: 0, r: 0 }; cards[s].y += c.yellow || 0; cards[s].r += (c.red || 0) + (c.second_yellow || 0);
      });
      if (m.team1_win_prob != null) mp[m.match_num] = { t1: r3(m.team1_win_prob), x: r3(m.draw_prob), t2: r3(m.team2_win_prob) };
      const fin = m.status === "final";
      mm[m.match_num] = {
        g1: m.team1_goals, g2: m.team2_goals, status: m.status,
        live: !fin && m.status !== "scheduled" && m.team1_goals != null,
        minute: m.minute, disp: m.match_time_display
      };
    });
    const team = {};
    flist.forEach(t => {
      const cur = t.current || {}, opp = (t.forecast && t.forecast.opponents) || [];
      team[t.short] = {
        place: cur.place, tiebreaker: cur.tiebreaker || null, fairPlay: cur.fair_play_score,
        seed: cur.third_place_seed || null, yel: (cards[t.short] || {}).y || 0, red: (cards[t.short] || {}).r || 0,
        r32: t.r32Match ? t.r32Match.matchNum : null, opp: opp.slice(0, 4).map(([s, c]) => [s, r(c)])
      };
    });
    return {
      lastUpdated: bracket.generated_at,
      feed: { lastUpdated: bracket.generated_at, nSims: N, bracket: br, win, team, match: mp },
      matches: mm
    };
  }
  async function fetchAll() {
    const [m, f, b] = await Promise.all(["matches.json", "forecast.json", "bracket.json"]
      .map(x => fetch(BASE + "/" + x, { cache: "no-store" }).then(r => r.json())));
    return process(m, f, b);
  }
  const appliedTs = () => (window.WC && WC.LAST_UPDATED) || "";
  function reloadKeepingScroll() { try { sessionStorage.setItem(LS_SCROLL, String(window.scrollY)); } catch {} location.reload(); }

  async function refresh() {
    try {
      const c = await fetchAll();
      localStorage.setItem(LS_CACHE, JSON.stringify(c));
      if (c.lastUpdated !== appliedTs()) reloadKeepingScroll();
      else setStatus();
    } catch (e) { setLabel("live unavailable — will retry"); }
  }

  let pill, label;
  const setLabel = t => { if (label) label.textContent = t; };
  function rel(ts) {
    if (!ts) return "just now";
    const s = Math.max(0, (Date.now() - new Date(ts)) / 1000);
    if (s < 60) return Math.floor(s) + "s ago";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }
  function setStatus() {
    if (!pill) return;
    if (isOn()) { pill.classList.add("on"); setLabel("LIVE · updated " + rel(appliedTs())); }
    else { pill.classList.remove("on"); setLabel("Snapshot · tap to go live"); }
  }
  function build() {
    pill = document.createElement("button");
    pill.className = "livepill";
    pill.innerHTML = '<span class="dot"></span><span id="livelabel"></span>';
    document.body.appendChild(pill);
    label = pill.querySelector("#livelabel");
    pill.onclick = () => {
      const turningOn = !isOn();
      localStorage.setItem(LS_ON, turningOn ? "1" : "0");
      if (turningOn) { setLabel("connecting…"); refresh(); } else reloadKeepingScroll();
    };
    setStatus();
    try { const sc = sessionStorage.getItem(LS_SCROLL); if (sc) { window.scrollTo(0, +sc); sessionStorage.removeItem(LS_SCROLL); } } catch {}
    if (isOn()) { refresh(); setInterval(refresh, 30000); setInterval(setStatus, 15000); }
  }
  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
