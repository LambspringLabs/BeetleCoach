# BeetleCoach v12.4.17 — Consolidated Review (2026-05-17)

Findings from: live game DOM inspection + script audit + full beetle.wiki crawl. See `WIKI_AUDIT.md` for the raw wiki scrape.

## TL;DR

The userscript's *logic* is fine. The data has rotted:

1. The **game shipped a Christmas Crafting Update** with 3 new beetles, 8 new flowers, 47 (vs. 27) junk types, a whole **Trinkets/Trophies** domain, a 6th **Specimen Pin** artifact, and a **Flower Reroll** assemble recipe. The script's hard-coded `LABELS` / `ALL_BEETLES` / `ALL_FLOWERS` / `ANY_JUNK` / `ITEM_ALIASES` / `RECIPES` are all stale.
2. Three KB claims are **wrong**: the Hercules recipe, the three "Flower Transmute" recipes, and the hammer break stats.
3. Session-log spam is one line: every full scan logs even when nothing changed.

The user-visible "Missing: Mars Rhino, Golden Scarab, Hercules, Black Lotus" lie has one root cause and a knock-on:
- **Root:** game filename is `golden.png`; script normalizes that to `golden`, not `golden_scarab`. No alias.
- **Knock-on:** the "1 unresolved" in log lines is the trinket/specimen_pin/cucumber/etc. the script can't classify. Fix the data tables and unresolved drops to 0.

---

## A. Script bugs (in beetle_coach.user.js)

