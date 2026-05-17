# BeetleCoach v12.4.18 Recipe & Display Audit
Audit date: 2026-05-17. Ground truth: `WIKI_AUDIT.md`. Verdicts: ✓ exact / ⚠ plausible-but-flagged / ✗ disagrees / ❓ off-wiki.

---

## 1. Recipe-by-recipe verification

| # | Label | Inputs | Wiki match | Verdict |
|---|---|---|---|---|
| 1 | Junk Cube | any_junk + any_junk | A.1 "Any Junk item x2" | ✓ |
| 2 | Junk Tesseract | junk_cube_t1 x3 | A.1 "Junk Cube x3" | ✓ |
| 3 | Tin Hammer | junk_cube_t1 x2 | A.1 "Junk Cube + Junk Cube" | ✓ |
| 4 | Bronze Hammer | Tin Hammer + Tesseract + Tin Pollen | A.1 row 2 | ✓ |
| 5 | Mithril Hammer | Bronze Hammer + Tesseract + Bronze Pollen | A.1 row 3 | ✓ |
| 6 | Adamantine Hammer | Mithril Hammer + Tesseract + Mithril Pollen | A.1 row 4 | ✓ |
| 7 | Diamond Hammer | Adamantine Hammer + Tesseract + Adamantine Pollen | A.1 row 5 | ✓ |
| 8 | Tin Pollen | any_tin_flower x2 | A.1 | ✓ |
| 9 | Bronze Pollen | any_bronze_flower x2 | A.1 | ✓ |
| 10 | Mithril Pollen | any_mithril_flower x2 | A.1 + note: ⚠ Cattail NOT a flower — TOKEN_GROUPS correctly excludes it | ✓ |
| 11 | Adamantine Pollen | any_adamantine_flower x2 | A.1 (inferred — wiki only states the lower 3) | ⚠ pattern-extrapolated; consistent with wiki structure |
| 12 | Nectar / Cattail Bridge | any_bronze_beetle + bronze_pollen | A.2 "Bronze Beetle + Bronze Pollen → Nectar OR Cattail" | ✓ |
| 13 | Pinecone / Moss / Gunpowder Bridge | any_mithril_beetle + mithril_pollen | A.2 "Mithril Beetle + Mithril Pollen → Pinecone OR Moss OR Gunpowder" | ✓ |
| 14 | Pond Beetle | cattail + ladybug | A.2 | ✓ |
| 15 | Monarch | nectar + ladybug | A.2 | ✓ |
| 16 | Monarch (alt) | nectar + purple | A.2 (recipe shows ladybug; protips elaborates "Cattail + Ladybug or Purple" → applies to Monarch craft analogously) | ⚠ wiki only shows "+ Ladybug" — Purple substitution is folklore-supported but not in the recipe table |
| 17 | Bombardier Beetle | gunpowder + pond | A.2 | ✓ |
| 18 | **Bombardier Beetle (alt)** | gunpowder + monarch | wiki table shows "+ Pond" only; A.2 DELTA explicitly flags this as not-documented for artifact-use crafts | ⚠ **risky** — wiki: "the canonical recipe is Pond. Monarch may also work but is not the documented form" |
| 19 | Stag Beetle | moss + pond | A.2 | ✓ |
| 20 | Goliath Beetle | pinecone + pond | A.2 | ✓ |
| 21 | **Goliath Beetle (alt)** | pinecone + monarch | same as #18 | ⚠ **risky** — same wiki note |
| 22 | Giraffe Weevil | royal_poinciana + pond | A.2 "Royal Poinciana + Mithril Beetle (e.g. Pond)" | ✓ |
| 23 | Giraffe Weevil (alt) | royal_poinciana + monarch | A.2 says "Mithril Beetle (e.g. Pond)" — Monarch is also Mithril | ✓ wiki's "e.g." implies any Mithril beetle |
| 24 | Pillbug | camellia + pond | A.2 "Camellia + Mithril Beetle" | ✓ |
| 25 | Pillbug (alt) | camellia + monarch | same as #23 | ✓ |
| 26 | Imperial Tortoise Beetle | morning_glory + pond | A.2 | ✓ |
| 27 | Imperial Tortoise Beetle (alt) | morning_glory + monarch | same as #23 | ✓ |
| 28 | Sabertooth Longhorn Beetle | pincushion + goliath | A.2 "Pincushion + Adamantine Beetle (e.g. Stag)" | ✓ |
| 29 | Sabertooth Longhorn (Stag) | pincushion + stag | A.2 "e.g. Stag" | ✓ |
| 30 | Sabertooth Longhorn (Bomb) | pincushion + bombardier | A.2 implies any Adamantine beetle | ✓ |
| 31 | Sunset Moth | gazania + goliath | A.2 "Gazania + Adamantine Beetle" | ✓ |
| 32 | Sunset Moth (Stag) | gazania + stag | A.2 | ✓ |
| 33 | Sunset Moth (Bomb) | gazania + bombardier | A.2 | ✓ |
| 34 | Black Lotus | gunpowder + moss + pinecone | A.2 verbatim | ✓ |
| 35 | Mars Rhino Beetle | black_lotus + sunset_moth + sabertooth_longhorn | A.2 verbatim | ✓ |
| 36 | **Hercules Beetle** | golden_scarab + adamantine_pollen + purple | NOT ON WIKI. WIKI_AUDIT A.2 + H.2 explicitly: no `beetle:hercules` page, no listing | ❌ **off-wiki, fabrication risk** |
| 37 | Black-Spotted Blue Longicorn | fringed_iris + any_mithril_beetle | A.2 "Fringed Iris + Mithril Beetle (e.g. Pond)" | ✓ |
| 38 | Golden-Spotted Tiger Beetle | larkspur + any_mithril_beetle | A.2 "Larkspur + Mithril Beetle" | ✓ |
| 39 | Blue Death Feigning Beetle | passionflower + any_adamantine_beetle | A.2 "Purple Passionflower + Adamantine Beetle (e.g. Stag)" | ✓ |
| 40 | Tin Flower Transmute | green + junk_cube_t1 | A.2 "Tin Beetle (Green) + Junk Cube" | ✓ |
| 41 | Bronze Flower Transmute | any_bronze_beetle + junk_cube_t1 | A.2 "Bronze Beetle (Ladybug) + Junk Cube" | ✓ (user-confirmed 2026-05-17) |
| 42 | Mithril Flower Transmute | any_mithril_beetle + junk_cube_t1 | A.2 "Mithril Beetle (Pond) + Junk Cube" | ✓ (user-confirmed 2026-05-17) |
| 43 | Adamantine Flower Transmute | any_adamantine_beetle + junk_cube_t1 | A.2 "Adamantine Beetle (Stag) + Junk Cube" | ✓ (user-confirmed 2026-05-17) |

