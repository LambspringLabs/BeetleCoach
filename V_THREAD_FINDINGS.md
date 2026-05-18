# /v/324142 Thread — Verified Recipes from Game Broadcasts

_Captured 2026-05-18 from miladychan.org/v/324142 ("BeetleBoy crafting recipes and tips!", 416 posts as of capture, OP `memory_prism` 23 Dec 2025)._

The Remilia.net BeetleBoy game broadcasts every craft to the global chat in a deterministic format that doubles as an authoritative recipe attestation. Two broadcast templates:

- `YOU ASSEMBLED A <output> FROM <ingredients>!` — deterministic assemble recipes (or one specific output of a probabilistic assemble)
- `YOU SACRIFICED A <sacrifice> AND SMASHED <ingredients> INTO <output>!` — smash recipes with sacrifice
- `YOUR HAMMER SHATTERED!` — append on a hammer break

The /v/ thread is a multi-month archive of players posting these broadcasts as recipe documentation. **Posts are tagged with the player's Remilia identity, so most are trustworthy attestations** (the game produces the text; the player just shares it).

What follows is every JT-involving and otherwise novel recipe captured from the thread, with the broadcast verbatim (quoted ≤15 words per copyright rules).

---

## A. The "Junk Tesseract × 2" assemble — confirmed multi-output lottery

This is the recipe the user originally asked about. The /v/ thread plus their personal observation establish that **2 Junk Tesseracts placed alone in the bench is a probabilistic Assemble recipe with many possible outputs**.

### Observed outputs (each is a single craft event, NOT all from one craft)

| Output | Evidence |
|---|---|
| **Bumblebee** | cherished, 09 May 2026: broadcast `"YOU ASSEMBLED A Bumblebee FROM 2 Junk Tesseracts!"` |
| Random Mithril flower | Big Zigg, 09 May 2026: `"...just smashed two tesseracts got a mithril flower"` |
| Specimen Pin (Adamantine artifact) | Anonymous, ~Sat 09 May: `"FOUND A PIN!!!! took me about 150 tesseracts (or 450 junk cubes)"` — implies ~75 attempts to hit a Pin |
| Pond Beetle | User observation (sails), 2026-05-17 |
| St. John's Wort | User observation (sails), 2026-05-17 |
| 1× Junk Tesseract refund | User observation — partial-failure / no-op refund outcome |

### Implications

- The data file at `https://beetle.sevensevenseven.net/data.js?v=20260515` lists this recipe as `{ out: 'specimen_pin', name: 'Gamble for Specimen Pin', ing: [{key: 'junk_cube_t2', qty: 2}] }`. **The "Gamble for" label is honest** — Specimen Pin is the rare jackpot, but a wide menu of common outputs (Mithril flower / Bumblebee / random beetle / partial refund) is the realistic distribution.
- **Bumblebee's recipe is now known.** Wiki said `???`. Answer: it's one of the JT×2 lottery outputs. No deterministic path to a Bumblebee exists in any documentation; you have to gamble.
- **Specimen Pin is roughly ~1.3% per attempt** if the 150-tesseracts-for-a-pin anecdote generalizes (~75 attempts per Pin).

---

## B. Junk Tesseract + Flower → flower reroll (with specific-output evidence)

The "flower reroll" recipe is documented on the wiki as `Junk Tesseract + Flower → different same-tier flower (random)`. The /v/ thread confirms multiple observed outputs and shows the reroll can:

| Recipe | Output | Source |
|---|---|---|
| `Gazania + Junk Tesseract` | **Purple Passionflower** | Aegean Fantasy, 05 May 2026: `"YOU ASSEMBLED A Purple Passionflower FROM A Gazania AND A Junk Tesseract!"` |
| `Gazania + Junk Tesseract` | Gazania (reroll back to same flower) | Player broadcast: `"YOU ASSEMBLED A Gazania FROM A Gazania AND A Junk Tesseract!"` |

So the reroll **can return the same flower** (RNG includes the original as a possible outcome). For a user trying to roll a specific flower (e.g., Passionflower), expect multiple attempts. With 3 Adamantine flowers (Pincushion / Gazania / Passionflower), naive uniform odds = 1/3 per attempt, mean ~3 tries.

This is the **deterministic-ish path to Purple Passionflower** for a player who has the other Adamantine flowers but not Passionflower — significantly cheaper than gambling 2 JT for a chance.