### A.1 Golden Scarab missing — single-line alias
- Game: `icons/beetles/golden.png` → `norm("golden")` = `"golden"` → not in `LABELS`/`ALL_BEETLES`
- Wiki itemtag canonical: `golden` (confirmed in `itemtag_docs`)
- Fix: add `golden:'golden_scarab'` to `ITEM_ALIASES` at [beetle_coach.user.js:101](C:/BeetleCoach/beetle_coach.user.js#L101)

### A.2 Session-log spam — one-line guard
[beetle_coach.user.js:436](C:/BeetleCoach/beetle_coach.user.js#L436): `logEvent('Scan: '+...)` fires on every full scan. With 2-min cadence and a 30-line log cap, an idle hour wipes useful events.

Fix: gate on `(changes.length || totalUnresolved)`. Don't log no-ops.

### A.3 Wrong Flower Transmute recipes
[beetle_coach.user.js:191-193](C:/BeetleCoach/beetle_coach.user.js#L191):
```
{label:'Bronze Flower Transmute',type:'smash',inputs:['green','purple','junk_cube_t1']},
{label:'Mithril Flower Transmute',type:'smash',inputs:['green','any_mithril_beetle','junk_cube_t1']},
{label:'Adamantine Flower Transmute',type:'smash',inputs:['green','any_adamantine_beetle','junk_cube_t1']}
```

Wiki says single beetle + Junk Cube — no `green` sacrifice required. Should be:
```
{label:'Tin Flower Transmute', type:'smash', inputs:['green','junk_cube_t1']},
{label:'Bronze Flower Transmute', type:'smash', inputs:['any_bronze_beetle','junk_cube_t1']},
{label:'Mithril Flower Transmute', type:'smash', inputs:['any_mithril_beetle','junk_cube_t1']},
{label:'Adamantine Flower Transmute', type:'smash', inputs:['any_adamantine_beetle','junk_cube_t1']}
```

Also: **Cucumber Beetle and Bumblebee can't be transmuted** — exclude from the "any bronze beetle" / "any mithril beetle" groups for this recipe specifically. (Add a `NON_TRANSMUTABLE` set.)

### A.4 Hercules recipe is unconfirmed
[beetle_coach.user.js:190](C:/BeetleCoach/beetle_coach.user.js#L190): `Hercules Beetle = golden_scarab + adamantine_pollen + purple` — **not on the wiki**. No `beetle:hercules` page exists, no entry in beetles overview.

Action: leave the recipe in but mark it speculative; or remove until verified in-game. The endgame chain pointing to Hercules ([beetle_coach.user.js:247](C:/BeetleCoach/beetle_coach.user.js#L247)) currently directs the user to grind toward an unverified target.

### A.5 Hammer break stats incomplete
[beetle_coach.user.js:137-140](C:/BeetleCoach/beetle_coach.user.js#L137): `HAMMER_STATS` has `baseBreak` per hammer but no "post-first-use" elevated values.

Wiki:
- Adamantine: 2% base → **5%** after first use
- Diamond: 1% base → **9%** after first use

This significantly changes Diamond Hammer EV — second smash is still cheap, but third+ jumps to 9%. Add `postFirstBreak` field.

### A.6 Missing daily-reset mechanic
The wiki documents "every hammer gets exactly one 0%-break smash per day after Universal Basic Cheese daily reset." The script has no concept of this. Implication: the *first* daily smash with any hammer is free; coach should surface "Use your premium hammers NOW before they accrue break wear."

Optional add: track `lastDailyResetSeen` per hammer; offer "Daily Free Smash" callout when the cheese-reset timer fires.

### A.7 Pagination fingerprint may stop short
[beetle_coach.user.js:421](C:/BeetleCoach/beetle_coach.user.js#L421) clicks MORE up to 20 times with a 200 ms sleep. On a slow render the same fingerprint repeats and pagination breaks early — explains why `stag` lingers in stored inventory after being used.

Fix options: bump delay to 500–800 ms; or wait for the first item's text/image to change before re-scanning; or paginate via React props (similar to the cartridge lever fix).

### A.8 `inv.stag` stuck in stored state
Likely caused by A.7. Worth running a clean Full Scan after the data-table refresh and confirming stale items disappear.

---

## B. Data table updates needed (LABELS / ALL_BEETLES / ALL_FLOWERS / ANY_JUNK / ITEM_ALIASES / TIER_MAP / TOKEN_GROUPS / RECIPES)

### B.1 New beetles to add to `LABELS` + `ALL_BEETLES` + `TIER_MAP`
| Wiki slug | Display name | Tier | Source |
|---|---|---|---|
| `cucumber` | Striped Cucumber Beetle | Bronze | Drop only; NOT transmutable |
| `bumblebee` | Bumblebee | Mithril | Drop? recipe unknown; NOT transmutable |
| `blue_longicorn` | Black-Spotted Blue Longicorn | Mithril | Craft: Fringed Iris + Mithril Beetle |
| `golden_tiger` | Golden-Spotted Tiger Beetle | Mithril | Craft: Larkspur + Mithril Beetle |
| `death_feigning` | Blue Death Feigning Beetle | Adamantine | Craft: Passionflower + Adamantine Beetle |

Also confirm wiki itemtags vs script aliases:
- `golden` → display "Golden Scarab" (alias needed)
- Holiday: `skull` → "Skull Bug" (we have "Skull Beetle"), `christmas` → "Christmas Beetle" ✓

Holiday beetles only listed in beetles overview, no individual pages:
- Black Widow (Diamond, Halloween drop) — page empty
- Candycane Tiger Moth (Diamond, Christmas drop) — page empty

### B.2 New flowers to add to `LABELS` + `ALL_FLOWERS` + `TIER_MAP`
| Wiki slug | Display name | Tier |
|---|---|---|
| `carnation` | Chinese Pink Carnation | Tin |
| `snapdragon` | Common Snapdragon | Tin |
| `petunia` | Large White Petunia | Tin |
| `st_johns_wort` | Spotted St. John's Wort | Bronze |
| `magnolia` | Southern Magnolia | Bronze |
| `larkspur` | Two-spike Larkspur | Mithril |
| `fringed_iris` | Fringed Iris | Mithril |
| `passionflower` | Purple Passionflower | Adamantine |

That brings `ALL_FLOWERS` from 12 → 20, and tier counts to: 6 Tin / 5 Bronze / 5 Mithril / 3 Adamantine / 1 special (Black Lotus).

Also `TIN_FLOWERS`, `BRONZE_FLOWERS`, `MITHRIL_FLOWERS`, `ADAMANTINE_FLOWERS` arrays need updating.

### B.3 New junk types — script has 27, wiki has 47
Missing from `ANY_JUNK`: ballpoint_pen, bendy_straw, broken_firework, burger_wrapper, button, chewed_eraser, deodorant_can, event_band, glue_stick, grenade_pin, guitar_pick, headphones_90s (might map to script's existing list), matchbook, origami_crane, pill_bottle, salt_pepper_packet, sim_card, wristband.

Cross-check with current script's list (27 items). Anything in the script that's not in the wiki should be flagged as removed by the dev team or renamed.

### B.4 New recipe: Flower Reroll (assemble)
`Junk Tesseract + <Flower> → different same-tier flower` (RNG between siblings, but 100% success — it always rerolls).

Add to `RECIPES` as type `assemble` with output type "same-tier flower". May need new tooling because output is variable.

### B.5 Specimen Pin (Adamantine artifact, recipe unknown)
Add to `LABELS` and `TIER_MAP` as `Bridge`/Artifact. No recipe known — surface as "found item" only.

### B.6 New domain: Trinkets + Trophies
**This is the big architectural addition.** The wiki has:
- 9 known Trinkets (Tin → Adamantine rarity, plus 1 Adamantine `stradivarius`)
- 15 known Trophies (Trophy rarity, separate tag) + 5 unknown
- Rule: **first craft of a Trinket recipe awards the Trophy; subsequent crafts award the Trinket itself**

Trinket recipes (from wiki):
| Trinket | Recipe |
|---|---|
| Chinese Coin | Junk Cube x2 + Tin Pollen |
| Prism | Junk Tesseract x2 + Tin Pollen |
| Roman Dodecahedron | Junk Tesseract x2 + Bronze Pollen |
| Arrowhead | Junk Tesseract x2 + Mithril Pollen |
| Titanium Cube | Junk Tesseract x2 + Adamantine Pollen |
| Oriental Fan | Chinese Coin + Tin Pollen |
| Jade Cabbage | Chinese Coin + Roman Dodecahedron |
| CULT Medallion | Chinese Coin + Juex Card |
| Stradivarius | Oriental Fan + Jade Cabbage |
| Thumb Drive | Roman Dodecahedron + Prism |
| Compass | Roman Dodecahedron + Arrowhead |
| Mokia | Roman Dodecahedron + Titanium Cube |
| Goya Miniature Painting | Arrowhead + Stradivarius |
| Police Badge | Arrowhead + Titanium Cube |
| Juex Card | Prism + Titanium Cube |

The Coach should at minimum:
- Add `TRINKETS` array (parallel to `ALL_BEETLES`/`ALL_FLOWERS`)
- Add Trophy unlock tracker (because each is a one-shot achievement)
- Add `RECIPES` entries for the 15 known trinket recipes (type `smash`? `assemble`? — wiki doesn't specify but they look like assembles based on the structure; needs verification)

Decide later whether to extend Stage/Strategy framework to include Trinket-hunting as a separate goal.

### B.7 New artifact (already mentioned): Specimen Pin
- `specimen_pin` (Adamantine artifact, recipe unknown). One owned in current inventory. Add to `LABELS` + `TIER_MAP`.

### B.8 BeetleBoy Key clarification
Wiki: the key unlocks the **3rd slot** on BOTH workbenches (Assemble + Smash) permanently. The coach doesn't currently track "key owned" or surface this as a milestone — easy add.

---

## C. Knowledge-base markdown updates needed

These are the two files in `C:\BeetleCoach\`: `beetleboy_knowledge_base.md` and `beetle_known_recipes_human_readable.md`. The wiki audit calls out the following deltas that should be reflected:

1. **Remove Hercules recipe** from confirmed list (or mark "speculative — not on wiki"). Move from §9 "Endgame recipes" to a new "Unverified" section.
2. **Rewrite §8 (flower transmutation)** to use single-beetle form. Drop the "green sacrifice + beetle + junk_cube" pattern from main recipes; preserve as a hypothesis if you want.
3. **Add the 3 new special-beetle smashes** (Blue Longicorn, Golden Tiger, Blue Death Feigning).
4. **Update §12 hammer table** with post-first-use break columns (5% / 9% for Adamantine / Diamond).
5. **Add Flower Reroll recipe** (Junk Tesseract + Flower → same-tier sibling).
6. **Rewrite §10 sacrifice theory** — wiki: "sacrifice is NOT part of the recipe, may affect probability AND/OR rarity, both Green and Purple work."
7. **Add Trinket + Trophy domain** as a new section (essentially everything in B.6).
8. **Add Specimen Pin** to artifact list.
9. **Update junk list** to 47 items per wiki itemtag_docs.
10. **Add `db.beetle.wiki`** as an authoritative external lookup tool.
11. **Add daily-reset / hammer-upgrade-resets-break / "Grigger Maxxing"** mechanics.
12. **Goliath/Stag/Bombardier are BOTH drop AND craft** — clarify in beetle-source tables.
13. **Cucumber + Bumblebee can NOT be transmuted** — note in transmutation section.

---

## D. Suggested fix order (when you say go)

| # | Change | Impact | Risk |
|---|---|---|---|
| 1 | Add `golden → golden_scarab` alias in `ITEM_ALIASES` | Fixes Missing-list lie | None |
| 2 | Gate `Scan:` log line on `changes.length \|\| totalUnresolved` | Kills session-log spam | None |
| 3 | Add 5 new beetles + 8 new flowers + their TIER_MAP entries + flower group arrays | Stage/collection counters accurate; new items show in inventory | None — pure data |
| 4 | Update `ANY_JUNK` to wiki's 47-item list | "1 unresolved" reaches 0 | Tiny — junk are interchangeable |
| 5 | Fix Flower Transmute recipes (remove `green`+ prefix; add Tin transmute) | Coach recommends correct ingredients | Small — needs in-game verification of single-beetle form |
| 6 | Add 3 new special-beetle recipes (Blue Longicorn, Golden Tiger, Blue Death Feigning) | Coach can chain to new collection targets | None |
| 7 | Add `cucumber`, `bumblebee` to a `NON_TRANSMUTABLE` set so they're not suggested for transmute | Avoids wasted recipes | None |
| 8 | Update hammer post-first-use break stats; teach EV model about it | More accurate hammer recommendations | Small |
| 9 | Add Specimen Pin to LABELS / TIER_MAP | Shown in inventory properly | None |
| 10 | Bump pagination delay from 200ms → 600ms | Stale-inventory bug (stag) goes away | Tiny — slower scans |
| 11 | Mark Hercules speculative or remove from endgame chain | Coach stops directing user at unverified recipe | Medium — depends on user's faith in old folklore |
| 12 | Add Trinket recipes + Trophy tracker | New collection goal surfaced | Larger — design work for the panel layout |
| 13 | Update both knowledge-base markdowns | Future AI conversations get current info | None |

I'd batch 1–10 as one PR (data + tiny logic fixes). 11 is a judgment call. 12 is its own follow-up.

---

## E. Things to verify in-game before changing

1. **Flower Transmute single-beetle form** — does `Pond + Junk Cube` actually produce a Mithril flower, no Green sacrifice required? Test cheap (Tin) version first.
2. **Hercules** — has the user ever crafted one or seen one drop? If yes, the wiki may just be missing the page. If no, treat as folklore.
3. **Bumblebee recipe** — community unknown; user may have insight from past inventory.
4. **Daily-reset mechanic** — has the user observed hammer breaks reset to 0% at daily-cheese reset? Confirm before adding the strategy callout.
5. **Trinket recipes type (assemble vs smash)** — wiki layout implies assemble (deterministic) but doesn't say outright.

---

## F. Repo / supply-chain note

[beetle_coach.user.js:11](C:/BeetleCoach/beetle_coach.user.js#L11) has `@updateURL: https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/beetle_coach.user.js` — but the project memory note says the repo is `MeridianAnalytics/BeetleCoach`. Worth resolving before pushing any updates. (The memory note is 6 days old, so the LambspringLabs URL may be intentional and newer.)

Also worth thinking about: with `@updateURL` pointing at a public repo, any committed credential or stored password would auto-distribute to all users on next pull. The script's existing comment at line 925-931 already calls this out. Keep the discipline.

---

End of consolidated review. Awaiting your "go" before any code or markdown edits.
