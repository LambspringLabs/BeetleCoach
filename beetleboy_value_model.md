# BeetleBoy / BeetleCraft — Strategic Value Model
_Last updated: 2026-05-18 (v12.4.20 — empirical recipe finds added from /v/324142 thread mining)_

> This document supersedes the 2026-04-07 baseline. The 2026-04-07 file optimized for "complete the basic collection." This rewrite is for a player who is **post-Adamantine** with the full core collection except a small set of endgame holdouts (Mars Rhino, Hercules-if-real, Blue Death Feigning, Black Lotus, Purple Passionflower), at Lvl 75 ~10,939 cheese. The methodology has been kept and extended.
>
> **Sources consulted for this revision:**
> - `WIKI_AUDIT.md` (2026-05-17 structured beetle.wiki scrape)
> - https://wiki.remilia.org/Beetleboy (canonical product-level documentation)
> - https://beetle.wiki/doku.php?id=crafted_items, `protips`, `hammers`, `antirecipes`, `trinket:start`, `trophy:start`, `artifact:start`, `itemtag_docs`
> - https://blog.remilia.org dev blog posts v0.1 through v0.7 (full chain)
> - https://db.beetle.wiki/ (community recipe lookup; no API)

---

## 0. The "Double Tesseract" lottery — RESOLVED 2026-05-18

**Update: the user's observation is confirmed.** `2 Junk Tesseracts` placed alone in the assemble bench is a **multi-output Assemble lottery** — recipe shape is deterministic (2 JT in, no other inputs), but output is RNG across a wide menu.

See `V_THREAD_FINDINGS.md` for the full provenance. Summary of observed outputs (each is one craft event, NOT all from one craft):

| Output | Source / evidence |
|---|---|
| **Bumblebee** | Game broadcast `"YOU ASSEMBLED A Bumblebee FROM 2 Junk Tesseracts!"` (cherished, 09 May 2026) |
| Random Mithril flower | Player report (Big Zigg, 09 May 2026) |
| **Specimen Pin** (Adamantine artifact, rare jackpot) | Player anecdote: ~150 tesseracts to find one (~1.3% per attempt) |
| Pond Beetle | User observation (sails, 2026-05-17) |
| St. John's Wort | User observation (sails, 2026-05-17) |
| 1× Junk Tesseract refund | User observation (partial-fail outcome) |

**Implications:**
- The wiki does not document this recipe — empirical mechanic.
- `beetle.sevensevenseven.net/data.js` records the recipe as `{out:'specimen_pin', name:'Gamble for Specimen Pin'}` — Specimen Pin is the *labeled target*, but actual output distribution is a much wider menu. The Bumblebee was confirmed to be one possible output despite not appearing in the data file's labeled outputs.
- **The Bumblebee recipe is now answered.** Wiki said `???`. It's "luck on a JT × 2 roll."
- **Specimen Pin** drops at roughly ~1.3% per attempt (75 attempts per Pin average) per available evidence.

### Original investigation (kept for record)

(Below this point is the 2026-05-17 "not found" analysis, kept for context. It was correct that the wiki documents no such recipe — the resolution came from mining the /v/ thread on 2026-05-18.)

**Finding: the only documented `Junk Tesseract x2 + X` recipes on the wiki produce trinkets/trophies, not beetles or flowers.**

The full set of documented `Junk Tesseract x2` recipes is:

| Recipe | Output (first ever craft → trophy; subsequent → trinket) |
|--------|-----------|
| Junk Tesseract x2 + Tin Pollen | Prism (Tin trinket) |
| Junk Tesseract x2 + Bronze Pollen | Roman Dodecahedron (Bronze trinket) |
| Junk Tesseract x2 + Mithril Pollen | Arrowhead (Mithril trinket) |
| Junk Tesseract x2 + Adamantine Pollen | Titanium Cube (Mithril trinket — yes, Mithril, despite Adamantine pollen input) |

A separate single-Tesseract assemble recipe rerolls a flower into a different same-tier flower:

| Junk Tesseract + Flower | Different flower of the same tier (Assemble, 100% success) |

**No double-Tesseract recipe that yields a beetle OR flower appears anywhere in:** the `crafted_items` recipe page, the `antirecipes` page, the `protips` page, the `meta:discussion` page, the four dev blogs (v0.2/v0.4/v0.5/v0.7), or any community search result. The wiki's recipe database (db.beetle.wiki) accepts arbitrary item slot queries and isn't programmatically scraped here, but the wiki maintainers cross-reference it heavily and would have surfaced such a recipe in `protips`.