---

## C. Specimen Pin: the actual purpose

| Recipe | Output | Source |
|---|---|---|
| `Specimen Pin + Beetle + Green sacrifice` (smash) | **That beetle's Trophy variant** | Anonymous, 05 May 2026: `"YOU SACRIFICED A Green Beetle AND SMASHED A Specimen Pin AND A Mars Rhino Beetle INTO A Mars Rhino Beetle Trophy!"` |

**This is the endgame trophy mechanism for beetles.** Wiki documents Trophy variants for trinkets ("first craft of a trinket recipe awards the Trophy"). It does NOT document a way to get a Trophy for a beetle. The /v/ thread reveals: Specimen Pin enables creating a Trophy for any beetle by consuming a copy of the beetle + a Green sacrifice.

### Strategic implications

- Every beetle in the user's collection can now have a Trophy version, but each requires (a) a copy of the beetle (consumed), (b) one Specimen Pin (consumed), (c) a Green sacrifice.
- Specimen Pin is the bottleneck — ~1.3% drop from JT×2 lottery means ~75 JT pairs (~450 junk cubes) per Pin on average.
- **For the user (Lvl 75, 21 Tesseracts):** ~10–15 Pins of expected value at current rate, but high variance. Trophy collection of ALL beetles requires ~23 Specimen Pins (one per ALL_BEETLES entry).

---

## D. Tier-up smash recipes — more reliable than the wiki suggests

Wiki language: "Tier-up: 2 same-rarity → random higher-rarity, very low success, don't rely on this."

But /v/ thread broadcasts show tier-up producing specific outputs (not random) when sacrifice is involved:

| Recipe | Output | Source |
|---|---|---|
| `2 Purple Beetles + Green sacrifice` (smash) | Monarch | broadcast: `"YOU SACRIFICED A GREEN BEETLE AND SMASHED 2 PURPLE BEETLES INTO A MONARCH!"` |
| `2 Pond Beetles + Purple sacrifice` (smash) | **Stag Beetle** (specific Adamantine, not random) | broadcast: `"YOU SACRIFICED A Purple Beetle AND SMASHED 2 Pond BeetleS INTO A Stag Beetle!"` |

So tier-up + sacrifice may target a specific output. The Purple-sacrifice-promotes-rarity hypothesis from the wiki audit is now backed by evidence.

---

## E. Other recipe broadcasts captured (already in our model — for confirmation)

The thread has dozens of broadcasts confirming recipes we already model. Sampling them as ground-truth attestations:

- `"YOU SACRIFICED A Purple Beetle AND SMASHED A Pond Beetle AND A Royal Poinciana INTO A Giraffe Weevil!"` — confirms Pond works (not just Monarch) for Giraffe Weevil
- `"YOU SACRIFICED A PURPLE BEETLE AND SMASHED A PINCUSHION AND A BOMBARDIER BEETLE INTO A SABERTOOTH LONGHORN BEETLE!"` — confirms Bombardier works for Sabertooth
- `"YOU SACRIFICED A Purple Beetle AND SMASHED A Ladybug AND A Bronze Pollen INTO A Cattail!"` — confirms Bronze Beetle + Bronze Pollen → Cattail (one of 2 outputs of the bridge)
- `"YOU SACRIFICED A Purple Beetle AND SMASHED A Monarch AND A Mithril Pollen INTO A Pinecone!"` — confirms Mithril Beetle + Mithril Pollen → Pinecone (one of 3 outputs of the bridge)
- `"YOU SACRIFICED A GREEN BEETLE AND SMASHED A LADYBUG AND A CATTAIL INTO A POND BEETLE!"` — confirms Cattail + Ladybug → Pond, Green sacrifice works for low-tier
- `"YOU SACRIFICED A Purple Beetle AND SMASHED A Ladybug AND A Nectar INTO A Monarch!"` — confirms Nectar + Ladybug → Monarch with Purple sacrifice

---

## F. Wiki-confirmed assemble recipes (ground-truth from broadcasts)

