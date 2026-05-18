# BeetleCoach v12 Refactor Handoff

_Originally written 2026-04-12 for the v11 → v12 refactor. Epilogues added 2026-05-17 (v12.4.20) and 2026-05-18 (v12.4.21)._

> **⚡ 2026-05-18 (v12.4.21) update — added 5 recipes per /v/324142 mining.**
>
> The miladychan `/v/324142` thread ("BeetleBoy crafting recipes and tips!", 416 posts) is the public mirror of every player's auto-broadcast `YOU ASSEMBLED ... FROM ...` / `YOU SACRIFICED ... AND SMASHED ... INTO ...` game messages. Mining it on 2026-05-18 surfaced confirmed recipes the wiki doesn't document. v12.4.21 adds 5 to `RECIPES[]`:
>
> - `Tin / Bronze / Mithril / Adamantine Flower Reroll` — `junk_cube_t2 + any_<tier>_flower` (Assemble, RNG output, can return same flower as input)
> - `Junk Tesseract Gamble` — `2x junk_cube_t2` (Assemble lottery; outputs include Bumblebee, random Mithril flower, Specimen Pin (~1.3% rare jackpot), random beetle/flower, partial refund)
>
> All 5 are in `MULTI_OUTPUT_RECIPES` so the panel annotates them `(random sibling)`. `PREREQ_RECIPES` now lists `Adamantine Flower Reroll` as the preferred path to `passionflower` / `gazania` / `pincushion`, and `Mithril Flower Reroll` as the path to `fringed_iris` / `larkspur`. `RECIPE_VALUE` tuned so reroll surfaces above transmute when both available; Gamble (30) surfaces as backup when progression is blocked.
>
> **New companion docs (2026-05-18):**
>
> - [`START_HERE.md`](./START_HERE.md) — top-level entry point for future AI sessions. Read this first.
> - [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md) — non-obvious gotchas: drag-drop unautomatable, prompt-injection patterns observed, /v/ thread is gold source, bench mode auto-resolves, recipe-value tuning principles.
> - [`V_THREAD_FINDINGS.md`](./V_THREAD_FINDINGS.md) — full /v/324142 mining report with verbatim broadcast quotes. Source for v12.4.21's new recipes.
>
> **What didn't land in v12.4.21 (open work):**
>
> - **Specimen Pin Beetle Trophy recipe** (`Specimen Pin + Beetle + Green sac → that Beetle's Trophy`). Confirmed via /v/ broadcast but needs a new `any_collected_beetle` TOKEN_GROUP. Punted.
> - **`junk_sphere`** item — sneed crafted one in chat 2026-05-17, but no recipe documented anywhere. Likely a newer recipe c.sneed deployed.
> - **Hercules recipe** verification — still unverified. User investigating.

---

