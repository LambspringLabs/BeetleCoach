# Friend Explorer — Pre-Ship Security + Design Review

_Reviewer: Claude (Opus 4.7, 1M ctx). Date: 2026-05-18._
_Subject: `remilia_friend_explorer.user.js` (planned). Standalone Tampermonkey userscript on `remilia.net` to grow `sails` / `~sailboatships` from 759 → ~2800 friends via mutual-of-mutual discovery, capped at 100 friend requests/day._
_Sibling script in same tab: BeetleCoach v12.4.23. Account-level safety is the dominant concern._

Verdict at bottom. Everything labeled C / S / M is severity (Critical / Significant / Minor).

---

## Critical issues

### C1. Auto-add daily-cap MUST be enforced just before the network call, atomically with the persisted state write

**Risk:** "1000 requests fire" is exactly the failure mode to design against. The cap should not be checked in the scheduler then trusted by the firing function. Re-check inside the same critical section that increments the counter and persists state. If you read-check-fire-write you lose to: setInterval drift, a tab waking from sleep with a backlog, a hot-reload re-running init, or a race between two tabs (see C2).

**Required pattern (pseudo):**
```js
function tryFireRequest(username) {
  reloadStateFromGM();                    // get freshest persisted view
  maybeResetDailyCounter();               // monotonic, see C3
  if (state.paused) return 'paused';
  if (state.dailyCount >= state.dailyCap) return 'cap_daily';
  if (burst.tokensInLastMinute() >= 10) return 'cap_burst';   // see C4
  if (state.sentRequests[username]) return 'dupe_sent';
  if (state.myFriends.includes(username)) return 'dupe_friend';
  // RESERVE the slot before the network call:
  state.sentRequests[username] = { ts: Date.now(), status: 'pending' };
  state.dailyCount += 1;
  burst.recordSend();
  save();                                  // GM_setValue + flush
  return fetch(...).then(handle).catch(handleErr);
}
```

The reservation-before-network pattern means a network hang doesn't allow a second auto-add tick to fire the same slot. If the network fails, mark `failedRequests[username]` and optionally refund the counter (your choice — I'd say DON'T refund, to keep the cap conservative).

### C2. Multi-tab race is real and not solved by a 30s heartbeat alone

Your suggested mitigation ("bail if `localStorage` heartbeat is recent") is the right shape but the threshold matters. The auto-add cadence is 5–10s. A 30s window catches the common case but a freshly-opened tab whose heartbeat hasn't fired yet still races. Use:

1. **Leader election on every tick**, not just startup. Write `{tabId: random, ts: now}` to `localStorage.remilia_fe_leader` each tick. Before firing, re-read and check `tabId === ours && now - ts < 15000`. If not leader, do nothing (still allow review-mode UI, just don't auto-fire).
2. **`storage` event listener** so non-leader tabs visibly show "another tab is driving" instead of silently doing nothing — avoids the "why isn't this working" debug session.
3. **GM_setValue is shared across tabs** for the same userscript, but read-modify-write is NOT atomic across tabs. Always re-read state immediately before mutating + saving. The two-tab race scenario is: tab A reads `dailyCount=99`, tab B reads `dailyCount=99`, both write `dailyCount=100`, both fire. You're at 101 with a "99→100" log on both sides.

**Pragmatic shortcut if you don't want leader election:** auto-add only runs in **one tab at a time, manually chosen**. Add a "This tab drives" toggle that writes its tabId to localStorage. Other tabs see the flag and disable their auto-add button with a tooltip "auto-add is running in another tab". Trivially correct, no race.

### C3. `dailyResetAt` rollover is brittle to clock skew and sleep/wake

`if (now - dailyResetAt > 86400000) reset` has three failure modes:

1. **Suspended laptop:** machine sleeps 18h, wakes, `Date.now()` jumps, multiple tabs all reset simultaneously. Fine if reset is idempotent (it is), bad if you tie it to "reset means I get a fresh 100".
2. **Wall-clock change** (NTP correction, user changes timezone, daylight saving). Use a monotonic-ish anchor: store `dailyResetAt` as the most recent local midnight, not a 24h-rolling window. Reset when `floor(now / 86_400_000) !== floor(dailyResetAt / 86_400_000)` in the user's local TZ. This makes "100 requests per day" mean "per calendar day" not "per 24h sliding window" — closer to what the upstream rate limit probably does, and easier to reason about.
3. **Manual user reset** of the count: gate behind a confirm dialog, log to a permanent counter (`lifetimeRequests`) so the user can audit "did I actually only send 100 today?" Trust but verify.

### C4. Hard burst cap is non-negotiable

You suggested it; I'm escalating to Critical. The dailyCap=100 is your stated business limit, but a logic bug that runs auto-add in a tight loop could fire 100 in 30 seconds and that single burst is what triggers anti-abuse heuristics on the server side. Implement:

```js
var burst = (function() {
  var sends = [];   // timestamps
  return {
    recordSend: function() { sends.push(Date.now()); sends = sends.filter(function(t){return Date.now()-t<60000;}); },
    tokensInLastMinute: function() { return sends.filter(function(t){return Date.now()-t<60000;}).length; }
  };
})();
```

Cap: **max 10 sends per rolling 60s**, hard-coded constant, not in state. State is mutable. Constants are not. If a future bug or injection rewrites state, the burst limit still holds.

Also: **first send of the session has a 2–3s grace delay** so an auto-add toggle accidentally firing on page load doesn't ship a request before the user can react.

### C5. Domain validation must use exact equality, not substring

Your suggestion `location.host === 'www.remilia.net'` is correct, but be explicit:

```js
if (location.host !== 'www.remilia.net' && location.host !== 'remilia.net') {
  console.warn('[RFX] Refusing to run on', location.host);
  return;
}
```

The `@match https://www.remilia.net/*` should already gate this, but defense-in-depth: an attacker who can MITM (or who gets the user to install a malicious update with a wider `@match`) bypasses the gate. The runtime check is cheap. Also: if the redirect target ever changes (e.g., `www2.remilia.net` for staging), this catches it.

**Do NOT** rely on `location.hostname.endsWith('remilia.net')` — `evilremilia.net` ends with `remilia.net`. Use full equality.

---

## Significant issues

### S1. The 3800-GET harvest is the real ban-risk vector, not the 100 POSTs

A POST that creates a side effect (friend request) is rate-limited server-side because it has to be. A GET that reads public data is often unrate-limited but **traffic-shape anomaly detection** (3800 requests in 2 minutes from one cookie) is more likely to trip a flag than the carefully-spaced POSTs.

**Recommendation:**
- **Serial-2, not parallel-5.** You tested parallel-4 with no throttle but anti-abuse heuristics look at request density per IP+cookie, not just response codes. Serial with 2 concurrent and a 250ms inter-request delay is ~5 req/sec. At 3800 requests that's ~12 minutes — fine for a one-time harvest.
- **Back off aggressively on ANY non-2xx.** 429 → pause 5min. 5xx → pause 30s and retry once. 401/403 → STOP harvest entirely, surface "your session may have expired".
- **Resume from a checkpoint.** Persist `harvestProgress: {friendIdx, page}` to GM_setValue. If the harvest dies mid-run (network, browser crash, user close), the next run resumes from the last completed friend. Saves the user from a 12-minute redo.
- **Reuse the harvest.** Cache `candidates` with `candidatesUpdatedAt`. Don't re-harvest unless older than e.g. 7 days OR the user explicitly clicks "Re-harvest". The whole point of the offline candidate map is you only pay the harvest cost once.
- **Randomize the harvest order.** Iterating friends alphabetically is a very obvious traffic pattern. Shuffle the friend list before iterating. Adds zero cost, removes a fingerprintable pattern.

### S2. Cookie exfil via supply-chain compromise is your biggest realistic threat

Your concern (#4) is well-founded. Mitigations in rough order of value:

1. **No remote code loading.** `@require` directives that point to CDNs / GitHub raw URLs are equivalent to `eval(fetch(url))` from a security standpoint. Vendor any helper code (none expected) directly into the userscript.
2. **`@updateURL` and `@downloadURL` point to YOUR github repo only.** If you publish, use `LambspringLabs/RemiliaFriendExplorer` (or wherever) with branch protection on `master`. Don't point at a third-party fork. Auto-update is the threat vector; your own repo is the trust root.
3. **`@grant` minimization.** Use only `GM_getValue`, `GM_setValue`, `GM_deleteValue`. Do NOT use `GM_xmlhttpRequest` (which can bypass CORS) — stick to `fetch()` with `credentials:'include'`. If you don't grant it, a compromised update can't add it without the user re-confirming the permission prompt (Tampermonkey re-prompts on `@grant` changes, IIRC).
4. **`unsafeWindow: false`** (default; just don't enable it). Keeps the script's globals isolated from page JS.
5. **No `innerHTML` with user-controlled strings.** Friend display names come from the API, are user-controlled, and could contain `<script>` or `<img onerror>`. Use `textContent` for all displayName / username / sample_mutuals rendering. For the pfpUrl, set `<img src=...>` via setAttribute and validate it's `https://` (not `javascript:` or `data:`).
6. **No `eval`, no `new Function`, no `document.write`.** Obvious but worth a lint pass.
7. **Document the trust model in the script header.** A literal `// SECURITY: this script makes authenticated requests with your cookie. ...` comment block in the source. Future-you reviewing diffs benefits.
8. **Kill switch.** A "Pause" button that sets `S.paused=true` AND clears any pending setInterval handles. Belt-and-suspenders: also `Object.freeze(S)` while paused so a buggy tick can't mutate state. (Optional; the simple `if (S.paused) return` pattern from BC works fine.)

### S3. Keyboard shortcuts will conflict — gate them properly

Space and S are both terrible global shortcuts on a site with chat input. Gate to **panel-has-focus AND no input element is focused**:

```js
document.addEventListener('keydown', function(e) {
  if (!rfxPanelHasFocus()) return;
  if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/i.test(document.activeElement.tagName)) return;
  if (document.activeElement && document.activeElement.isContentEditable) return;
  if (e.code === 'Space') { e.preventDefault(); handleAdd(); }
  else if (e.key === 's' || e.key === 'S') { e.preventDefault(); handleSkip(); }
});
```

Where `rfxPanelHasFocus()` checks if the most recent click was inside `#rfx-panel` (track via a `mousedown` listener that flips a flag). Or simpler: only enable shortcuts when the user has explicitly clicked into the panel ("entered review mode"), and disable when they click outside. Visual indicator: panel border changes color when shortcuts are armed.

Also: **Enter** is a better "add" key than Space. Enter doesn't conflict with chat (chat sends on Enter, but if chat is focused, the gate above blocks the shortcut anyway). Space-to-add is too easy to trigger by accident if focus is ambiguous. Suggest **Enter = add, Esc = skip, P = pause auto-add**. All three are uncommon as content keys.

### S4. The "yesyesyes" UX — concrete design

The user explicitly asked for "super easy to click yesyesyesyesyes". Design pattern:

**Review-mode UI (one big card, takes the full panel):**
```
┌────────────────────────────────────────┐
│  [PFP 96px]   displayName              │
│               @username                │
│               42 mutual friends        │
│               via: alice, bob, carol   │
│               +39 more                 │
│                                        │
│  [ ✓ ADD (Enter) ]   [ ✗ SKIP (Esc) ] │
│                                        │
│  Today: 14 / 100 sent · 86 remaining   │
└────────────────────────────────────────┘
```

- ADD button is **huge** (e.g., 60% of panel width, 60px tall). Skip is smaller.
- After Add: 200ms confirmation flash ("✓ sent"), 100ms slide animation, next card slides in. Total click-to-next < 500ms.
- After Skip: instant transition, no confirmation.
- Show pfp via `<img>` (lazy-load with intersection observer if you preload the next 3 cards).
- **Pre-fetch the next 3 candidate avatars** so rapid clicking doesn't show loading flashes.
- Optional: a "10 more" mode — user clicks one button that auto-adds the next 10 candidates with a 1s gap, visible progress bar, big STOP button. This is the "yesyesyesyes" power-mode without the 5–10s auto-add cadence.

For the no-mouse mode: just `Enter, Enter, Enter, Enter` cycles through. Each press advances. Make sure focus stays on the panel — never let the panel lose focus due to a re-render. The Add button receiving focus after each render is the usual pattern.

### S5. De-dupe correctness — three sets, not two

You listed two: `sentRequests` and `myFriends`. Add a third:

- `blockedOrRejected`: usernames where the POST returned 4xx (other than 429). These should never be retried automatically. Surface them in a "review failures" UI so the user can manually unblock if they want, but default = never retry.

Also: **stale `myFriends`**. If the user accepts a request from someone manually (outside the script), they're now a friend but the script's `myFriends` snapshot doesn't know. Two options:

1. Refresh `myFriends` at the start of every review session (~1 fast GET, no big deal).
2. On any 4xx response with text suggesting "already friends" (need to inspect the actual API response), add to `myFriends` and skip.

(1) is cheap and correct. Do it.

### S6. BC v12.4.23 coexistence

You named the right things (rfx- prefix, separate panel location). Specifics:

- **BC panel is at `position:fixed; left:20px; top:50px`** with a z-index visible in the script. RFX panel: pick `right:20px; top:50px` so they don't overlap. Don't go bottom-anchored — BC's log section grows downward.
- **GM_setValue namespace:** BC uses `STORE_KEY = 'beetle_coach_v8_store'`. Pick a clearly distinct key, e.g., `STORE_KEY = 'remilia_friend_explorer_v1'`. Tampermonkey GM_setValue is per-script (each userscript has its own namespace), but **only if the scripts are separate userscript installs**. Confirm both scripts are installed as distinct `.user.js` files in Tampermonkey, not concatenated.
- **setInterval cadence:** BC ticks every 10s. RFX auto-add cadence is 5–10s. These will interleave fine; just don't share globals. Both use IIFE wrappers; you do the same.
- **DOM observation:** BC has MutationObservers on the game's React tree to detect state changes. RFX shouldn't need MOs at all (it's pure API + its own panel). If it does, scope to its own panel: `observer.observe(document.getElementById('rfx-panel'), ...)`. Never `observe(document.body, {subtree: true})` — guaranteed conflict + perf hit.
- **The combined script tag in the page:** both scripts run in isolated Tampermonkey contexts but share the page's DOM. No conflict expected.

### S7. Failure-mode handling

Your suggestions are good. Tighten:

- **429 received:** parse `Retry-After` header if present; otherwise pause 5min. Surface a banner in the panel: "Rate limited, paused until HH:MM". Don't decrement the daily counter (the request didn't take effect from the server's perspective — but actually, server might count rejected attempts toward its own rate, so be conservative and DO count it).
- **4xx other than 429 (400, 403, 404, 409):** log to `failedRequests[username] = {ts, code, msg}`, advance, do NOT pause. After 5 consecutive 4xx, pause auto-add and surface "something's wrong, check the log". Five consecutive non-rate-limit failures probably means session expired or schema changed.
- **5xx during harvest:** retry the failed page once after 2s, then skip the page (log it), continue. Don't abort the whole harvest on one transient 503.
- **5xx during POST:** retry once after 2s. If second attempt also 5xx, log failure, advance. Don't loop.
- **Network error / fetch throws:** treat as 5xx-equivalent.
- **Session expired** (401/403 on a GET that previously worked): full stop. Surface "Please log in to remilia.net and reload the page". Don't try to re-authenticate.

### S8. State migration / versioning

Add `S.ver` (you have it). Use it: on load, if persisted state's `ver` is < current, run a migration function. Even for v1 → v1, this gives you a place to drop forward-incompatible state if the schema changes. Pattern:

```js
if (!persisted || persisted.ver !== STATE_VER) {
  persisted = migrate(persisted, STATE_VER) || defaults();
}
```

Don't load arbitrary persisted state without validation — if a future-you ships v2 with a different shape, old state can crash the script.

---

## Minor / polish

### M1. Avatar `src` validation
Friend pfpUrl is user-controlled. Validate:
```js
function safePfpUrl(u) {
  try {
    var url = new URL(u);
    return /^https?:$/.test(url.protocol) ? u : '';
  } catch(e) { return ''; }
}
```
Reject `javascript:`, `data:`, `file:`. Render a placeholder if invalid.

### M2. Display name escaping
Even though you'll use `textContent`, double-check the review card's `via: alice, bob, carol` rendering doesn't accidentally `innerHTML` a join. Build it via DOM nodes or template literals + textContent.

### M3. Show "candidates remaining" and ETA
"86 / 100 today, 1840 candidates left at 100/day → 18 days to clear". Helps the user see the shape of the work.

### M4. Mutual-count tiebreaker
When two candidates have the same mutualCount, sort by `displayName` to make ordering deterministic across sessions. Currently you'll get insertion-order which depends on harvest order.

### M5. Sample-mutuals quality
`sample_mutuals: [names]` — pick the user's most-prominent friends (e.g., highest friend-count themselves, or randomly from top 30), not just the first 5 alphabetical. Helps with the "is this person plausibly someone I want to know" judgment call.

### M6. Manual blocklist
Add an `S.userBlocklist` set the user can append to (right-click candidate → "never suggest again"). Different from `failedRequests` — this is intentional, not error-driven.

### M7. Export / import state
Add a button to copy `JSON.stringify(S)` to clipboard, and one to paste-replace. Useful for backup before risky changes (and for moving between browsers).

### M8. The Pause button should be ALWAYS visible
Not behind a settings panel. First-class panel button. Same lesson BC learned — `S.paused` is the most important toggle.

### M9. Initial harvest should require explicit "Start" click
Don't auto-harvest on first script load. User opens panel → sees "Harvest your friend graph? (~12 min, ~3800 reads)" with Start / Cancel. Reduces "wait what is this doing" anxiety.

### M10. Log every send to a permanent log
Append to a `S.history = [{ts, username, result}]` array, capped at e.g. 1000 entries. Visible in the panel. Lets the user audit the script's behavior.

### M11. Don't ship until you've manually-sent ~5 requests via the script
The one test request to `landcruiser` proves the API works. Ship-criterion: send 5 more via the script in review mode, confirm all flip "Pending" in the in-game UI, confirm the daily counter increments correctly. THEN enable auto-add.

---

## Concrete patches / suggestions

### Userscript header (copy-paste-ready scaffold)
```js
// ==UserScript==
// @name         Remilia Friend Explorer
// @namespace    https://github.com/LambspringLabs/
// @version      0.1.0
// @description  Mutual-of-mutual friend discovery and (capped) friend-request automation for remilia.net
// @author       Dan
// @match        https://www.remilia.net/*
// @match        https://remilia.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/LambspringLabs/RemiliaFriendExplorer/master/remilia_friend_explorer.user.js
// @downloadURL  https://raw.githubusercontent.com/LambspringLabs/RemiliaFriendExplorer/master/remilia_friend_explorer.user.js
// ==/UserScript==
//
// SECURITY: This script makes authenticated requests to remilia.net using your
// browser session cookie (credentials:'include'). If the script is modified by a
// malicious update, an attacker could exfiltrate friend data or send unauthorized
// friend requests. Mitigations: (1) @updateURL points only to LambspringLabs; keep
// branch protection on master. (2) No remote code is loaded via @require. (3) Domain
// is gated by @match and a runtime location.host check. (4) Hard burst cap of 10
// req/min is a constant, not stored in mutable state.
```

### State shape (with the additions)
```js
var STATE_VER = 1;
var DEFAULT_STATE = {
  ver: STATE_VER,
  myUsername: 'sailboatships',
  myFriends: [],              // [username]
  myFriendsScannedAt: 0,
  candidates: {},             // {username: {mutualCount, displayName, pfpUrl, sample_mutuals:[]}}
  candidatesUpdatedAt: 0,
  harvestProgress: null,      // {friendIdx, page} or null if not harvesting / finished
  sentRequests: {},           // {username: {ts, status:'pending'|'accepted'|'rejected'}}
  failedRequests: {},         // {username: {ts, code, msg}}
  blockedOrRejected: {},      // {username: ts}   subset of failedRequests we won't retry
  userBlocklist: {},          // {username: ts}   manual "never suggest"
  history: [],                // [{ts, username, result}]   capped 1000
  dailyCount: 0,
  dailyResetAt: 0,            // local-midnight-anchored, see C3
  dailyCap: 100,
  lifetimeSent: 0,
  delayMsMin: 5000,
  delayMsMax: 10000,
  autoAdd: false,
  paused: false,
  uiCollapsed: false,
};
var HARD_BURST_MAX_PER_MIN = 10;   // CONSTANT — not in state
```

### The fire-request critical section (use as-is)
```js
function reserveAndFire(username) {
  reloadStateFromGM();
  maybeResetDailyCounter();
  if (S.paused) return Promise.resolve({ok:false, reason:'paused'});
  if (location.host !== 'www.remilia.net' && location.host !== 'remilia.net') return Promise.resolve({ok:false, reason:'wrong_host'});
  if (S.dailyCount >= S.dailyCap) return Promise.resolve({ok:false, reason:'cap_daily'});
  if (burst.tokensInLastMinute() >= HARD_BURST_MAX_PER_MIN) return Promise.resolve({ok:false, reason:'cap_burst'});
  if (S.sentRequests[username]) return Promise.resolve({ok:false, reason:'dupe_sent'});
  if (S.myFriends.indexOf(username) >= 0) return Promise.resolve({ok:false, reason:'dupe_friend'});
  if (S.userBlocklist[username]) return Promise.resolve({ok:false, reason:'user_blocked'});
  if (S.blockedOrRejected[username]) return Promise.resolve({ok:false, reason:'prev_rejected'});

  // Reserve the slot BEFORE the network call.
  S.sentRequests[username] = { ts: Date.now(), status: 'pending' };
  S.dailyCount += 1;
  S.lifetimeSent += 1;
  burst.recordSend();
  S.history.push({ ts: Date.now(), username: username, result: 'sent' });
  if (S.history.length > 1000) S.history = S.history.slice(-1000);
  save();

  return fetch('/api/friendship/request', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username })
  }).then(function(r) {
    if (r.status === 200) {
      // already counted; no further action
      return { ok:true };
    }
    if (r.status === 429) {
      autoAddPauseUntil = Date.now() + 5*60*1000;
      S.failedRequests[username] = { ts: Date.now(), code: 429, msg: 'rate_limited' };
      save();
      return { ok:false, reason:'rate_limited' };
    }
    // 4xx other than 429
    S.failedRequests[username] = { ts: Date.now(), code: r.status, msg: 'http_'+r.status };
    S.blockedOrRejected[username] = Date.now();
    consecutiveFailures += 1;
    if (consecutiveFailures >= 5) { S.autoAdd = false; surface('5 consecutive failures — auto-add disabled'); }
    save();
    return { ok:false, reason:'http_'+r.status };
  }).catch(function(err) {
    S.failedRequests[username] = { ts: Date.now(), code: 0, msg: String(err).slice(0,200) };
    save();
    return { ok:false, reason:'network_error' };
  });
}
```

### Single-tab driver pattern (simpler than leader election)
```js
function thisTabIsDriver() {
  var driver = localStorage.getItem('rfx_driver_tab');
  return driver === MY_TAB_ID;
}
function claimDriver() {
  localStorage.setItem('rfx_driver_tab', MY_TAB_ID);
  renderPanel();
}
function releaseDriver() {
  if (thisTabIsDriver()) localStorage.removeItem('rfx_driver_tab');
}
window.addEventListener('beforeunload', releaseDriver);
// Auto-add only runs if thisTabIsDriver(). Other tabs show button as "Claim driver" instead of "Auto-add ON".
```

### Daily reset (calendar-day anchored)
```js
function localMidnightTs(t) {
  var d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function maybeResetDailyCounter() {
  var nowMid = localMidnightTs(Date.now());
  if (S.dailyResetAt !== nowMid) {
    S.dailyResetAt = nowMid;
    S.dailyCount = 0;
    save();
  }
}
```

---

## Verdict

**Ship it after addressing C1–C5.** The S-tier items are real but most are 10-line additions to a design that's fundamentally sound. The critical ones are the request-firing critical section (C1), multi-tab safety (C2), reset robustness (C3), the hard burst cap (C4), and domain validation (C5). Without those, the failure mode is "send 200 requests in 30 seconds → account flagged" — exactly what the daily cap is meant to prevent.

The harvest is more of a ban risk than the POSTs (S1). Serial-2 with backoff is the right answer.

UX-wise, your two-mode design (manual review + auto-add) is correct. The "yesyesyes" path is one big ADD button with Enter as the shortcut, gated to not eat keystrokes in chat. Pre-fetch the next 3 candidate avatars so rapid clicking has no loading lag.

Account-safety-wise, the script's threat model is "compromised auto-update injects cookie exfil". Mitigations: minimize `@grant`, no `@require`, no `unsafeWindow`, validate domain at runtime, no `innerHTML` of API content. All cheap.

BC coexistence is fine — different panel position, different STORE_KEY, different prefix, separate IIFE. Both scripts share only the page DOM and the cookie jar; neither is a problem.

Single biggest practical recommendation: **send 5–10 friend requests via the review UI first, with autoAdd OFF, before enabling auto-add for the first time.** Catch the "session expired" / "request body schema wrong" / "the button-flip detection doesn't work" failures in slow mode. Then turn on auto-add for the day's remaining quota.

— end review —
