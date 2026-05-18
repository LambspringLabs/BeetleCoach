# BeetleCoach Operating Manual

_Last updated: 2026-05-18 (v12.4.23 — per-hammer free-smash tracking + manual UBC detection + MutationObserver chat monitor + Set-based dedup)._

Practical reference for a human running the coach day-to-day, and for any future AI session that needs to understand "how the thing actually behaves at runtime" without having to re-derive it from the source.

For game-mechanics ground truth, see [`WIKI_AUDIT.md`](./WIKI_AUDIT.md).
For architectural / data-model handoff, see [`HANDOFF_v12.md`](./HANDOFF_v12.md).

---

## TL;DR — manual-crafting workflow

You want to craft for 5 minutes without the coach yanking you back to the catch view or away from your current cartridge.

1. Click **⏸ Pause** at the top of the panel.
2. Do whatever you want — craft, browse marketplace, switch cartridges, read the panel for ingredient hints.
3. Click **▶ Resume** when done.

While paused: **no automation fires.** No claim, no hunt, no cheese, no nav, no scan, no cartridge-eject recovery. The panel keeps refreshing so you can still read recommendations and timers.

---

## How the tick loop works

The script runs one function (`tick()`) on a 10-second `setInterval`. Every tick, in order:

1. **`parseTimers()`** — reads Beetle Catch / Daily Cheese / Hunt cooldown text from the game's nav bar. Updates `S.timers`.
2. **`refreshTimerDisplay()`** — updates the timer badges in the panel strip.
3. **If `S.paused` is true → `renderPanel()` and return.** Everything below stops here.
4. **Dispatch on `S.machineState`** (see state machine below).

So Pause works by short-circuiting tick at step 3. Nothing past that runs. Timers keep updating (steps 1–2), the panel keeps re-rendering (in step 3), but the state machine is frozen.

### State machine

`S.machineState` is persisted to `GM_setValue` storage and survives page reloads. Possible states:

| State | When | What its handler does |
|---|---|---|
| `BOOTING` | Script just loaded, looking for the game | Wait for `.beetle-game-nav .info` to appear; transition to IDLE. Force-refresh after 30 s if app never loads. |
| `LOGGED_OUT` | Auth lost (`oidc-spa` errors / "SIGN IN or register" body text) | Try `tryAutoLogin()`. If autofill is unavailable, watch for user gesture (mousedown / keydown / touch) and retry. |
| `LOGGING_IN` | Autologin in flight, watching for next page | Timeout 30 s back to BOOTING. |
| `IDLE` | Normal — everything's ready | Priority: stuck-detect → cartridge-eject recovery → passive scan → claim → hunt → daily cheese → full scan. See "Idle priorities" below. |
| `CLAIMING`, `HUNTING`, `CLAIMING_CHEESE` | Action in flight | Wait for completion. Auto-IDLE after `ACTION_TIMEOUT` (30 s) or when the action's button shows it's done. |
| `SCANNING` | Full inventory scan running (paginating MORE buttons) | Wait. Timeout 60 s back to IDLE. |
| `STUCK` | Game buttons stuck on "PROCESSING" for 20+ s | Wait 15 s; if still stuck, reload page (max 3 times then 5 min pause). |

99% of the time you'll see **IDLE**. Anything else is transient.

### IDLE priorities (`handleIdle`)

In IDLE, the script considers actions in this order. Each cycle does **at most one** action — the game can only handle one at a time, so firing claim + hunt simultaneously drops one silently.

1. **Cartridge ejected?** If the `.toggle-bar` on the catch module has class `ejected`, pull the LOAD lever (clicks the React `onClick` prop directly because hit-testing through the overlay fails).
2. **Stuck on PROCESSING?** Transition to STUCK if catch/hunt buttons have been stuck for 20+ s and we're > 30 s past boot.
3. **Passive scan** — only if visible, on beetle cartridge, and last passive > 30 s ago. Cheap (no pagination).
4. **Claim** — only if `S.autoClaim`, claim timer says "ready". Requires beetle cartridge + catch sub-view.
5. **Hunt** — only if `S.autoHunt`, cheese ≥ 20 (HUNT_COST), cheese after hunt ≥ 100 (MIN_CHEESE), no cooldown. Requires beetle cartridge + catch sub-view.
6. **Daily cheese** — navigates to cheese cartridge, clicks `.claim-button`, then navigates back.
7. **Full scan** — only if visible, on beetle cartridge, last full scan > 120 s (STALE_MS) ago.
8. **Drift correction** — if we're NOT on the beetle cartridge AND daily cheese isn't ready, navigate back to beetle.

