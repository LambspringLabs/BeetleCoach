# BeetleBoy / BeetleCraft — Known Recipes, Facts & Coach Reference
_Last updated: 2026-05-17 (v12.4.18 — wiki resync after Christmas Crafting Update)_

This is the clean human-readable recipe and mechanics text file for future AI chats and personal reference.

> **2026-05-17 audit:** the file below was last touched 2026-04-07 and is partially stale against the live beetle.wiki. Full structured re-scrape is in `WIKI_AUDIT.md`. Key deltas the AI/reader should know before using this doc:
>
> - **Hercules recipe is unverified.** No `beetle:hercules` page exists on the wiki. The "Golden Scarab + Adamantine Pollen + Purple" recipe in section 9 is unconfirmed folklore — investigate before trusting.
> - **Flower Transmute uses ONE beetle, not two.** Wiki: `<rarity> beetle + Junk Cube → same-tier flower` (smash). The "Green sacrifice + beetle + Junk Cube" form in section 10 is not on the wiki. **CONFIRMED 2026-05-17 by user (in-game test): single-beetle form works.** The v12.4.18 userscript uses wiki-canonical recipes; section 10 below preserves the older (wrong) 3-input form for historical record only — do not act on it.
> - **5 new beetles** added to the wiki since April: Striped Cucumber (Bronze, drop only, non-transmutable), Bumblebee (Mithril, recipe unknown, non-transmutable), Black-Spotted Blue Longicorn (Mithril, `fringed_iris + mithril_beetle`), Golden-Spotted Tiger Beetle (Mithril, `larkspur + mithril_beetle`), Blue Death Feigning (Adamantine, `passionflower + adamantine_beetle`).
> - **8 new flowers** added: Chinese Pink Carnation, Common Snapdragon, Large White Petunia (all Tin); Spotted St. John's Wort, Southern Magnolia (Bronze); Fringed Iris, Two-spike Larkspur (Mithril); Purple Passionflower (Adamantine).
> - **Specimen Pin** is a 6th Adamantine artifact, recipe undocumented on wiki.
> - **Hammer post-first-use break chance bumps** — Adamantine 2%→5%, Diamond 1%→9%. Section 12 table has only base.
> - **Flower Reroll** (assemble, undocumented in section 4): `Junk Tesseract + Flower → different flower of same tier`. New tool.
> - **Daily reset rule** (section 13): every hammer gets one 0%-break smash per day after Universal Basic Cheese reset.
> - **Trinkets + Trophies** are an entire content domain absent below — see `WIKI_AUDIT.md` section F.4 + F.5. 9 trinkets + 15 trophies with documented recipes. First craft of a trinket recipe awards the Trophy version; subsequent crafts award the Trinket.
> - **Junk item count is 45**, not 27. Full list in `WIKI_AUDIT.md` section F.6.
> - **Sacrifice rules** (section 13): "Sacrifice is NOT part of the recipe. May change probability AND/OR rarity. Both Green and Purple work." The framing of "Green is for transmutation, Purple is for high tier" overstates it.
> - **Goliath / Stag / Bombardier are BOTH drop AND craft.** Earlier framing of "craft-only" is wrong.
> - **Cucumber + Bumblebee cannot be transmuted to flowers** — confirmed by wiki.
> - **External recipe DB**: `https://db.beetle.wiki/` is community-maintained, queryable lookup tool.
>
> Everything below this point is the 2026-04-07 baseline. Cross-check against `WIKI_AUDIT.md` before treating any specific recipe as authoritative.

---

## 1. Core game model

BeetleBoy / BeetleCraft is a tiered crafting game built from:
- beetles
- flowers
- junk
- pollens
- artifact materials
- hammers

There are two major craft modes:

### Assemble
- deterministic
- used for compression, hammer upgrades, key unlocks

### Smash
- probabilistic
- can succeed, fail-valid, or be fully invalid

### Very important distinction
- **Smash failed** = the recipe is real, but the attempt failed
- **Nothing happened** = the combo is invalid / dead

---

## 2. Important item families

