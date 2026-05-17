# BeetleBoy / BeetleCraft Knowledge Base
_Last updated: 2026-05-17 (v12.4.18 — see WIKI_AUDIT.md for the full 2026-05-17 wiki scrape)_

> **2026-05-17 note:** This doc is the 2026-04-07 baseline. A fresh beetle.wiki audit lives in `WIKI_AUDIT.md`; deltas summarized at the top of `beetle_known_recipes_human_readable.md`. Key things to know up front:
> - 5 new beetles (cucumber, bumblebee, blue_longicorn, golden_tiger, death_feigning) and 8 new flowers (carnation, snapdragon, petunia, st_johns_wort, magnolia, fringed_iris, larkspur, passionflower) now exist.
> - Specimen Pin is a 6th Adamantine artifact.
> - Trinket + Trophy crafting is an entire domain absent from this doc — see `WIKI_AUDIT.md` sections F.4–F.5.
> - Flower Transmute is single-beetle + Junk Cube (not 3-input "green + beetle + junk").
> - Hercules recipe is not on the wiki — treat as folklore until verified in-game.
> - Hammer post-first-use break: Adamantine 2%→5%, Diamond 1%→9%.

This document is a durable handoff/reference file for future AI conversations about the RemiliaNET BeetleBoy / BeetleCraft game.

It is written to be:
- practical
- structured
- explicit about confidence
- useful both for strategy and for tooling/code work

## 1. What the game is

BeetleBoy / BeetleCraft is a browser-based collection + crafting game inside RemiliaNET centered around:
- collecting beetles
- collecting junk
- collecting flowers
- converting those resources through **assemble** and **smash** recipes
- climbing from low-tier/common items toward high-tier/endgame beetles and hammers
- managing uncertainty, because many **smash** recipes are probabilistic rather than guaranteed

The game appears to have two important crafting modes:

### Assemble
- deterministic
- used for things like:
  - Junk Cube
  - Junk Tesseract
  - Hammer upgrades
  - BeetleBoy Key
- if you have the correct inputs, this is treated as the safest / most reliable path

### Smash
- probabilistic / RNG-weighted
- used for:
  - many flower/beetle conversions
  - artifact generation
  - tier-up attempts
  - most interesting/endgame beetle crafts
- results can include:
  - success
  - valid recipe but failed ("smash failed")
  - invalid combo ("nothing happened")

## 2. Core terminology

### Beetles
The main creature/resource ladder.

Known important beetles:
- Green
- Ladybug
- Purple
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
Tier-linked outputs and crafting materials.

Known important flowers:
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

### Artifacts / intermediates
Bridge items between tiers:
- Nectar
- Cattail
- Pinecone
- Moss
- Gunpowder

### Pollens
Tier-linked support materials:
- Tin Pollen
- Bronze Pollen
- Mithril Pollen
- Adamantine Pollen

### Junk
Low-tier miscellaneous items used for economy/compression/transmutation.
Also includes:
- Junk Cube
- Junk Tesseract

### Hammers
Tool ladder for smash/upgrade progression:
- Tin Hammer
- Bronze Hammer
- Mithril Hammer
- Adamantine Hammer
- Diamond Hammer (known in theory/path, not always surfaced in inventory depending on player progression)

## 3. Tier model

A useful mental model is that the game has item families tied to tiers.

### Beetle tiers
**Tin / common**
- Green

**Bronze**
- Ladybug
- Purple

**Mithril**
- Pond Beetle
- Monarch

**Adamantine**
- Goliath
- Stag
- Bombardier

**Higher / special / endgame**
- Giraffe Weevil
- Pillbug
- Imperial Tortoise Beetle
- Sabertooth Longhorn
- Sunset Moth
- Mars Rhino
- Golden Scarab
- Hercules

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

## 4. The most important game-logic distinction

### "Smash failed"
Interpretation:
- the combination is a **real recipe**
- the attempt failed due to RNG / probability / hammer / sacrifice / weighting factors

### "Nothing happened"
Interpretation:
- the combination is **invalid**
- stop testing it unless new evidence appears

This distinction is one of the most important known mechanics because it means structured logging has real value.

## 5. Known deterministic recipes (Assemble)

These are treated as the safest known recipes.

### Junk / compression
- Any Junk x2 -> Junk Cube
- Junk Cube x3 -> Junk Tesseract

### Hammer chain
- Junk Cube x2 -> Tin Hammer
- Tin Hammer + Junk Tesseract + Tin Pollen -> Bronze Hammer
- Bronze Hammer + Junk Tesseract + Bronze Pollen -> Mithril Hammer
- Mithril Hammer + Junk Tesseract + Mithril Pollen -> Adamantine Hammer
- Adamantine Hammer + Junk Tesseract + Adamantine Pollen -> Diamond Hammer

