# v12.4.23 code review

_Reviewer: BC code-review agent, 2026-05-18. Reviewing the in-flight v12.4.22 → v12.4.23 changes described in the spec, partially landed in `beetle_coach.user.js` (defaults+clickCheeseButton already touched; everything else pending). Read order: spec → file → v12.4.22 baseline → mapped each spec item back to code._

_Working assumption: the file already has the `VER = '12.4.23'` bump (line 31), the `hammerSmashedSince:{}` field in `defaults()` (line 484), and the `S.hammerSmashedSince = {}` reset in `clickCheeseButton()` (line 1040). The chat handler, `parseTimers` UBC-transition detection, MutationObserver, `renderPanel()` per-hammer strip, and migration are NOT YET WRITTEN — this review treats spec items #2, #3 (manual detection), #4, #5, and #J as design proposals to vet before implementation._

---

## Critical issues

### C1. Migration (spec item J) cannot run at `load()` — `S.currentHammer` is null until first `parseHammer()`

`load()` (line 510–520) is called once at module init, before any DOM exists (`@run-at document-start`). At that moment `S.currentHammer` is whatever was stored last session, but on a fresh page reload the saved value reflects the LAST `parseHammer()` from the previous tab session — not necessarily today's reality. More importantly, on the first ever v12.4.23 load:
- `parsed.lastSmashAt = <yesterday>`, `parsed.lastUbcAt = <yesterday morning>`, `parsed.hammerSmashedSince = {}` (from defaults merge).
- If `lastSmashAt > lastUbcAt`, the spec's migration says: `hammerSmashedSince[S.currentHammer] = S.lastSmashAt`.
- But `S.currentHammer` from the parsed state could be **wrong**: the user may have crafted a Diamond Hammer between sessions, and `parseHammer()` hasn't re-run.

**More dangerous failure mode:** if the persisted `S.currentHammer` is `null` (fresh install, or boot-state save), the migration writes `hammerSmashedSince[null] = <ts>` — that's a literal string key `"null"`, which won't match any real hammer key during count. The user gets `5/5 free smashes` even though they smashed yesterday and UBC hasn't fired today. **This is exactly the "Diamond Hammer wasted" failure the user is allergic to.**

**Fix:** the migration must run **after the first successful `parseHammer()`**, gated by a one-shot flag (e.g. `S._migratedHammerSmash`). Add to `parseHammer()` immediately after `S.currentHammer = S.ownedHammers[0] || null`:

```js
// v12.4.23 one-shot migration of pre-v12.4.23 lastSmashAt → hammerSmashedSince
if (!S._migratedHammerSmash && S.currentHammer && (S.lastSmashAt||0) > (S.lastUbcAt||0)) {
  S.hammerSmashedSince = S.hammerSmashedSince || {};
  S.hammerSmashedSince[S.currentHammer] = S.lastSmashAt;
}
S._migratedHammerSmash = true;
```

Even with the flag, this is still a heuristic (the user may have smashed with a different hammer than `currentHammer`), but it's the closest you can get without per-broadcast hammer-tier data. **Document the limitation in the panel tooltip on first run.**

---

### C2. The `Ready → countdown` UBC detection (spec #3) will produce false positives during boot

`parseTimers()` (line 646–659) reads from `.cheese-claim-nav .info` and `.cheese-claim-nav .info span:last-child`. The selectors are tolerant: if the span is missing, it falls through to the `Ready!` literal detection (line 644). During React mount, a common sequence is:

1. Cold page load → element doesn't exist yet → `t.dailyCheese = null`
2. Mount partial → `.info` exists with text `Ready` because the React component renders the ready state before fetching server data → `t.dailyCheese = 'Ready!'`
3. Server data arrives → `.info span:last-child` populated with `23h 47m` → `t.dailyCheese = '23h 47m'`

Between (2) and (3) the transition `Ready → 23h 47m` happens **without UBC firing**. If the detection logic is naïve (`if prev === 'Ready' && curr matches /\d+h/ → S.lastUbcAt = Date.now(); S.hammerSmashedSince = {}`), the indicator will **falsely report all hammers as free** when in fact UBC already fired earlier today. The user looks at the panel, drags the Diamond Hammer, gets a 9% break-roll, and loses it.