### Beetles
- Green Beetle
- Ladybug
- Purple Beetle
- Pond Beetle
- Monarch
- Goliath Beetle
- Stag Beetle
- Bombardier Beetle
- Giraffe Weevil
- Pillbug
- Imperial Tortoise Beetle
- Sabertooth Longhorn Beetle
- Sunset Moth
- Mars Rhino Beetle
- Golden Scarab
- Hercules Beetle

### Flowers
- Daisy
- Poppy
- Sunflower
- Marigold
- Gallic Rose
- Milk Thistle
- Royal Poinciana
- Camellia
- Morning Glory
- Pincushion
- Gazania
- Black Lotus

### Bridge / artifact materials
- Nectar
- Cattail
- Pinecone
- Moss
- Gunpowder

### Pollens
- Tin Pollen
- Bronze Pollen
- Mithril Pollen
- Adamantine Pollen

### Junk economy
- Junk items
- Junk Cube
- Junk Tesseract

### Hammers
- Tin Hammer
- Bronze Hammer
- Mithril Hammer
- Adamantine Hammer
- Diamond Hammer

---

## 3. Tier model

### Beetle tiers
**Tin / common**
- Green Beetle

**Bronze**
- Ladybug
- Purple Beetle

**Mithril**
- Pond Beetle
- Monarch

**Adamantine**
- Goliath Beetle
- Stag Beetle
- Bombardier Beetle

**Higher / special**
- Giraffe Weevil
- Pillbug
- Imperial Tortoise Beetle
- Sabertooth Longhorn Beetle
- Sunset Moth
- Mars Rhino Beetle
- Golden Scarab
- Hercules Beetle

### Flower tiers
**Tin**
- Daisy
- Poppy
- Sunflower

**Bronze**
- Marigold
- Gallic Rose
- Milk Thistle

**Mithril**
- Royal Poinciana
- Camellia
- Morning Glory

**Adamantine**
- Pincushion
- Gazania

**Special**
- Black Lotus

---

## 4. Deterministic / assemble recipes

### Junk / compression
- Any 2 junk items -> Junk Cube
- 3 Junk Cubes -> Junk Tesseract

### Hammer ladder
- 2 Junk Cubes -> Tin Hammer
- Tin Hammer + Junk Tesseract + Tin Pollen -> Bronze Hammer
- Bronze Hammer + Junk Tesseract + Bronze Pollen -> Mithril Hammer
- Mithril Hammer + Junk Tesseract + Mithril Pollen -> Adamantine Hammer
- Adamantine Hammer + Junk Tesseract + Adamantine Pollen -> Diamond Hammer

### Key unlock
- Bronze Flower + Junk Cube -> BeetleBoy Key

Confirmed Bronze Flower alternatives for BeetleBoy Key:
- Marigold + Junk Cube
- Milk Thistle + Junk Cube

---

## 5. Pollen recipes

**IMPORTANT: Pollens are ASSEMBLE recipes (100% success rate), not smash.**
Confirmed by beetle.wiki. No hammer needed, no RNG.

### Tin Pollen
- Any 2 same-tier Tin flowers (ASSEMBLE)
- Daisy + Poppy, Daisy + Sunflower, Poppy + Sunflower

### Bronze Pollen
- Any 2 same-tier Bronze flowers (ASSEMBLE)
- Gallic Rose + Gallic Rose, Marigold + Milk Thistle, etc.

### Mithril Pollen
- Any 2 same-tier Mithril flowers (ASSEMBLE)
- Royal Poinciana + Camellia, Camellia + Morning Glory, etc.

### Adamantine Pollen
- Any 2 same-tier Adamantine flowers (ASSEMBLE)
- Pincushion + Gazania, etc.

---

## 6. Artifact bridge recipes

These are progression-critical because they bridge beetles into special materials.

### Bronze beetle + Bronze Pollen
Can produce:
- Nectar
- Cattail

Operational note:
- Purple Beetle sacrifice is often recommended

### Mithril beetle + Mithril Pollen
Can produce:
- Pinecone
- Moss
- Gunpowder

---

## 7. Core beetle crafting chain

### Early bridge
- Cattail + Ladybug -> Pond Beetle
- Nectar + Ladybug -> Monarch
- Nectar + Purple Beetle -> Monarch

### Mithril -> Adamantine bridge
- Gunpowder + Pond Beetle -> Bombardier Beetle
- Gunpowder + Monarch -> Bombardier Beetle
- Moss + Pond Beetle -> Stag Beetle
- Pinecone + Pond Beetle -> Goliath Beetle
- Pinecone + Monarch -> Goliath Beetle

