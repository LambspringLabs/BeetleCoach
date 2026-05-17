# beetle.wiki Audit — Structured Factual Scrape
Scraped: 2026-05-17 against beetle.wiki (DokuWiki). Source URLs listed under each section. Where the wiki is ambiguous or a page is empty, that is preserved. Where my facts contradict the existing C:\BeetleCoach knowledge base, the delta is flagged with "**DELTA:**".

---

## A. Recipes (assemble + smash)

Source: https://beetle.wiki/doku.php?id=crafted_items (raw export captured)

### A.1 Assembled Recipes (100% success rate)

#### Higher Dimensional Junk
| Recipe | Output |
|--------|--------|
| Any Junk item x2 (e.g. bottle_cap + marble) | Junk Cube |
| Junk Cube x3 | Junk Tesseract |

#### Hammers (max 1 per type)
| Recipe | Output | Stats |
|--------|--------|-------|
| Junk Cube + Junk Cube | Tin Hammer | Base Break 10% |
| Tin Hammer + Junk Tesseract + Tin Pollen | Bronze Hammer | Bonus +5%, Break 5% |
| Bronze Hammer + Junk Tesseract + Bronze Pollen | Mithril Hammer | Bonus +20%, Break 10% |
| Mithril Hammer + Junk Tesseract + Mithril Pollen | Adamantine Hammer | Bonus +35%, Break 2%, **5% after first use** |
| Adamantine Hammer + Junk Tesseract + Adamantine Pollen | Diamond Hammer | Bonus +90%, Break 1%, **9% after first use** |

**DELTA:** Our doc has Mithril Hammer at break "10%". Wiki confirms 10% — correct. Our doc does not currently capture the "post-first-use" stat for Adamantine (5%) and Diamond (9%). Add these.

#### Key
| Recipe | Output | Use |
|--------|--------|-----|
| Bronze Rarity Flower + Junk Cube | BeetleBoy Key | Unlocks 3rd slot on **both** the ASSEMBLY and SMASH workbench. Permanent. |

#### Pollens (assemble)
| Recipe | Output |
|--------|--------|
| Tin Flower + Tin Flower | Tin Pollen |
| Bronze Flower + Bronze Flower | Bronze Pollen |
| Mithril Flower + Mithril Flower | Mithril Pollen |
| Adamantine Flower + Adamantine Flower | Adamantine Pollen |

Note from protips: pollen recipe is "more complicated than previously thought". Specifically, **2× Cattail does NOT make Mithril Pollen** (even though Cattail is Mithril rarity). Morning Glory + Camellia (two different Mithril flowers) does produce Mithril Pollen, and "double Mithril flowers work well for pollen". Cattail is an *artifact*, not a *flower*, which is presumably why — but the wiki preserves this as folklore-confusion-worthy.

#### Flower Reroll (assemble — undocumented in our KB)
**DELTA: NEW**
| Recipe | Output |
|--------|--------|
| Junk Tesseract + Flower | Different flower of the **same tier** |
| Junk Tesseract + Morning Glory | Camellia (example) |
| Junk Tesseract + Gazania | Pincushion (example) |

This is an assemble recipe (100% success). Use it to convert one flower into a random sibling of the same rarity. Our KB doesn't have this.

---

### A.2 Smashed Recipes

#### Tier-Up (RNG, **don't rely on**)
| Recipe | Output |
|--------|--------|
| Bronze Beetle x2 (e.g. Ladybug x2) | Mithril Beetle (e.g. Monarch) |
| Bronze Flower x2 (e.g. Milk Thistle x2) | Mithril Flower (e.g. Morning Glory) |

Wiki warning: "hammer breaks really predictably in this recipe — try 2 times in sequence and it's likely guaranteed to break". Wiki advises preferring transmutation/artifacts over tier-up. **Wiki does NOT show tier-up recipes beyond Bronze→Mithril** (no Mithril→Adamantine or Adamantine→Diamond listed); the implication is that higher-tier upgrades go through artifacts.

#### Artifacts — Creating (RNG)
| Recipe | Possible Outputs |
|--------|------------------|
| Bronze Beetle (Ladybug or Purple) + Bronze Pollen | Nectar OR Cattail |
| Mithril Beetle (Pond or Monarch) + Mithril Pollen | Pinecone OR Moss OR Gunpowder |

**DELTA:** Our KB says "Nectar/Cattail = bronze_beetle + bronze_pollen" — correct, and it's RNG between the two. Our KB lists "Pinecone/Moss/Gunpowder = mithril_beetle + mithril_pollen" — correct, RNG between the three.

#### Artifacts — Using (deterministic on success)
| Recipe | Output |
|--------|--------|
| Nectar + Ladybug | Monarch |
| Cattail + Ladybug | Pond Beetle |
| Pinecone + Pond | Goliath Beetle |
| Moss + Pond | Stag Beetle |
| Gunpowder + Pond | Bombardier Beetle |
| Gunpowder + Moss + Pinecone | **Black Lotus** |