### Unlock
- Bronze Flower + Junk Cube -> BeetleBoy Key
- Confirmed alternatives for BeetleBoy Key:
  - Marigold + Junk Cube
  - Milk Thistle + Junk Cube

## 6. Known pollen recipes

Pollen recipes are deterministic assemble recipes, not smash.

### Tin Pollen
- Any 2 same-tier common/Tin flowers
- Practical examples:
  - Daisy + Poppy
  - Poppy + Sunflower
  - Daisy + Sunflower

### Bronze Pollen
- Gallic Rose x2
- More generally treated as:
  - same-tier Bronze flowers x2

### Mithril Pollen
- same-tier Mithril flowers x2

### Adamantine Pollen
- same-tier Adamantine flowers x2

## 7. Artifact bridge recipes

These are extremely important because they bridge beetle tiers into special intermediates.

### Bronze beetle + Bronze pollen
Output:
- Nectar OR Cattail

Known/claimed forms:
- Bronze Beetle + Bronze Pollen
- Ladybug + Bronze Pollen
- Purple sacrifice often appears as optional/recommended

### Mithril beetle + Mithril pollen
Output:
- Pinecone OR Moss OR Gunpowder

Known/claimed forms:
- Pond/Monarch + Mithril Pollen

These artifact recipes are strategically critical because they unlock the next tier of beetle crafting.

## 8. Flower transmutation rules

One of the biggest practical discoveries:
**Green sacrifice + beetle + Junk Cube -> same-tier flower**

This is massively important because it means flowers can be farmed/targeted from beetles rather than only discovered through blind smashing.

Confirmed examples:
- Green Beetle + Green Beetle + Junk Cube -> Sunflower
- Green Beetle + Purple Beetle + Junk Cube -> Gallic Rose
- Green Beetle + Pond/Stag/Goliath + Junk Cube -> matching-tier higher flower
- Pattern: matching-tier beetle + Junk Cube with Green sacrifice yields a same-tier flower

Practical value:
- this is a key farming/transmutation engine
- lets you build flower stockpiles for pollen creation
- lets you move from beetle inventory into flower inventory intentionally

## 9. Confirmed beetle crafting chain

### Early bridge
- Cattail + Ladybug -> Pond Beetle
- Nectar + Ladybug -> Monarch
- Nectar + Purple -> Monarch

### Mithril -> Adamantine bridge
- Gunpowder + Pond/Monarch -> Bombardier Beetle
- Moss + Pond -> Stag Beetle
- Pinecone + Pond/Monarch -> Goliath Beetle

### Flower-linked advanced beetles
- Royal Poinciana + Pond/Monarch -> Giraffe Weevil
- Camellia + Pond/Monarch -> Pillbug
- Morning Glory + Pond/Monarch -> Imperial Tortoise Beetle

### Adamantine flower-linked advanced beetles
- Pincushion + Stag/Bombardier/Goliath -> Sabertooth Longhorn Beetle
- Gazania + Goliath/Bombardier/Stag -> Sunset Moth

### Endgame chain
- Gunpowder + Moss + Pinecone -> Black Lotus
- Black Lotus + Sunset Moth + Sabertooth Longhorn -> Mars Rhino Beetle

### New high-tier known recipe
- Golden Scarab + Adamantine Pollen + Purple sacrifice -> Hercules Beetle

## 10. Sacrifice rules / sacrifice theory

The compiled evidence suggests a rough sacrifice pattern:

### Green sacrifice
Used more often for:
- basic crafts
- early-tier conversions
- flower transmutation
- early bridge crafts like Pond

### Purple sacrifice
Used more often for:
- higher-tier crafts
- tier-up crafts
- advanced beetles
- endgame crafts
- difficult / rarer smash outcomes

### Practical interpretation
Purple sacrifice is likely improving one or more of:
- success rate
- weighting toward higher-tier outcome
- access to a specific recipe branch
- probability of getting the intended result rather than a sibling result

This should be treated as an important operational heuristic even where the exact internal weighting is unknown.

## 11. Tier-up pattern theory

Known from compiled evidence:

### Beetle tier-up
- 2x same-tier beetles (+ lower sacrifice) -> random higher-tier beetle
- Example: 2 Pond + Purple sacrifice -> Stag Beetle
- More generally this seems to be a risky/probabilistic tier-up rule

### Flower tier-up
- 2x same-tier flowers -> higher flower tier
- often fails
- probably RNG-weighted
- should be treated as real but not deterministic