---

## 8. Advanced flower-linked beetles

### Mithril-flower-linked
- Royal Poinciana + Pond Beetle -> Giraffe Weevil
- Royal Poinciana + Monarch -> Giraffe Weevil

- Camellia + Pond Beetle -> Pillbug
- Camellia + Monarch -> Pillbug

- Morning Glory + Pond Beetle -> Imperial Tortoise Beetle
- Morning Glory + Monarch -> Imperial Tortoise Beetle

### Adamantine-flower-linked
- Pincushion + Goliath Beetle -> Sabertooth Longhorn Beetle
- Pincushion + Stag Beetle -> Sabertooth Longhorn Beetle
- Pincushion + Bombardier Beetle -> Sabertooth Longhorn Beetle

- Gazania + Goliath Beetle -> Sunset Moth
- Gazania + Stag Beetle -> Sunset Moth
- Gazania + Bombardier Beetle -> Sunset Moth

---

## 9. Endgame recipes

### Black Lotus
- Gunpowder + Moss + Pinecone -> Black Lotus

### Mars Rhino Beetle
- Black Lotus + Sunset Moth + Sabertooth Longhorn Beetle -> Mars Rhino Beetle

Operational note:
- Purple Beetle sacrifice is commonly associated with high-tier success

### Hercules Beetle
- Golden Scarab + Adamantine Pollen + Purple Beetle -> Hercules Beetle

This is one of the important newer high-tier confirmed routes.

---

## 10. Flower transmutation rule

> **REVISED 2026-05-17 — wiki-canonical form confirmed in-game.** The text below this note is the older 3-input version that turned out to be wrong; preserved only for context.

### Canonical (2026-05-17, wiki + in-game confirmed)

**`<rarity> beetle + Junk Cube → same-tier flower`** (smash)

- Green Beetle + Junk Cube → random Tin flower
- Ladybug or Purple Beetle + Junk Cube → random Bronze flower
- Pond or Monarch + Junk Cube → random Mithril flower
- Goliath / Stag / Bombardier + Junk Cube → random Adamantine flower

Constraints:
- **One-way only.** Flower + Junk Cube does not produce a beetle.
- **Striped Cucumber Beetle and Bumblebee cannot be transmuted** (per beetle.wiki). The v12.4.18 script keeps them out of `BRONZE_BEETLES` / `MITHRIL_BEETLES` for this reason.
- **Diamond-tier beetles cannot be transmuted.** Golden Scarab + Junk Cube is a documented anti-recipe.

### Historical (pre-2026-05-17, wrong) — do not use

This section described a 3-input form: "Green Beetle sacrifice + beetle + Junk Cube → same-tier flower". Examples claimed Green+Green+Junk Cube → Sunflower, Green+Purple+Junk Cube → Gallic Rose, etc. The wiki documents only the 2-input form above and in-game testing on 2026-05-17 confirmed the single-beetle form works. Treat the 3-input claim as superseded.

---

## 11. Tier-up / RNG patterns

### Beetle tier-up
- 2 same-tier beetles (+ lower sacrifice) -> random higher-tier beetle
Examples discussed:
- 2 Purple Beetles -> Monarch / Pond style outcomes
- 2 Pond Beetles + Purple Beetle sacrifice -> Stag / Goliath / Bombardier type outcomes

### Flower tier-up
- 2 same-tier flowers -> higher-tier flower
- often fails
- should be treated as real but probabilistic

---

## 12. Hammer facts

### Confirmed hammer stats
| Hammer | Craft Bonus | Base Break | After First Use | Base Cost |
|--------|-------------|------------|-----------------|-----------|
| Tin | +0% | 10% | — | 4 (2 Junk Cubes) |
| Bronze | +5% | 5% | — | 13 |
| Mithril | +20% | 10% | — | 33 |
| Adamantine | +35% | 2% | 5% | 159 |
| Diamond | +90% | 1% | 9% | 1395 |

### DOM state detection (discovered in v8.6)
The game exposes three hammer states via CSS classes:
- `crafting-module__hammer-slot--empty` = BROKEN (was crafted, now broken, needs re-craft)
- no modifier = OWNED and available for use
- `crafting-module__hammer-slot--undiscovered` = never crafted this tier

