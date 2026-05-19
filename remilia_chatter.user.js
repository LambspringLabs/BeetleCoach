// ==UserScript==
// @name         Remilia Chatter
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Low-frequency rotating chatter for remilia.net global chat. Standalone, separate from BeetleCoach / Friend Explorer.
// @match        https://www.remilia.net/*
// @match        https://remilia.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/remilia_chatter.user.js
// @downloadURL  https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/remilia_chatter.user.js
// ==/UserScript==

// SECURITY: this script posts authenticated chat messages using your
// remilia.net session cookie. Trust model:
//   - Strict hostname equality check (no substring/endsWith — evilremilia.net
//     would not pass). Refuses to run on any other origin.
//   - No remote code loading (no @require, no script tag injection).
//   - @updateURL points only at LambspringLabs/BeetleCoach master.
//   - GM grants minimized: GM_getValue / GM_setValue only.
//   - Multi-tab leader-lock prevents double-posts from concurrent tabs.
//   - Daily-cap + interval-min guardrails are hardcoded constants — a future
//     state-mutating bug cannot lower the floor.
//   - Phrases are rendered via textContent or escaped in HTML — never raw
//     innerHTML with user-edited pool content.

(function () {
  'use strict';

  // Domain guard — refuse to run on unexpected origins.
  if (location.host !== 'www.remilia.net' && location.host !== 'remilia.net') {
    console.warn('[RC] Refusing to run on host:', location.host);
    return;
  }

  /* ═══════════════════════════════════════════════════════
     1. CONFIG
     ═══════════════════════════════════════════════════════ */
  var VER = '1.0.0';
  var STORE_KEY = 'remilia_chatter_v1_store';
  var PANEL_ID = 'rc-panel';
  var BTN_ID = 'rc-toggle';
  var STYLE_ID = 'rc-style';
  var TAB_LOCK_KEY = 'rc_active_tab';
  var TAB_LOCK_TTL_MS = 30000;
  var DAY_MS = 86400000;

  // Hardcoded floors — protect against config bugs lowering safety.
  var MIN_INTERVAL_SECONDS = 60 * 60;       // never post more than once per hour
  var MAX_DAILY_CAP = 24;                   // ceiling on daily cap setting
  var POST_RETRY_DELAY_MS = 5 * 60 * 1000;  // retry in 5 min if chat input missing
  var DEFAULT_INTERVAL_MIN_S = 2.5 * 3600;  // 2.5 hours
  var DEFAULT_INTERVAL_MAX_S = 3 * 3600;    // 3 hours

  // Default phrase pool — user-editable in panel. Seeded from collections
  // visible on the profile page that the user already engages with.
  var DEFAULT_PHRASES = [
    'radcat', 'radbro', 'remilio', 'retart', 'kagami', 'milady',
    'molady', 'yayo', 'shishi', 'remicat'
  ];

  /* ═══════════════════════════════════════════════════════
     2. STATE
     ═══════════════════════════════════════════════════════ */
  function defaults() {
    return {
      ver: VER,
      enabled: false,                 // user must explicitly enable
      paused: false,                  // separate from enabled — temporary halt
      panelOpen: true,
      myUsername: '',
      phrases: DEFAULT_PHRASES.slice(),
      lastPhrase: '',                 // anti-repeat
      dailyCount: 0,
      dailyResetAt: Date.now(),
      dailyCap: 10,                   // user-configurable, capped at MAX_DAILY_CAP
      intervalMinS: DEFAULT_INTERVAL_MIN_S,
      intervalMaxS: DEFAULT_INTERVAL_MAX_S,
      nextPostAt: 0,                  // timestamp of next scheduled post
      lastPostAt: 0,
      lastPostPhrase: '',
      lastPostStatus: '',             // 'ok' | 'fail: <reason>'
      backoffUntil: 0,                // skip until this time (set on repeated failures)
      consecutiveFailures: 0,
      log: []
    };
  }
  function load() {
    try {
      var raw = GM_getValue(STORE_KEY, null);
      if (!raw) return defaults();
      var p = JSON.parse(raw);
      var d = Object.assign(defaults(), p);
      // Daily-cap rollover.
      if (Date.now() - d.dailyResetAt > DAY_MS) {
        d.dailyCount = 0;
        d.dailyResetAt = Date.now();
      }
      // Clamp config against hardcoded floors.
      if (d.intervalMinS < MIN_INTERVAL_SECONDS) d.intervalMinS = MIN_INTERVAL_SECONDS;
      if (d.intervalMaxS < d.intervalMinS) d.intervalMaxS = d.intervalMinS;
      if (d.dailyCap > MAX_DAILY_CAP) d.dailyCap = MAX_DAILY_CAP;
      if (d.dailyCap < 1) d.dailyCap = 1;
      if (!Array.isArray(d.phrases) || !d.phrases.length) d.phrases = DEFAULT_PHRASES.slice();
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
    var el = document.getElementById('rc-log');
    if (el) el.innerHTML = S.log.map(function(l){ return '<div class="rc-log-line">'+escapeHtml(l)+'</div>'; }).join('');
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function fmtTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }
  function fmtCountdown(targetTs) {
    if (!targetTs) return '—';
    var ms = targetTs - Date.now();
    if (ms <= 0) return 'now';
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  }

  /* ═══════════════════════════════════════════════════════
     3. MULTI-TAB LEADER LOCK
     ═══════════════════════════════════════════════════════
     Only one tab fires posts at a time. Prevents double-counting +
     duplicate posts when the script is open on multiple tabs. */
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
  function claimLeader() {
    localStorage.setItem(TAB_LOCK_KEY, JSON.stringify({tabId:_tabId, heartbeat:Date.now()}));
    return true;
  }
  function renewLeader() {
    localStorage.setItem(TAB_LOCK_KEY, JSON.stringify({tabId:_tabId, heartbeat:Date.now()}));
  }
  setInterval(renewLeader, TAB_LOCK_TTL_MS / 3);

  /* ═══════════════════════════════════════════════════════
     4. CHAT INPUT HELPERS
     ═══════════════════════════════════════════════════════
     remilia.net's chat input class isn't published; we use tolerant
     selectors. setReactValue() uses the React-aware native setter so
     React's internal state mirrors the DOM change — without it, React
     overwrites the value on the next render. */
  function findChatInput() {
    var sels = [
      '[class*="global-chat"] textarea',
      '[class*="GlobalChat"] textarea',
      '[class*="chat"] textarea[placeholder]',
      '[class*="chat-input"] textarea',
      '[class*="message-input"] textarea',
      '[class*="global-chat"] input[type="text"]',
      '[class*="chat"] input[placeholder*="message" i]',
      '[class*="chat"] input[placeholder*="chat" i]',
      '[class*="chat"] input[placeholder*="say" i]'
    ];
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (el && !el.disabled) return el;
    }
    return null;
  }
  function findSendButton(nearEl) {
    if (nearEl) {
      // Walk up looking for a form or container with a submit button.
      var p = nearEl;
      for (var depth = 0; depth < 5 && p; depth++) {
        var btn = p.querySelector && p.querySelector('button[type="submit"], button[class*="send" i], button[aria-label*="send" i]');
        if (btn && !btn.disabled) return btn;
        p = p.parentElement;
      }
    }
    // Fallback: any send-like button in the chat area.
    var sels = [
      '[class*="global-chat"] button[type="submit"]',
      '[class*="chat"] button[type="submit"]',
      '[class*="chat"] button[class*="send" i]',
      '[class*="chat"] button[aria-label*="send" i]'
    ];
    for (var i = 0; i < sels.length; i++) {
      var b = document.querySelector(sels[i]);
      if (b && !b.disabled) return b;
    }
    return null;
  }
  function setReactValue(el, value) {
    var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value');
    if (setter && setter.set) setter.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  }
  function sendMessage(text) {
    return new Promise(function(resolve, reject) {
      var input = findChatInput();
      if (!input) { reject(new Error('chat input not found')); return; }
      // Don't overwrite user-typed content. If input has existing value, abort.
      if (input.value && input.value.trim().length > 0) {
        reject(new Error('chat input has existing user text — skipping to avoid overwriting'));
        return;
      }
      setReactValue(input, text);
      // Give React a tick to register the change before clicking send.
      setTimeout(function() {
        var btn = findSendButton(input);
        if (btn) {
          btn.click();
          resolve('button');
        } else {
          // Enter-key fallback.
          input.focus();
          var down = new KeyboardEvent('keydown', {key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true, cancelable:true});
          var press = new KeyboardEvent('keypress', {key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true, cancelable:true});
          var up = new KeyboardEvent('keyup', {key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true, cancelable:true});
          input.dispatchEvent(down);
          input.dispatchEvent(press);
          input.dispatchEvent(up);
          resolve('enter');
        }
      }, 100);
    });
  }
  function findChatMessages() {
    var sels = [
      '[class*="global-chat"] [class*="messages"]',
      '[class*="GlobalChat"] [class*="messages"]',
      '[class*="chat-messages"]',
      '.messages'
    ];
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (el && el.children && el.children.length > 0) return el;
    }
    return null;
  }
  function verifyPosted(text) {
    // Look at the last ~8 chat lines for our text + username (if known).
    // Returns true if observed within 4 seconds.
    return new Promise(function(resolve) {
      var deadline = Date.now() + 4000;
      var tick = function() {
        var c = findChatMessages();
        if (c) {
          var lines = c.children;
          var startIdx = Math.max(0, lines.length - 8);
          var myName = (S.myUsername || '').toLowerCase();
          for (var i = startIdx; i < lines.length; i++) {
            var t = (lines[i].textContent || '').toLowerCase();
            if (t.indexOf(text.toLowerCase()) > -1 && (!myName || t.indexOf(myName) > -1)) {
              resolve(true);
              return;
            }
          }
        }
        if (Date.now() >= deadline) { resolve(false); return; }
        setTimeout(tick, 400);
      };
      tick();
    });
  }

  /* ═══════════════════════════════════════════════════════
     5. SCHEDULER
     ═══════════════════════════════════════════════════════ */
  function pickPhrase() {
    // Random pick from pool, anti-repeat (don't repeat the last phrase).
    var pool = (S.phrases || []).filter(function(p) { return p && p.trim().length > 0; });
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    var candidates = pool.filter(function(p) { return p !== S.lastPhrase; });
    if (!candidates.length) candidates = pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  function nextDelaySeconds() {
    // Uniform random in [intervalMinS, intervalMaxS]. Capped by hardcoded
    // MIN_INTERVAL_SECONDS as belt-and-suspenders.
    var lo = Math.max(MIN_INTERVAL_SECONDS, S.intervalMinS);
    var hi = Math.max(lo, S.intervalMaxS);
    return Math.floor(lo + Math.random() * (hi - lo));
  }
  function scheduleNext(fromMs) {
    var base = fromMs || Date.now();
    S.nextPostAt = base + nextDelaySeconds() * 1000;
    save();
    renderPanel();
  }
  function maybePost() {
    // Top-level tick. Fires at most every 30s. Decides whether to attempt
    // a post based on enabled/paused/leader/daily-cap/schedule/backoff.
    if (!S.enabled || S.paused) return;
    if (!isLeaderTab()) return;
    var now = Date.now();
    if (S.backoffUntil && now < S.backoffUntil) return;
    // Daily-cap rollover.
    if (now - S.dailyResetAt > DAY_MS) {
      S.dailyCount = 0;
      S.dailyResetAt = now;
      save();
    }
    if (S.dailyCount >= S.dailyCap) return;
    if (!S.nextPostAt) { scheduleNext(now); return; }
    if (now < S.nextPostAt) return;
    // Fire.
    var phrase = pickPhrase();
    if (!phrase) {
      logEvent('No phrases configured — pausing.');
      S.paused = true;
      save();
      renderPanel();
      return;
    }
    // Reserve before send (per friend-explorer pattern) — bump counters so
    // a concurrent tab won't try the same post.
    var reservedAt = Date.now();
    S.lastPhrase = phrase;
    S.dailyCount++;
    save();
    sendMessage(phrase).then(function(method) {
      logEvent('Posted "' + phrase + '" via ' + method + '.');
      return verifyPosted(phrase);
    }).then(function(verified) {
      S.lastPostAt = Date.now();
      S.lastPostPhrase = phrase;
      S.lastPostStatus = verified ? 'ok' : 'sent (unverified)';
      S.consecutiveFailures = 0;
      save();
      scheduleNext(Date.now());
    }).catch(function(err) {
      // Roll back the reserved counter — the post didn't actually go through.
      S.dailyCount--;
      S.consecutiveFailures++;
      S.lastPostStatus = 'fail: ' + (err && err.message ? err.message : 'unknown');
      logEvent('Post failed: ' + S.lastPostStatus);
      if (S.consecutiveFailures >= 3) {
        S.backoffUntil = Date.now() + POST_RETRY_DELAY_MS;
        logEvent('Backing off for 5 min after 3 failures.');
      }
      save();
      // Reschedule sooner on transient failure so we retry.
      S.nextPostAt = Date.now() + POST_RETRY_DELAY_MS;
      save();
      renderPanel();
    });
  }

  /* ═══════════════════════════════════════════════════════
     6. USERNAME DETECTION (light)
     ═══════════════════════════════════════════════════════
     Used by verifyPosted to confirm OUR message appeared (not someone
     else saying the same phrase). Best-effort — falls back to
     text-only check if username can't be derived. */
  function detectUsername() {
    if (S.myUsername) return Promise.resolve(S.myUsername);
    return fetch('/api/profile/whoami', {credentials:'include'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){
        if (!j) return '';
        var u = j.displayUsername || j.username || j.user || j.handle || '';
        if (u) { S.myUsername = u; save(); }
        return u;
      }).catch(function(){ return ''; });
  }

  /* ═══════════════════════════════════════════════════════
     7. UI
     ═══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#' + BTN_ID + '{position:fixed;left:20px;bottom:80px;z-index:999998;padding:8px 12px;background:#f3e8ff;color:#581c87;border:1px solid #c4b5fd;border-radius:10px;font-weight:700;cursor:pointer;font-size:12px;font-family:-apple-system,Arial,sans-serif;}',
      '#' + BTN_ID + ':hover{background:#e9d5ff;}',
      '#' + PANEL_ID + '{position:fixed;left:20px;top:50px;z-index:999998;width:340px;max-width:90vw;background:#fff;border:2px solid #c4b5fd;border-radius:14px;padding:14px;box-shadow:0 12px 36px rgba(0,0,0,.15);font-family:-apple-system,Arial,sans-serif;color:#1f2937;font-size:12px;display:flex;flex-direction:column;gap:8px;max-height:calc(100vh - 70px);overflow:hidden;}',
      '#' + PANEL_ID + '.hidden{display:none!important;}',
      '.rc-h{display:flex;align-items:center;justify-content:space-between;cursor:grab;user-select:none;padding-bottom:6px;border-bottom:1px solid #ede9fe;}',
      '.rc-h:active{cursor:grabbing;}',
      '.rc-title{font-size:14px;font-weight:800;color:#5b21b6;}',
      '.rc-ver{font-size:9px;color:#6b7280;font-weight:600;margin-left:4px;}',
      '.rc-row{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11px;}',
      '.rc-label{color:#6b7280;font-weight:600;}',
      '.rc-val{font-weight:700;color:#1f2937;}',
      '.rc-btn{background:#ede9fe;color:#5b21b6;border:1px solid #c4b5fd;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;}',
      '.rc-btn:hover{background:#ddd6fe;}',
      '.rc-btn.on{background:#7c3aed;color:#fff;border-color:#6d28d9;}',
      '.rc-btn.danger{background:#fef2f2;color:#b91c1c;border-color:#fecaca;}',
      '.rc-btns{display:flex;gap:4px;flex-wrap:wrap;}',
      '.rc-status{padding:8px;background:#faf5ff;border:1px solid #ede9fe;border-radius:8px;font-size:11px;display:flex;flex-direction:column;gap:3px;}',
      '.rc-card{padding:6px 8px;background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;font-size:11px;}',
      '.rc-pool{width:100%;min-height:60px;font-family:monospace;font-size:11px;padding:4px;border:1px solid #d1d5db;border-radius:4px;resize:vertical;box-sizing:border-box;}',
      '.rc-input{width:60px;font-size:11px;padding:2px 4px;border:1px solid #d1d5db;border-radius:4px;}',
      '.rc-log{max-height:120px;overflow-y:auto;background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;padding:4px 6px;}',
      '.rc-log-line{font-size:9px;color:#6b7280;border-bottom:1px solid #f3f4f6;padding:1px 0;line-height:1.4;}',
      '.rc-log-line:last-child{border-bottom:none;}',
      '.rc-badge{display:inline-block;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:700;}',
      '.rc-on{background:#dcfce7;color:#166534;}',
      '.rc-off{background:#fee2e2;color:#991b1b;}',
      '.rc-paused{background:#fef3c7;color:#92400e;}'
    ].join('');
    document.head.appendChild(s);
  }
  function injectToggleBtn() {
    if (document.getElementById(BTN_ID)) return;
    var b = document.createElement('button');
    b.id = BTN_ID;
    b.textContent = '💬 Chatter';
    b.addEventListener('click', function() {
      var p = document.getElementById(PANEL_ID);
      if (!p) { createPanel(); return; }
      var hidden = p.classList.toggle('hidden');
      S.panelOpen = !hidden;
      save();
    });
    document.body.appendChild(b);
  }
  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;
    var p = document.createElement('div');
    p.id = PANEL_ID;
    if (!S.panelOpen) p.classList.add('hidden');
    document.body.appendChild(p);
    renderPanel();
    bindDrag(p);
  }
  function statusBadge() {
    if (!S.enabled) return '<span class="rc-badge rc-off">DISABLED</span>';
    if (S.paused) return '<span class="rc-badge rc-paused">PAUSED</span>';
    if (S.backoffUntil && Date.now() < S.backoffUntil) return '<span class="rc-badge rc-paused">BACKOFF</span>';
    if (!isLeaderTab()) return '<span class="rc-badge rc-paused">FOLLOWER</span>';
    return '<span class="rc-badge rc-on">ACTIVE</span>';
  }
  function renderPanel() {
    var p = document.getElementById(PANEL_ID);
    if (!p) return;
    var h = '';
    h += '<div class="rc-h"><span class="rc-title">💬 Remilia Chatter <span class="rc-ver">v' + VER + '</span> ' + statusBadge() + '</span><span class="rc-btn" id="rc-close" title="Close">×</span></div>';
    // Buttons
    h += '<div class="rc-btns">';
    h += '<button class="rc-btn ' + (S.enabled ? 'on' : '') + '" id="rc-enable">' + (S.enabled ? 'Enabled' : 'Enable') + '</button>';
    h += '<button class="rc-btn ' + (S.paused ? 'on' : '') + '" id="rc-pause" title="Temporary halt; preserves schedule">' + (S.paused ? 'Resume' : 'Pause') + '</button>';
    h += '<button class="rc-btn" id="rc-test" title="Send one message now using a random phrase">Test post</button>';
    h += '<button class="rc-btn" id="rc-skip" title="Skip next scheduled post; pick a new random time">Reschedule</button>';
    h += '<button class="rc-btn danger" id="rc-reset" title="Reset daily counter">Reset day</button>';
    h += '</div>';
    // Status
    h += '<div class="rc-status">';
    h += '<div class="rc-row"><span class="rc-label">Next post:</span><span class="rc-val">' + (S.enabled && !S.paused ? fmtCountdown(S.nextPostAt) + ' (' + fmtTime(S.nextPostAt) + ')' : '—') + '</span></div>';
    h += '<div class="rc-row"><span class="rc-label">Today:</span><span class="rc-val">' + S.dailyCount + '/' + S.dailyCap + '</span></div>';
    h += '<div class="rc-row"><span class="rc-label">Last post:</span><span class="rc-val">' + (S.lastPostAt ? escapeHtml(S.lastPostPhrase) + ' @ ' + fmtTime(S.lastPostAt) : '—') + '</span></div>';
    h += '<div class="rc-row"><span class="rc-label">Status:</span><span class="rc-val">' + escapeHtml(S.lastPostStatus || '—') + '</span></div>';
    h += '<div class="rc-row"><span class="rc-label">User:</span><span class="rc-val">' + escapeHtml(S.myUsername || '(detecting…)') + '</span></div>';
    h += '</div>';
    // Cadence settings
    h += '<div class="rc-card"><div style="font-weight:700;margin-bottom:4px;">Cadence</div>';
    h += '<div class="rc-row"><span class="rc-label">Interval:</span><span><input class="rc-input" id="rc-imin" type="number" min="60" value="' + Math.round(S.intervalMinS / 60) + '"> – <input class="rc-input" id="rc-imax" type="number" min="60" value="' + Math.round(S.intervalMaxS / 60) + '"> min</span></div>';
    h += '<div class="rc-row"><span class="rc-label">Daily cap:</span><span><input class="rc-input" id="rc-cap" type="number" min="1" max="' + MAX_DAILY_CAP + '" value="' + S.dailyCap + '"></span></div>';
    h += '<button class="rc-btn" id="rc-save-cadence" style="margin-top:4px;">Save cadence</button>';
    h += '</div>';
    // Phrase pool
    h += '<div class="rc-card"><div style="font-weight:700;margin-bottom:4px;">Phrase pool <span style="color:#6b7280;font-weight:500;">(one per line)</span></div>';
    h += '<textarea class="rc-pool" id="rc-phrases">' + escapeHtml((S.phrases || []).join('\n')) + '</textarea>';
    h += '<button class="rc-btn" id="rc-save-phrases" style="margin-top:4px;">Save phrases</button>';
    h += '</div>';
    // Log
    h += '<div style="font-weight:700;">Log</div>';
    h += '<div class="rc-log" id="rc-log">' + S.log.map(function(l){return '<div class="rc-log-line">'+escapeHtml(l)+'</div>';}).join('') + '</div>';
    p.innerHTML = h;
    bindButtons();
  }
  function bindButtons() {
    var $ = function(id) { return document.getElementById(id); };
    if ($('rc-close')) $('rc-close').addEventListener('click', function() {
      document.getElementById(PANEL_ID).classList.add('hidden');
      S.panelOpen = false; save();
    });
    if ($('rc-enable')) $('rc-enable').addEventListener('click', function() {
      S.enabled = !S.enabled;
      if (S.enabled && !S.nextPostAt) scheduleNext(Date.now());
      logEvent(S.enabled ? 'Enabled.' : 'Disabled.');
      save(); renderPanel();
    });
    if ($('rc-pause')) $('rc-pause').addEventListener('click', function() {
      S.paused = !S.paused;
      logEvent(S.paused ? 'Paused.' : 'Resumed.');
      save(); renderPanel();
    });
    if ($('rc-test')) $('rc-test').addEventListener('click', function() {
      var phrase = pickPhrase();
      if (!phrase) { alert('No phrases configured.'); return; }
      sendMessage(phrase).then(function(method) {
        logEvent('Test post "' + phrase + '" via ' + method + '.');
        S.lastPhrase = phrase;
        save();
      }).catch(function(err) {
        logEvent('Test post failed: ' + (err.message || err));
      });
    });
    if ($('rc-skip')) $('rc-skip').addEventListener('click', function() {
      scheduleNext(Date.now());
      logEvent('Rescheduled next post.');
    });
    if ($('rc-reset')) $('rc-reset').addEventListener('click', function() {
      if (!confirm('Reset today\'s post counter to 0?')) return;
      S.dailyCount = 0;
      S.dailyResetAt = Date.now();
      save(); renderPanel();
      logEvent('Daily counter reset.');
    });
    if ($('rc-save-cadence')) $('rc-save-cadence').addEventListener('click', function() {
      var minM = parseInt($('rc-imin').value, 10);
      var maxM = parseInt($('rc-imax').value, 10);
      var cap = parseInt($('rc-cap').value, 10);
      if (!isFinite(minM) || minM < 60) { alert('Min must be ≥ 60 min.'); return; }
      if (!isFinite(maxM) || maxM < minM) { alert('Max must be ≥ min.'); return; }
      if (!isFinite(cap) || cap < 1 || cap > MAX_DAILY_CAP) { alert('Daily cap must be 1–' + MAX_DAILY_CAP + '.'); return; }
      S.intervalMinS = minM * 60;
      S.intervalMaxS = maxM * 60;
      S.dailyCap = cap;
      save();
      logEvent('Cadence updated: ' + minM + '–' + maxM + ' min, cap ' + cap + '.');
      renderPanel();
    });
    if ($('rc-save-phrases')) $('rc-save-phrases').addEventListener('click', function() {
      var txt = $('rc-phrases').value;
      var arr = txt.split('\n').map(function(s){return s.trim();}).filter(function(s){return s.length > 0 && s.length <= 60;});
      if (!arr.length) { alert('Add at least one phrase.'); return; }
      S.phrases = arr;
      save();
      logEvent('Phrase pool updated: ' + arr.length + ' phrases.');
      renderPanel();
    });
  }
  var _drag = {on:false, ox:0, oy:0};
  function bindDrag(p) {
    p.addEventListener('mousedown', function(e) {
      var h = e.target.closest('.rc-h');
      if (!h) return;
      if (e.target.id === 'rc-close') return;
      _drag.on = true;
      _drag.ox = e.clientX - p.offsetLeft;
      _drag.oy = e.clientY - p.offsetTop;
    });
    document.addEventListener('mousemove', function(e) {
      if (!_drag.on) return;
      p.style.left = Math.max(0, e.clientX - _drag.ox) + 'px';
      p.style.top = Math.max(0, e.clientY - _drag.oy) + 'px';
    });
    document.addEventListener('mouseup', function() { _drag.on = false; });
  }

  /* ═══════════════════════════════════════════════════════
     8. BOOT
     ═══════════════════════════════════════════════════════ */
  function boot() {
    if (!document.body) { setTimeout(boot, 200); return; }
    injectStyles();
    injectToggleBtn();
    createPanel();
    detectUsername();
    // First-time setup: schedule a slot so the user can see countdown.
    if (S.enabled && !S.nextPostAt) scheduleNext(Date.now());
    // Tick loop — checks every 30s whether it's time to post + updates UI.
    setInterval(function() {
      maybePost();
      // Cheap UI refresh of countdown row only — full renderPanel rewrites
      // the textarea which would clobber user edits in progress. Update
      // the live values inline instead.
      var p = document.getElementById(PANEL_ID);
      if (p && !p.classList.contains('hidden')) {
        // Cheap diff: just update countdown + counters.
        var rows = p.querySelectorAll('.rc-row .rc-val');
        if (rows.length >= 2) {
          rows[0].textContent = (S.enabled && !S.paused ? fmtCountdown(S.nextPostAt) + ' (' + fmtTime(S.nextPostAt) + ')' : '—');
          rows[1].textContent = S.dailyCount + '/' + S.dailyCap;
        }
      }
    }, 30000);
    logEvent('Chatter v' + VER + ' loaded. ' + (S.enabled ? 'Enabled.' : 'Disabled — click Enable to start.'));
  }
  boot();
})();