**Mitigations (need at least two of these):**
1. **Confirm with sibling signals:** only fire detection when the cheese cartridge is visible (i.e. user just navigated to claim) OR the cheese-count field is visibly populated AND consistent with a recent fetch. Cold-boot transitions don't qualify.
2. **Boot grace window:** ignore the Ready→countdown transition if `Date.now() - _bootTime < 60000` (60s after the bootloader, matching BOOT_GRACE × 6). UBC isn't fired within 60s of a cold load — the timer was already populated before reload.
3. **Cross-check with cheese delta:** UBC adds 200–500 cheese. If `inv.cheese` increased by ≥150 in the same tick as the transition, accept; otherwise reject. **This is the most reliable signal**, because the cheese delta is a real-world consequence.
4. **Require Ready was seen on a prior real tick:** only call it a transition if `S._lastSeenDailyCheese === 'Ready!'` AND that value was set in a *prior* tick (track via tick counter), not in the same tick. This rejects (2)→(3) in a single tick.

I'd recommend (2) + (3) together. Without protections, this is a **misleading-indicator bug, which is the exact failure mode the user warned against**.

---

### C3. Chat heuristic mis-attribution → user's main strategy is exactly Grigger Maxxing (uses Tin Hammer for cheap crafts)

The spec acknowledges this in §D: "The heuristic is wrong if the user manually selects a lower-tier hammer in the bench." But the spec then says "the best we can do." That's not quite true — there IS information available from `parseHammer()` (the `.crafting-module__hammer-row .crafting-module__hammer-slot` elements). The game UI shows which hammer is *currently selected* in the bench. A modest extension would detect the selected slot.

**What's available in the DOM:** `parseHammer()` walks `.crafting-module__hammer-slot`. The "currently selected" hammer in the bench is plausibly tagged with a CSS modifier (e.g. `--selected` or `--active`). It's worth one Chrome MCP DOM inspection to find out.

**If selection class doesn't exist** (or is unreliable): accept the heuristic, but **annotate the per-hammer tooltip with the heuristic note**: e.g. `Tin used (assumed)`. Then the user can read the tooltip, recognize "actually I used Bronze, not Tin", and right-click → Reset (or a future "manual hammer-set" control). Without this, the user has no way to know the indicator is approximate.

This is **critical because the user is described as cheese-rich and material-rich**. They actively swap hammers. The status-quo silent attribution will be wrong frequently.

---

## Significant issues

### S1. `dailyFreeSmashAvailable()` becomes a lying single-bit summary if not updated

The existing function (line 790–798) returns a global boolean. After v12.4.23, the panel render uses a per-hammer count, but `dailyFreeSmashAvailable()` is still defined and could be referenced elsewhere (search the file — currently only line 1546 uses it). Once the per-hammer strip lands, the function should either:
- Be **deleted** (clean break — no callers, gone), OR
- Be **rewritten** to take an optional `hammerKey` arg: `dailyFreeSmashAvailable(hammerKey)`. If `hammerKey` provided, return `!S.hammerSmashedSince[hammerKey] || S.hammerSmashedSince[hammerKey] < S.lastUbcAt`. If omitted, return ANY-hammer-free as a fallback for boot.

I'd recommend deletion + a new helper `freeSmashesByHammer()` returning `{hammer_t1: bool, hammer_t2: bool, ...}` — see suggested patch P5.

### S2. The chat handler doesn't filter "smash broadcasts that produce non-smash output"

`parseChatBroadcast()` (line 717) matches:
- `YOU ASSEMBLED A <out> FROM <ingredients>!` → `type:'assemble'`
- `AND SMASHED.+?INTO A <out>!` → `type:'smash'`

In `pollChat()` (line 771), **both** assemble and smash currently set `S.lastSmashAt = Date.now()`. **But assemble recipes don't use a hammer!** Junk Tesseract, Pollen, Reroll, Bridge crafts, Pollen → none of these use a hammer or affect break chance. The v12.4.22 behavior is already too aggressive here (Junk Cube craft marks "smash used") — the v12.4.23 per-hammer version inherits the bug and amplifies it.