> **⚡ 2026-05-17 (v12.4.20) update.**
>
> The architecture below is still accurate. The state machine, scan loop, login flow, eject recovery, and tick cadence (10 s) are unchanged. **However**, the data tables (`LABELS`, `ALL_BEETLES`, `ALL_FLOWERS`, `ITEM_ALIASES`, `ANY_JUNK`, `RECIPES`, `HAMMER_STATS`) were fully resynced with `beetle.wiki` because the game shipped a Christmas Crafting Update we missed. Several recipe rows are also gone (`Monarch (alt)`, `Goliath Beetle (alt)`, `Bombardier Beetle (alt)` — wiki-unverified substitutions). `MULTI_OUTPUT_RECIPES` was added so the panel can annotate RNG-output recipes with `(random sibling)`. `isProtected()` was extended to cover `fringed_iris`, `larkspur`, and `passionflower`.
>
> **Doc index for new contributors / future AI sessions** (read in this order if you're cold):
>
> | File | Read for |
> |---|---|
> | [`START_HERE.md`](./START_HERE.md) | **Read this first.** Top-level entry point — current state, doc map, project summary, what to know. |
> | [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md) | **Read this second.** Non-obvious gotchas: drag-drop unautomatable, prompt-injection patterns, recipe-value tuning, etc. |
> | [`OPERATING_MANUAL.md`](./OPERATING_MANUAL.md) | How the script behaves at runtime; user-facing panel + pause workflow + troubleshooting |
> | This file (`HANDOFF_v12.md`) | Architecture, data model, design decisions, what NOT to automate |
> | [`WIKI_AUDIT.md`](./WIKI_AUDIT.md) | Game-mechanics ground truth (recipes, anti-recipes, hammers, trinkets, trophies) as of 2026-05-17 |
> | [`V_THREAD_FINDINGS.md`](./V_THREAD_FINDINGS.md) | Empirical recipe verification from /v/324142 game broadcasts (2026-05-18). **More authoritative than the wiki for new recipes.** |
> | [`RECIPE_AUDIT.md`](./RECIPE_AUDIT.md) | Independent verification pass over the recipes in `RECIPES[]` against the wiki |
> | [`REVIEW_FINDINGS.md`](./REVIEW_FINDINGS.md) | The 2026-05-17 audit + fix plan that drove v12.4.18–v12.4.20 |
> | [`DOUBLE_TESSERACT_HUNT.md`](./DOUBLE_TESSERACT_HUNT.md) | Historical multi-agent hunt log. Some agent-sourced claims (Twitter handles, GitHub repos) unverified — treat with caution. |
> | [`beetle_known_recipes_human_readable.md`](./beetle_known_recipes_human_readable.md) | Older recipe reference; first ~80 lines are the v12.4.18 delta block, rest is historical 2026-04-07 baseline |
> | [`beetleboy_knowledge_base.md`](./beetleboy_knowledge_base.md) | Older game knowledge base; cross-check against `WIKI_AUDIT.md` for current facts |
> | [`beetleboy_value_model.md`](./beetleboy_value_model.md) | Item-value math, EV reasoning for hammer choice, lanes, strategic state |
>
> **What's in the script post-v12.4.20 that this doc doesn't yet describe:**
>
> - `MULTI_OUTPUT_RECIPES` set (next to `FLOWER_CONSUMING`) — recipes that yield ONE OF several siblings. The renderPanel goal-block uses this to annotate `(random sibling)` so the user doesn't read a transmute or bridge as deterministic.
> - `HAMMER_STATS[k].postFirstBreak` — Adamantine 5%, Diamond 9% (wiki documents these post-first-use bumps). Not yet surfaced in the strip display.
> - `S._lastUnresolved` — used by `fullScan` to gate the "X unresolved" log line so it fires only when the count changes (suppresses spam).
> - `isProtected()` now covers `fringed_iris`, `larkspur`, `passionflower` (closes gap where Mithril Pollen / Adamantine Pollen crafts could consume the last copy of an input needed for the new special-beetle smashes).
> - `RECIPES[]` rows REMOVED in v12.4.20: `Monarch (alt)`, `Goliath Beetle (alt)`, `Bombardier Beetle (alt)`. Wiki shows only "+ Ladybug" / "+ Pond" canonically. Stag had no alt, so this also restored internal consistency.
> - `RECIPES[]` rows ADDED in v12.4.18: `Black-Spotted Blue Longicorn`, `Golden-Spotted Tiger Beetle`, `Blue Death Feigning Beetle`, `Tin Flower Transmute`. Transmutes rewritten to wiki-canonical 2-input form (single beetle + Junk Cube, no "green +" prefix).
> - `ITEM_ALIASES`: `golden → golden_scarab` (the game files Golden Scarab as `golden.png`; without this alias, the script reported the user's Golden Scarab as Missing).
> - `ANY_JUNK` grew 27 → 45 items per the wiki itemtag_docs.
> - Pagination delay in `fullScan` bumped 200 ms → 600 ms (was missing pages on slow React commits, causing stale `stag` entries to linger in `S.mergedInventory`).
> - `fullScan` log line gated on `(changes.length || totalUnresolved !== S._lastUnresolved)` — no more "Scan: no changes" spam.
>
> **Open questions still on the board after v12.4.20:** Hercules Beetle recipe (off-wiki, retained pending user investigation), Trinkets + Trophies entire domain (not yet modeled), Specimen Pin recipe (unknown), Bumblebee recipe (unknown), holiday beetles (Black Widow / Candycane Tiger Moth — wiki pages empty), surfacing post-first-use break in the hammer strip, surfacing the daily 0%-break smash window.

---

## What This Is

BeetleCoach is a Tampermonkey userscript (`beetle_coach.user.js`) that automates and advises play in the BeetleBoy game on remilia.net. It runs in-browser, injected by Tampermonkey, and persists state via `GM_getValue`/`GM_setValue`.

**Repo:** `MeridianAnalytics/BeetleCoach` (GitHub)  
**Production file:** `C:\BeetleCoach\beetle_coach.user.js`  
**Backup:** `Z:\BeetleCoach` (READ ONLY — never overwrite C:\ from Z:\)  
**Current version:** 11.7.0 (2168 lines)  
**Target version:** 12.0.0  

## What v12 Must Do

### Core Automation (must be rock-solid)

1. **Auto-claim beetles** — The game has a 2-hour Beetle Catch timer. When it shows "ready" in the `.beetle-game-nav .info` element, click `.beetle-catch-module__catch-button`. The button must not be in `loading` class or show "PROCESSING" text.

2. **Auto-hunt beetles** — Costs 20 cheese per hunt. Click `.beetle-catch-module__hunt-button` when:
   - `S.autoHunt` is true (default: true in v12)
   - Cheese count >= `HUNT_COST` (20)
   - Cheese count after hunt >= `MIN_CHEESE_RESERVE` (100)
   - No hunt cooldown active (check `.beetle-catch-module__hunt-button-cheese-cost` for "cooldown" text)
   - The hunt button is NOT `disconnected` class — BUT clicking disconnected buttons is fine (it auto-loads the cartridge AND performs the action, discovered in v11)

3. **Daily cheese claim** — Every ~6 hours. Check `.cheese-claim-nav .info` for "ready". Navigate to `?cartridge=cheese`, click `.claim-button`. Then navigate back to `?cartridge=beetle`.

4. **Auto-login on session expiry** — The site uses OIDC auth that expires. Three screens to click through:
   - **Screen 1 (main site):** Page shows "SIGN IN or register", no game nav elements present. Click the element with text "SIGN IN" (top-right nav area).
   - **Screen 2 (auth portal):** URL contains `/oidc/...openid-connect`. Page shows "REMILIA AUTHENTICATION PORTAL" with "SIGN IN" and "NEW ACCOUNT" buttons. Click "SIGN IN".
   - **Screen 3 (login form):** Same URL pattern. Has `input[name="username"]` and `input[type="password"]` fields. If credentials are pre-populated (browser autofill), click the submit button. If not pre-filled, log a message and wait for manual login.
   
   The `@run-at document-start` header is critical — it lets us suppress OIDC `alert()` dialogs that would otherwise freeze all JS on the page.

5. **Stuck state recovery** — Game buttons can get stuck showing "PROCESSING..." text or `loading` CSS class. Escalating recovery: wait 15s → refresh page → wait again → hard navigate to `?cartridge=beetle`.

### One-Action-Per-Cycle Rule

**Critical design constraint:** The game can only process one action at a time. If you fire claim AND hunt in the same 10-second cycle, the game silently drops one. The automation must execute at most ONE action per tick, in priority order: **claim > hunt > cheese > scan**.

### Cartridge Navigation

The game has multiple "cartridges" (tabs). Beetle automation needs `?cartridge=beetle`, cheese needs `?cartridge=cheese`. The `ensureCartridge(cartridge, reason)` function handles navigation. Key behaviors:
- Check `currentCartridge()` from URL params
- If already there, return true (ready to act)
- If not, click the nav element or do `window.location.assign`
- Return false (not ready yet — caller should bail and retry next tick)
- Navigation has a 60-second cooldown (`NAV_RETRY_COOLDOWN`) to prevent ping-pong

### What NOT to Automate

**Junk cleanup (drag-to-trash)** — Extensively tested in v11. Cannot be automated. The game uses React internal component state for drag-and-drop that cannot be triggered externally (tried: DOM clicks, synthetic drag events, HTML5 drag API, React props mousedown/mouseup, physical mouse simulation). Do not attempt.

## Architecture for v12

### State Machine

Replace the current three `setInterval` loops + scattered globals with a single `tick()` function called every 5 seconds and a persisted `S.machineState`:

```
BOOTING → LOGGED_OUT → LOGGING_IN → LOADING → IDLE
                                                 ↓
                              CLAIMING / HUNTING / CLAIMING_CHEESE / SCANNING
                                                 ↓
                                              STUCK → RECOVERING → BOOTING
```

`handleIdle()` checks priority order: stuck detection → claim → hunt → cheese → staleness scan. Each action transitions to its specific state, which has a timeout that transitions back to IDLE (or to STUCK if the action didn't complete).

### Key Functions to Preserve

- `scanPage(sel, imgCls, cntCls)` — DOM scraping for inventory items. Returns `{items, unresolved}`. Uses layered extraction: background-image URL → `<img src>` → alt/title attributes.
- `fullScan()` — Async function that paginates through inventory pages using fingerprint-based loop detection. Must remain async.
- `passiveScan()` — Lightweight scan without pagination. Only updates existing items or adds confirmed new items (two-sighting rule).
- `parseTimers()` — Reads timer text from `.beetle-game-nav .info`, `.cheese-claim-nav .info`, `.beetle-catch-module__cooldown-timer`, `.beetle-catch-module__hunt-button-cheese-cost`.
- `parseHammer()` — Reads `.crafting-module__hammer-row` slots. Distinguishes owned vs broken (`--empty` class) vs undiscovered.
- `getDirectCrafts(inv)` — Returns craftable recipes sorted by value. Filters out owned outputs, handles hammer tier logic.
- `getProgressionMove(inv)` — Goal-directed engine using ENDGAME_CHAIN / BROAD_CHAIN / FLOWER_CHAIN. Returns the best actionable progression step.

### Key Functions to Remove/Simplify

- `clickElement()` — Delete, use `safeClick()` everywhere (identical implementation)
- `PREREQ_MAP` inside `getActionPlans()` — Delete, merge into `PREREQ_RECIPES`
- `exportInventory()` / `downloadExport()` — Remove or move to console-only
- Resource Planner (`GOAL_RECIPES` in `renderPanel`) — Duplicates chain data, remove
- `scanConfidence()` / `scanAge()` — Replace with binary `isFresh()`
- Live hammer break-chance probing (mouseenter hover trick) — Fragile, remove
- 2-step chain plans and cross-plan consumption check in `getActionPlans()` — Remove
- `OLD_STORE_KEY` v7 migration — Remove
- `session.beetles` migration — Remove (v12 major version wipe handles this)

## Data Model

### Persisted State (`GM_getValue('beetle_coach_v8_store')`)

```javascript
{
  ver: '12.0.0',
  mergedInventory: { green: 970, ladybug: 166, cheese: 15577, ... },
  currentHammer: 'hammer_t4',  // best available
  ownedHammers: ['hammer_t4', 'hammer_t2'],
  brokenHammers: [],
  discoveredHammers: ['hammer_t1', 'hammer_t2', 'hammer_t3', 'hammer_t4'],
  timers: { beetleCatch: 'Ready!', dailyCheese: '6h 34m', huntCooldown: 'Ready!' },
  lastFullScan: 1712945000000,  // timestamp
  lastPassiveScan: 1712945030000,
  autoClaim: true,
  autoHunt: true,
  panelOpen: true,
  level: 67,
  strategy: 'endgame',  // 'endgame' | 'broad' | 'flowers'
  log: ['01:24 PM Auto-claimed beetle!', ...],  // last 30 events
  machineState: 'IDLE',        // NEW in v12
  stateEnteredAt: 1712945000000, // NEW in v12
  session: { claims: 0, hunts: 0, cheeseClaims: 0, cheeseGained: 0, gains: [], totalXP: 0, startTime: ... }
}
```

### Item Key Format

All items are normalized to snake_case keys via `norm()`. Examples: `green`, `ladybug`, `pollen_bronze`, `hammer_t4`, `junk_cube_t1`. The `ITEM_ALIASES` map handles variations (e.g., `green_beetle` → `green`, `tin_hammer` → `hammer_t1`).

### Token Groups

Some recipe inputs use wildcard tokens: `any_junk`, `any_tin_flower`, `any_bronze_beetle`, etc. The `TOKEN_GROUPS` map resolves these to arrays of specific item keys.

## Game DOM Selectors (as of April 2026)

| Purpose | Selector |
|---------|----------|
| Catch timer nav | `.beetle-game-nav .info` |
| Cheese timer nav | `.cheese-claim-nav .info` |
| Claim button | `.beetle-catch-module__catch-button` |
| Hunt button | `.beetle-catch-module__hunt-button` |
| Hunt cost/cooldown | `.beetle-catch-module__hunt-button-cheese-cost` |
| Cooldown timer | `.beetle-catch-module__cooldown-timer` |
| Daily cheese button | `.claim-button` |
| Inventory items (crafting) | `.crafting-module__inventory-grid .crafting-module__beetle-item` |
| Inventory items (catch) | `.beetle-catch-module__beetle-item` |
| Item image | `.crafting-module__beetle-img` / `.beetle-catch-module__beetle-img` |
| Item count | `.crafting-module__beetle-item-count` / `.beetle-catch-module__beetle-item-count` |
| Pagination | `.crafting-module__pagination-button` / `.beetle-catch-module__pagination-button` |
| Hammer slots | `.crafting-module__hammer-row .crafting-module__hammer-slot` |
| Level display | `.beetle-card__level` |
| Logged-out indicator | Text "SIGN IN or register" + no `.beetle-game-nav .info` |
| OIDC auth page | URL contains `/oidc/` + `/openid-connect` |
| Auth portal | Body text contains "AUTHENTICATION PORTAL" |
| Login form | `input[name="username"]` + `input[type="password"]` on OIDC page |

## User Preferences (from conversation history)

- **C:\BeetleCoach is production.** Never overwrite from Z:\ backup.
- User wants **terse responses**, no trailing summaries.
- User gets frustrated by **regressions** — every fix must not break existing functionality.
- User regularly shares code with **ChatGPT for second opinions** — code should be readable and well-structured.
- **Auto-claim and auto-hunt should both default to ON.**
- The script must work unattended for hours (RDP sessions).
- User's account: `sails` / `~sailboatships`, level 67, 15,577 cheese, Adamantine Hammer.

## Testing Checklist

1. Load script on `remilia.net/home?cartridge=beetle`
2. Verify panel renders with version 12.0.0
3. Verify Claim ON / Hunt ON by default
4. Wait for Beetle Catch "ready" → confirm auto-claim fires
5. Confirm auto-hunt fires when cheese sufficient and no cooldown
6. Wait for Daily Cheese "ready" → confirm navigation to cheese cartridge and click
7. Log out manually → confirm 3-screen auto-login completes
8. Trigger PROCESSING state → confirm stuck recovery kicks in
9. Verify inventory scan captures items correctly (check console for snapshot)
10. Verify no JS errors in console related to BeetleCoach