**DELTA:** Our KB says "Goliath = pinecone + pond/monarch", "Stag = moss + pond", "Bombardier = gunpowder + pond/monarch". The wiki recipes table only shows "+ Pond" for these three, not "+ Monarch". However the protips page mentions interchangeability of Monarch and Pond on flower crafts, so it's ambiguous whether Monarch substitutes for Pond on the Goliath/Stag/Bombardier recipes — the canonical recipe is Pond. **Tighten our KB to "+ Pond" as primary; Monarch may also work but is not the documented form for artifact-use.**

#### Beetle → Flower Transmutation
| Recipe | Output |
|--------|--------|
| Tin Beetle (Green) + Junk Cube | Tin Flower |
| Bronze Beetle (Ladybug) + Junk Cube | Bronze Flower |
| Mithril Beetle (Pond) + Junk Cube | Mithril Flower |
| Adamantine Beetle (Stag) + Junk Cube | Adamantine Flower |

Notes from wiki:
- One-way: flower + Junk Cube does NOT produce a beetle. "SAD!!!"
- **Striped Cucumber Beetle and Bumblebee CANNOT be transmuted** — "Special beetles like Striped Cucumber Beetle and Bumblebee cannot be transmuted into flowers."
- No mention of Diamond transmute — and antirecipes confirms "Golden Scarab + Junk Cube" fails with the note "Can't convert diamond tier beetles back to flowers".

**DELTA — important:** Our KB has recipes like:
- "Bronze Flower Transmute = green + purple + junk_cube"
- "Mithril Flower Transmute = green + mithril_beetle + junk_cube"
- "Adamantine Flower Transmute = green + adamantine_beetle + junk_cube"

These are **NOT documented anywhere on the wiki**. The wiki only documents beetle + Junk Cube = same-tier flower (one item, not two). The "green +" version is either folklore not on the wiki, or wrong. **Verify in-game or remove from our KB.** The canonical recipe is **single beetle + Junk Cube → same-tier flower**.

#### Flower Beetlecraft (guaranteed output on success)
| Recipe | Output |
|--------|--------|
| Royal Poinciana + Mithril Beetle (e.g. Pond) | Giraffe Weevil |
| Camellia + Mithril Beetle | Pillbug |
| Morning Glory + Mithril Beetle | Imperial Tortoise Beetle |
| Pincushion + Adamantine Beetle (e.g. Stag) | Sabertooth Longhorn Beetle |
| Gazania + Adamantine Beetle | Sunset Moth |
| Black Lotus + Sabertooth Longhorn + Sunset Moth | **Mars Rhino Beetle** |

#### New Special Beetle Smashes (own table section on wiki, distinct from above)
| Recipe | Output |
|--------|--------|
| Fringed Iris + Mithril Beetle (e.g. Pond) | Black-Spotted Blue Longicorn |
| Larkspur (Two-spike) + Mithril Beetle | Golden-Spotted Tiger Beetle |
| Purple Passionflower + Adamantine Beetle (e.g. Stag) | Blue Death Feigning Beetle |

**DELTA — important:** Our KB has:
- "Hercules = golden_scarab + adamantine_pollen + purple" — **NOT on the wiki**. There is no "Hercules Beetle" page at `beetle:hercules` (returns "topic does not exist") and no Hercules entry in the beetle:start namespace listing. **Likely fabricated or pre-Christmas-update; remove from our KB unless verified in-game.**
- "Mars Rhino = black_lotus + sunset_moth + sabertooth_longhorn" — confirmed. (Wiki lists Sabertooth Longhorn first — order is irrelevant.)
- Our KB doesn't have the three "New Special Beetle Smashes" (Blue Longicorn, Golden Tiger, Blue Death Feigning). **Add these.**

#### Sacrifice Rules (verbatim)
> **NOTE on Sacrificial Beetles:**
> - As far as I can tell the sacrificial beetle is *not* part of the recipe
> - It *may* change the probability of success or failure of the crafting attempt.
> - It *may* alter the rarity of the output (for example, the Pond + Pond smash recipe with Purple sacrifice = Goliath, while Green sacrifice output Monarch) YMMV!

Protips elaboration:
> Think about why i let you use either green or purple beetles for sacrifices. a purple beetle IS more rare than a green beetle, after all. but they're of the same genus. interdasting.

**DELTA:** Wiki documents BOTH Green and Purple as valid sacrifices, and explicitly states sacrifice "may" alter probability AND rarity of output — concrete example: Pond+Pond with Purple gave Goliath, with Green gave Monarch. So Purple *may* upgrade the result one tier. Our KB has "sacrifice Purple Beetle" on the crafted-beetle recipes — that overstates it. **Update KB to note: Purple is optional, Green also works, Purple may improve odds and/or upgrade output rarity, both YMMV.**

---

## B. Anti-recipes (dead combos — "NOTHING HAPPENED")

Source: https://beetle.wiki/doku.php?id=antirecipes (raw export)

Wiki definition: **NOTHING HAPPENED** = recipe doesn't exist; **SMASH FAILED** = recipe is correct but RNG failed (ingredients returned).

