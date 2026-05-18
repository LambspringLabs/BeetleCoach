// ==UserScript==
// @name         Remilia Friend Explorer
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Discover unfriended users via mutuals-of-mutuals graph harvest, then bulk-add with rate limiting. Standalone, separate from BeetleCoach.
// @match        https://www.remilia.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/remilia_friend_explorer.user.js
// @downloadURL  https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/remilia_friend_explorer.user.js
// ==/UserScript==

// SECURITY: this script makes authenticated requests with your remilia.net
// session cookie. Trust model:
//   - Only loaded on the exact origin via @match + runtime exact-equality
//     domain check (no substring match — evilremilia.net would not pass).
//   - No remote code loading (no @require, no script tag injection).
//   - @updateURL points only at LambspringLabs/BeetleCoach master — if
//     that repo is compromised, the auto-update path lets an attacker run
//     arbitrary code with cookie access. Audit diffs before pulling.
//   - GM grants minimized: only GM_getValue / GM_setValue. No
//     GM_xmlhttpRequest (which bypasses CORS), no GM_notification, no
//     unsafeWindow. A future grant addition triggers a Tampermonkey
//     permission re-prompt.
//   - All user-controlled API content (displayName, username, via list)
//     is rendered via textContent or escaped, never via innerHTML with
//     raw values. pfpUrl is validated to https:// or /imgproxy/ prefix
//     before being assigned as <img src>.