- `"YOU ASSEMBLED A Bronze Hammer FROM A Tin Hammer, A Junk Tesseract, AND A Tin Pollen!"`
- `"YOU ASSEMBLED A Mithril Hammer FROM A Bronze Hammer, A Bronze Pollen, AND A Junk Tesseract!"`
- `"YOU ASSEMBLED A Adamantine Hammer FROM A Mithril Hammer, A Junk Tesseract, AND A Mithril Pollen!"`
- `"YOU ASSEMBLED A TIN POLLEN FROM A DAISY AND A SUNFLOWER!"`
- `"YOU ASSEMBLED A Chinese Coin Trophy FROM 2 Junk Cubes AND A Tin Pollen!"` — Trophy = first craft per recipe; subsequent → Chinese Coin trinket
- `"YOU ASSEMBLED A Prism Trophy FROM 2 Junk Tesseracts AND A Tin Pollen!"`
- `"YOU ASSEMBLED A Roman Dodecahedron Trophy FROM 2 Junk Tesseracts AND A Bronze Pollen!"`
- `"YOU ASSEMBLED A Arrowhead Trophy FROM 2 Junk Tesseracts AND A Mithril Pollen!"`
- `"YOU ASSEMBLED A Titanium Cube Trophy FROM A Adamantine Pollen AND 2 Junk Tesseracts!"`

(All match `WIKI_AUDIT.md` and `beetleboy_value_model.md`'s trinket/trophy table.)

---

## G. Updates to make in our docs and script

### To beetleboy_value_model.md
- Section 0 (Double Tesseract): rewrite — recipe is confirmed multi-output Assemble lottery. List observed outputs. Specimen Pin is the rare jackpot (~1.3%). Bumblebee is one common output.
- Section 8 (Trophy Progression): add `Specimen Pin + Beetle + Green → Beetle Trophy` mechanic. This is a major new trophy domain (23 beetle trophies achievable).
- Section 10 (Optimal Crafting Order): Phase 1 (Purple Passionflower) — use `Gazania + Junk Tesseract` reroll (deterministic in shape, RNG in output, but Passionflower is one valid output). Replace the "transmute beetle + junk cube" suggestion as the primary path.
- Section 12 (Lanes): Trophy Hunter lane now includes beetle trophies via Specimen Pin gambling. Adds ~23 trophy outputs to the lane's scope.

### To beetle_coach.user.js
- Add `Junk Tesseract Gamble` to `RECIPES`: `{label:'Junk Tesseract Gamble', type:'assemble', inputs:['junk_cube_t2','junk_cube_t2']}` and add to `MULTI_OUTPUT_RECIPES`.
- Add `Adamantine Flower Reroll` to `RECIPES`: `{label:'Adamantine Flower Reroll', type:'assemble', inputs:['junk_cube_t2','any_adamantine_flower']}` and add to `MULTI_OUTPUT_RECIPES`. Add `passionflower` to PREREQ_RECIPES.
- Add `Specimen Pin Trophy Craft` to `RECIPES`: `{label:'Specimen Pin Beetle Trophy', type:'smash', inputs:['specimen_pin','any_collected_beetle','green']}` — but this needs a new `any_collected_beetle` token group. Maybe defer until we want to surface beetle trophies as goals.

### To OPERATING_MANUAL.md
- Add a "Random sibling" note in Common Scenarios for Adamantine Flower Reroll (you'll roll Pincushion / Gazania / Passionflower; takes ~3 tries on average for a specific output).
- Mention the Specimen Pin gamble as a chase craft for endgame players.

### To beetleboy_knowledge_base.md / beetle_known_recipes_human_readable.md
- Add the JT × 2 lottery and Specimen Pin trophy mechanic to the recipe sections.

---

## H. Open questions remaining

- **Exact output distribution of JT × 2.** We have anecdotal evidence: ~1.3% Specimen Pin, multiple Mithril flower / beetle / refund outputs. No published probability table. Empirical: crafting 50+ pairs and logging outputs would derive a real distribution.
- **Junk Sphere recipe** — sneed crafted one in chat (`🏆 Crafted [[junk_sphere]]!`). Not in any thread or data file. Likely a new addition c.sneed deployed today. Unknown inputs.
- **Hercules** — still no broadcast or wiki entry. Skip until verified.
- **5 unknown Trophies on the wiki** (Milady Fumoku, Reminet ID, Deck of Cards, D20, Engraved Lighter). The data file has stubs for `milady_fumoku` and `remilianet_id` outputs but inputs are not yet documented.