### TIN
- Tin Pollen + Tin Pollen
- Tin Pollen + Tin Pollen + Junk Cube
- Tin Pollen + Green
- Tin Pollen + Green + Junk Cube
- Tin Pollen + Green + Green
- Tin Pollen + Junk Cube
- Tin Pollen + Junk Cube + Junk Cube
- Tin Pollen + Green + Junk Tesseract
- Tin Pollen + Daisy + Junk Tesseract
- Tin Pollen + Daisy
- Tin Pollen + Daisy + Daisy
- Daisy + Daisy + Daisy ("GAAAAAAYYYYY!!!")
- Poppy + Junk Cube ("Was seeing if smashing flowers with junkcubes worked")

### BRONZE
- Purple + Moss

### MITHRIL
- Cattail + Cattail
- Nectar + Nectar + Nectar
- Nectar + Nectar + Cattail
- Pond + Monarch + Moss
- Pond + Monarch + Mithril Pollen
- Imperial Tortoise + Giraffe Weevil + Pillbug
- Camellia + Nectar + Cattail

### ADAMANTINE
- Goliath + Gunpowder + Moss
- Bombardier + Bombardier + Gunpowder
- Bombardier + Bombardier + Moss ("Can a WN get some pinecones?!?")
- Stag + Adamantine Pollen ("tested by donut/milady")
- Adamantine Pollen + Cattail + Nectar
- Adamantine Pollen + Mithril Pollen + Pond

### DIAMOND
- Golden + Junk Cube ("Can't convert diamond tier beetles back to flowers")
- Golden + Black Lotus ("Early black lotus testing")
- Golden + Mars Rhino
- Golden + Mars Rhino + Black Lotus ("-Payback- tried this")
- Golden + Golden + Golden
- Golden + Golden + Mars Rhino
- Mars Rhino + Mars Rhino + Mars Rhino ("Pack tried these")
- Mars Rhino + Mars Rhino + Mars Rhino again ("wh173_c47 used to believe in something")

**Total: 31 distinct dead combos on the wiki.** Our KB has ~27 — flag for sync.

**Notable for our KB:**
- Wiki also points to https://db.beetle.wiki/ — a recipe lookup database with a Smash/Assemble interface, community-maintained. Useful for runtime checks. Login restricted; viewer mode public.

---

## C. Item drops / rarity

### C.1 Rarity tier system

Source: https://beetle.wiki/doku.php?id=rarity (verbatim quote of dev blog):
> Item rarity is now color coded on both inventory buttons and card backgrounds. The rarity tiers are as follows:
> Junk > Tin > Bronze > Mithril > Adamantine > Diamond

Color mapping (from beetles/flowers pages):
- Junk: (uncolored)
- Tin: Green
- Bronze: Yellow
- Mithril: Cyan
- Adamantine: Red
- Diamond: Light Blue
- Trophy: (separate "Trophy" rarity tag — independent of the tier scale)

### C.2 Beetles — by source

Source: https://beetle.wiki/doku.php?id=beetles + https://beetle.wiki/doku.php?id=beetle:start

| Beetle | Rarity | Source |
|--------|--------|--------|
| Green Beetle (Grigger) | Tin | Drop only |
| Striped Cucumber Beetle | Bronze | Drop only (cannot be transmuted) |
| Ladybug | Bronze | Drop only |
| Purple Beetle | Bronze | Drop only |
| Pond Beetle | Mithril | Craft (Cattail + Ladybug) |
| Monarch | Mithril | Craft (Nectar + Ladybug or Purple) |
| Bumblebee | Mithril | Recipe unknown (cannot be transmuted) |
| Giraffe Weevil | Mithril | Craft (Royal Poinciana + Mithril Beetle) |
| Pillbug | Mithril | Craft (Camellia + Mithril Beetle) |
| Imperial Tortoise Beetle | Mithril | Craft (Morning Glory + Mithril Beetle) |
| Black-Spotted Blue Longicorn | Mithril | Craft (Fringed Iris + Mithril Beetle) |
| Golden-Spotted Tiger Beetle | Mithril | Craft (Larkspur + Mithril Beetle) |
| Skull Bug | Mithril | Holiday (Halloween), drop only |
| Christmas Beetle | Mithril | Holiday (Christmas), drop only |
| Goliath Beetle | Adamantine | Both: Drop AND Craft (Pinecone + Pond) |
| Stag Beetle | Adamantine | Both: Drop AND Craft (Moss + Pond) |
| Bombardier Beetle | Adamantine | Both: Drop AND Craft (Gunpowder + Pond) |
| Sabertooth Longhorn Beetle | Adamantine | Craft (Pincushion + Adamantine Beetle) |
| Sunset Moth | Adamantine | Craft (Gazania + Adamantine Beetle) |
| Blue Death Feigning Beetle | Adamantine | Craft (Purple Passionflower + Adamantine Beetle) |
| Golden Scarab | Diamond | Drop only |
| Mars Rhino Beetle | Diamond | Craft (Black Lotus + Sabertooth Longhorn + Sunset Moth) |
| Black Widow | Diamond | Holiday (Halloween), drop only — page empty but listed in beetles overview |
| Candycane Tiger Moth | Diamond | Holiday (Christmas), drop only — page empty but listed in beetles overview |