(function () {
  'use strict';

  // Domain guard — refuse to run if loaded somewhere unexpected.
  // Strict equality on full hostname; allow both www and naked.
  if (location.host !== 'www.remilia.net' && location.host !== 'remilia.net') {
    console.warn('[RFX] Refusing to run on host:', location.host);
    return;
  }

  /* ═══════════════════════════════════════════════════════
     1. CONFIG
     ═══════════════════════════════════════════════════════ */
  var VER = '1.0.1';
  var STORE_KEY = 'remilia_friend_explorer_v1_store';
  var PANEL_ID = 'rfx-panel';
  var BTN_ID = 'rfx-toggle';
  var STYLE_ID = 'rfx-style';
  var TAB_LOCK_KEY = 'rfx_active_tab';
  var TAB_LOCK_TTL_MS = 30000;
  var DAY_MS = 86400000;

  // Hard guardrails — independent of user-configurable daily cap.
  // If a bug ever pushes dailyCount past dailyCap, the burst limit
  // still prevents flooding the server. These are CONSTANTS (not in
  // S) — a future state-mutating bug can't lower them.
  var BURST_MAX_PER_MIN = 10;
  // v1.0.1: harvest is the bigger ban-risk vector (3800+ GETs vs 100
  // POSTs). Drop parallel from 5 → 2 and bump inter-batch delay so
  // we stay well under anti-abuse traffic-shape heuristics. ~5 req/s
  // sustained, total ~12 min for a fresh harvest.
  var HARVEST_PARALLEL = 2;
  var HARVEST_BATCH_DELAY_MS = 250;
  var BACKOFF_ON_429_MS = 5 * 60 * 1000;
  // pfpUrl must start with one of these prefixes to be rendered as
  // an <img src>. API-supplied URLs that don't match get suppressed
  // (the card still renders, just no avatar). Belt-and-suspenders
  // against an API-content XSS via a `javascript:` or `data:` URL.
  var PFP_OK_PREFIXES = ['https://', '/imgproxy/', '/pfp/'];

  /* ═══════════════════════════════════════════════════════
     2. STATE
     ═══════════════════════════════════════════════════════ */
  function defaults() {
    return {
      ver: VER,
      myUsername: '',
      myFriends: [],
      candidates: {},
      myFriendsScannedAt: 0,
      candidatesUpdatedAt: 0,
      sentRequests: {},
      failedRequests: {},
      dailyCount: 0,
      dailyResetAt: Date.now(),
      dailyCap: 100,
      delayMsMin: 5000,
      delayMsMax: 10000,
      autoAdd: false,
      paused: false,
      backoffUntil: 0,
      log: [],
      panelOpen: true
    };
  }
  function load() {
    try {
      var raw = GM_getValue(STORE_KEY, null);
      if (!raw) return defaults();
      var p = JSON.parse(raw);
      var d = Object.assign(defaults(), p);
      // Daily-cap rollover: if it's been more than 24h since last reset,
      // wipe today's count and stamp a fresh reset timestamp.
      if (Date.now() - d.dailyResetAt > DAY_MS) {
        d.dailyCount = 0;
        d.dailyResetAt = Date.now();
      }
      return d;
    } catch (e) { return defaults(); }
  }
  function save() { try { GM_setValue(STORE_KEY, JSON.stringify(S)); } catch (e) {} }
  var S = load();

  function logEvent(msg) {
    var ts = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    S.log.unshift(ts + ' ' + msg);
    if (S.log.length > 60) S.log = S.log.slice(0, 60);
    save();
    refreshLog();
  }
  function refreshLog() {
    var el = document.getElementById('rfx-log');
    if (el) el.innerHTML = S.log.map(function(l){ return '<div class="rfx-log-line">'+escapeHtml(l)+'</div>'; }).join('');
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  /* ═══════════════════════════════════════════════════════
     3. MULTI-TAB LOCK
     ═══════════════════════════════════════════════════════
     If two tabs both run the script, they could double-count daily
     requests and race on auto-add. We use localStorage as a leader-
     lock with a 30s heartbeat. Only the leader runs auto-add. Manual
     Add clicks still work in any tab (they go through doAdd which
     bumps the shared GM_setValue counter). */
  var _tabId = Math.random().toString(36).slice(2);
  function isLeaderTab() {
    try {
      var raw = localStorage.getItem(TAB_LOCK_KEY);
      if (!raw) return claimLeader();
      var lock = JSON.parse(raw);
      if (lock.tabId === _tabId) { renewLeader(); return true; }
      if (Date.now() - lock.heartbeat > TAB_LOCK_TTL_MS) return claimLeader();
      return false;
    } catch (e) { return claimLeader(); }
  }
  function claimLeader() { localStorage.setItem(TAB_LOCK_KEY, JSON.stringify({tabId:_tabId, heartbeat:Date.now()})); return true; }
  function renewLeader() { localStorage.setItem(TAB_LOCK_KEY, JSON.stringify({tabId:_tabId, heartbeat:Date.now()})); }
  setInterval(renewLeader, TAB_LOCK_TTL_MS / 3);

  /* ═══════════════════════════════════════════════════════
     4. API
     ═══════════════════════════════════════════════════════ */
  function apiGet(path) {
    return fetch(path, {credentials:'include'}).then(function(r){
      if (!r.ok) throw new Error('GET '+path+' → '+r.status);
      return r.json();
    });
  }
  function apiPost(path, body) {
    return fetch(path, {
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    }).then(function(r){
      return r.json().then(function(j){ return {ok:r.ok, status:r.status, body:j}; }).catch(function(){
        return {ok:r.ok, status:r.status, body:null};
      });
    });
  }
  function fetchMyUsername() {
    return apiGet('/api/profile/whoami').then(function(j){
      // shape: probably { displayUsername | username }
      var u = (j && (j.displayUsername || j.username || j.user || j.handle)) || '';
      if (u) { S.myUsername = u; save(); }
      return u;
    });
  }
  function fetchAllFriends(username) {
    var page = 1, limit = 50, all = [], totalKnown = 0;
    function once() {
      return apiGet('/api/profile/friends?username='+encodeURIComponent(username)+'&page='+page+'&limit='+limit)
        .then(function(j){
          if (j && j.friends) {
            j.friends.forEach(function(f){ all.push(f); });
            totalKnown = (j.total || 0);
          }
          var maxPage = Math.ceil(totalKnown / limit) || 1;
          if (page < maxPage) { page++; return once(); }
          return all;
        });
    }
    return once();
  }
  function sendFriendRequest(username) {
    return apiPost('/api/friendship/request', {username:username});
  }

  /* ═══════════════════════════════════════════════════════
     5. HARVEST — mutuals-of-mutuals graph
     ═══════════════════════════════════════════════════════ */
  var _harvesting = false;
  async function runHarvest() {
    if (_harvesting) return;
    _harvesting = true;
    try {
      logEvent('Harvest start');
      // 1) Refresh own username + friend list
      if (!S.myUsername) {
        try { await fetchMyUsername(); } catch (e) { logEvent('whoami failed; falling back to candidate inference'); }
      }
      if (!S.myUsername) {
        // Try to read from the visible user widget (top-right)
        try {
          var el = Array.from(document.querySelectorAll('*')).find(function(e){
            var t = (e.textContent||'').trim();
            return /^~[a-z0-9_]+$/i.test(t) && e.children.length === 0;
          });
          if (el) S.myUsername = el.textContent.trim().replace(/^~/,'');
        } catch (e) {}
      }
      if (!S.myUsername) {
        logEvent('Cannot determine my username — set S.myUsername manually via console.');
        return;
      }
      logEvent('Username: ~'+S.myUsername);

      var myFriendsList = await fetchAllFriends(S.myUsername);
      S.myFriends = myFriendsList.map(function(f){ return f.displayUsername; });
      S.myFriendsScannedAt = Date.now();
      logEvent('My friends: '+S.myFriends.length);

      // 2) For each friend, fetch their friends. Aggregate counts.
      // v1.0.1: shuffle order so the request pattern doesn't look like a
      // monotone alphabetical sweep (less obvious traffic fingerprint).
      var myFriendsSet = new Set(S.myFriends);
      var candidates = S.candidates || {};
      var queue = S.myFriends.slice();
      for (var i = queue.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp;
      }
      var done = 0;
      var batch;
      while (queue.length > 0) {
        batch = queue.splice(0, HARVEST_PARALLEL);
        await Promise.all(batch.map(function(friendUsername){
          return fetchAllFriends(friendUsername).then(function(list){
            list.forEach(function(person){
              var u = person.displayUsername;
              // Skip self + already-friends
              if (u === S.myUsername) return;
              if (myFriendsSet.has(u)) return;
              if (!candidates[u]) {
                candidates[u] = {
                  displayName: person.displayName || u,
                  pfpUrl: person.pfpUrl || '',
                  mutualCount: 0,
                  via: []
                };
              }
              candidates[u].mutualCount++;
              if (candidates[u].via.length < 5) candidates[u].via.push(friendUsername);
            });
            done++;
          }).catch(function(e){
            done++;
            // Continue silently — one friend's list failing isn't fatal.
          });
        }));
        // Small inter-batch breath
        await new Promise(function(r){ setTimeout(r, HARVEST_BATCH_DELAY_MS); });
        // Lightweight progress update every ~25 batches
        if (done % 25 === 0) {
          S.candidates = candidates;
          S.candidatesUpdatedAt = Date.now();
          save();
          logEvent('Harvest progress: '+done+' / '+S.myFriends.length+' friends scanned');
          render();
        }
      }
      S.candidates = candidates;
      S.candidatesUpdatedAt = Date.now();
      save();
      var totalCandidates = Object.keys(candidates).length;
      logEvent('Harvest done: '+totalCandidates+' unique candidates');
      render();
    } catch (e) {
      logEvent('Harvest error: '+e.message);
    } finally {
      _harvesting = false;
    }
  }

  /* ═══════════════════════════════════════════════════════
     6. CANDIDATE RANKING + ADD
     ═══════════════════════════════════════════════════════ */
  function getRankedCandidates(limit) {
    var arr = [];
    Object.keys(S.candidates || {}).forEach(function(u){
      if (S.sentRequests[u]) return;       // already requested
      if (S.myFriends.indexOf(u) > -1) return; // they accepted (or were always friend)
      if (S.failedRequests[u]) return;     // previously failed
      var c = S.candidates[u];
      arr.push({username:u, mutualCount:c.mutualCount, displayName:c.displayName, pfpUrl:c.pfpUrl, via:c.via});
    });
    arr.sort(function(a,b){ return b.mutualCount - a.mutualCount; });
    return arr.slice(0, limit || arr.length);
  }
  function getTopCandidate() {
    var top = getRankedCandidates(1);
    return top[0] || null;
  }
  function burstAllow() {
    // Hard guardrail: max BURST_MAX_PER_MIN requests in any 60s window.
    var now = Date.now();
    var win = (S._burstWindow || []).filter(function(ts){ return now - ts < 60000; });
    S._burstWindow = win;
    return win.length < BURST_MAX_PER_MIN;
  }
  function burstRecord() {
    S._burstWindow = (S._burstWindow || []);
    S._burstWindow.push(Date.now());
  }
  function dailyCapRemaining() {
    if (Date.now() - S.dailyResetAt > DAY_MS) {
      S.dailyCount = 0;
      S.dailyResetAt = Date.now();
      save();
    }
    return Math.max(0, S.dailyCap - S.dailyCount);
  }
  function inBackoff() { return Date.now() < (S.backoffUntil || 0); }

  async function doAdd(username) {
    if (!username) return {ok:false, reason:'no-target'};
    // v1.0.1: re-read state from GM right before mutating to avoid
    // multi-tab read-modify-write races. The other tab may have just
    // burned a slot we thought was free.
    var fresh = load();
    Object.assign(S, fresh);
    if (S.sentRequests[username]) return {ok:false, reason:'already-sent'};
    if (S.myFriends.indexOf(username) > -1) return {ok:false, reason:'already-friend'};
    if (dailyCapRemaining() <= 0) return {ok:false, reason:'daily-cap'};
    if (!burstAllow()) return {ok:false, reason:'burst-cap'};
    if (inBackoff()) return {ok:false, reason:'backoff'};
    // RESERVE-BEFORE-SEND: increment the counter and persist BEFORE
    // firing the network request. This way, even if the request hangs
    // for 30s, a second auto-add tick reading state can't re-fire the
    // same target or burn a second slot. On failure we leave the
    // reservation in place (don't refund) — conservative.
    S.sentRequests[username] = {ts:Date.now(), status:'pending'};
    S.dailyCount++;
    burstRecord();
    save();
    var resp;
    try {
      resp = await sendFriendRequest(username);
    } catch (e) {
      // Network error — keep the slot reserved but mark as failed for visibility
      S.sentRequests[username] = {ts:Date.now(), status:'failed', error:e.message};
      S.failedRequests[username] = {ts:Date.now(), error:e.message, status:0};
      logEvent('Add ~'+username+' failed (network): '+e.message);
      save(); render();
      return {ok:false, reason:'network', error:e.message};
    }
    if (resp.status === 429) {
      S.backoffUntil = Date.now() + BACKOFF_ON_429_MS;
      // For 429 specifically, refund the slot — the request didn't take effect.
      delete S.sentRequests[username];
      S.dailyCount = Math.max(0, S.dailyCount - 1);
      logEvent('Rate-limited (429) — refunded slot, backing off 5 min, auto-add OFF');
      S.autoAdd = false;
      save(); render();
      return {ok:false, reason:'rate-limited'};
    }
    if (!resp.ok) {
      // Non-2xx other than 429: target rejection (e.g. blocked us, account deleted).
      // Keep slot reserved (don't refund — slot is "spent" on a known-bad target).
      S.sentRequests[username] = {ts:Date.now(), status:'rejected', code:resp.status};
      S.failedRequests[username] = {ts:Date.now(), error:'http_'+resp.status, status:resp.status, body:resp.body};
      logEvent('Add ~'+username+' rejected ('+resp.status+')');
      save(); render();
      return {ok:false, reason:'http', status:resp.status};
    }
    // Success.
    S.sentRequests[username] = {ts:Date.now(), status:'sent'};
    logEvent('✓ Add ~'+username+' (today: '+S.dailyCount+'/'+S.dailyCap+')');
    save(); render();
    return {ok:true};
  }
  function doSkip(username) {
    if (!username) return;
    // Skip = treat as "don't surface again this session". We use the
    // failedRequests bucket with a sentinel error so it doesn't get
    // confused with real failures.
    S.failedRequests[username] = {ts:Date.now(), error:'user-skipped', status:0};
    logEvent('✗ Skip ~'+username);
    save(); render();
  }

  /* ═══════════════════════════════════════════════════════
     7. AUTO-ADD LOOP
     ═══════════════════════════════════════════════════════ */
  var _autoTimer = null;
  function scheduleAutoTick() {
    if (_autoTimer) clearTimeout(_autoTimer);
    if (!S.autoAdd || S.paused) return;
    if (!isLeaderTab()) return; // only the leader tab auto-adds
    var delay = S.delayMsMin + Math.random() * (S.delayMsMax - S.delayMsMin);
    _autoTimer = setTimeout(autoTick, delay);
  }
  async function autoTick() {
    if (!S.autoAdd || S.paused) return;
    if (!isLeaderTab()) return;
    if (inBackoff()) { logEvent('Auto-add: in backoff, waiting'); scheduleAutoTick(); return; }
    if (dailyCapRemaining() <= 0) {
      logEvent('Auto-add: daily cap reached ('+S.dailyCap+'). Turning off auto-add.');
      S.autoAdd = false;
      save(); render();
      return;
    }
    var top = getTopCandidate();
    if (!top) { logEvent('Auto-add: no candidates left. Turning off.'); S.autoAdd = false; save(); render(); return; }
    await doAdd(top.username);
    scheduleAutoTick();
  }

  /* ═══════════════════════════════════════════════════════
     8. UI
     ═══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = ''
      + '#'+BTN_ID+'{position:fixed;right:20px;bottom:20px;z-index:999998;padding:10px 14px;background:#ffe9f1;color:#831843;border:1px solid #f9a8d4;border-radius:12px;font-weight:700;cursor:pointer;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;}'
      + '#'+BTN_ID+':hover{background:#fbcfe8;}'
      + '#'+PANEL_ID+'{position:fixed;right:20px;top:50px;z-index:999998;width:400px;min-width:320px;max-width:90vw;background:#fff;border:2px solid #f9a8d4;border-radius:16px;padding:14px;box-shadow:0 14px 40px rgba(0,0,0,.18);font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#1f2937;max-height:calc(100vh - 70px);display:flex;flex-direction:column;gap:8px;overflow:hidden;}'
      + '#'+PANEL_ID+'.hidden{display:none!important;}'
      + '.rfx-header{display:flex;align-items:center;justify-content:space-between;cursor:grab;user-select:none;padding-bottom:4px;border-bottom:1px solid #fce7f3;}'
      + '.rfx-header:active{cursor:grabbing;}'
      + '.rfx-title{font-size:16px;font-weight:800;color:#831843;}'
      + '.rfx-sub{font-size:10px;color:#6b7280;font-weight:600;}'
      + '.rfx-btns{display:flex;gap:4px;flex-wrap:wrap;}'
      + '.rfx-btn{background:#fce7f3;color:#831843;border:1px solid #f9a8d4;border-radius:6px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;}'
      + '.rfx-btn:hover{background:#fbcfe8;}'
      + '.rfx-btn.on{background:#831843;color:#fff;}'
      + '.rfx-btn.danger{color:#991b1b;border-color:#fecaca;}'
      + '.rfx-strip{display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#fdf2f8;border:1px solid #fce7f3;border-radius:8px;font-size:11px;color:#831843;}'
      + '.rfx-card{background:linear-gradient(135deg,#fdf2f8,#fce7f3);border:2px solid #f9a8d4;border-radius:12px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:6px;}'
      + '.rfx-pfp{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #f9a8d4;background:#fdf2f8;}'
      + '.rfx-name{font-size:18px;font-weight:800;color:#831843;}'
      + '.rfx-handle{font-size:11px;color:#6b7280;}'
      + '.rfx-mutuals{font-size:13px;color:#7c2d12;font-weight:700;}'
      + '.rfx-actions{display:flex;gap:8px;margin-top:6px;}'
      + '.rfx-add{background:#22c55e;color:#fff;border:none;padding:10px 24px;font-size:14px;font-weight:800;border-radius:8px;cursor:pointer;}'
      + '.rfx-add:hover{background:#16a34a;}'
      + '.rfx-skip{background:#cbd5e1;color:#1f2937;border:none;padding:10px 24px;font-size:14px;font-weight:800;border-radius:8px;cursor:pointer;}'
      + '.rfx-skip:hover{background:#94a3b8;}'
      + '.rfx-hint{font-size:10px;color:#6b7280;margin-top:4px;}'
      + '.rfx-log{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:6px;font-size:10px;color:#374151;max-height:120px;overflow-y:auto;}'
      + '.rfx-log-line{padding:1px 0;border-bottom:1px solid #f3f4f6;}'
      + '.rfx-empty{text-align:center;color:#6b7280;font-size:12px;padding:20px;}'
      + '.rfx-via{font-size:10px;color:#6b7280;text-align:center;margin-top:2px;}'
      + '.rfx-badge{display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800;}'
      + '.rfx-badge.ok{background:#dcfce7;color:#166534;}'
      + '.rfx-badge.warn{background:#fef3c7;color:#854d0e;}'
      + '.rfx-badge.danger{background:#fee2e2;color:#991b1b;}';
    document.head.appendChild(s);
  }
  function ensureUI() {
    injectStyles();
    if (!document.getElementById(BTN_ID)) {
      var btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.textContent = '💗 Friend Explorer';
      btn.addEventListener('click', function(){
        var p = document.getElementById(PANEL_ID);
        if (!p) { p = document.createElement('div'); p.id = PANEL_ID; document.body.appendChild(p); }
        p.classList.toggle('hidden');
        S.panelOpen = !p.classList.contains('hidden');
        save();
        if (S.panelOpen) render();
      });
      document.body.appendChild(btn);
    }
    if (!document.getElementById(PANEL_ID)) {
      var p = document.createElement('div');
      p.id = PANEL_ID;
      if (!S.panelOpen) p.classList.add('hidden');
      document.body.appendChild(p);
    }
  }
  function render() {
    var p = document.getElementById(PANEL_ID);
    if (!p || p.classList.contains('hidden')) return;
    var ranked = getRankedCandidates(500);
    var top = ranked[0] || null;
    var remaining = dailyCapRemaining();
    var statusBadge;
    if (inBackoff()) {
      var min = Math.ceil((S.backoffUntil - Date.now()) / 60000);
      statusBadge = '<span class="rfx-badge danger">backoff '+min+'m</span>';
    } else if (S.paused) {
      statusBadge = '<span class="rfx-badge warn">paused</span>';
    } else if (S.autoAdd) {
      statusBadge = '<span class="rfx-badge ok">auto-add ON</span>';
    } else {
      statusBadge = '<span class="rfx-badge warn">manual</span>';
    }
    var h = '';
    h += '<div class="rfx-header">';
    h +=   '<div><span class="rfx-title">💗 Friend Explorer</span> <span class="rfx-sub">v'+VER+'</span></div>';
    h +=   '<button class="rfx-btn" id="rfx-close">✕</button>';
    h += '</div>';
    h += '<div class="rfx-strip">';
    h +=   'Today: <b>'+S.dailyCount+'/'+S.dailyCap+'</b> · ';
    h +=   'Candidates: <b>'+ranked.length+'</b> · ';
    h +=   'Sent: <b>'+Object.keys(S.sentRequests).length+'</b> · ';
    h +=   statusBadge;
    h += '</div>';
    h += '<div class="rfx-btns">';
    h +=   '<button class="rfx-btn" id="rfx-harvest">'+(_harvesting?'⏳ Harvesting…':'\u{1F50D} Harvest')+'</button>';
    h +=   '<button class="rfx-btn '+(S.autoAdd?'on':'')+'" id="rfx-auto">Auto-add '+(S.autoAdd?'ON':'OFF')+'</button>';
    h +=   '<button class="rfx-btn '+(S.paused?'on':'')+'" id="rfx-pause">'+(S.paused?'▶ Resume':'⏸ Pause')+'</button>';
    h +=   '<button class="rfx-btn" id="rfx-reset-day" title="Reset today\'s count (debug)">Reset count</button>';
    h += '</div>';
    if (!top) {
      h += '<div class="rfx-empty">';
      if (Object.keys(S.candidates||{}).length === 0) {
        h += 'No candidates yet. Click <b>🔍 Harvest</b> to scan your friends-of-friends graph.';
      } else {
        h += 'No remaining candidates. All ranked candidates have been sent, skipped, or are already friends.';
      }
      h += '</div>';
    } else {
      // v1.0.1: validate pfpUrl prefix before assigning <img src>. Only
      // accept relative remilia.net paths and absolute https:// URLs to
      // known remilia.net subdomains. Suppress any other shape.
      var pfp = '';
      if (top.pfpUrl) {
        var raw = String(top.pfpUrl);
        if (raw.indexOf('https://pfp.remilia.net/') === 0 ||
            raw.indexOf('https://www.remilia.net/') === 0 ||
            raw.indexOf('/imgproxy/') === 0 ||
            raw.indexOf('/pfp/') === 0) {
          pfp = raw.indexOf('http') === 0 ? raw : 'https://www.remilia.net' + raw;
        }
      }
      h += '<div class="rfx-card">';
      h +=   (pfp ? '<img class="rfx-pfp" src="'+escapeHtml(pfp)+'" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">' : '');
      h +=   '<div class="rfx-name">'+escapeHtml(top.displayName)+'</div>';
      h +=   '<div class="rfx-handle">~'+escapeHtml(top.username)+'</div>';
      h +=   '<div class="rfx-mutuals">⭐ '+top.mutualCount+' mutual friends</div>';
      if (top.via && top.via.length) {
        h += '<div class="rfx-via">via ~'+top.via.slice(0,3).map(escapeHtml).join(', ~')+(top.via.length>3?'…':'')+'</div>';
      }
      h +=   '<div class="rfx-actions">';
      h +=     '<button class="rfx-add" id="rfx-add">✓ Add (Enter)</button>';
      h +=     '<button class="rfx-skip" id="rfx-skip">✗ Skip (Esc)</button>';
      h +=   '</div>';
      h +=   '<div class="rfx-hint">Profile: <a href="/~'+escapeHtml(top.username)+'" target="_blank" style="color:#7c2d12;">/~'+escapeHtml(top.username)+'</a></div>';
      h += '</div>';
    }
    h += '<div><b style="font-size:11px;color:#831843;">Activity log</b></div>';
    h += '<div class="rfx-log" id="rfx-log">';
    h += S.log.map(function(l){ return '<div class="rfx-log-line">'+escapeHtml(l)+'</div>'; }).join('');
    h += '</div>';
    p.innerHTML = h;
    bindHandlers();
  }
  function bindHandlers() {
    var close = document.getElementById('rfx-close');
    if (close) close.addEventListener('click', function(){
      var p = document.getElementById(PANEL_ID); if (p) p.classList.add('hidden');
      S.panelOpen = false; save();
    });
    var harvest = document.getElementById('rfx-harvest');
    if (harvest) harvest.addEventListener('click', function(){
      if (!_harvesting) runHarvest();
    });
    var auto = document.getElementById('rfx-auto');
    if (auto) auto.addEventListener('click', function(){
      S.autoAdd = !S.autoAdd;
      save(); render();
      if (S.autoAdd) scheduleAutoTick();
    });
    var pause = document.getElementById('rfx-pause');
    if (pause) pause.addEventListener('click', function(){
      S.paused = !S.paused;
      logEvent(S.paused ? 'Paused all activity' : 'Resumed');
      save(); render();
      if (!S.paused && S.autoAdd) scheduleAutoTick();
    });
    var resetDay = document.getElementById('rfx-reset-day');
    if (resetDay) resetDay.addEventListener('click', function(){
      if (!confirm('Reset today\'s sent count to 0?')) return;
      S.dailyCount = 0;
      S.dailyResetAt = Date.now();
      save(); render();
      logEvent('Daily count reset manually');
    });
    var add = document.getElementById('rfx-add');
    if (add) add.addEventListener('click', function(){
      var top = getTopCandidate();
      if (top) doAdd(top.username);
    });
    var skip = document.getElementById('rfx-skip');
    if (skip) skip.addEventListener('click', function(){
      var top = getTopCandidate();
      if (top) doSkip(top.username);
    });
  }

  /* ═══════════════════════════════════════════════════════
     9. KEYBOARD SHORTCUTS
     ═══════════════════════════════════════════════════════
     Space = Add, S = Skip. Only fire when the panel is open AND
     focus is not in a text input (avoids stealing keystrokes from
     chat, the search bar, etc.). */
  function setupKeyboard() {
    // v1.0.1: Enter/Esc instead of Space/S. Space conflicts with scrolling
    // and chat input; S is too easy to fire accidentally. Enter is the
    // natural "yes" key and Esc is the natural "skip/cancel" key. Both
    // are gated to skip when focus is in an input / textarea / editable.
    document.addEventListener('keydown', function(e){
      var p = document.getElementById(PANEL_ID);
      if (!p || p.classList.contains('hidden')) return;
      var ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      if (e.key === 'Enter') {
        var top = getTopCandidate();
        if (top) { e.preventDefault(); doAdd(top.username); }
      } else if (e.key === 'Escape') {
        var topS = getTopCandidate();
        if (topS) { e.preventDefault(); doSkip(topS.username); }
      }
    }, true);
  }

  /* ═══════════════════════════════════════════════════════
     10. BOOT
     ═══════════════════════════════════════════════════════ */
  function boot() {
    ensureUI();
    setupKeyboard();
    render();
    // If a previous session left auto-add ON, resume it on boot
    if (S.autoAdd && !S.paused) scheduleAutoTick();
    console.log('[RFX] Remilia Friend Explorer v'+VER+' loaded.');
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 800);
  } else {
    window.addEventListener('load', function(){ setTimeout(boot, 800); });
  }
})();