**Fix:** in `pollChat()`, only set `S.hammerSmashedSince[S.currentHammer] = Date.now()` when `bc.type === 'smash'`. Leave `S.lastSmashAt` alone for backwards compat with v12.4.22 storage; just don't propagate `'assemble'` to the per-hammer table.

```js
// v12.4.23: only smash crafts consume the daily free smash
if (bc.type === 'smash' && S.currentHammer) {
  S.hammerSmashedSince = S.hammerSmashedSince || {};
  S.hammerSmashedSince[S.currentHammer] = Date.now();
}
// Keep S.lastSmashAt for either type (existing v12.4.22 behavior, not per-hammer)
if (bc.type === 'smash' || bc.type === 'assemble') S.lastSmashAt = Date.now();
```

### S3. MutationObserver + pollChat dedup race (spec C)

The spec says both share `_lastChatSig`. **The actual race:** MutationObserver fires when a new `<li>` is appended; pollChat runs each tick (every 10s). If MutationObserver fires between ticks and updates `_lastChatSig`, then pollChat runs and starts at `lines.length - 10`. The for-loop checks `if (sig === _lastChatSig) continue;` (line 764) which only skips lines whose sig EQUALS the last-seen. But: pollChat iterates the last 10 lines, while `_lastChatSig` only stores ONE sig. **If two broadcasts arrive between ticks, both processed by the observer**, pollChat's loop will see:
- Line N-2: not `_lastChatSig` (observer set it to line N-1) → process AGAIN → double count.
- Line N-1: equals `_lastChatSig` → skipped → OK.

**Fix:** dedup must track a SET of recent sigs (or, simpler, a single counter incremented on each processed line + a Map of "sigs seen this minute" with a 5-minute prune). Suggested:

```js
var _seenChatSigs = new Map(); // sig -> timestamp, pruned at 5min
function chatSigSeen(sig) {
  var now = Date.now();
  // prune old
  for (var [s, t] of _seenChatSigs) if (now - t > 300000) _seenChatSigs.delete(s);
  if (_seenChatSigs.has(sig)) return true;
  _seenChatSigs.set(sig, now);
  return false;
}
```

Then both pollChat and observer call `if (chatSigSeen(sig)) continue;` and the loop is idempotent.

### S4. The observer can fire while paused — confirm that's OK, then make sure the indicator updates

Spec §G says chat monitor runs while paused. Verified: line 1256–1261 — `pollChat()` is BEFORE the `if (S.paused)` check, so it runs even when paused. **Good.** But: when paused, `renderPanel()` is called from the pause check (line 1261). After the chat handler updates `S.hammerSmashedSince`, the panel re-renders correctly because `renderPanel()` reads from `S` each call. The path is clean. **No fix needed**, but verify in your manual test: while paused, manually smash with Tin Hammer → chat broadcast → indicator drops by one immediately, not after unpause.

### S5. The `ownedHammers` vs `discoveredHammers` choice (spec §E)

Spec §E asks: "should broken hammers count toward 5/5 free?" The answer is **no, but with a UI consideration**. `S.ownedHammers` (line 660-674) already excludes broken hammers. A broken hammer can't be smashed at all (it's empty in the slot). So:
- Use `S.ownedHammers` for the denominator (e.g. `4 / S.ownedHammers.length`).
- Use `S.ownedHammers` to iterate when computing the count of free smashes.

Edge case: user has 5 hammers, 1 is broken (Tin). v12.4.22 panel showed `Broken: Tin Hammer` separately (line 1549). v12.4.23 panel should show `⚡ 4/4 free smashes` (4 owned, 4 free) + `Broken: Tin Hammer`. The denominator change from 5 to 4 should match what the user sees in `Broken:`.

### S6. The free-smash badge color thresholds (spec §F)

Current badge colors (line 1498 CSS):
- `.bc8-free` (green `#22c55e`) = ⚡ FREE
- `.bc8-free-used` (gray `#94a3b8`) = used

For per-hammer, recommended thresholds:
- `count === ownedHammers.length` (all free) → green `#22c55e`, badge `⚡ N/N free smashes`
- `count > 0 && count < total` → yellow `#f59e0b`, badge `⚡ N/M free smashes`
- `count === 0` (all used) → gray `#94a3b8`, badge `smash: all used`