**Best explanation of the user's observation:** The user is likely conflating two real mechanics:
1. **Junk Tesseract x2 + Pollen → trinket/trophy** (the third slot determines the output trinket; the third slot is itself a flower-derived item)
2. **Junk Tesseract + Flower → flower reroll** (single Tesseract, one of the wiki's NEW additions)

When the user sees "trinkets are rolled" + "flowers can be rerolled via Tesseract," the experience of a single Tesseract pair generating a wide variety of trinket outputs (Prism, Roman Dodeca, Arrowhead, Titanium Cube depending on pollen) may *feel* like a roll over an item pool — but the output is fully determined by the pollen tier, and the result is a trinket/trophy, not a beetle or flower.

**Action items:**
- Recommend the user re-test in-game with a screenshot. If they can produce a beetle or flower from `JT + JT` (with any third item), capture the third slot exactly. Until then, treat this as user misremembering.
- The userscript should NOT advertise a "Double-Tesseract beetle roll" recipe.
- If the user is asking "what's the highest-EV use of a pair of Tesseracts?" — see Section 8: it's the next Trophy in the chain (one-shot value).

---

## 1. Methodology

### Base unit
**1 base unit = 1 farmable item produced by one catch action.**

A catch (claim OR hunt) returns: 1 beetle of random rarity + 1 junk item + XP. So a single catch contributes ~2 base units of inventory mass, of which the beetle is the variable-value part. Cheese flowers are also Tier-0 farmable and equally count as 1 base unit, but they only drop during hunts (claims yield only beetles + junk).

### Cost models

| Item type | Smash-success cost model |
|-----------|--------------------------|
| Assemble recipe | Exactly the sum of input base costs. No hammer needed, no RNG (100%). |
| Smash (guaranteed family — e.g. artifact-use, flower-beetlecraft) | Sum of inputs × **RNG tax 1.5x** (accounts for hammer break + occasional miss). Lower bound if using daily-reset 0% smash. |
| Smash (random-from-family — Nectar OR Cattail; Pinecone OR Moss OR Gunpowder) | Sum × **2.0x** (RNG tax) × **Coupon-collector** for "exactly N" specific outputs |
| Smash (tier-up — 2 same-rarity → 1 higher-rarity) | Sum × **2.5x**. Wiki says "don't rely on this" — modeling acknowledges low success. |
| Trophy first-craft | Same as smash but **the output is exactly one Trophy, ever**. EV calculation in Section 8. |

### NEW: Daily-reset discount
Every hammer's first smash of the day is **0% break**. A Mars Rhino smash that on average costs 1× input + ~1% hammer durability (Diamond) costs **zero hammer durability** if it's your first smash that day.

**Implication:** the most expensive RNG craft of the day should always be the day's first Diamond Hammer smash. The daily reset effectively gives you one free EV swing per hammer.

Quantitatively: the EV cost saving from this single free smash is approximately `[Diamond hammer replacement cost] × [break chance saved] = 1395 × 1% ≈ 14 base units` per day from Diamond alone, plus another 14-ish from Adamantine (2% on a 159-unit hammer = 3.2 per smash, but you get one such smash every day). Cumulatively, **the daily reset is worth ~17 base units of EV per day across all your hammers** — over a month, that's ~510 base units, equivalent to about ~25-30 cheese-priced hunts.

### NEW: Trinket/Trophy valuation
A Trophy is one-shot per recipe per account: first successful craft awards the **Trophy** variant (Trophy rarity); every subsequent craft awards the **Trinket** (its actual tier rarity). Trophies have no in-game gameplay utility documented; they're a collection/prestige item, like the Specimen Pin display shelf system referenced in v0.7.

- **Value model for trophies:** intrinsic value = `[trinket value] + [trophy premium]`. Trophy premium is non-rivalrous-collection equity. I assign it +50 to the score on first craft only; for follow-up crafts, value = the trinket itself.

---

## 2. Complete Item Value Table

Numbers reflect post-Adamantine endgame: cheese is plentiful, junk is plentiful, the bottleneck is upper-tier flowers, Mithril beetles, and one-of-a-kind drops.

### Tier 0 — Farmable (Depth 0, Cost 1)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Green Beetle | 1 | 1 | farmable | Pity-counter floor, sacrifice fodder, transmute input |
| Ladybug | 1 | 2 | farmable | Bronze. Used in Pond/Monarch chains |
| Purple Beetle | 1 | 2 | farmable | Bronze. May upgrade output rarity vs Green |
| Striped Cucumber Beetle | 1 | 1 | farmable, **trapped** | Bronze. Cannot transmute to flower. Sacrifice or display only |
| Junk Items (47 types) | 1 | 1 | farmable | Always interchangeable via x2 → Junk Cube |
| Cheese | n/a | n/a | currency | Spent at 20–30/hunt; daily 200–500 from streak |
| Daisy / Poppy / Sunflower | 1 | 2 | farmable | Tin flower |
| Chinese Pink Carnation / Common Snapdragon / Large White Petunia | 1 | 2 | farmable | Tin flower, post-Christmas additions |

### Tier 1 — First crafts (Depth 1–2, Cost 2–5)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Junk Cube | 2 | 3 | junk (assemble) | 2 junk |
| Tin Pollen | 3 | 5 | pollen (assemble) | 2 Tin flowers |
| BeetleBoy Key | 5 | 4 | unique (assemble) | Bronze flower + Junk Cube. Permanent 3rd-slot unlock for both benches |
| Tin Hammer | 4 | 6 | utility (assemble) | 2 Junk Cubes |

### Tier 1.5 — Bronze flowers (Depth 2, Cost 2)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Gallic Rose / Marigold / Milk Thistle | 2 | 6 | farmable, transmute | Drop or Bronze beetle + Junk Cube |
| Spotted St. John's Wort / Southern Magnolia | 2 | 6 | farmable | Bronze. Confirm catch availability — new additions |

### Tier 2 — Compression & Bronze Pollen (Depth 2–3)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Junk Tesseract | 6 | 8 | junk (assemble) | 3 Junk Cubes |
| Bronze Pollen | 4 | 12 | pollen (assemble) | 2 Bronze flowers |
| Bronze Hammer | 13 | 15 | utility (assemble) | Tin Hammer + Tesseract + Tin Pollen. Best efficiency hammer for mid-tier |

### Tier 3 — Bronze bridge artifacts (Depth 4, Cost ~22)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Nectar | 22 | 18 | bridge (smash, RNG 1-of-2) | Bronze beetle + Bronze Pollen → Nectar OR Cattail |
| Cattail | 22 | 18 | bridge | Same recipe; output is 1-of-2 |

### Tier 4 — Mithril beetles (Depth 5)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Pond Beetle | 35 | 25 | collectible (craft only) | Cattail + Ladybug. PRIMARY BOTTLENECK |
| Monarch | 35 | 25 | collectible (craft only) | Nectar + Ladybug or Purple |
| Bumblebee | ??? | 30 | collectible, **trapped** | Recipe unknown. Cannot transmute. Mithril rarity drop? |
| Christmas Beetle | n/a (drop only) | 40 | collectible, seasonal | Mithril, Christmas window only |
| Skull Bug | n/a (drop only) | 40 | collectible, seasonal | Mithril, Halloween window only |

### Tier 4 — Mithril flowers (Depth 2–3, Cost ~40)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Royal Poinciana | 40 | 30 | craftable, drop | Transmute (Mithril beetle + Junk Cube) or drop |
| Camellia | 40 | 30 | craftable, drop | Same |
| Morning Glory | 40 | 30 | craftable, drop | Same |
| Fringed Iris | 40 | 35 | craftable, drop | Needed for Black-Spotted Blue Longicorn |
| Two-spike Larkspur | 40 | 35 | craftable, drop | Needed for Golden-Spotted Tiger Beetle |

### Tier 5 — Mithril artifacts/pollen/hammer

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Mithril Pollen | 80 | 40 | pollen (assemble) | 2 Mithril flowers |
| Mithril Hammer | 33 | 30 | utility (assemble) | +20%, 10% break |
| Pinecone / Moss / Gunpowder | 175 | 50 | bridge (smash, RNG 1-of-3) | Mithril beetle + Mithril Pollen. Coupon collector applies |

### Tier 6 — Rare beetles (Depth 6)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Giraffe Weevil | 120 | 55 | collectible | Royal Poinciana + Mithril beetle |
| Pillbug | 120 | 55 | collectible | Camellia + Mithril beetle |
| Imperial Tortoise Beetle | 120 | 55 | collectible | Morning Glory + Mithril beetle |
| Black-Spotted Blue Longicorn | 120 | 60 | collectible | Fringed Iris + Mithril beetle (new) |
| Golden-Spotted Tiger Beetle | 120 | 60 | collectible | Larkspur + Mithril beetle (new) |

### Tier 7 — Adamantine beetles (Depth 7–9)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Goliath Beetle | 280 | 60 | collectible (drop OR craft) | Pinecone + Pond. Also a rare drop. |
| Stag Beetle | 280 | 60 | collectible (drop OR craft) | Moss + Pond |
| Bombardier Beetle | 280 | 55 | collectible (drop OR craft) | Gunpowder + Pond |

### Tier 7 — Adamantine flowers & hammer

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Pincushion | 280 | 65 | craftable, drop | Drop or Adamantine beetle + Junk Cube |
| Gazania | 280 | 65 | craftable, drop | Same |
| Purple Passionflower | 280 | 70 | craftable, drop | Needed for Blue Death Feigning Beetle (new) |
| Adamantine Hammer | 159 | 65 | utility (assemble) | +35%, 2% base / 5% post-first-use |

### Tier 8 — Epic beetles (Depth 8–10)

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Sabertooth Longhorn | 600 | 78 | collectible | Pincushion + Adamantine beetle |
| Sunset Moth | 600 | 78 | collectible | Gazania + Adamantine beetle |
| Blue Death Feigning Beetle | 600 | 80 | collectible | Passionflower + Adamantine beetle (new) |

### Tier 8.5 — Adamantine pollen

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Adamantine Pollen | 560 | 75 | pollen (assemble) | 2 Adamantine flowers. Diamond Hammer + Hercules input |

### Tier 9 — Black Lotus & Diamond Hammer

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Black Lotus | 700 | 88 | craftable | Gunpowder + Moss + Pinecone. Mars Rhino input |
| Diamond Hammer | 725 | 82 | utility (assemble) | +90%, 1% base / 9% post-first-use |

### Tier 10 — Legendary/Endgame

| Item | Base Cost | Score | Category | Notes |
|------|-----------|-------|----------|-------|
| Mars Rhino Beetle | 1980 | 95 | collectible | Black Lotus + Sabertooth + Sunset Moth |
| Hercules Beetle | **unverified** | 100? | collectible | "Golden Scarab + Adamantine Pollen + Purple" is **not on the wiki**. Treat as folklore. |
| Golden Scarab | n/a (drop only) | 90 | collectible | Diamond drop. No craft. Pity-counter eligible |
| Black Widow | n/a (drop only) | 90 | collectible, seasonal | Diamond, Halloween only |
| Candycane Tiger Moth | n/a (drop only) | 90 | collectible, seasonal | Diamond, Christmas only |

### Trinkets (Tier-Rarity Crafted Items)

| Trinket | Rarity | Recipe | Base Cost | Score |
|---------|--------|--------|-----------|-------|
| Chinese Coin | Tin | Junk Cube x2 + Tin Pollen | 7 | 25 |
| Prism | Tin | Junk Tesseract x2 + Tin Pollen | 15 | 25 |
| Roman Dodecahedron | Bronze | Junk Tesseract x2 + Bronze Pollen | 16 | 35 |
| Oriental Fan | Bronze | Chinese Coin + Tin Pollen | 10 | 35 |
| Jade Cabbage | Bronze | Chinese Coin + Roman Dodecahedron | 23 | 40 |
| Arrowhead | Mithril | Junk Tesseract x2 + Mithril Pollen | 92 | 45 |
| Juex Card | Mithril | Prism + Titanium Cube | 119 | 45 |
| Titanium Cube | Mithril | Junk Tesseract x2 + Adamantine Pollen | 572 | 50 |
| Stradivarius | Adamantine | Oriental Fan + Jade Cabbage | 33 | 55 |

Note: **Titanium Cube's recipe burns an Adamantine Pollen** — an expensive single input that no Mithril-tier output reasonably justifies on a per-unit basis, but Trophy first-craft makes it worthwhile exactly once.

### Trophies (15 documented + 5 unknown)

A Trophy is the first successful craft of a recipe. All 15 are listed in `WIKI_AUDIT.md` F.5. Five additional trophies (Milady Fumoku, Reminet ID, Deck of Cards, D20, Engraved Lighter) have unknown recipes.

### Specimen Pin — PURPOSE CONFIRMED 2026-05-18

Adamantine artifact. **Recipe AND purpose now known** (see `V_THREAD_FINDINGS.md`):

- **Acquisition:** rare jackpot from the `Junk Tesseract × 2` lottery (~1.3% per attempt; "150 tesseracts to find a Pin" anecdote on the /v/ thread implies ~75 attempts mean).
- **Purpose:** **Specimen Pin + Beetle + Green sacrifice → that Beetle's Trophy variant.** Confirmed by /v/ broadcast: `"YOU SACRIFICED A Green Beetle AND SMASHED A Specimen Pin AND A Mars Rhino Beetle INTO A Mars Rhino Beetle Trophy!"`
- **Implication:** every beetle in `ALL_BEETLES` (23 entries) can have a Trophy variant. Each trophy requires: 1 Specimen Pin + 1 copy of that beetle + 1 Green sacrifice (each consumed).
- **Bottleneck:** Specimen Pins. To trophy the entire collection of 23 beetles requires ~23 Specimen Pins → ~1725 tesseracts (~5175 junk cubes) at average drop rate. Very long-term project.
- **Strategy:** don't waste your one free Specimen Pin on a low-value beetle. Save it for a trophy you'd actually display (Mars Rhino is the natural choice).

---

## 3. NEW: XP / Leveling

**Confirmed facts:**
- Every action (claim, hunt, craft) gives XP. Specific values are **not published**.
- Level 10 unlocks global chat. No other tier unlocks are documented.
- v0.4 patch notes describe "User leveling has been repaired, with built-up XP automatically leveling users to their proper state immediately" — confirming XP is persistent and retroactively applied. There is no public level cap.
- The user is Lvl 75 — well past the documented unlock (Lvl 10 chat).

**Inferred XP yields (approximation, not verified):**

| Action | XP (estimated) | Why |
|--------|---------------|-----|
| Claim (every 2h) | small constant — call it 5 | Free, no resource cost |
| Hunt (20–30 cheese) | medium constant — call it 10 + rarity bonus | Paid action, scales with output |
| Successful Smash craft | proportional to output tier — Goliath > Pond > Junk Cube | Crafting is the "advanced" mechanic |
| Failed Smash | possibly partial (logged "smash failed" still consumed an attempt) | Risk-reward parity |
| Assemble craft | small (deterministic / "easy" action) | Hammers, tesseracts, pollen |
| Daily Cheese claim | small | One-tap |

**Strategic implication for a Lvl 75 player:**
- Level itself confers no documented gameplay reward beyond Lvl 10. **Lvl 75 is bragging-rights / social-credit territory.**
- If the user wants to **maximize XP**, the cheapest XP/action is `claim` (free, every 2h). 12 claims/day × 5 XP = 60 XP/day from claims. ~30 days/level if the curve is exponential (typical RPG curve).
- The XP-per-cheese-spent ratio favors **hunts of low-tier results** because XP scales sub-proportionally to rarity. But cheese is far more efficient when spent toward bottleneck Mithril beetles.
- **Bottom line:** XP/leveling is a passive byproduct of gameplay, not a target to optimize. Optimizing for beetle/flower output naturally produces XP. **Do not deviate from optimal beetle path for leveling.**

---

## 4. NEW: Cheesemaxing

### Cheese economy facts (from wiki.remilia.org)

| Mechanic | Value |
|----------|-------|
| Daily UBC claim | **200–500 cheese** depending on consecutive-day streak |
| Hunt cost | **20–30 cheese** (20 confirmed via v0.2 patch notes; 30 may be the per-rarity-tier or fluctuating value) |
| Hunt charges | **3 per cycle, regenerating over 90 minutes (30 min per charge)** |
| Claim cooldown | **2 hours** (free, no cheese) |
| Total daily capacity | **~10–15 hunts/day** (gating depends on cheese supply, not just cooldowns) |

### Optimal daily cheese spending (Lvl 75, post-Adamantine player)

The user has ~10,939 cheese in bank. That's ~365–545 hunts of cushion. The user is **not cheese-constrained**.

Daily routine when not cheese-constrained:
1. **Always claim free items first.** Claim every 2h. Daily UBC every day (streak compounds). Junk faucet (v0.7) every day. **Zero opportunity cost; ~17 free items per day not counting the bumper claims.**
2. **Hunt to fill the time between claims.** At 30 min/charge regen, you can hunt 14–15 times/day in bursts of 3. Each hunt costs 20–30 cheese; daily output is therefore 280–450 cheese spent.
3. **Daily UBC at the right phase.** Claim UBC when starting a "high-EV" session: it (a) refreshes streak, (b) resets all hammer break chances to 0%.
4. **First Diamond smash of the day = highest-EV craft you have ingredients for.** This is the most important optimization. The user's current state suggests the answer is **Black Lotus** (Gunpowder + Moss + Pinecone) or **Mars Rhino** (Black Lotus + Sunset Moth + Sabertooth). Both burn ~600–700 base units of inputs — losing a Diamond Hammer to a 1% mid-craft break costs 725 base units, so the EV cushion is razor-thin. **Always burn the daily-reset free smash on the biggest such craft.**

### Whale path

Per the Remilia Wiki, cheese can be purchased with real money (anti-sybil token but tradeable). Not strategy-relevant unless cash is no object. **Note for context only.**

### Cheese as a metric

A reasonable conversion rate: **1 hunt ≈ 20 cheese ≈ 1 beetle of varying rarity + 1 junk + some XP.** Treating that as approximately 1.5 base units per cheese spent (since the beetle is often Bronze or Mithril after pity-counter activation), the user's 10,939 cheese is roughly **16,000 base units of farming runway.** That's enough to brute-force every remaining endgame recipe **several times over** if RNG behaves average. The user is in spending mode, not saving mode.

---

## 5. NEW: Quantity vs Quality

The user explicitly asked: "100 Green Beetles vs 1 Mars Rhino — which is more XP? Which is more value?"

### XP comparison

Assume claim yields 5 XP, hunt yields ~10 XP (post-pity-bumped tier maybe +5–10), and successful Mars Rhino craft yields a one-time large bonus (estimate 200 XP for the act of completing the recipe).

- **100 Green Beetles** would come from ~100 claims (since claim guarantees 1 beetle but biased toward Green). At 5 XP per claim, that's 500 XP. Time cost: 200 hours of real-time waiting. Cheese cost: 0.
- **1 Mars Rhino** built from scratch (assuming pristine state) requires ~1980 base units of inputs. Realistically the user already has the prerequisites and needs only a one-shot smash. That smash gives perhaps 200 XP. Inputs already-paid-for. Time cost: instant.

**Verdict — XP:** 100 Greens > 1 Mars Rhino (500 vs 200). But this is a meaningless comparison — Greens are essentially free and Mars Rhino is a one-time achievement.

### Value (score) comparison

- **100 Green Beetles** × Score 1 = 100 "value". But the marginal value of each additional Green is near-zero once you have stock for transmutes/sacrifices. Realistic value: ~20.
- **1 Mars Rhino** = Score 95. Collection-completion premium adds another +30 (it's one of two Diamond beetles the user can craft, and the only one short of Hercules). Realistic value: ~125.

**Verdict — value:** Mars Rhino wins decisively. ~6x the value of 100 Greens at full marginal accounting.

### Other scenarios

| Scenario | Items | Total Score (raw) | Marginal Value | Verdict |
|----------|-------|-------------------|----------------|---------|
| 50 Junk Cubes vs 1 Black Lotus | 50 × 3 = 150 | Black Lotus = 88 + collection completion +30 = 118 | Black Lotus barely wins on raw score; loses on diversity. **But** Black Lotus is a one-way input to Mars Rhino. If you already have one, 50 Junk Cubes win (more downstream optionality). |
| 10 Mithril Beetles vs 1 Mars Rhino | 10 × 25 = 250 | 125 | 10 Mithril Beetles win — they unlock all 8 Mithril-flower-linked beetles |
| 1 Adamantine Hammer vs 10 Bronze Hammers | 65 | 10 × 15 = 150 | Bronze chain wins on score. Adamantine wins on EV-per-craft for high-tier smashes. **Both matter; not substitutable.** |
| 1 Golden Scarab vs 1 Mars Rhino | 90 (drop-only) | 95 (craftable) | Equal value, but Golden is RNG-locked behind the catch system. The user should prioritize building Mars Rhino (deterministic) and let Golden be incidental to hunts. |

### Per-cheese conversion rate

Lower bound (raw): 1 cheese → 1/20 hunt → 1/20 beetle drop (Green at ~70% rate post-pity ≈ value 0.04 per cheese).

Upper bound (effective): 1 cheese → fractional progress toward a Pond Beetle, which is value 25. With pity active and modal output being Bronze, ~1 cheese ≈ 0.1 unit of progress toward a Mithril.

**Therefore: ~1 cheese = ~0.05 to ~0.15 base units depending on what you're funneling toward.** The most efficient "lane" is **hunt → catch Mithril or higher → use directly in artifact-bridge → Adamantine beetle**. Cheese spent on Tin/Bronze targets is wasteful compared to letting claim handle low-tier supply.

---

## 6. Bottleneck Analysis (updated)

### Top 5 bottlenecks for the user's current state

1. **Mithril Beetles (Pond/Monarch).** Each is ~35 base. The user needs ~12+ to clear the remaining endgame chain (Sabertooth, Sunset Moth, Blue Death Feigning, second Black Lotus, Mars Rhino input). Mithril beetles are **craft-only** (no native drop), so every one requires Cattail or Nectar via the bronze-bridge.
2. **Adamantine flower variants.** The user is missing Purple Passionflower (Adamantine). Either farm it via drops or transmute one Adamantine beetle. The Adamantine beetle drop path (Goliath/Stag/Bombardier directly catchable) helps.
3. **A 2nd full set of Mithril artifacts** (Gunpowder + Moss + Pinecone) for the **second Black Lotus**. The user already has one Black Lotus presumably; Mars Rhino needs one Black Lotus + 1 Sabertooth + 1 Sunset Moth. **A second Black Lotus is NOT needed unless seeking a backup or display.**
4. **Sabertooth + Sunset Moth.** Each needs an Adamantine beetle as input (which already costs ~280 base). User has ~5 missing collections — these are the gating Mars Rhino inputs.
5. **Golden Scarab.** Drop-only. The only "blocking" item for Hercules (if Hercules is real). Pity counter helps; otherwise pure RNG over many hunts.

### NEW: Pollen consumption budget (post-Adamantine)

| Pollen | Used for | Total batches needed for endgame |
|--------|----------|----------------------------------|
| Tin Pollen | Tin Hammer chain, Chinese Coin trophy, Prism trophy, Oriental Fan trinket | 4 batches |
| Bronze Pollen | Bronze Hammer chain, Roman Dodeca trophy, Nectar/Cattail (per Mithril beetle), Jade Cabbage upstream | 8+ batches (~16 Bronze flowers) |
| Mithril Pollen | Mithril Hammer chain, Arrowhead trophy, Pinecone/Moss/Gunpowder (per artifact set) | 6+ batches |
| Adamantine Pollen | Adamantine Hammer chain, Diamond Hammer chain, Titanium Cube trophy, hypothetical Hercules | 3 batches (~6 Adamantine flowers) |

---

## 7. Opportunity Cost Analysis (updated)

The user's holdouts are: Mars Rhino, Hercules (if real), Blue Death Feigning, Black Lotus, Purple Passionflower.

### High-opportunity decisions

1. **Adamantine flower allocation.** Each Adamantine flower can either: (a) feed Adamantine Pollen, (b) craft an Epic beetle (Sabertooth/Sunset Moth/Blue Death Feigning). Pollen is regenerable from transmutes; Epic beetles are not. **Allocate first Adamantine flowers to the 3 missing Epic beetles; only after the collection is complete, divert to pollen.**
2. **First Black Lotus → Mars Rhino vs. save for display.** Black Lotus needs all 3 Mithril artifacts. Recreating it costs the equivalent of building a 2nd set of artifacts (~700 base). The user should burn Black Lotus on Mars Rhino as soon as Sabertooth + Sunset Moth are ready.
3. **Junk Tesseract usage.** Each Tesseract can either: (a) advance the hammer chain (1 per upgrade — user has these already), (b) feed Trophy chain (Junk Tesseract x2 + Pollen → 4 Trophies, see Section 8). **User has hammers; Tesseracts now go to Trophy crafting.**
4. **Specimen Pin.** User gets one free per v0.7. **Hold it.** The recipe is undocumented — wasting the free one on speculative experiments is irreversible. Wait until the wiki documents the recipe.
5. **Diamond Hammer durability.** With 1% base / 9% post-first-use break, **two Diamond smashes per day is the practical ceiling**. After 2 smashes, expected break in <10 more smashes. **Do not use Diamond on anything below Tier 8.5 except your daily free smash.**

---

## 8. NEW: Trinket/Trophy Progression Order

Trophies are one-shot per recipe. Each first craft awards a Trophy; subsequent crafts award the Trinket (its normal tier rarity). **The optimal order is bottom-up by ingredient cost, so each first craft uses the cheapest possible inputs.**

### Phase A — Cheap foundations (low-tier trophies)

1. **Chinese Coin Trophy** — `Junk Cube x2 + Tin Pollen`. Cost: 7 base units. Mandatory because:
   - Used as input for Oriental Fan, Jade Cabbage, CULT Medallion.
   - Use Tin Hammer; daily reset not needed.
2. **Prism Trophy** — `Junk Tesseract x2 + Tin Pollen`. Cost: 15.
   - Used in Thumb Drive (with Roman Dodeca), Juex Card (with Titanium Cube).
3. **Roman Dodecahedron Trophy** — `Junk Tesseract x2 + Bronze Pollen`. Cost: 16.
   - Used in Jade Cabbage, Thumb Drive, Compass, Mokia.
4. **Oriental Fan Trophy** — `Chinese Coin + Tin Pollen`. Cost: 10 (assumes Chinese Coin trinket is 7).
   - Used in Stradivarius.

### Phase B — Mid-tier trophies

5. **Jade Cabbage Trophy** — `Chinese Coin + Roman Dodecahedron`. Cost: 23.
   - Used in Stradivarius.
6. **Stradivarius Trophy** — `Oriental Fan + Jade Cabbage`. Cost: 33.
   - Used in Goya Miniature.
7. **Arrowhead Trophy** — `Junk Tesseract x2 + Mithril Pollen`. Cost: 92.
   - Used in Police Badge, Goya Miniature, Compass.

### Phase C — Higher trinket prerequisites

8. **Juex Card Trophy** — `Prism + Titanium Cube`. Cost: 119.
   - Used in CULT Medallion.
9. **Titanium Cube Trophy** — `Junk Tesseract x2 + Adamantine Pollen`. Cost: 572.
   - Used in Juex Card, Police Badge, Mokia.
10. **CULT Medallion Trophy** — `Chinese Coin + Juex Card`. Cost: 126.
11. **Thumb Drive Trophy** — `Roman Dodecahedron + Prism`. Cost: 31.
12. **Compass Trophy** — `Roman Dodecahedron + Arrowhead`. Cost: 108.
13. **Mokia Trophy** — `Roman Dodecahedron + Titanium Cube`. Cost: 588.
14. **Goya Miniature Trophy** — `Arrowhead + Stradivarius`. Cost: 125.
15. **Police Badge Trophy** — `Arrowhead + Titanium Cube`. Cost: 664.

### Total cost summary for the 15-trophy sweep

Cumulative: ~2700 base units of inputs IF every trinket from previous Trophies is reused as an input to the next Trophy (rolling cost, not sum-of-recipes).

**Wait — there's a clever exploit:** Once a Trophy is crafted, *that trophy is the only one of its type for that account*. But subsequent crafts of the same recipe give the trinket variant, which IS usable as an input. So crafting Chinese Coin Trophy → next craft of `Junk Cube x2 + Tin Pollen` = Chinese Coin (trinket) → that Chinese Coin is the input to Oriental Fan Trophy. **You need at minimum 2 of each base trinket: one to be the Trophy, one to feed upstream recipes.**

This means the practical material cost for full 15-trophy collection is **~4500 base units** of inputs, including re-crafts for trinket variants used as inputs.

### Five unknown trophies

- Milady Fumoku Trophy
- Reminet ID Trophy
- Deck of Cards Trophy
- D20 Trophy
- Engraved Lighter Trophy

Likely undiscovered or unreleased. Don't speculate.

---

## 9. NEW: Hammer EV Table with Daily Reset

### Per-smash EV cost of breaking

| Hammer | Recraft cost | Base break | Post-first-use break | Daily-reset break | Per-smash break EV (post-first) |
|--------|--------------|------------|----------------------|--------------------|---------------------------------|
| Tin | 4 | 10% | 10% | 0% | 0.40 base/smash |
| Bronze | 13 | 5% | 5% | 0% | 0.65 base/smash |
| Mithril | 33 | 10% | 10% | 0% | 3.30 base/smash |
| Adamantine | 159 | 2% | **5%** | 0% | 3.18 base/smash (8.0 if treating elevated rate forever) |
| Diamond | 725 | 1% | **9%** | 0% | 7.25 base/smash (65.0 if treating elevated rate forever) |

### Net daily EV from the 5 hammers

Assuming **one daily-reset free smash per hammer** (and assuming the user fully uses every hammer every day):
- Sum of break-EVs saved: 0.40 + 0.65 + 3.30 + 3.18 + 7.25 ≈ **14.8 base units saved per day**.
- Over a month: **~445 base units of EV** — equivalent to ~22 full hunts worth of cheese.

### Practical hammer routing for the user

| Recipe type | Hammer recommendation | Rationale |
|-------------|----------------------|-----------|
| Tin Pollen, Junk Cube, Tesseract, Pollen-of-any-tier (assembles) | NONE | Assembles don't need hammers |
| Trophy crafts (Junk Tesseract x2 + Pollen) | **Tin** | These are *smash* recipes per Section 8 — but the inputs are pollen, not beetles. Inputs are deterministic; the smash is more about "trinket vs trophy" than RNG outcome. **Use cheapest hammer.** |
| Nectar/Cattail bridge | Bronze | Input cost = 22; Adamantine overkill |
| Pond/Monarch from artifact + Ladybug | Bronze | Same logic |
| Mithril artifacts (Pinecone/Moss/Gunpowder) | Mithril | +20% bonus on Mithril Pollen helps |
| Adamantine beetles from artifact + Mithril beetle | Adamantine | Output is 280 base; 5% break risk = 8 base EV cost vs +35% bonus value |
| Epic beetles (Sabertooth/Sunset Moth/Blue Death Feigning) | Adamantine **for daily free smash**, Diamond if it's the only Epic of the day | Output is 600 base; 9% Diamond break = 65 EV. Worth it for first Epic of the day |
| Black Lotus | **Diamond, FIRST SMASH OF DAY** | Input is 700 base; +90% bonus is critical |
| Mars Rhino | **Diamond, FIRST SMASH OF DAY** | Same |
| Hypothetical Hercules | **Diamond, FIRST SMASH OF DAY** | Diamond is the only hammer that justifies the input cost |

### Key rule

**Always run the day's most valuable smash first thing after UBC daily claim.** This is the single highest-leverage optimization in the entire game economy. For the user, that's currently **Mars Rhino** (or Black Lotus building toward it).

---

## 10. Optimal Crafting Order (Current State)

The user is at endgame. Missing: Mars Rhino, Hercules (unverified), Blue Death Feigning, Black Lotus, Purple Passionflower. **Plus the 15-trophy collection if they want to complete that.**

### Phase 1: Get Purple Passionflower (Adamantine flower) — RECIPE CONFIRMED 2026-05-18
- **Primary path: `Gazania + Junk Tesseract` (Assemble)**. Confirmed by /v/324142 game broadcast: `"YOU ASSEMBLED A Purple Passionflower FROM A Gazania AND A Junk Tesseract!"`. Output is RNG across the 3 Adamantine flowers (Pincushion, Gazania, Passionflower), so naive odds ~1/3 per attempt. Mean ~3 attempts. The reroll can also return the same flower (confirmed broadcast: `Gazania + Junk Tesseract → Gazania`), so this is genuinely RNG.
- **Cost:** 1 Junk Tesseract + 1 Adamantine flower (consumed) per attempt. With your Adamantine flower stock + 21 Tesseracts, you have ample budget.
- Backup: transmute an Adamantine beetle + Junk Cube → random Adamantine flower (RNG over the 3 outputs).
- Alternative: drop-farm via hunts (Adamantine flowers drop).

### Phase 2: Blue Death Feigning Beetle
- `Purple Passionflower + Adamantine beetle (Stag) → Blue Death Feigning`. Smash.
- Use Adamantine Hammer (daily free smash if it's the day's biggest craft).

### Phase 3: 2nd Black Lotus → Mars Rhino chain
- If the user already has 1 Black Lotus, they need: Sabertooth + Sunset Moth + Black Lotus → Mars Rhino.
- If missing Sabertooth: craft `Pincushion + Adamantine beetle`. Same for Sunset Moth (`Gazania + Adamantine beetle`).
- **Critical:** Mars Rhino smash uses the day's first Diamond Hammer use.

### Phase 4: Hercules investigation
- Wiki has no Hercules page. Folklore recipe is `Golden Scarab + Adamantine Pollen + Purple Beetle`.
- **Action: do NOT spend Golden Scarab without verifying in-game.** Try cheap alternatives first (e.g., post a screenshot of the smash result on `meta:discussion` to see if other players have observed it).
- If real, the cost is staggering: 1 Golden Scarab (irreplaceable drop) + 1 Adamantine Pollen (~560 units).

### Phase 5: Trophy collection
- Bottom-up trophy order per Section 8. Start with the 4 cheap Tin/Bronze trophies; they cumulatively gate everything else.

---

## 11. Resource Budget (Full Collection)

### To complete remaining beetles (post-Christmas additions counted)

| Resource | Need | Cheese-cost lower bound | Cheese-cost upper bound |
|----------|------|-------------------------|-------------------------|
| Purple Passionflower | 1 | 0 (reroll via Tesseract) | ~280 (transmute Adamantine beetle) |
| Blue Death Feigning craft | 1 smash | 0 (use existing) | 280 (a fresh Adamantine beetle) |
| 2nd Sabertooth + Sunset Moth (if exhausted) | 2 smashes | 600 each | 1200 |
| Mars Rhino craft | 1 smash | 0 | ~1980 (full inputs from scratch) |
| Hercules (if real) | 1 smash | 560 + Golden | unbounded (Golden is drop-only RNG) |
| **Beetle subtotal** | | | **~3700 base units = ~750 hunts** |

### To complete the 15-trophy set

| Resource | Quantity | Cost |
|----------|----------|------|
| Junk Tesseracts | ~20 | 120 |
| Pollens (mixed) | ~30 batches | ~600 |
| Trinket re-crafts | ~10 | ~800 |
| **Trophy subtotal** | | **~1520 base units = ~300 hunts** |

### Total full-completion budget

**~5000 base units of inputs = ~1000 hunts = ~25,000 cheese (over many weeks/months at 200–500 cheese/day).**

The user has 10,939 cheese banked. **They are halfway funded for full completion.** Daily streak income of ~300 cheese × 90 days = 27,000 cheese. The user can realistically complete everything in ~3 months of consistent daily play.

---

## 12. NEW: "Lanes" — Play Styles

The economy supports four distinct "lanes," ordered roughly by tempo:

### Lane A — Collector (broad collection, slow)
- **Goal:** every beetle and flower in inventory.
- **Tempo:** slow, opportunistic.
- **Play loop:** claim every 2h, hunt with leftover cheese, transmute incidental beetles to flowers for stockpile, do safe assemble recipes.
- **Best for:** new/mid players. The user has mostly outgrown this lane.
- **Efficiency rating:** 5/10 for the user.

### Lane B — Cheesemaxxer (maximize cheese bank)
- **Goal:** maximize cheese accumulation (whale-adjacent without paying).
- **Tempo:** daily 1-tap, minimal hunting.
- **Play loop:** UBC + claim + skip hunts. Watch cheese accumulate.
- **Best for:** AFK players. User is not in this lane.
- **Efficiency rating:** 2/10 for the user (counterproductive — cheese has rapidly diminishing utility past ~5k).

### Lane C — Trophy Hunter (Trinket/Trophy completion)
- **Goal:** all 15 documented trophies.
- **Tempo:** moderate. Burns junk and pollen, not beetles.
- **Play loop:** stockpile Junk Tesseracts and Pollens; craft trophies bottom-up per Section 8.
- **Best for:** players post-beetle-completion who want a new objective.
- **Efficiency rating:** 8/10 for the user. **Strong recommendation — this is the user's natural next chapter.**

### Lane D — Endgame Sprint (Mars Rhino / Hercules)
- **Goal:** complete the last 1–3 endgame beetles.
- **Tempo:** fast. Heavy daily-reset usage.
- **Play loop:** hold all hammers at high durability, do one Diamond smash per day on the highest-EV recipe, accumulate Mithril artifacts and Adamantine beetles aggressively.
- **Best for:** the user.
- **Efficiency rating:** 9/10 for the user. **Top recommendation if they care more about the Beetle Pokedex than the Trinket case.**

### Recommended lane blend for the user (Lvl 75, ~11k cheese)

**60% Lane D + 30% Lane C + 10% Lane A.**

- **Daily routine:** Open game → UBC + junk faucet → Diamond Hammer free smash on Mars Rhino or its prerequisites → 3-hunt burst → claim cycle → 1–2 Tin/Bronze Trophy crafts as the day winds down.
- **Weekly:** finish one Trophy chain (bottom-up); finish or advance one Mars Rhino input.
- **Monthly:** full collection check; resync wiki to catch new content (the dev cadence is ~6 weeks per alpha bump).

---

## 13. Corrections log

### v12.4.20 (May 17, 2026 — this rewrite)

- **Double Tesseract claim investigated.** No double-Tesseract recipe yielding a beetle or flower is documented on beetle.wiki, in any dev blog (v0.1–v0.7), in `meta:discussion`, or in any community search result. The user is likely conflating `Junk Tesseract x2 + Pollen → Trophy/Trinket` with `Junk Tesseract + Flower → flower reroll`. Marked "not found / likely misremembered" pending in-game re-test.
- **Cheese economy nailed down.** Confirmed via wiki.remilia.org: UBC daily 200–500 cheese on streak; hunts cost 20–30 cheese; 3 hunt charges regen over 90 min; 2h claim cooldown; ~10–15 hunts/day capacity.
- **XP system documented as a passive byproduct.** Level 10 = chat unlock; no other tier unlocks published. Lvl 75 is bragging rights, not gameplay.
- **v0.7 dev blog mechanics added:** junk faucet (daily junk drop), hammer grace (first craft has 0% break), pity counter "lousy beetle" sacrifice mechanic, specimen pin (1 free per user).
- **Trinkets + Trophies added as full content tier.** 9 trinkets + 15 trophies with documented recipes. 5 trophies remain undiscovered.
- **Specimen Pin added as a 6th Adamantine artifact.** Recipe unknown. Each user gets 1 free.
- **Hammer post-first-use break rates documented.** Adamantine 2%→5%, Diamond 1%→9%. Daily reset gives one 0% smash per hammer per day, worth ~14.8 base/day EV.
- **Hercules recipe flagged unverified.** No `beetle:hercules` page exists on the wiki. Removed from "confirmed" recipes pending in-game confirmation.
- **Updated bottleneck analysis.** Mithril beetles, Adamantine flowers, 2nd Mithril artifact set, Golden Scarab.
- **Tighter resource budget.** ~5000 base units for full completion (down from prior 5000–7000 estimate) by accounting for trinket reuse and reroll efficiency.
- **Added 4 Lanes / Play Styles** with explicit efficiency ratings for the user's state.

### Older (preserved from prior versions)

- v8.7 (2026-04-07): Pollen recipes are ASSEMBLE (100% success), not smash — confirmed by beetle.wiki. Hammer states detectable from DOM. Goliath, Stag, Golden Scarab confirmed droppable. 27 confirmed anti-recipes (now 31 per latest scan).

---

## 14. Open Research Questions

These need in-game verification or wiki updates:

1. **Hercules recipe.** Does `Golden Scarab + Adamantine Pollen + Purple Beetle` actually produce a Hercules Beetle? No wiki page exists. Could be folklore.
2. **Specimen Pin recipe.** v0.7 says 1 free + "find more yourself" — likely a craft, possibly involving Adamantine beetles or a new artifact recipe.
3. **5 unknown trophies.** Milady Fumoku, Reminet ID, Deck of Cards, D20, Engraved Lighter — recipes undiscovered. Possible event-tied or hidden-craft.
4. **Exact XP curve.** No published values for XP per claim/hunt/craft. The userscript could log levels-up timestamps and back-fit a curve.
5. **Exact drop rates.** Wiki explicitly withholds. Userscript-level statistics would derive these empirically.
6. **Bumblebee recipe.** Mithril rarity, marked "??" on the wiki. Likely a flower-pollen-beetle craft analogous to Pond/Monarch but with an undiscovered input.
7. **Black Widow + Candycane Tiger Moth.** Diamond seasonal drops. Drop rate unknown.
8. **Cheese cost variation 20 vs 30.** Conflicting data between v0.2 patch ("20 cheese") and wiki ("20–30 cheese"). May depend on hunt charge state or daily counter.
9. **Junk Tesseract x2 + non-pollen.** Does anything else combine? The user's "double Tesseract → beetle/flower" claim hints at something unexplored. Worth testing with cheap third inputs.

End of model.