**Key clarifications vs our KB:**
- **Goliath / Stag / Bombardier are BOTH drop AND craft.** Our KB may treat them as drop-only or craft-only — wiki lists all three as drops on the beetles overview and also as artifact-use crafts.
- **Mithril beetles like Pond and Monarch are craft-only** (no native drop).
- **Bumblebee recipe is `???` per the wiki — completely unknown.** Mithril rarity. Cannot be transmuted. Likely a craft, ingredients undiscovered.
- **Striped Cucumber Beetle** is a Bronze drop-only beetle that explicitly CANNOT be transmuted to a flower. Treat as "trapped Bronze" — only useful as sacrifice or storage.
- **Holiday beetles are drop-only, time-limited.** Dev blog: "limited-time winter beetles available for two weeks".

### C.3 Flowers — by source

Source: https://beetle.wiki/doku.php?id=flowers + https://beetle.wiki/doku.php?id=flower:start

All non-Diamond flowers are catchable. Black Lotus is **craft only** (Gunpowder + Moss + Pinecone via smash). Pollens are all crafted.

| Tin | Bronze | Mithril | Adamantine | Diamond |
|-----|--------|---------|------------|---------|
| Sunflower | Gallic Rose | Camellia | Pincushion | Black Lotus (craft only) |
| Daisy | Milk Thistle | Royal Poinciana | Gazania | |
| Poppy | Marigold | Morning Glory | Purple Passionflower | |
| Chinese Pink Carnation | Spotted St. John's Wort | Fringed Iris | (Adamantine Pollen, craft only) | |
| Common Snapdragon | Southern Magnolia | Two-spike Larkspur | | |
| Large White Petunia | (Bronze Pollen, craft only) | (Mithril Pollen, craft only) | | |
| (Tin Pollen, craft only) | | | | |

**DELTA:** Our KB may not include all 5 Mithril flowers (Camellia, Royal Poinciana, Morning Glory, Fringed Iris, Larkspur) or all 3 Adamantine flowers (Pincushion, Gazania, Purple Passionflower). Verify and add missing.

### C.4 Catch-rate notes

Wiki provides **no concrete catch-rate numbers**. The only quantitative information is the Goliath build cost calculation from protips:
> Total for Goliath Beetle: 16× Ladybug, 10× Junk Cube (or 20 Junk), 9× Grigger
> ...
> Adamantine Pollen = 32 Ladybug, 42 Junk, 1 Purple Beetle
> Diamond Hammer = Adamantine Pollen + 3 Junk Cubes (or 6 Junk) + Adamantine Hammer

No drop-rate percentages anywhere on the wiki.

---

## D. Hammer mechanics

Source: https://beetle.wiki/doku.php?id=hammers (raw export)

### D.1 Stats

| Hammer | Crafting Bonus | Base Break Chance | Post-First-Use Break Chance |
|--------|---------------|-------------------|---------------------------|
| Tin | +0% | 10% | (not specified) |
| Bronze | +5% | 5% | (not specified) |
| Mithril | +20% | 10% | (not specified) |
| Adamantine | +35% | 2% | **5%** |
| Diamond | +90% | 1% | **9%** |

**DELTA:** Our KB doesn't capture the "post-first-use" higher break chance for Adamantine (jumps 2%→5%) and Diamond (jumps 1%→9%). This is the wiki's documented behavior: the first smash is at 0%, the second smash uses Base Break, but for Adamantine/Diamond a *third+ smash* uses the elevated post-first-use break chance. **This significantly changes value-modeling for Diamond Hammer — second use is still cheap (1%) but third use jumps to 9%.**

Actually re-reading: the table reads as "Base Break Chance 2% \\ Break chance after first use 5%". The protips page clarifies the formula:
> Current Break Chance += Base Break Chance + Recipe Break Chance

So the model is: every hammer starts at 0% Current Break, accrues damage with each use. For Adamantine and Diamond specifically, the wiki splits out a "Base Break Chance" applied to the first attempt vs an elevated value applied thereafter (a heuristic). For Tin/Bronze/Mithril there is no such split — accrual is presumably uniform.

### D.2 Break mechanic — verbatim

> every hammer starts with a Current Break Chance of 0% then begins to increase with each use risking it shattering during a crafting operation.
> Current Break Chance += Base Break Chance + Recipe Break Chance

### D.3 Daily reset (verbatim from hammers page, dated 12/27/25)

> Current Break Chance resets to 0% at Universal Basic Cheese daily reset, but after using the hammer it continues to accrue wear at the pre-reset Break Chance.

Protips reinforces: "hammer break chance resets to 0% every day after Daily Cheese. However after using one time it goes back up to the previous break chance. Experts are uncertain of the exact mechanic, but it looks like we get one daily smash per hammer."

**Practical takeaway: every player gets exactly 1 "free" smash per hammer per day (0% break). After that smash, break chance resumes at its pre-reset accrued value.** This is the basis for the "Daily Smash" / "Grigger Maxxing" / "do the risky upgrade as your first daily smash" strategy.