The yellow tier is the new state — it's the most common situation for a multi-hammer user mid-day. Without it, the binary green/gray loses the "you've used 1 of 5" signal.

### S7. Boot-state: `(!ubc && !smash) return true` is fragile after migration

`dailyFreeSmashAvailable()` returns `true` if both are zero — "boot state, no info" (line 796). After v12.4.23 migration, this branch shouldn't fire in practice (the migration writes either `hammerSmashedSince[H] = lastSmashAt` if smashed yesterday, or leaves `{}` if not). But: a fresh install with empty state still gets this branch. Recommend keeping the optimistic-default behavior for per-hammer too: if `hammerSmashedSince` is `{}` and `lastUbcAt === 0`, show all hammers as free. **Just don't add a "freeSmashUsed" log on first boot if there's no actual data** — that would spam the log with bogus state.

---

## Minor / polish

### M1. Comment on heuristic in `defaults()` is excellent — keep it. Line 476–483.

The comment block at line 476–483 already documents the Grigger Maxxing concern. Good. After implementing, **add a one-line UI hint in the tooltip** so end-user reads it: e.g. `(estimated — assumes you used your highest-tier non-broken hammer)`. The tooltip is the only place this caveat reaches the user in the field.

### M2. `S.craftCounters` is keyed by `bc.output` (normalized string). For per-hammer tracking, also stash `bc.hammerUsed: S.currentHammer` in a log line so debug trace is recoverable.

Not strictly necessary, but: when the user reports "the indicator was wrong", being able to grep the log for `Chat: smash → Pond Beetle (assumed hammer: hammer_t4)` makes debugging painless. Currently line 779 logs `Chat: smash → Pond Beetle` with no hammer attribution.

### M3. MutationObserver attachment timing — chat container may not exist at `document-start`

The script runs at `document-start` (line 10). The chat container `[class*="messages"]` won't exist until React mounts. Attaching the observer needs to retry until `findChatContainer()` returns non-null. Pattern:

```js
var _chatObserver = null;
function ensureChatObserver() {
  if (_chatObserver) return;
  var chat = findChatContainer();
  if (!chat) return; // try again next tick
  _chatObserver = new MutationObserver(function() {
    if (!S._chatObserverDisabled) pollChat();
  });
  _chatObserver.observe(chat, {childList: true, subtree: false});
  logEvent('Chat observer attached.');
}
```

Call `ensureChatObserver()` from `tick()` before `pollChat()`. If chat container detaches/remounts (rare but possible on cartridge change), the observer survives unless DOM ref is GC'd; re-detect each tick is cheap.

### M4. `parseTimers` change: store `_prevDailyCheese` BEFORE the new value is computed

If you implement the Ready→countdown detection inside `parseTimers`, the obvious pattern is:

```js
var prevDC = S.timers.dailyCheese;  // store before overwrite
// ... existing logic to compute new t.dailyCheese ...
S.timers = t;
// after assignment, detect transition
if (prevDC && /ready/i.test(prevDC) && t.dailyCheese && /\d+h\s*\d+m/i.test(t.dailyCheese)) {
  // (apply C2 guards before acting)
  handleManualUbcDetected();
}
```

### M5. Compact mode (spec §I)

Confirmed: status strip is always rendered (lines 1538–1554 are BEFORE the `if (!S.compact)` block at 1620). The free-smash indicator stays visible in compact mode. **Intended and correct** for spec §I.

### M6. Tooltip text — recommended format

The badge tooltip on the per-hammer count, line-by-line:

```
Daily 0%-break smashes remaining: N / M
─────────────────────────
Tin Hammer       ⚡ free
Bronze Hammer    ⚡ free
Mithril Hammer   used 14:32
Adamantine       ⚡ free
Diamond          ⚡ free
─────────────────────────
Indicator assumes smash chat broadcasts used your
highest-tier non-broken hammer. Wrong if you Grigger-Maxx.
Resets at next UBC daily cheese claim.
```

That's a `title=` attribute string in `\n`-separated form. HTML tooltips aren't supported in basic `title=`, but the user requested a status-strip tooltip and the readable plaintext multi-line is fine — Chrome renders `\n` in `title` as line breaks on hover. If you want rich HTML, you need a custom hover element (out of scope; status strip is dense).