This is real observed state, not simulated. The script tracks:
- `ownedHammers[]` — available (not broken) hammers
- `brokenHammers[]` — hammers that broke
- `discoveredHammers[]` — all ever crafted
- `currentHammer` — highest non-broken hammer

### Hammer recommendation rules (v8.7)
Match hammer to recipe value to avoid wasting expensive hammers:
- **Value 1-20** (Tin Pollen, Junk Tesseract): use cheapest available (Tin/Bronze)
- **Value 21-50** (bridges, pollen, Mithril beetles): use Bronze+
- **Value 51-75** (Adamantine beetles, Rare beetles): use Mithril+
- **Value 76+** (Epic beetles, endgame): use best available (Adamantine/Diamond)

### Operational hammer truths
- only one hammer per type at a time
- if a hammer breaks, you craft a replacement (script now recommends this)
- higher hammer is NOT automatically better EV for every recipe
- Bronze is the efficient workhorse (5% bonus, only 5% break)
- Mithril gives more bonus but same break risk as Tin (10%)
- Adamantine is the practical endgame hammer (35% bonus, only 2% break)
- Diamond has the highest bonus (+90%) but 9% break after first use — use selectively
- always re-craft broken cheap hammers before risking expensive ones on low-value crafts

---

## 13. Sacrifice theory

Practical sacrifice rule:

### Green Beetle
Commonly associated with:
- basic crafts
- early progression
- flower transmutation

### Purple Beetle
Commonly associated with:
- higher-tier routes
- advanced smash attempts
- better success odds on valuable crafts

This should be treated as operationally important even if exact hidden math is unknown.

---

## 14. Known dead / invalid combos

Confirmed bad tests:
- Bombardier Beetle + Goliath Beetle -> nothing
- Adamantine Beetle + Adamantine Pollen -> nothing
- Black Lotus + Black Lotus -> nothing
- Golden Scarab + Black Lotus -> nothing

Rule:
- if the game says “nothing happened,” treat the combo as dead until new evidence appears

---

## 15. Practical progression model

### Stage 1
- farm Green Beetles
- farm Ladybugs / Purple Beetles
- farm junk
- build Junk Cubes / Junk Tesseracts
- build Tin Hammer

### Stage 2
- transmute beetles into flowers
- build Tin / Bronze pollen
- use Bronze beetle + Bronze Pollen to generate Nectar / Cattail

### Stage 3
- craft Pond Beetle and Monarch

### Stage 4
- use Mithril beetle + Mithril Pollen for Pinecone / Moss / Gunpowder
- craft Goliath / Stag / Bombardier

### Stage 5
- push rare flowers and advanced beetles:
  - Giraffe Weevil
  - Pillbug
  - Imperial Tortoise Beetle

### Stage 6
- push Adamantine flower routes:
  - Sabertooth Longhorn Beetle
  - Sunset Moth

### Stage 7
- Black Lotus
- Mars Rhino Beetle
- Hercules Beetle

---

## 16. Best big-picture truths

- Junk is part of the economy engine, not trash
- flowers are progression fuel
- pollen is a bridge resource
- Green Beetle matters early
- Purple Beetle matters higher up
- better hammers should be used selectively
- “Smash failed” is useful data
- “Nothing happened” is a stop sign
- Black Lotus / Mars Rhino / Hercules are major endgame branches

---

## 17. Complete junk item list (27 known types)

All of these are raw junk items that can be combined into Junk Cubes:
coffee_can, red_whistle, cracker_wrapper, stamp, marble, bottle_cap,
ramune_bottle, wine_cork, green_army_man, scratch_off, cigarette_butt,
train_ticket_stub, chip_bag, chocolate_wrapper, jack_adapter, paperclip,
pebble, soda_can_tab, chocolate_bar, empty_noodle_cup, juicebox,
smiley_pebble, watch_battery, bike_reflector, pokkiri_box, rubber_band, gum_wrapper

Note: Skull is a BEETLE (Uncommon tier), not junk.
Note: Christmas Beetle is a special seasonal beetle.

---

## 18. Game timer mechanics