### D.4 Hammer upgrade resets break chance

> Upgrading your hammer resets the break chance. So you can use it a few times at each tier and then upgrade before it breaks, to maximize your smashes per hammer.
> NOTE: If you push it too far you can lose your hammer at an intermediary tier, but the first smash is 0% break chance so you should always at least use it once before upgrading.

### D.5 "Grigger Maxxing"

> If you have a guaranteed recipe eg: smashing a Pincushion and a Bombardier beetle to create a Sabertooth Longhorn - you do not NEED to sacrifice a purple beetle or use an upgraded hammer - you can use a green beetle and a tin hammer - it will just take you a lot of griggers and a lot of tin hammers to get the recipe.

I.e., guaranteed-output recipes (Flower Beetlecraft, artifact-use) can be ground out with Tin Hammers + Green Beetles. **Tier-up and pollen-creation recipes likely cannot — wiki author hedges: "I believe this is not the case if you're trying to upgrade flowers (by smashing two of like rarity together) or trying to upgrade like beetles."**

---

## E. Mechanics we may have wrong

### E.1 Sacrifice rules

- Wiki says: **Sacrifice is NOT part of the recipe.** It "may" change success probability and/or output rarity. Green AND Purple both valid.
- Concrete example given: Pond + Pond with **Purple** → Goliath; with **Green** → Monarch. So Purple may upgrade output by one rarity tier in non-guaranteed recipes.
- Our KB phrasing "sacrifice Purple Beetle" should be softened to "sacrifice optional; Purple may improve odds and/or upgrade rarity, Green also works".
- **Green is NOT solely for transmutation.** It is a general-purpose cheap sacrifice. Transmutation (Beetle + Junk Cube → Flower) uses the target beetle as the *input*, not as a sacrifice; the Junk Cube is the catalyst. Our KB's framing of "Green is only for transmutation" appears incorrect.

### E.2 "SMASH FAILED" vs "NOTHING HAPPENED"

- Verbatim: "SMASH FAILED = recipe is correct / NOTHING HAPPENED = recipe doesn't exist"
- Dev blog also confirms: "Ingredients will be returned to inventory upon failing a valid recipe" — so SMASH FAILED returns materials.
- Implication: on NOTHING HAPPENED, ingredients are also presumably returned (no recipe consumed them) — but the wiki does not explicitly confirm this. Treat as "ingredients always safe on a non-success".

### E.3 Hunt cooldown / cheese economy

- **No concrete numbers on the wiki.** The cheese:cheese page contains only the item entry (Cheddar variety, Tin rarity). No mention of hunt cooldowns, daily cheese amounts, or XP curves anywhere.
- Universal Basic Cheese daily reset is referenced as the global "morning" event that resets hammer break chance.

### E.4 Pollen weirdness

> two Cattails do not assemble into Mithril pollen, despite Cattail being Mithril rarity. However it is confirmed that e.g. Morning Glory + Camellia produces Mithril pollen. And others have said that double Mithril flowers work well for pollen. So the system may be more complicated than previously thought...

Interpretation: only **flowers** (not artifacts like Cattail or Nectar) make pollen. Two artifacts of the same rarity don't.

### E.5 Tier-up recipes documented in wiki only at Bronze→Mithril

The crafted_items page only lists Bronze→Mithril for tier-up. There's no documented Mithril→Adamantine or Adamantine→Diamond tier-up smash. Higher tiers go through artifacts (the Pond → Goliath/Stag/Bombardier path) and flower-beetlecraft (Sabertooth, Sunset Moth, Mars Rhino, etc.).

---

## F. New items we don't yet know about

Comparing against the KB list provided in the prompt:

### F.1 Flowers NEW or unconfirmed in our KB
Source: https://beetle.wiki/doku.php?id=flower:start

- **Chinese Pink Carnation** (Tin)
- **Common Snapdragon** (Tin)
- **Large White Petunia** (Tin)
- **Spotted St. John's Wort** (Bronze)
- **Southern Magnolia** (Bronze)
- **Two-spike Larkspur** (Mithril) — needed for Golden-Spotted Tiger Beetle recipe
- **Fringed Iris** (Mithril) — needed for Black-Spotted Blue Longicorn recipe
- **Purple Passionflower** (Adamantine) — needed for Blue Death Feigning Beetle recipe

### F.2 Beetles NEW or unconfirmed in our KB
- **Black-Spotted Blue Longicorn** (Mithril, craft: Fringed Iris + Mithril Beetle)
- **Golden-Spotted Tiger Beetle** (Mithril, craft: Larkspur + Mithril Beetle)
- **Blue Death Feigning Beetle** (Adamantine, craft: Passionflower + Adamantine Beetle)
- **Christmas Beetle** (Mithril, Christmas drop)
- **Skull Bug** (Mithril, Halloween drop)
- **Black Widow** (Diamond, Halloween drop — page empty)
- **Candycane Tiger Moth** (Diamond, Christmas drop — page empty)

### F.3 Artifacts (full list)
Source: https://beetle.wiki/doku.php?id=artifact:start