---

## Suggested concrete patches

### P1. Migration helper after `parseHammer()` (addresses C1)

In `parseHammer()` at line 660, after the existing `S.currentHammerBreakChance = ...` line:

```js
// v12.4.23: one-shot migration of pre-v12.4.23 saved state. If the previous
// version recorded a lastSmashAt newer than lastUbcAt, we know the user smashed
// today but we don't know which hammer. Best heuristic: attribute to whatever
// is currentHammer NOW (their highest-tier non-broken). Wrong if they crafted
// a new tier of hammer between sessions or were Grigger-Maxxing yesterday,
// but better than showing 5/5 free when they actually used one.
if (!S._migratedHammerSmash && S.currentHammer && (S.lastSmashAt||0) > (S.lastUbcAt||0)) {
  S.hammerSmashedSince = S.hammerSmashedSince || {};
  // Only seed if not already set (defensive: if the field somehow has data from a v12.4.23
  // session that crashed before the migration flag was set, don't overwrite)
  if (!S.hammerSmashedSince[S.currentHammer]) {
    S.hammerSmashedSince[S.currentHammer] = S.lastSmashAt;
    logEvent('v12.4.23: migrated prior smash → ' + dn(S.currentHammer) + ' (heuristic)');
  }
}
S._migratedHammerSmash = true;
```

### P2. Chat handler — per-hammer attribution, smash-only (addresses S2, partial of #2)

In `pollChat()`, replace line 771:
```js
if (bc.type === 'smash' || bc.type === 'assemble') S.lastSmashAt = Date.now();
```

with:
```js
// v12.4.23: per-hammer attribution. Only smash recipes consume the daily
// 0%-break bonus (assemble recipes use no hammer). Attribute to currentHammer.
var now = Date.now();
if (bc.type === 'smash') {
  if (S.currentHammer) {
    S.hammerSmashedSince = S.hammerSmashedSince || {};
    S.hammerSmashedSince[S.currentHammer] = now;
  }
  S.lastSmashAt = now;  // keep updating for backwards compat
} else if (bc.type === 'assemble') {
  S.lastSmashAt = now;  // unchanged from v12.4.22; not per-hammer
}
```

Also augment the log line on line 779 to include hammer attribution on smash:
```js
var hint = (bc.type === 'smash' && S.currentHammer) ? ' (hammer: ' + dn(S.currentHammer) + ')' : '';
logEvent('Chat: ' + bc.type + ' → ' + dn(bc.output) + hint);
```

### P3. parseTimers — guarded Ready→countdown detection (addresses C2, #3)

In `parseTimers()` at line 658, just before `S.timers = t;`:

```js
// v12.4.23: detect manual UBC claim. The Ready→countdown transition on the
// daily-cheese timer means UBC just fired — either via clickCheeseButton (which
// already handles its own bookkeeping) OR via the user manually clicking through
// the cheese cartridge. We need the manual path; auto-claim already updates
// S.lastUbcAt directly so duplicate-detect is harmless (idempotent).
//
// GUARDS to suppress false positives from cold-boot render race:
//   1. Boot grace: ignore transitions within 60s of script boot. UBC doesn't
//      fire during boot — if Ready→countdown happens then, it's the React
//      mount populating after initially showing the cached/empty state.
//   2. Recent auto-claim: if clickCheeseButton fired within the last 30s,
//      the transition is the auto-claim we already booked — don't double-fire.
//   3. Cheese delta corroboration: UBC awards 200–500 cheese. Cross-check
//      against inventory delta when available.
var prevDC = (S.timers || {}).dailyCheese;
var newDC = t.dailyCheese;
if (prevDC && newDC
    && /ready/i.test(prevDC)
    && /\d+\s*[hm]/i.test(newDC)
    && Date.now() - _bootTime > 60000
    && Date.now() - (S.lastUbcAt || 0) > 30000) {
  // Probably a real UBC event from the user manually claiming.
  S.lastUbcAt = Date.now();
  S.hammerSmashedSince = {};
  logEvent('Daily cheese claimed (manual or external); free smashes reset.');
}
S.timers = t;
```