### Beetle Claim
- Free beetle every 2 hours
- Button: CLAIM BEETLE
- Timer shown in nav bar and on the catch module button
- Reward: 1 beetle + 1 junk item + XP

### Hunt Beetle
- Costs 20 cheese per hunt
- Can hunt 3-4 times, then 60 minute cooldown
- Timer shown in hunt button's cost area (shows "Xm Xs cooldown" or "20 Cheese" when ready)

### Daily Cheese
- Free cheese claim once every 24 hours
- Claimed from cheese cartridge (cartridge=cheese)
- Shows streak counter

---

## 19. DOM selectors for Beetle Coach script

### Timers
- Beetle Catch nav: `.beetle-game-nav .info span:last-child`
- Daily Cheese nav: `.cheese-claim-nav .info span:last-child`
- Claim cooldown: `.beetle-catch-module__cooldown-timer`
- Hunt cooldown: `.beetle-catch-module__hunt-button-cheese-cost`

### Inventory
- Catch module items: `.beetle-catch-module__beetle-item`
- Crafting module items: `.crafting-module__beetle-item:not(.crafting-module__hammer-slot)`
- Item images: background-image URL pattern `/beetle/images/icons/{category}/{name}.png`
- Item counts: `.beetle-catch-module__beetle-item-count` / `.crafting-module__beetle-item-count`
- Pagination: `.beetle-catch-module__pagination-button` / `.crafting-module__pagination-button`

### Hammer
- Row: `.crafting-module__hammer-row .crafting-module__hammer-slot`
- Undiscovered: `.crafting-module__hammer-slot--undiscovered`

### Other
- Level: `.beetle-card__level`
- Craft mode: `.crafting-module--smash` (class present = Smash mode)
- Claim button: `.beetle-catch-module__catch-button:not(.disabled):not(.disconnected)`
- Hunt button: `.beetle-catch-module__hunt-button:not(.disabled):not(.disconnected)`

---

## 20. Beetle Coach Tampermonkey script (v10.3)

The companion script is `beetle_coach.user.js` in this directory.
GitHub: https://github.com/MeridianAnalytics/BeetleCoach

### Core automation
- Auto-claim beetle every 2 hours (30s debounce, 12s post-action rescan)
- Auto-hunt beetle (15s debounce, costs 20 cheese, 100 cheese reserve)
- Auto-claim daily cheese
- Smart navigation: auto-navigates to beetle cartridge when claim/hunt ready
- Post-action hybrid refresh: immediate passiveScan + delayed fullScan 30s later
- Strategy toggle: Endgame (Mars Rhino path) or Broad (collect everything)