**Step 8 is what "ticks you back to the beetle cartridge."** Pausing freezes the entire dispatch (step 3 in the tick), so step 8 never runs.

---

## What Pause actually halts

The `S.paused` check is the very first thing the dispatch does. When paused, **nothing in the IDLE priorities runs** — none of items 1–8 above.

What's still alive while paused:

- The 10-second `setInterval` itself (so timers update, panel re-renders).
- `parseTimers` reads (so the timer badges in the strip stay current).
- `renderPanel` (so you keep seeing recommendations).
- Every **manual button** in the panel: Full Scan, Claim ON/OFF, Hunt ON/OFF, strategy toggle, Reset Session, Reset.
- In-game interactions (the script does nothing to block you).

What goes stale while paused:

- **Hammer state** (`parseHammer`) — only runs in `handleIdle` and inside `fullScan`. If you craft a hammer while paused, the strip's hammer badge won't update until you unpause OR click Full Scan.
- **Craft mode** (Smash / Assemble) — same deal.
- **Level** — same deal (matters only if you're about to level up).

Workaround: click **Full Scan** manually while paused. The button handler doesn't check `S.paused`, so a forced scan works and rebuilds everything.

### Edge cases worth knowing

- **Pause for 2+ hours:** you'll miss a Beetle Catch ready window. The 2 h cycle continues, so worst case you're 1–2 h late. Same for daily cheese (24 h cycle) — if you pause past the daily reset, the script catches up on resume.
- **Cartridge ejects while paused:** recovery doesn't run. Either unpause briefly (within ~10 s the lever click fires) or pull it manually.
- **Mid-action pause:** if you pause during `HUNTING` or `CLAIMING`, the in-flight action completes (the game finishes the click), but follow-up retries don't fire. The state will sit in HUNTING until you unpause; on resume, the state-age timeout kicks it back to IDLE. There is one minor wart: the `scheduleHuntRetry` `setTimeout` fires `handleHunting` directly (bypassing the tick), so a single retry can still fire ~3.5 s after pausing. After that retry the state transitions away and no more attempts happen.

---

## The two toggles that aren't Pause

If you don't want a full pause but want to disable parts of automation:

| Button | Effect |
|---|---|
| **Claim ON / OFF** | Toggles `S.autoClaim`. When OFF, the script skips claim in IDLE priorities. Everything else still runs (hunt, cheese, scan, nav). |
| **Hunt ON / OFF** | Toggles `S.autoHunt`. When OFF, the script skips hunt. |

There's no toggle for "don't navigate me back to beetle cartridge while leaving auto-claim/hunt on." That's by design — claim and hunt require the beetle cartridge + catch sub-view, so the script has to navigate to do its job. If you want to be elsewhere, that's what Pause is for.

---

## Scans — passive vs full

- **Passive scan** (`passiveScan`, every 30 s): inspects visible inventory only, no pagination. Adds new items if they appear twice (anti-flicker rule). Cheap — no UI disruption.
- **Full scan** (`fullScan`, every 120 s and on-demand): clicks the MORE pagination button up to 20 times, scans each page, fingerprints to stop when content repeats. Wholesale-replaces `S.mergedInventory` with what it sees. **Authoritative — anything not currently in your inventory falls out.**
- **Manual scan** (Full Scan button): runs `fullScan` immediately, regardless of pause.

If a number in the inventory section looks wrong, click Full Scan and check the Log. Stale entries (from items you've consumed in-game) drop out on the next full scan.

The inter-page pagination delay was bumped from 200 ms → 600 ms in v12.4.18 because slow React commits were causing the fingerprint loop-detection to break out early, missing pages. If you're seeing items not showing up that you clearly own, watch the Log for "no items found" or stalled scan messages.

---

## Strategy (Endgame / Broad / Flowers)

Cycle the strategy button to change what the coach prioritizes:

- **Endgame** (default): drives toward Mars Rhino via `ENDGAME_CHAIN` (Goliath → Sunset Moth → Black Lotus → Mars Rhino → Hercules). Other beetles are filler.
- **Broad**: more goals across the collection (Pollen → all 3 Adamantine beetles → flowers → Sabertooth → Sunset Moth → Mars Rhino).
- **Flowers**: prioritize flower/pollen production. Useful for stocking up.

The strategy affects:
- "Next moves" GOAL/Step block
- `wouldConsumeLastCollectible` (the flowers-strategy is more permissive about consuming the last copy of a flower).

---

## Reset buttons

- **Reset Session** — clears the session counters (claims, hunts, cheese gained, XP, gain log, start time). Leaves inventory and settings alone. Use this when you want to track a specific session.
- **Reset** (red) — wipes everything: inventory, log, settings, session. Confirms first. Use only when something is deeply broken.

---

## Panel anatomy

```
┌─ Header ────────────────────────────────────┐
│ 🪲 Beetle Coach v12.4.20  Lv.X · NNNN 🧀 · OK · IDLE
├─ Buttons ──────────────────────────────────┤
│ [⏸ Pause] [Full Scan] [Claim ON] [Hunt ON]
│ [Endgame] [Reset Session] [Reset]
├─ Status strip ─────────────────────────────┤
│ Hammer: X · +N% / N% break · Broken: ...
│ Claim: <time>  Hunt: <time>  Cheese: <time>
│ Mode: Smash / Assemble
├─ Next moves [STRATEGY] ────────────────────┤
│ <Goal> GOAL
│ 🎯 <goal recipe>:  <ingredients>
│ 🔧 Step now: <step recipe> — <ingredients>
│  (3 alternates below)
├─ Progression ──────────────────────────────┤
│ Stage 6/7   Beetles N/M · Flowers N/M
│ Missing: <list>
├─ You can make (N) ─────────────────────────┤
│ <Recipe> [SAFE | RNG]
│ <ingredients>
│   ... (scrollable)
├─ Inventory ────────────────────────────────┤
│ <item> [tier]              <count>
│   ... (scrollable)
├─ Session ──────────────────────────────────┤
│ <duration> · Nc/Nh · N XP
│ Gained: <list>
├─ Log ──────────────────────────────────────┤
│ <recent event lines>
└────────────────────────────────────────────┘
```

The minimize button is the 🪲 emoji on the left of the header. Click it to collapse the panel; click the bottom-left **🪲 Beetle Coach** button to reopen.

The panel is draggable (header) and resizable (corner).

---

## Common scenarios

### "I want to manually craft Black Lotus right now"
1. Click ⏸ Pause.
2. Open the crafting bench in-game, drop in Gunpowder + Moss + Pinecone, smash.
3. Click ▶ Resume.

### "I want to browse the marketplace cartridge for a few minutes"
Same: Pause → browse → Resume. Without Pause, the script will navigate you back within 10 s (handleIdle step 8).

### "The Mode strip says Smash but I'm in Assemble"
Click Full Scan once. parseCraftMode runs at the end of fullScan and updates the strip.

### "The recipe in the Next moves block looks wrong"
This shouldn't happen post-v12.4.20 (the goal and step recipes are now on separately-labeled lines), but if it does:
1. Check the goal name in the header — that's the eventual target.
2. The `🎯 <goal> recipe:` line is the GOAL's ingredients.
3. The `🔧 Step now:` line is the immediate action's ingredients.
4. If a recipe shows `(random sibling)`, the output isn't guaranteed — you'll get one of multiple siblings (Adamantine Flower Transmute yields a random Adamantine flower, for example).

### "I want to never auto-hunt but always auto-claim"
Click Hunt ON → it becomes Hunt OFF. Leave Claim ON. Auto-claim runs every 2 h; auto-hunt is disabled.

### "Script is doing something weird"
1. Read the Log section in the panel (newest entries at top, 30-line cap).
2. Check the state badge near the top right of the header (BOOTING / IDLE / STUCK / etc).
3. If STUCK: it'll auto-recover within 15 s, up to 3 reloads, then pause 5 min.
4. If pause-and-resume doesn't help, click Reset Session (preserves inventory + settings) and reload the tab.
5. If THAT doesn't help, click Reset (red) — wipes everything — and reload. Last resort.

### "I want to look at the Hercules recipe even though it's not verified"
The recipe is still in `RECIPES` and the Endgame chain. Coach will direct you toward `golden_scarab + adamantine_pollen + purple` if you select Endgame strategy and have the inputs. Wiki has no entry for Hercules — proceed at your own risk until verified.

---

## What the badges mean

| Badge | Meaning |
|---|---|
| **SAFE** | Assemble recipe. 100% success, no hammer break, no RNG. Things like pollens, hammers, junk cubes, the BeetleBoy Key. |
| **RNG** | Smash recipe. Probabilistic — modified by hammer Crafting Bonus and optionally a sacrifice. Failures return ingredients (recipe valid but RNG missed) OR trigger "Nothing happened" (recipe invalid, also returns ingredients). |
| **GOAL** | The eventual chain target you're working toward. |
| **(random sibling)** | The recipe yields ONE OF multiple possible outputs. Adamantine Flower Transmute yields a random Adamantine flower; Pinecone/Moss/Gunpowder Bridge yields one of those three artifacts. Don't expect a specific output. |

## UX features (v12.4.22)

### Compact mode

New button next to the strategy toggle: **`□ Compact`** / **`□ Full`**. Click to collapse the panel to just header + button row + status strip + Next moves + (Specimen Pin badge if any) + (Junk Compress card if junk is plentiful). Hides Progression / You-can-make-overflow / Inventory / Session / Log. Useful while actively crafting and you just want the next-action info visible.

State is persisted (`S.compact`) — survives page reloads.

### Free smash indicator (v12.4.23 — per-hammer)

Status strip shows `⚡ N/M free` with per-hammer letter abbreviations (T B M A D for Tin/Bronze/Mithril/Adamantine/Diamond, with ⚡ for fresh and · for used). Three-tier badge color:

- **Green `⚡ N/N free`** — all owned hammers have their daily 0%-break smash available
- **Yellow `⚡ N/M free`** — some used, some fresh
- **Gray `all used`** — no free smashes left today

Hover the badge for a per-hammer breakdown tooltip:

```
Tin: ⚡ free
Bronze: used
Mithril: ⚡ free
Adamantine: ⚡ free
Diamond: ⚡ free

Free smashes reset at the next UBC daily cheese claim.
Note: each detected smash is attributed to your highest-tier non-broken hammer.
If you manually select a lower hammer in the bench, the indicator may be wrong.
```

Detection:
- **`S.lastUbcAt`** — set by `clickCheeseButton` (BC auto-claim) AND by `parseTimers` when it detects a manual UBC claim (the cheese-claim timer transitioning from `Ready` to a countdown like `23h 59m`). Manual UBC detection has a 60s boot-grace and 30s auto-claim cooldown to avoid React-mount false positives.
- **`S.hammerSmashedSince[hammer_key]`** — set when the chat monitor sees your own `YOU SACRIFICED ... AND SMASHED ... INTO ...` broadcast. Only fires on `type === 'smash'` broadcasts (Assemble crafts like pollens, Junk Cubes, Flower Rerolls, Tesseract Gamble don't burn the daily 0%-break bonus). Heuristic: attributes the smash to `S.currentHammer` (the highest-tier non-broken hammer). Wrong if you manually selected a different hammer in the bench (Grigger Maxxing) — the chat broadcast doesn't say which hammer was used.

Both paths reset `S.hammerSmashedSince = {}` when the UBC event fires, so all hammers go back to "fresh."

Limitations and mitigations:
- **Per-hammer attribution is heuristic** — based on `S.currentHammer` at the moment of smash. The tooltip notes this. If you regularly Grigger Maxx with Tin while owning Adamantine, the indicator will show "Adamantine used" when you actually used Tin.
- **Manual UBC detection isn't bulletproof** — the boot-grace + auto-claim guards catch the most common false positives. If the indicator misbehaves, hit "Full Scan" or wait for the next BC auto-claim.

### Junk Compression card

Appears when raw junk ≥ 30 OR current Junk Cube count is low (<5). Shows:

```
🗜 Junk Compression
Raw junk: 412 → 206 Cubes possible (have 151)
Cubes available: 357 → 119 Tesseracts possible (have 21)
Session: 18 cubes · 6 tesseracts crafted
```

Live session counters increment when the chat monitor sees `YOU ASSEMBLED A Junk Cube...` / `YOU ASSEMBLED A Junk Tesseract...` from your own broadcasts. So as you grind compression, the counter updates in real time without scrolling chat.

### Specimen Pin badge

When `inv.specimen_pin >= 1`, a pink badge appears above the recipe list:

```
💎 1 Specimen Pin · save for highest-tier Beetle Trophy (Pin + Beetle + Green sac)
```

Reminder that this is a rare jackpot from the JT × 2 gamble and shouldn't be wasted on a low-tier beetle. The Beetle Trophy mechanic (`Specimen Pin + Beetle + Green sacrifice → that Beetle's Trophy`) is documented in V_THREAD_FINDINGS.md.

### Chat broadcast monitor

Each tick (10s), BC reads your Global Chat element looking for your own craft broadcasts. Three patterns matched:

1. Long-form Assemble: `YOU ASSEMBLED A <output> FROM <ingredients>!`
2. Long-form Smash: `YOU SACRIFICED A <sacrifice> AND SMASHED <ingredients> INTO A <output>!`
3. Trophy short-form: `🏆 Crafted [[<item_key>]]!`

When a match is detected from username `sails` (configurable via `S.myUsername`):
- `S.lastSmashAt = Date.now()` (powers free-smash indicator)
- `S.craftCounters[output] += 1` (powers junk-compress session counter)
- If output is a collectible beetle: `S.session.gains.push(displayName)` (so the session card updates without waiting for full scan)
- A `Chat: <type> → <output>` line is added to the Log section

Observation-only — runs whether paused or not.

### Pause hardening

Fixed a small wart documented in LESSONS_LEARNED.md §8: `scheduleHuntRetry`'s setTimeout could fire ~3.5s after the user clicked Pause if scheduled mid-`HUNTING` state. Now respects `S.paused` and bails the retry. Pause is now truly complete — no automation fires after the click.

### Visual polish

- **Tier badges** font-size 8px → 10px, padding 1×4 → 2×6px. More legible at panel zoom.
- **Cursor: grab** on the panel header (was `cursor: move`) with `cursor: grabbing` on active drag. Clearer affordance.

---

## New recipes (v12.4.21)

Per the /v/324142 thread mining (see `V_THREAD_FINDINGS.md`):

### Flower Reroll (4 tier-specific recipes — Assemble)
- `Junk Tesseract + Tin Flower → random Tin flower`
- `Junk Tesseract + Bronze Flower → random Bronze flower`
- `Junk Tesseract + Mithril Flower → random Mithril flower` (path to Fringed Iris / Larkspur for the new Mithril beetles)
- `Junk Tesseract + Adamantine Flower → random Adamantine flower` (path to Purple Passionflower for Blue Death Feigning)

These are RNG-output Assembles. The reroll **can return the same flower** as input (confirmed by game broadcast: `"YOU ASSEMBLED A Gazania FROM A Gazania AND A Junk Tesseract!"`), so mean ~3 attempts to hit a specific 1-of-3 target. Cheaper than transmutation for users with plenty of Junk Tesseracts.

### Junk Tesseract Gamble (Assemble)
- `2× Junk Tesseract` alone → lottery output

Observed outputs from /v/ thread broadcasts + user testing:
- **Bumblebee** (the only known path to this beetle — wiki said `???`)
- Random Mithril flower
- Specimen Pin (~1.3% rare jackpot per "150 tesseracts for a pin" anecdote)
- Random beetle / random flower / partial 1× JT refund

**When to use this:** if you have excess Junk Tesseracts and no purposeful crafts available. Specifically valuable if you're hunting Bumblebee (no other path) or grinding for Specimen Pins (the artifact that turns any owned beetle into its Trophy variant via `Specimen Pin + Beetle + Green sacrifice → Beetle Trophy`).

**Coach behavior**: the Gamble has a moderate `RECIPE_VALUE` (30) — it surfaces in "You can make" but doesn't dominate progression-driving crafts. If you're stuck on a goal (e.g., need Pinecone but have no Mithril Pollen), gambling shows up as a backup option.

---

## Hammer break — what's NOT in the UI

The hammer strip shows "+X% / N% break" using the wiki's **base** break chance. The wiki actually documents a post-first-use bump for the top two tiers:

| Hammer | Bonus | Base break | After first use |
|---|---|---|---|
| Tin | +0% | 10% | — |
| Bronze | +5% | 5% | — |
| Mithril | +20% | 10% | — |
| Adamantine | +35% | 2% | **5%** |
| Diamond | +90% | 1% | **9%** |

There's also a **daily reset**: every hammer gets exactly one 0%-break smash per day after the Universal Basic Cheese daily reset. Strategy implication — save the day's first high-tier smash for your most valuable RNG craft.

The `postFirstBreak` field is in `HAMMER_STATS` as of v12.4.18 but not yet surfaced in the UI. Future enhancement.

---

## File index for future travelers

| File | What it is |
|---|---|
| `beetle_coach.user.js` | The userscript itself. Tampermonkey loads this from `LambspringLabs/BeetleCoach/master`. |
| **`START_HERE.md`** | **Top-level entry point. Read first if you're a future AI session arriving cold.** Current state, doc map, project summary. |
| **`LESSONS_LEARNED.md`** | **Read second.** Non-obvious gotchas: drag-drop unautomatable, prompt-injection patterns observed, /v/ thread is gold source, recipe-value tuning principles. |
| `HANDOFF_v12.md` | Architectural handoff (v12 refactor) + v12.4.x epilogues. Architecture + data model + what NOT to automate. |
| `OPERATING_MANUAL.md` | This file. Runtime behavior + user workflows + panel layout + FAQ. |
| `WIKI_AUDIT.md` | Full structured scrape of beetle.wiki as of 2026-05-17. Game-mechanics ground truth from the wiki perspective. |
| `V_THREAD_FINDINGS.md` | /v/324142 thread mining (2026-05-18). Empirical recipe verification from game broadcasts. **More authoritative than the wiki for new recipes.** |
| `REVIEW_FINDINGS.md` | Consolidated 2026-05-17 audit + fix plan. Historical context for v12.4.18 → v12.4.20. |
| `RECIPE_AUDIT.md` | Independent verifier pass over `RECIPES[]` entries against the wiki. |
| `DOUBLE_TESSERACT_HUNT.md` | Historical multi-agent hunt log. Some agent-sourced claims unverified — treat with caution per LESSONS_LEARNED.md §4. |
| `beetleboy_knowledge_base.md` | Older game knowledge base (April 2026 baseline). Has v12.4.18 delta block at top. Cross-check facts against `WIKI_AUDIT.md` + `V_THREAD_FINDINGS.md`. |
| `beetle_known_recipes_human_readable.md` | Older recipe reference. Same status as above. |
| `beetleboy_value_model.md` | Strategic value math, EV reasoning, lanes, optimal craft order. Rewritten for v12.4.20 endgame state. |
| `inventory_snapshots/` | Empty folder; reserved for a future inventory export feature. |

---

## Open questions / known gaps (2026-05-18)

- **Hercules recipe** is in the script's RECIPES but has no wiki page or /v/ broadcast. Likely chat folklore. User says "ill investigate." Don't recommend until confirmed.
- **Trinkets + Trophies** are still unmodeled in `RECIPES[]` for auto-recommendation, but the wiki documents 9 trinkets + 15 trophies with full recipes (see `WIKI_AUDIT.md` F.4–F.5). Adding them to the script is a bigger ask — design-pending.
- **Specimen Pin → Beetle Trophy recipe** (`Specimen Pin + Beetle + Green sac → that Beetle's Trophy`) confirmed via /v/ broadcast 2026-05-18, but not yet in `RECIPES[]` because it needs a new `any_collected_beetle` token group that doesn't fit cleanly into `TOKEN_GROUPS`.
- **`junk_sphere`** item exists (sneed broadcasts `🏆 Crafted [[junk_sphere]]!` in chat 2026-05-17), but the recipe is not in any data file we've found. Likely a very new addition c.sneed deployed.
- **Bumblebee recipe** is now KNOWN: it's one of the outputs of `Junk Tesseract Gamble` (2× JT). No targeted craft path. Documented in v12.4.21.
- **Holiday beetles** (Black Widow Halloween, Candycane Tiger Moth Christmas) — wiki pages empty. Not in `ALL_BEETLES` until confirmed.
- **Hammer post-first-use break** in `HAMMER_STATS` (data field `postFirstBreak`) but not yet surfaced in the strip display. The daily 0%-break reset isn't surfaced either.
- **Daily-reset detection** — script doesn't know when Universal Basic Cheese resets fire. Can't surface "use your premium hammer NOW for a free smash" callout.
- **The 5 unknown Trophies** (Milady Fumoku, Reminet ID, Deck of Cards, D20, Engraved Lighter) — c.sneed's data file has `trophy_milady_fumoku` and `trophy_remilianet_id` as known outputs; inputs not yet documented anywhere.