This still has one residual failure mode: if the user manually claims UBC, then the React UI updates `dailyCheese` from `Ready` to a countdown BEFORE BC reads it (e.g. they claim while panel is hidden, or while tab is backgrounded for >2 ticks). In that case the transition is observed-as `null → 23h 47m` (no `Ready` ever seen), and detection misses. **Mitigation:** as a secondary trigger, also check for `prevDC === null && newDC matches countdown && cheese delta > 150 in the same tick`. Out of scope for this iteration unless field testing shows false negatives — first ship with the Ready transition only, and add the delta-corroborated detector if user complains the indicator doesn't reset on manual claim.

### P4. MutationObserver setup with dedup (addresses #4, S3)

Add after the `pollChat()` function (line 789), as a new block:

```js
// v12.4.23: MutationObserver-driven chat parsing. Polling-only had up to 10s
// latency (TICK_MS); the observer gives instant updates so the free-smash
// indicator drops the moment a smash broadcast lands. Both observer and
// pollChat share _seenChatSigs to dedup.
var _seenChatSigs = new Map();  // sig -> timestamp
function _chatSigSeen(sig) {
  var now = Date.now();
  if (now - (_seenChatSigsLastPrune || 0) > 60000) {
    for (var entry of _seenChatSigs) {
      if (now - entry[1] > 300000) _seenChatSigs.delete(entry[0]);
    }
    _seenChatSigsLastPrune = now;
  }
  if (_seenChatSigs.has(sig)) return true;
  _seenChatSigs.set(sig, now);
  return false;
}
var _seenChatSigsLastPrune = 0;
var _chatObserver = null;
function ensureChatObserver() {
  if (_chatObserver) return;
  var chat = findChatContainer();
  if (!chat) return;
  _chatObserver = new MutationObserver(function() {
    try { pollChat(); } catch (e) {}
  });
  _chatObserver.observe(chat, {childList: true, subtree: false});
  logEvent('Chat observer attached (instant smash detection).');
}
```

Then in `pollChat()` at line 764, replace the `if (sig === _lastChatSig) continue;` line with:
```js
if (_chatSigSeen(sig)) continue;
```

Drop the `_lastChatSig` updating block at lines 782–786 (no longer needed; the Set replaces it). Then in `tick()` at line 1251 (after `parseTimers()` etc.), add `ensureChatObserver();` before `pollChat();`.

### P5. renderPanel per-hammer strip (addresses #5, S5, S6, M6)

In `renderPanel()`, replace lines 1545–1548 (the current free-smash block) with:

```js
// v12.4.23: per-hammer free-smash indicator with hover detail.
if (S.ownedHammers && S.ownedHammers.length) {
  var ubcTs = S.lastUbcAt || 0;
  var hsm = S.hammerSmashedSince || {};
  var freeList = [], usedList = [];
  S.ownedHammers.forEach(function(hk) {
    var smashAt = hsm[hk] || 0;
    if (smashAt > ubcTs) usedList.push({k:hk, at:smashAt}); else freeList.push({k:hk});
  });
  var free = freeList.length, total = S.ownedHammers.length;
  // Build tooltip — multiline plaintext (Chrome title= renders \n as breaks).
  var tipLines = ['Daily 0%-break smashes: ' + free + ' / ' + total];
  tipLines.push('────────────────────');
  freeList.forEach(function(e) { tipLines.push(dn(e.k) + '   ⚡ free'); });
  usedList.forEach(function(e) {
    var tm = new Date(e.at);
    var hh = String(tm.getHours()).padStart(2,'0'), mm = String(tm.getMinutes()).padStart(2,'0');
    tipLines.push(dn(e.k) + '   used at ' + hh + ':' + mm);
  });
  tipLines.push('────────────────────');
  tipLines.push('Smash broadcasts attributed to your highest-tier');
  tipLines.push('non-broken hammer. Wrong if you Grigger-Maxx.');
  tipLines.push('Resets at next UBC daily cheese claim.');
  var tip = tipLines.join('\n').replace(/"/g, '&quot;');
  // Color thresholds: green (all free), yellow (some used), gray (none free).
  var cls = free === total ? 'bc8-free' : (free > 0 ? 'bc8-free-partial' : 'bc8-free-used');
  var label = free === total
    ? '⚡ ' + free + '/' + total + ' free smashes'
    : (free > 0
        ? '⚡ ' + free + '/' + total + ' free'
        : 'smashes: ' + total + '/' + total + ' used');
  h += '<div class="bc8-strip-item" title="' + tip + '">'
     + '<span class="' + cls + '">' + label + '</span></div>';
}
```