### Strategic value
Tier-up attempts can be strong if:
- the inputs are cheap
- the target tier is otherwise bottlenecked
- the player has enough inventory buffer
- the hammer quality is appropriate

Tier-up attempts are dangerous if:
- they consume protected materials
- they consume rare flowers
- they consume high-tier beetles without a good upside case

## 12. Hammers: known facts

### Known hammer ladder
- Tin
- Bronze
- Mithril
- Adamantine
- Diamond

### Known theory
Hammers matter most for **smash** attempts, not assemble recipes.

Strongly suspected effects:
- better hammer = higher success rate
- better hammer = safer high-tier attempts
- hammer and sacrifice quality likely interact
- smash recipes with rare outputs are more likely to need better hammer quality

### Practical hammer strategy
**Tin Hammer**
- low-risk experiments
- cheap attempts
- junk or early-tier testing

**Bronze Hammer**
- mid-tier documented recipes
- controlled experiments where inputs are replaceable

**Mithril Hammer**
- more serious mid/high-tier attempts
- use selectively

**Adamantine Hammer**
- reserve for highly valuable or clearly documented high-tier paths

**Diamond Hammer**
- theoretical top-end tool; likely should only be used on very high-value, very real recipes

## 13. Hammer theory / break theory

The exact internals are not fully known, but the operating theory should be:

- Smash recipes are probabilistic
- Better hammer likely raises success rate
- Better sacrifice likely raises success rate
- Higher-tier recipes likely have lower baseline success
- There may be hidden weighting by tier match and/or valid recipe branch

Historically discussed ideas include:
- daily reset behavior affecting hammer risk feel
- hammer upgrade path being partly a way to stabilize high-tier smashing
- some "failed" smashes preserving recipe reality, which is why logging matters

Conservative operational stance:
- never waste best hammers on vague guesses
- use documented recipes first
- use better hammers when the inputs are expensive and the recipe is known real
- avoid using rare hammers to test unproven nonsense

## 14. Weighting / RNG theory

The game likely uses weighting in several places:

### Artifact generation weighting
Bronze beetle + Bronze pollen can produce:
- Nectar
- Cattail

Mithril beetle + Mithril pollen can produce:
- Pinecone
- Moss
- Gunpowder

This implies:
- one input set can map to multiple valid outputs
- sacrifice / hammer may influence which one appears
- some outputs may be rarer than others

### Tier-up weighting
2 same-tier beetles / flowers do not necessarily deterministically become one exact higher-tier output.
Likely:
- RNG picks among a small output family
- failure chance exists
- sacrifice and hammer improve odds

### Endgame weighting
Recipes like:
- Black Lotus
- Mars Rhino
- Hercules
almost certainly sit at the hard end of the weighting curve

## 15. Invalid / disproven combos

Confirmed bad / nothing results:
- Bombardier + Goliath (+ Purple) -> nothing
- Adamantine Beetle + Adamantine Pollen -> nothing
- 2x Black Lotus -> nothing
- Gold Scarab + Black Lotus alone -> nothing

General rule:
- mismatched-tier smashes without proper sacrifice/flower support are often bad
- if the game says "nothing happened," treat it as dead until new evidence appears

## 16. Best practical progression model

A useful progression ladder is:

### Stage 1: low-tier collection
- stack Green
- stack Ladybug / Purple
- stack Junk
- build Junk Cube / Junk Tesseract
- build Tin Hammer

### Stage 2: flower and pollen economy
- transmute beetles into flowers
- build Tin/Bronze pollen
- use Bronze beetle + Bronze pollen to generate Nectar/Cattail

### Stage 3: unlock Pond / Monarch
- Cattail + Ladybug -> Pond
- Nectar + Ladybug or Purple -> Monarch

### Stage 4: artifact bridge to Adamantine
- Mithril beetle + Mithril pollen -> Pinecone/Moss/Gunpowder
- use those to make:
  - Goliath
  - Stag
  - Bombardier

### Stage 5: advanced flowers / advanced beetles
- transmute into Royal Poinciana / Camellia / Morning Glory
- craft:
  - Giraffe Weevil
  - Pillbug
  - Imperial Tortoise

### Stage 6: Adamantine flower path
- Pincushion / Gazania
- craft:
  - Sabertooth Longhorn
  - Sunset Moth

### Stage 7: endgame
- Black Lotus
- Mars Rhino
- Hercules
- future unknowns / hidden branches

## 17. Operational priorities for a player account

The most important recurring strategic principles are:

### Protect these
- Bronze/Mithril/Adamantine pollen
- Junk Tesseract
- rare flowers
- Black Lotus
- Golden Scarab
- higher hammers
- advanced beetles