### Scanning
- Layered item extraction: background-image → img src → alt/title
- Pagination with fingerprinting (stops when content doesn't change)
- Full scan (with pagination, authoritative inventory) on boot + manual
- Passive scan every 30s (visibility-gated, confirms existing items, adds validated new drops)
- Three-band freshness: fresh (green) / warming (amber) / stale (red)
- Unresolved node count logged per scan

### Recommendations
- Smart group consumption: non-collectibles first, duplicates before singletons, strategic value ranking (Ladybug before Purple for bronze beetle tokens)
- Collection protection: never consume last copy of a collected beetle/flower
- Endgame ingredient protection: preserves Black Lotus, Sunset Moth, Sabertooth for Mars Rhino; Golden Scarab, Adamantine Pollen for Hercules
- Already-owned filter: won't recommend crafting beetles you already have (exception: items needed as ingredients for higher recipes)
- 2-step chains with cross-plan consumption simulation and output crediting
- SAFE/RNG badges on craftable recipes

### Hammer intelligence
- Live break% from game tooltip: hovers hammer slot, reads CURRENT BREAK CHANCE
- Persists live reading until hammer changes (not overwritten by refreshTimers)
- Real DOM state detection: owned / broken / undiscovered via CSS classes
- Hammer recommendation per recipe based on value (cheap hammer for low-value, premium for high-value)
- Broken hammer re-craft suggestions
- Status strip shows broken hammers in red

### Display
- Session stats: claims, hunts, cheese claims, gained beetles, duration
- Resource planner: bill of materials for missing collection goals
- Progression tracker: 7-stage bar with next goals
- Collection tracker: beetles X/18, flowers X/12, missing list
- Inventory with tier badges, junk consolidation
- Activity log with timestamps
- Minimize via beetle emoji click in header

### Goal-directed progression engine (v9.2)
- PROGRESSION_CHAIN defines the full collection path: Goliath → Sunset Moth → Black Lotus → Mars Rhino → Hercules
- getProgressionMove() finds the NEXT concrete step that advances the collection, not just what's craftable
- Progression moves get priority + green GOAL badge in the UI
- If progression is blocked, shows what's needed and how to get it
- Fills remaining recommendation slots with direct crafts sorted by value

### Inventory export
- Export button downloads JSON snapshot (inventory, collection, session, missing items)
- Console log on every full scan: [BeetleCoach] Inventory snapshot: {...}
- Useful for pasting into AI conversations or tracking progress over time

### Architecture
- Single IIFE, single file, no dependencies
- Store: Tampermonkey GM_getValue/GM_setValue with v7→v8 migration
- All DOM IDs use bc8- prefix
- Conservative automation: won't act on stale data, explicit logging for every action and skip

---

## 21. Corrections from beetle.wiki (April 2026)

Source: https://beetle.wiki/doku.php?id=crafted_items

### Pollens are ASSEMBLE, not smash
All pollen recipes (Tin, Bronze, Mithril, Adamantine) are deterministic assemble recipes
with 100% success rate. They are NOT probabilistic smash recipes.

### Droppable high-tier beetles
The following beetles can drop from catches (not only craftable):
- Goliath Beetle (Adamantine rarity)
- Stag Beetle (Adamantine rarity)
- Golden Scarab (Diamond rarity) — this is the only way to get one

### Holiday beetles (seasonal)
- Skullbug (Halloween, Mithril)
- Black Widow (Halloween, Diamond)
- Christmas Beetle (Christmas, Mithril)
- Candycane Tiger Moth (Christmas, Diamond)

### Tier-up recipe (unreliable)
- 2 Bronze beetles + 2 Bronze flowers -> Mithril beetle (smash, very low success)
- Wiki explicitly says "Do NOT rely on this to work"

### Transmutation is generic pattern
- Same-rarity beetle + Junk Cube -> flower of that tier (one-way, smash)
- Works for all tiers (Tin through Adamantine)

---

## 22. Anti-recipes (confirmed dead combos from beetle.wiki)

Source: https://beetle.wiki/doku.php?id=antirecipes

### Tin tier dead combos
- Tin Pollen + Tin Pollen
- Tin Pollen + Green Beetle
- Tin Pollen + Junk Cube
- Poppy + Junk Cube

### Bronze tier
- Purple Beetle + Moss

### Mithril tier
- Cattail + Cattail
- Nectar + Nectar + Nectar
- Nectar + Nectar + Cattail
- Pond + Monarch + Moss
- Pond + Monarch + Mithril Pollen
- Imperial Tortoise + Giraffe Weevil + Pillbug
- Camellia + Nectar + Cattail

### Adamantine tier
- Goliath + Gunpowder + Moss
- Bombardier + Bombardier + Gunpowder
- Bombardier + Bombardier + Moss
- Stag + Adamantine Pollen
- Adamantine Pollen + Cattail + Nectar
- Adamantine Pollen + Mithril Pollen + Pond

### Diamond tier
- Golden Scarab + Junk Cube
- Golden Scarab + Black Lotus
- Golden Scarab + Mars Rhino
- Golden Scarab + Mars Rhino + Black Lotus
- Golden Scarab x3
- Golden Scarab x2 + Mars Rhino
- Golden Scarab + Mars Rhino x2
- Mars Rhino x3

### Key anti-recipe insight
Golden Scarab does NOT combine with Black Lotus or Mars Rhino.
The only known Hercules recipe is: Golden Scarab + Adamantine Pollen + Purple Beetle.

---

## 23. What future AI should do with this file

If this file is pasted into a future AI conversation, the AI should:
1. treat this as the current known baseline
2. not re-argue already settled recipes
3. separate deterministic crafts from probabilistic smashes
4. separate known dead combos from real recipe families
5. prioritize practical, account-specific recommendations over abstract discussion
6. reference the DOM selectors in section 19 for any script work
7. reference the junk list in section 17 when classifying items