And in the CSS string (line 1498), add a new class:
```
.bc8-free-partial{background:#f59e0b;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;letter-spacing:0.3px;}
```

### P6. Remove dead `dailyFreeSmashAvailable()` after P5 lands (addresses S1)

After P5, search the file for remaining `dailyFreeSmashAvailable` references — there should be none. Delete the function definition at lines 790–798 to prevent confusion.

---

## Edge cases I tested in my head

1. **First v12.4.23 boot, user smashed yesterday with Tin (their only hammer at the time), then crafted Bronze hammer last night.** Saved state has `currentHammer = 'hammer_t2'` (after parseHammer last session), `lastSmashAt = yesterday-evening`, `lastUbcAt = yesterday-morning`. Migration runs, sets `hammerSmashedSince['hammer_t2'] = lastSmashAt`. **Wrong attribution** — they smashed with Tin, not Bronze — but recoverable on next UBC. Acceptable.

2. **First v12.4.23 boot, completely fresh install (no saved state).** `load()` returns `defaults()`, `currentHammer = null`. Migration guard `S.currentHammer && ...` short-circuits. Flag set true. `hammerSmashedSince = {}`. Panel shows 0/0 since `ownedHammers` is empty. After first scan, hammers populate, the strip shows `N/N free smashes` (no smash recorded ever). **Correct.**

3. **User unpauses panel after a 4-hour pause; in those 4 hours, UBC fired (manual claim) and they did 3 smashes.** Chat observer sees broadcasts on attach (only new ones — observer can't replay history); pollChat reads the last 10 lines from chat. If chat has scrolled past the broadcasts (likely after 4 hours of activity), they're MISSED. `_seenChatSigs` is fresh (empty Set). The free-smash indicator would show all-free even though 3 hammers were used. **This is a known limitation of any chat-derived signal — no DB.** Acceptable; nothing to do.

4. **The /v/ thread says game broadcasts `YOUR HAMMER SHATTERED!` is appended on break.** Verify the regex at line 723 doesn't mis-parse a broadcast that includes the shatter suffix. Test text: `YOU SACRIFICED A NECTAR AND SMASHED A LADYBUG INTO A POND BEETLE! YOUR HAMMER SHATTERED!` — the lazy regex `.+?INTO\s+...A POND BEETLE!\s*$` ... actually the `\s*!` at the end of the regex matches the `!` after `BEETLE`, and the `YOUR HAMMER SHATTERED!` suffix is left unconsumed (text after the match). **OK — regex captures POND BEETLE correctly.** Per-hammer attribution proceeds with the smash; the shatter suffix is parsed independently if needed (currently it isn't, just rendered in the log line).

5. **Two smashes back to back (auto-replay or fast manual).** Each broadcast lands as a separate `<li>`. Observer fires twice. Both sigs distinct (the recipe inputs differ). Both processed. `hammerSmashedSince[currentHammer]` ends up at the later of the two timestamps. **Correct (it's the same hammer, used twice — second smash wasn't free).** The indicator goes from N→N-1 free smashes after the FIRST. If user crafted Bronze first and then Diamond (which would normally happen via Grigger Maxx pattern), attribution is wrong on the Diamond — but since `currentHammer` is by `ownedHammers[0]` (highest-tier), the Diamond use is attributed correctly. **The Bronze use is silently lost.** Acceptable for the heuristic.

6. **Tab backgrounded for an hour; UBC fired (auto-claim), user opened tab; observer attaches now.** clickCheeseButton already updated `S.lastUbcAt` and cleared `hammerSmashedSince` synchronously when the auto-claim fired. Page state is correct on tab-foreground; no chat replay needed. **Correct.**

7. **User manually clicks the cheese-claim button while the panel is hidden.** `clickCheeseButton` isn't called (that's BC's path), so `S.lastUbcAt` doesn't update via that path. **Falls to the Ready→countdown detection in P3.** Subject to the guards in P3. If guards reject (e.g. cold boot transition), the per-hammer indicator will be stale until the next UBC actually claims via auto-claim. **Limitation.** Document in the tooltip.