### Farm these
- Green
- Ladybug / Purple
- Junk
- Tin/Bronze flowers
- documented artifact bridge inputs

### Use documented deterministic recipes first
Especially:
- hammer chain
- key
- compression
- pollen

### Treat rare smashes as informed bets, not casual clicks
Especially:
- Black Lotus
- Mars Rhino
- Hercules
- higher-tier flower tier-ups

## 18. The code/tooling we built conceptually

The helper script direction evolved toward a persistent **Beetle Coach** with these goals:

### Persistence
- use Tampermonkey storage:
  - `GM_setValue`
  - `GM_getValue`
- browser restarts should not wipe state
- removing the script or clearing its storage would wipe it

### Scanning
- auto-scan visible inventory
- merge scans across pagination / pages
- preserve merged inventory as a persistent snapshot

### Current input detection
- read current crafting slots
- exclude hammer slots from ingredient detection
- remember the current combination before/while crafting

### Activity parsing
- attempt to read page activity/log text
- interpret:
  - assembled -> success
  - smash failed -> valid recipe failed
  - nothing happened -> invalid

### Recipe memory
- store local successes
- store local invalids
- show recipe book
- show dead combos

### Decision engine UX
The script should present:
- Best move now
- What to do next
- Known safe/documented crafts
- Protect these items
- One ingredient away
- Avoid these combos
- Recipe book
- Merged inventory

### Recommendation engine logic
It should rank:
1. deterministic upgrades
2. high-confidence documented crafts
3. high-value experiments
4. avoid invalids and protect rare materials

## 19. Code direction / design philosophy for future tool work

Future AI or code work should keep these priorities:

### Legibility
- no debug-clutter UI
- plain English labels
- sectioned dashboard
- top action first

### Utility
- single best next move
- ranked queue
- explicit "protect" section
- explicit "one ingredient away" section

### Persistence
- durable storage
- exportable state
- easy copy/paste into AI chats

### Insight
- distinguish deterministic vs probabilistic
- distinguish documented vs inferred
- distinguish safe crafts vs experiments
- track invalid combinations aggressively

## 20. Best future improvements for the script

### High value
- parse more exact in-game log text
- detect sacrifice beetles explicitly
- detect selected hammer explicitly
- infer current bench mode (assemble vs smash)
- show recipe confidence badges
- show deterministic vs risky badge

### Very high value
- support a full recipe DB with:
  - exact recipe
  - pattern recipe
  - invalid recipe
  - sacrifice notes
  - confidence
  - source note

### Best UX improvements
- "Best move now"
- "Best safe craft"
- "Best experiment"
- "You are one ingredient away"
- "Do not waste these"
- "Recently disproven"
- "Likely because of sacrifice / hammer"

## 21. Confidence summary

### High confidence
- hammer chain
- junk compression
- key unlock
- pollen same-tier rule
- bronze/mithril pollen artifact bridge
- Pond / Monarch / Bombardier / Goliath / Stag
- Giraffe / Pillbug / Imperial Tortoise
- Sabertooth / Sunset Moth
- Mars Rhino
- Hercules
- Green sacrifice flower transmutation
- major invalid combos listed above

### Medium / partial
- Black Lotus is real, but observed as failure-prone
- exact weighting of artifact outputs
- exact hammer success multipliers
- exact internal sacrifice math
- full Adamantine flower edge cases
- all hidden future branches after Hercules

## 22. Practical instructions for future AI conversations

If this document is pasted into a future conversation, the AI should:
1. treat this as the current best known baseline
2. not re-argue already settled recipes
3. separate:
   - deterministic crafts
   - probabilistic crafts
   - invalid combos
4. prioritize operator usefulness over abstract discussion
5. recommend next moves based on:
   - current inventory
   - documented paths
   - protection of rare resources
   - avoidance of dead combos

## 23. Short tactical summary

If you had to boil the game down into one sentence:
**BeetleBoy is a tiered crafting economy where low-tier beetles and junk are converted into flowers, pollen, artifacts, advanced beetles, hammers, and finally endgame outputs through a mix of deterministic assembly and weighted probabilistic smashing.**

## 24. Current “big picture” strategic truths

- Junk is not trash; it is part of the economy engine.
- Flowers are not decorative; they are core progression fuel.
- Pollen is a bridge resource, not just a side item.
- Green sacrifice matters early.
- Purple sacrifice matters high up.
- Better hammers should be reserved for known high-value smash lines.
- "Smash failed" is useful data.
- "Nothing happened" is a stop sign.
- Black Lotus, Mars Rhino, Hercules, and related branches are where endgame logic lives.