| Artifact | Description | Rarity |
|----------|-------------|--------|
| Cattail | Marsh reed | Mithril |
| Nectar | Concentrated sweetness | Mithril |
| Gunpowder | Volatile black powder | Adamantine |
| Moss | Damp forest carpet | Adamantine |
| Pinecone | Coniferous seed pod | Adamantine |
| **Specimen Pin** | "We have the technology" | Adamantine |

**DELTA:** Specimen Pin is a sixth artifact. **Its recipe is not documented on the wiki**, but it has its own page, an Adamantine rarity, and a teasing description ("We have the technology"). Likely a craft, presumably related to mounting beetles for trophies. **Watch for this.**

### F.4 Trinkets (full list — separate from Trophies)

Source: https://beetle.wiki/doku.php?id=trinket:start (raw export)

| Name | Description | Rarity |
|------|-------------|--------|
| Chinese Coin | Final circulating treasure | Tin |
| Prism | Bedazzlingly photonic | Tin |
| Jade Cabbage | Pacific Ocean Disappear | Bronze |
| Oriental Fan | Putting on airs | Bronze |
| Roman Dodecahedron | For sartorial purposes | Bronze |
| Arrowhead | Bites the dust | Mithril |
| Juex Card | Write me a check | Mithril |
| Titanium Cube | Copious mechanical work embedded | Mithril |
| Stradivarius | One would wish to stridulate... | Adamantine |