8. **User deletes site data / fresh Tampermonkey install with old `STORE_KEY` from v12.4.22.** Major-version check at load line 516 fires (`p.ver` major === VER major, both `12`, so the reset DOESN'T fire). State is preserved across v12.4.22 → v12.4.23, which is what we want.

9. **`parseHammer()` runs while user is on cheese cartridge (no `.crafting-module__hammer-row` in DOM).** `ownedHammers` would be empty on that pass. **Bug risk:** if migration fires during a cheese-cartridge tick, `S.currentHammer = null` (because `ownedHammers[0]` is undef), migration is skipped (guard), flag set true. Next tick on beetle cartridge, `ownedHammers` repopulates, but the migration flag is already true → **migration never runs**. **Fix:** the migration guard should be `if (!S._migratedHammerSmash && S.currentHammer && ...)` AND we should NOT set the flag to true if `S.currentHammer` is null. Refine P1 to:
```js
if (!S._migratedHammerSmash && S.currentHammer) {
  if ((S.lastSmashAt||0) > (S.lastUbcAt||0)) {
    S.hammerSmashedSince = S.hammerSmashedSince || {};
    if (!S.hammerSmashedSince[S.currentHammer]) {
      S.hammerSmashedSince[S.currentHammer] = S.lastSmashAt;
      logEvent('v12.4.23: migrated prior smash → ' + dn(S.currentHammer) + ' (heuristic)');
    }
  }
  S._migratedHammerSmash = true;  // set only when we actually had a hammer to migrate to
}
```
**This is a real bug** in P1 as I first drafted it — fixed above.

10. **`S.hammerSmashedSince` accumulates entries over many days that don't get cleared.** Auto-claim clears the whole object (line 1040, correct). But if a key is present for a hammer the user no longer owns (e.g. shattered and not yet recrafted), the indicator just ignores it because `S.ownedHammers` doesn't include it. **Self-cleaning. No leak.**

---

## Verdict

**Ship with fixes.** The spec's design is sound and the user need is real. But three categories of fixes are required before this can go to a user who's allergic to crafting mistakes:

1. **Migration (C1) MUST run after `parseHammer()` populates `S.currentHammer`** — set `_migratedHammerSmash = true` only when migration actually had data to act on. Without this, the indicator will lie about hammers being free on the first v12.4.23 boot for users with smashed-yesterday state.

2. **Manual UBC detection (C2) MUST have boot-grace + cheese-delta guards.** Otherwise the React mount race produces a false `lastUbcAt = Date.now(); hammerSmashedSince = {}` during boot, and the indicator will show all hammers as free when the user actually used some. **This is the precise failure mode the user warned about — a misleading green indicator causing a wasted Diamond Hammer smash.**

3. **Chat handler MUST only attribute to per-hammer table on `bc.type === 'smash'`** (S2). Assemble recipes (Junk Cube, Pollen, Reroll, etc.) don't use hammers and should never decrement the count.

The MutationObserver + dedup-by-Set design (S3, P4) is a real improvement over poll-only and is worth doing in the same release. The per-hammer renderPanel update with yellow-tier mid state and multi-line tooltip is the right UX (S6, M6, P5).

If the user wants to ship faster, **the absolute minimum is C1 + C2 + S2**. The MutationObserver and the rich tooltip can land in v12.4.24 if needed. But: shipping without C2 in particular is dangerous. Don't ship a "manual UBC" detector without the boot-grace guard.

**Post-ship verification (the user should do, not BC):**
- Manually click cheese-claim in the bench → confirm indicator resets all hammers to free.
- Smash with currentHammer → indicator drops by 1, tooltip shows that hammer as "used at HH:MM".
- Smash with a non-currentHammer (Grigger-Maxx test: switch to Tin in the bench, smash) → confirm tooltip shows the WRONG hammer as used (this is expected per the heuristic; just confirm the user understands it's an estimate).
- Reload page → state survives correctly; on first v12.4.23 boot, indicator shows pre-existing v12.4.22 lastSmashAt migrated to currentHammer.
- Pause script → smash via game UI → confirm chat observer still records the smash while paused.