### Goliath/Stag/Bombardier (alt) — verdict
Wiki A.2 DELTA: "The wiki recipes table only shows '+ Pond' for these three, not '+ Monarch'... The canonical recipe is Pond. Monarch may also work but is not the documented form for artifact-use." Status: **risky**. Recommend removing or relabeling as "speculative" with explicit warning. Stag has no `(alt)` row in the script — inconsistency.

### Sabertooth/Sunset (Stag)/(Bomb) — verdict
Wiki A.2 says "Adamantine Beetle (e.g. Stag)" for Sabertooth and Sunset Moth — phrasing parallels the "Mithril Beetle (e.g. Pond)" form used for Giraffe Weevil/Pillbug/Imperial Tortoise, which the audit accepts as "any Mithril beetle". The same logic applies symmetrically. ✓ safe.

### Transmute recipes — verdict
All 4 ✓ per wiki and per user's in-game confirmation 2026-05-17. Note: `cucumber` and `bumblebee` are excluded from `BRONZE_BEETLES`/`MITHRIL_BEETLES` (line 164–165) — correct per wiki ("Special beetles like Striped Cucumber Beetle and Bumblebee cannot be transmuted").

---

## 2. Display ambiguity audit (renderPanel)

| # | Risk | Location | Status |
|---|---|---|---|
| 1 | Black Lotus prereq display ("GOAL / ✅ <prereq inputs>") | Line 1342–1349 | **FIXED in code present at line 1342–1349.** Direct moves now say "Craft now:". Prereq moves now say "🎯 <goal> recipe: ..." then "🔧 Step now: <prereq label> — <prereq inputs>". |
| 2 | Goal recipe shown when chain points at `Adamantine Flower Transmute` for `gazania`/`pincushion` goal | Line 1347: `chainEntry.recipe='Adamantine Flower Transmute'`, but inputs are `any_adamantine_beetle + junk_cube_t1` which RNG-yields ANY adamantine flower (Pincushion/Gazania/Passionflower), not specifically the goal | ⚠ **NEW AMBIGUITY** — panel would read "Gazania GOAL / 🎯 Gazania recipe: Adamantine beetle + Junk Cube" but combo yields random adamantine flower. Will likely confuse user same way Black Lotus did. |
| 3 | "via" text on BROAD_CHAIN line 341–342 + FLOWER_CHAIN 357–358 says "Green + Adamantine beetle + Junk Cube" (3-input) — stale from pre-v12.4.18 transmute formula | Lines 341, 342, 357, 358 | ⚠ **STALE TEXT** — real recipe is 2-input. Shows in blocked-state message line 1356. |
| 4 | "via" text for Hercules: "Golden Scarab is drop-only" / "Golden Scarab + Adamantine Pollen" | Lines 334, 347 | ⚠ Points user at off-wiki recipe (see #36 above). |
| 5 | "You can make (N)" section labels each recipe by `dc.label` + its own `dc.inputs.map(tokHuman)` — these are always paired correctly | Line 1371 | ✓ safe |
| 6 | Tier badge color for RNG-risk recipes — `Legendary` (#f1c40f gold) and `Epic` (#e74c3c red) only used for outputs in Inventory section, not in the Next Moves recipe lines | Line 1376 | Neutral — no visual risk distinction on Next Moves recipes (only SAFE/RNG badges). |
| 7 | Status strip — Cheese/Hunt/Claim timers, Hammer name, Bonus%, Break% | Lines 1315–1322 | ✓ no ambiguity |
| 8 | "Missing: ..." line in Progression — uses `dn()` straight from `ALL_BEETLES`/`ALL_FLOWERS`. Now-aliased `golden`→`golden_scarab` flows through correctly | Line 1366 | ✓ safe |
| 9 | Blocked-state line shows `prog.reason` ("Need: <missing items>") + `prog.via` | Line 1356 | ✓ unambiguous (labels are explicit) |
| 10 | Hammer "+X% / Y% break" doesn't show post-first-use jump (5%/9% for Adamantine/Diamond) | Line 1316 | ⚠ misleading but separate concern from recipe correctness |

---

## 3. Chain validation

| Chain | Entry | recipe field | RECIPES match | prereqs map valid |
|---|---|---|---|---|
| ENDGAME | goliath | Goliath Beetle | ✓ | pinecone→Bridge ✓ |
| ENDGAME | sunset_moth | Sunset Moth | ✓ | gazania→AdaFlowerTransmute ✓; any_adamantine_beetle→Goliath/Stag/Bombardier ✓ |
| ENDGAME | black_lotus | Black Lotus | ✓ | gunpowder/moss/pinecone→Bridge ✓ |
| ENDGAME | mars_rhino | Mars Rhino Beetle | ✓ | black_lotus/sunset_moth/sabertooth_longhorn — **NO PREREQ_RECIPES entries.** Cannot generate a prereq move; falls through to blocked. |
| ENDGAME | hercules | Hercules Beetle | ✓ as label but ❌ recipe off-wiki | golden_scarab — no PREREQ entry (drop only); pollen_adamantine→Adamantine Pollen ✓ |
| BROAD | pollen_bronze | Bronze Pollen | ✓ | — |
| BROAD | goliath | Goliath Beetle | ✓ | pinecone ✓ |
| BROAD | stag | Stag Beetle | ✓ | moss ✓ |
| BROAD | bombardier | Bombardier Beetle | ✓ | gunpowder ✓ |
| BROAD | gazania | Adamantine Flower Transmute | ✓ recipe label exists but outputs a random adamantine flower, not gazania specifically | — |
| BROAD | pincushion | Adamantine Flower Transmute | same ⚠ as above | — |
| BROAD | black_lotus | Black Lotus | ✓ | gunpowder/moss/pinecone ✓ |
| BROAD | sabertooth_longhorn | Sabertooth Longhorn Beetle | ✓ | pincushion→AdaFlowerTransmute ✓; any_adamantine_beetle ✓ |
| BROAD | sunset_moth | Sunset Moth | ✓ | gazania ✓; any_adamantine_beetle ✓ |
| BROAD | mars_rhino | Mars Rhino Beetle | ✓ | — (no PREREQ entries for black_lotus/sunset_moth/sabertooth_longhorn) |
| BROAD | hercules | Hercules Beetle | ❌ off-wiki | — |
| FLOWER | pollen_bronze | Bronze Pollen | ✓ | — |
| FLOWER | nectar | Nectar / Cattail Bridge | ✓ | pollen_bronze→Bronze Pollen ✓ |
| FLOWER | cattail | Nectar / Cattail Bridge | ✓ | pollen_bronze ✓ |
| FLOWER | pollen_mithril | Mithril Pollen | ✓ | — |
| FLOWER | pinecone | Pinecone / Moss / Gunpowder Bridge | ✓ | pollen_mithril→Mithril Pollen ✓ |
| FLOWER | moss | Pinecone / Moss / Gunpowder Bridge | ✓ | pollen_mithril ✓ |
| FLOWER | gunpowder | Pinecone / Moss / Gunpowder Bridge | ✓ | pollen_mithril ✓ |
| FLOWER | gazania | Adamantine Flower Transmute | ⚠ same RNG-output mismatch | — |
| FLOWER | pincushion | Adamantine Flower Transmute | ⚠ same | — |
| FLOWER | pollen_adamantine | Adamantine Pollen | ✓ | — |

**Dangling refs:** none structurally. `Mars Rhino Beetle` and `Hercules Beetle` prereqs not in PREREQ_RECIPES → silently falls to `bestB` blocked path. Acceptable.

**Endgame chain ordering bug (low):** `sunset_moth` listed before `black_lotus`, but `mars_rhino` requires both. If user owns 0 of all three, the engine picks the highest-value reachable goal — works in practice but the ordering is suboptimal for narration.

**No PREREQ entries for new craft outputs:** `blue_longicorn`, `golden_tiger`, `death_feigning` are not chain goals AND not prereqs anywhere. Not strictly wrong (chain reflects user-set strategy goals), but means coach will not surface them as next moves under any chain. Worth noting.

**Stag has no (alt):** Lines 237–238 — Stag is the only adamantine beetle without a Monarch (alt) variant. Inconsistent (if Goliath/Bombardier alts are kept, Stag should match — though all three are wiki-flagged risky).

---

## 4. NEEDED_AS_INGREDIENT / isProtected coverage

`NEEDED_AS_INGREDIENT = {sabertooth_longhorn, sunset_moth, black_lotus}` (line 305).

`isProtected` covers: pond, monarch, pinecone, moss, gunpowder, gazania, pincushion, black_lotus, sunset_moth, sabertooth_longhorn, golden_scarab, pollen_adamantine.

| Item | In COLLECTIBLES | Protected when last copy? | Risk |
|---|---|---|---|
| cucumber | ✓ (ALL_BEETLES) | No (collectible default) | ✓ safe — only consumed in transmute (which is excluded from cucumber group anyway) |
| bumblebee | ✓ | No | ✓ safe — also excluded from groups |
| blue_longicorn | ✓ | No | ⚠ output of `fringed_iris + mithril_beetle` — not an ingredient in any recipe, but `wouldConsumeLastCollectible` would block crafting it again (correct via line 647 `inv[out]>0`). Recipe value not set → defaults to 5 (low priority). |
| golden_tiger | ✓ | No | same as above |
| death_feigning | ✓ | No | same as above |
| fringed_iris | ✓ (ALL_FLOWERS) | **No explicit protection** | ⚠ **GAP** — if user owns 1 fringed_iris and 0 blue_longicorn, and engine evaluates Mithril Pollen (any_mithril_flower x2), `canMake` says yes if 2+ mithril flowers exist. `wouldConsumeLastCollectible` checks per-group element: at fringed_iris (count=1), no protection rule → consume allowed. Could destroy last fringed_iris before blue_longicorn is crafted. |
| larkspur | ✓ | **No explicit protection** | ⚠ same gap re: golden_tiger |
| passionflower | ✓ | **No explicit protection** | ⚠ same gap re: death_feigning AND used in Adamantine Pollen group |
| carnation/snapdragon/petunia | ✓ | No (Tin) | Low risk — many Tin flowers available, attrition tolerable |
| st_johns_wort/magnolia | ✓ | No | Low risk — Bronze tier, multiple alternatives |

**Last-copy fallback (line 627):** for plain (non-group) inputs, `(inv[t]||0) <= 1 && !(makesNew && !isProtected(...))` triggers; for group inputs (line 626), the same idea applies but with the "hasAlt" check — needs 2+ of an alternative within the group. So if user has 1 fringed_iris + 1 morning_glory and goes to make Mithril Pollen, fringed_iris alone would block but morning_glory provides `hasAlt`... wait, hasAlt checks `inv[g[ai]] > 1` — both at 1 each fails the alt check → block. Actually safer than I thought.

But: 1 fringed_iris + 2 morning_glory = morning_glory passes hasAlt for fringed_iris → consume allowed. fringed_iris (which is the user's only one) is at risk. **Real gap.**

Recommendation: add `fringed_iris`, `larkspur`, `passionflower` to `isProtected` similar to how gazania/pincushion are protected for sunset_moth/sabertooth_longhorn, gated on respective new beetles owned.

---

## 5. Anti-recipe surfacing

WIKI_AUDIT.md section B lists 31 dead combos. None present in `RECIPES` (good). The script's `canMake` requires a recipe to exist, so the panel cannot accidentally suggest a dead combo. Three potentially-confusing ones for users to watch out for (matter only as in-game manual mistakes):

- `Pond + Monarch + Moss` — looks like a Stag-adjacent recipe; fails
- `Pond + Monarch + Mithril Pollen` — same
- `Bombardier + Bombardier + Gunpowder` — looks like a Black Lotus shortcut; fails

**Recommendation: low priority.** Surface a small "⚠ Known dead combos" expandable list in the panel for self-directed crafting reference. Do not implement until requested.

---

## 6. Specific question about Black Lotus display bug

(a) **Stored Black Lotus recipe in `RECIPES` (line 252):** `inputs:['gunpowder','moss','pinecone']`. ✓ correct per wiki A.2.

(b) **Bug location:** v12.4.18's stored renderPanel logic at line 1330 (`pr.inputs.map(tokHuman).join(' + ')`) showed the PREREQ recipe's inputs under the GOAL heading. The fix is already present in the working file at lines 1342–1349 (the comment says "v12.4.19" so this is in-flight). The new logic for `prog.type === 'prereq'` shows TWO labeled lines: "🎯 <goal> recipe: <goal inputs>" + "🔧 Step now: <prereq label> — <prereq inputs>" — both explicitly labeled.

(c) **Other goals where the same prereq ambiguity could occur** (if the old code were still active):

| Chain | Goal | Prereq path that would produce ambiguous "goal / prereq inputs" display |
|---|---|---|
| ENDGAME | goliath | Pinecone missing → suggests "Pinecone / Moss / Gunpowder Bridge" (Mithril beetle + Mithril Pollen) → reads as "Goliath recipe = Mithril beetle + Mithril Pollen" |
| ENDGAME | sunset_moth | gazania missing → Adamantine Flower Transmute (adamantine beetle + Junk Cube) → reads as "Sunset Moth = adamantine beetle + Junk Cube" |
| ENDGAME | black_lotus | any of gunpowder/moss/pinecone missing → Bridge → reads as "Black Lotus = Mithril beetle + Mithril Pollen" (the reported case) |
| ENDGAME | hercules | pollen_adamantine missing → Adamantine Pollen → reads as "Hercules = Adamantine flower x2" |
| BROAD | goliath/stag/bombardier | pinecone/moss/gunpowder missing → Bridge → reads as same |
| BROAD | sabertooth | pincushion missing → Adamantine Flower Transmute → reads as "Sabertooth = adamantine beetle + Junk Cube" |
| BROAD | sunset_moth | gazania missing → same |
| FLOWER | nectar/cattail | pollen_bronze missing → Bronze Pollen → reads as "Nectar = 2 Bronze flowers" |
| FLOWER | pinecone/moss/gunpowder | pollen_mithril missing → Mithril Pollen → reads as "Pinecone = 2 Mithril flowers" |

**Conclusion (c):** the bug is structural — any chain entry with a prereq that has its own recipe creates the ambiguity. The v12.4.19 fix at line 1342–1349 addresses ALL of them, because the new code labels both lines (`🎯 <goal> recipe:` vs `🔧 Step now:`).

**Remaining residual ambiguity (NEW finding):** when `chainEntry.recipe` itself is a multi-output recipe (i.e. `Adamantine Flower Transmute` for goal=`gazania` or `pincushion`, and `Bronze Pollen`/`Mithril Pollen`/`Pinecone / Moss / Gunpowder Bridge` for their respective single-flower goals), the new "🎯 <goal> recipe: <inputs>" line still misleadingly attributes a specific output to a multi-output recipe. E.g.:
- "Gazania GOAL / 🎯 Gazania recipe: Adamantine beetle + Junk Cube" — but combo could yield Pincushion or Passionflower instead.
- "Pinecone GOAL / 🎯 Pinecone recipe: Mithril beetle + Mithril Pollen" — but combo could yield Moss or Gunpowder instead.

The user may interpret this as deterministic when it is RNG between siblings. **Recommend:** for these multi-output recipes, add an "(random sibling)" annotation, e.g. "🎯 Reach Gazania via Adamantine Flower Transmute (adamantine beetle + Junk Cube — random adamantine flower)".