**These are real crafted items.** Each trinket has a Tin/Bronze/Mithril/Adamantine rarity (NOT Trophy rarity — that's separate, see below).

### F.5 Trophies (full list — 15 entries)

Source: https://beetle.wiki/doku.php?id=trophy:start

The wiki uses **two separate concepts**:
- **Trinket** = the regular crafted item (e.g. Chinese Coin, Prism). Has a normal tier rarity. Gets produced when you craft the recipe.
- **Trophy** = the *first-ever success* of that recipe awards a Trophy version instead of the regular item. All Trophies share rarity "Trophy" (separate tag).

Trophy list with descriptions:

| Trophy | Description | Recipe |
|--------|-------------|--------|
| Chinese Coin | Final circulating treasure | Junk Cube x2 + Tin Pollen |
| Prism | Bedazzlingly photonic | Junk Tesseract x2 + Tin Pollen |
| Roman Dodecahedron | For sartorial purposes | Junk Tesseract x2 + Bronze Pollen |
| Arrowhead | Bites the dust | Junk Tesseract x2 + Mithril Pollen |
| Titanium Cube | Copious mechanical work embedded | Junk Tesseract x2 + Adamantine Pollen |
| Oriental Fan | Putting on airs | Chinese Coin + Tin Pollen |
| Jade Cabbage | Pacific Ocean Disappear | Chinese Coin + Roman Dodecahedron |
| CULT Medallion | Buying your sleep to sell you dreams | Chinese Coin + Juex Card |
| Stradivarius | One would wish to stridulate... | Oriental Fan + Jade Cabbage |
| Thumb Drive | Odd partitioning scheme | Roman Dodecahedron + Prism |
| Compass | Points towards the Beetle you want most | Roman Dodecahedron + Arrowhead |
| Mokia | Indestructuburu!!! | Roman Dodecahedron + Titanium Cube |
| Goya Miniature Painting | A diminutive disturbance, really | Arrowhead + Stradivarius |
| Police Badge | License to maim | Arrowhead + Titanium Cube |
| Juex Card | Write me a check | Prism + Titanium Cube |

**Five Trophies with unknown recipes:**
- Milady Fumoku Trophy
- Reminet ID Trophy
- Deck Of Cards Trophy
- D20 Trophy
- Engraved Lighter Trophy

**DELTA: NEW DOMAIN.** Trophies and Trinkets are entirely absent from our KB. **The userscript should track Trophy unlock progress** — the "first craft = trophy" rule means each Trophy can be earned exactly once per account, then subsequent crafts give the Trinket. This is essential metadata for advice logic.

### F.6 Junk items (47 total per itemtag_docs)

Source: https://beetle.wiki/doku.php?id=junk:start

Full list of junk items: Disassembled Ballpoint Pen, Bendy Straw, Broken Bike Reflector, Bottle Cap, Broken Firework, Burger Wrapper, Button, Chewed Eraser, Chip Bag, Chocolate Bar, Chocolate Wrapper, Cigarette Butt, Coffee Can, Cracker Wrapper, Deodorant Can, Empty Noodle Cup, Event Band, Glue Stick, Green Army Man, Grenade Pin, Guitar Pick, Gum Wrapper, 90s Headphones, Phone Jack Adapter, Juice Box, Junk Cube, Junk Tesseract, Marble, Matchbook, Origami Crane, Paperclip, Pebble, Empty Pill Bottle, Pokkiri Box, Empty Ramune Bottle, Red Whistle, Rubber Band, Salt N Pepper Packet, Scratch Off Ticket, SIM Card, Smiley Pebble, Soda Can Tab, Stamp, Train Ticket Stub, Watch Battery, Wine-Stained Cork, Plastic Wristband.

All have rarity Junk. None has any documented recipe beyond "x2 = Junk Cube". Treat them as interchangeable.

The found_items.png assets page has only 22 — fewer than itemtag_docs which lists 47. **The itemtag list is more complete and current.**

### F.7 Unique items (1 entry)

Source: https://beetle.wiki/doku.php?id=unique:start

Only entry: **BeetleBoy Key** (Tin rarity, _Slotus Reserus_, "Once shiny and chrome").

---

## G. Holiday / seasonal items

Source: https://beetle.wiki/doku.php?id=beetles + dev blog https://blog.remilia.org/remilianet-alpha-v0-5-christmas-crafting-update/

### G.1 Halloween (2025)
- **Skull Bug** — Mithril, drop only, "Death head bug" (_Eucorysses grandis_)
- **Black Widow** — Diamond, drop only (page empty/missing on wiki, but listed in beetles overview as a Diamond Halloween drop)

### G.2 Christmas (2025/26)
- **Christmas Beetle** — Mithril, drop only, "Spotted flower beetle" (_Stephanorrhina guttata_)
- **Candycane Tiger Moth** — Diamond, drop only (page empty/missing on wiki, but listed in beetles overview as Diamond Christmas drop)

Dev blog (verified excerpt): "Two limited-time winter beetles available for two weeks". Holiday beetles confirmed **catch-only, noncraftable**.

### G.3 Christmas Crafting Update v0.5 — feature dump

(Quotes I was able to obtain from the blog before access was limited:)
- Introduction of "BeetleCraft" as a new system with two modes: **Assemble** and **Smash**.
- Rarity tiers became color-coded.
- "Nine new beetles, 14 flower types" added.
- "The recipes are unrecorded and unsaved, you must discover them through trial and error."
- "Ingredients will be returned to inventory upon failing a valid recipe."
- Two limited-time winter beetles (two-week window).
- Unlockable crafting slot via a special item (BeetleBoy Key) that "once you've unlocked it, you get it for both crafting modes and it's unlocked forever".
- 50% faster PFP generation, admin dashboard tools, and profile stat fixes (engine/UX side, not gameplay).

No Hercules Beetle, no Diamond Hammer break-math reveal, no concrete drop rates were disclosed in the dev blog or wiki.

---

## H. Anything else surprising or contradicting our docs

### H.1 Documented but missing from our KB
- **Flower Reroll** assemble recipe: `Junk Tesseract + Flower → different same-tier flower`. This is a meaningful tool for getting specific Mithril/Adamantine flowers without grinding catches.
- **Trinkets and Trophies** as an entire crafting domain — 9 trinkets + 15 trophies + 5 unknown trophies.
- **Specimen Pin** — Adamantine artifact, recipe unknown.
- **Three special-beetle recipes** that our KB likely doesn't have: Blue Longicorn, Golden Tiger, Blue Death Feigning.
- **Adamantine/Diamond hammer "post-first-use" elevated break chance** (2%→5%, 1%→9%).

### H.2 Contradictions with our KB
- "**Hercules** = golden_scarab + adamantine_pollen + purple" — **not on the wiki.** No `beetle:hercules` page, no `Hercules` entry in beetle list. Likely either folklore or game-content removed/never-added. **Recommend removing from KB unless verified live.**
- Our "Bronze/Mithril/Adamantine Flower Transmute" recipes that have THREE items (e.g. green + purple + junk_cube) — **wiki shows only single-beetle + Junk Cube**. Recommend revising these to single-beetle form.
- Our KB phrases like "BeetleBoy Key = bronze_flower + junk_cube" — correct. Note also: the key unlocks the 3rd slot for **both** Assemble AND Smash workbenches simultaneously and is permanent.
- Our "Goliath = pinecone + pond/monarch" — wiki has only "+ Pond" as the canonical recipe. Monarch substitution is unconfirmed in this case (it's confirmed only for the Nectar→Monarch upgrade and Cattail→Pond).

### H.3 Recipe DB external resource
- https://db.beetle.wiki/ is a community recipe lookup site with a Smash/Assemble form (drop in up to 3 items, see if a recipe exists). Useful as a programmatic check before consuming a hammer durability. Login restricted for edits; public for queries.

### H.4 Wiki pages that are EMPTY (so be cautious in any tooling that reads them)
- `beetle:hercules` — does not exist
- `beetle:black_widow` — does not exist
- `beetle:candycane_tiger_moth` — does not exist
- `meta:dev_blog`, `meta:christmas_crafting_update`, `meta:christmas`, `meta:beetlecraft` — none exist (the blog is at blog.remilia.org)
- `crypto_betting:start` — empty (the namespace contains only SEO spam pages, not game content)
- `the_climb_of_cbd_edibles:*` — SEO spam, not game content
- `trinkets` (top-level slug) — empty; use `trinket:start` instead
- `unique:beetleboy_key` page exists but minimal; `beetleboy_key` top-level page is the canonical one

### H.5 SMASH vs ASSEMBLE behavior summary
| Operation | Workbench | Success rate | What "fail" means |
|-----------|-----------|--------------|-------------------|
| Junk Cube, Tesseract, Pollens, Hammers, Key, Flower Reroll | ASSEMBLE | 100% (guaranteed) | (cannot fail) |
| All beetle/flower/artifact recipes | SMASH | RNG; modified by hammer Crafting Bonus and possibly Sacrifice | SMASH FAILED = recipe valid, RNG missed, ingredients return; NOTHING HAPPENED = no recipe exists |

### H.6 Item-ID list (canonical names for the userscript's tag-to-display mapping)

Source: https://beetle.wiki/doku.php?id=itemtag_docs

These are the exact tag-friendly slugs the wiki uses internally — useful if our userscript wants to match the wiki's conventions:

- Artifacts: cattail, gunpowder, moss, nectar, pinecone, specimen_pin
- Beetles: blue_longicorn, bombardier, bumblebee, christmas, cucumber, death_feigning, giraffe_weevil, golden, golden_tiger, goliath, green, imperial_tortoise, ladybug, mars_rhino, monarch, pillbug, pond, purple, sabertooth_longhorn, skull, stag, sunset_moth (22 listed; "black_widow" and "candycane_tiger_moth" not yet in tag plugin)
- Cheese: cheese
- Flowers: adamantine_pollen, black_lotus, bronze_pollen, camellia, carnation, daisy, fringed_iris, gallic_rose, gazania, larkspur, magnolia, marigold, milk_thistle, mithril_pollen, morning_glory, passionflower, petunia, pincushion, poppy, royal_poinciana, snapdragon, st_johns_wort, sunflower, tin_pollen
- Hammers: adamantine_hammer, bronze_hammer, diamond_hammer, mithril_hammer, tin_hammer
- Junk: ballpoint_pen, bendy_straw, bike_reflector, bottle_cap, broken_firework, burger_wrapper, button, chewed_eraser, chip_bag, chocolate_bar, chocolate_wrapper, cigarette_butt, coffee_can, cracker_wrapper, deodorant_can, empty_noodle_cup, event_band, glue_stick, green_army_man, grenade_pin, guitar_pick, gum_wrapper, headphones_90s, jack_adapter, juicebox, junk_cube, junk_tesseract, marble, matchbook, origami_crane, paperclip, pebble, pill_bottle, pokkiri_box, ramune_bottle, red_whistle, rubber_band, salt_pepper_packet, scratch_off, sim_card, smiley_pebble, soda_can_tab, stamp, train_ticket_stub, watch_battery, wine_cork, wristband
- Trinkets: arrowhead, chinese_coin, jade_cabbage, juex_card, oriental_fan, prism, roman_dodeca, stradivarius, titanium_cube
- Trophies: trophy_arrowhead, trophy_chinese_coin, trophy_compass, trophy_cult_medallion, trophy_goya_miniature, trophy_jade_cabbage, trophy_juex_card, trophy_mokia, trophy_oriental_fan, trophy_police_badge, trophy_prism, trophy_roman_dodeca, trophy_stradivarius, trophy_thumb_drive, trophy_titanium_cube
- Unique: beetleboy_key

---

## Appendix — Source URL index

- Sitemap: https://beetle.wiki/doku.php?do=index
- Start: https://beetle.wiki/doku.php?id=start
- Beetles overview: https://beetle.wiki/doku.php?id=beetles
- Beetle namespace: https://beetle.wiki/doku.php?id=beetle:start
- Flowers overview: https://beetle.wiki/doku.php?id=flowers
- Flower namespace: https://beetle.wiki/doku.php?id=flower:start
- Hammers overview: https://beetle.wiki/doku.php?id=hammers
- Hammer namespace: https://beetle.wiki/doku.php?id=hammer:start
- Crafted items (recipes): https://beetle.wiki/doku.php?id=crafted_items
- Anti-recipes: https://beetle.wiki/doku.php?id=antirecipes
- Junk Cube: https://beetle.wiki/doku.php?id=junk_cube
- Junk namespace: https://beetle.wiki/doku.php?id=junk:start
- BeetleBoy Key: https://beetle.wiki/doku.php?id=beetleboy_key
- Found items: https://beetle.wiki/doku.php?id=found_items
- Rarity: https://beetle.wiki/doku.php?id=rarity
- Protips: https://beetle.wiki/doku.php?id=protips
- ItemTag docs: https://beetle.wiki/doku.php?id=itemtag_docs
- Trinkets: https://beetle.wiki/doku.php?id=trinket:start
- Trophies overview: https://beetle.wiki/doku.php?id=trophies
- Trophy namespace: https://beetle.wiki/doku.php?id=trophy:start
- Artifacts: https://beetle.wiki/doku.php?id=artifact:start
- Cheese namespace: https://beetle.wiki/doku.php?id=cheese:start
- Unique namespace: https://beetle.wiki/doku.php?id=unique:start
- Christmas Crafting Update dev blog: https://blog.remilia.org/remilianet-alpha-v0-5-christmas-crafting-update/
- Recipe DB tool: https://db.beetle.wiki/
- Meta discussion: https://beetle.wiki/doku.php?id=meta:discussion

End of audit.
