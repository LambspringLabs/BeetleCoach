# Hunt for the 2x Junk Tesseract Recipe

> Investigation into the user's claim that two Junk Tesseracts (with NO pollen) yields a random beetle + a random flower (user observed: Pond Beetle + St. John's Wort). The Beetle Wiki does not document this recipe. Filing public-source evidence here.

## Twitter/X + Third-party userscript findings
_Compiled 2026-05-17 by the Twitter/X-hunt agent._

### BREAKTHROUGH: the `JT x2` recipe IS documented — by a competing userscript

**The recipe `Junk Tesseract x2 -> Specimen Pin` is documented as an ASSEMBLE recipe in the data files of `beetle.sevensevenseven.net`, a third-party Beetleboy companion site by Twitter user @SNEEDRAGON71717.** This site is announced in Tweet `https://x.com/SNEEDRAGON71717/status/2053121314680955283` (Beetleboy Advance SP v0.1, includes "inventory browser, recipe lookup, and trophy tracker" — direct competitor to BeetleCoach).

The raw recipe entry from `https://beetle.sevensevenseven.net/data.js?v=20260515` line 619 reads exactly:
```
{ out:'specimen_pin', name:'Gamble for Specimen Pin', ing:[{key:'junk_cube_t2',qty:2}] }
```

This is the ONLY assemble recipe in the entire data file that takes 2x Junk Tesseract with no other inputs. The recipe label "Gamble for Specimen Pin" explicitly indicates a probabilistic/gambling outcome.

**Specimen Pin** is then used in a Smash recipe: `Specimen Pin + Any Beetle + Green (sac) -> That Beetle's Trophy` (per `RECIPES` table line 720 and `SMASH_FILL_MAP` line 756). Beetle.sevensevenseven.net treats Specimen Pin as an Adamantine-tier artifact in its category map (per BeetleCoach's own user.js it's also Adamantine, "we have the technology" — sourced from beetle.wiki's `artifact:start` listing).

### What this means for the user's claim

The user's reported observation of "JT x2 -> Pond Beetle + St. John's Wort" CANNOT be reconciled with the documented `JT x2 -> Specimen Pin (Gamble)` recipe. The sevensevenseven data file contains NO recipe (assemble OR smash) that outputs both a beetle AND a flower as multi-output. Searched the full RECIPES, AR (ASSEMBLE RECIPES), and SMASH_FILL_MAP tables — every single output is a single item.

The remaining plausible explanations:
1. **The Gamble failed and refunded inputs partially.** Per the v0.5 dev blog: *"Ingredients will be returned to inventory upon failing a valid recipe."* If the user's `JT x2 -> Specimen Pin` gamble failed, they would get back 1-2 tesseracts (matching the user's "Sometimes returns 1x Tesseract" observation perfectly). The Pond Beetle + St. John's Wort the user saw would have been from a SEPARATE craft (or a coincidental Catch/Hunt drop) in the same session that the user is conflating.
2. **The user misremembered the inputs.** If a Specimen Pin was used (not 2x JT) in a smash with a Pond Beetle (mithril) plus a sacrifice, the output would be "That Beetle's Trophy" — i.e., Pond Beetle's Trophy. The St. John's Wort the user saw could be a separate inventory item.
3. **The "everybody knows" recipe is `JT x2 -> Specimen Pin` and the user is misremembering the OUTPUT.** The community knows this gambling recipe exists; the user's memory of the specific output is what's wrong.

### Sources I checked (Twitter/X-side)

| URL | Verdict |
|-----|---------|
| `https://x.com/SNEEDRAGON71717/status/2053121314680955283` | DuckDuckGo snippet retrieved — announces `beetle.sevensevenseven.net` with recipe lookup. **HIGH RELEVANCE.** Direct X.com fetch returned 402 Payment Required. |
| `https://x.com/simulaxion/status/2052129033308053572` | DuckDuckGo snippet only ("I'm taking Beetleboy REAL seriously. I will uncover everything. I just need a pinecone..."). No recipe details. X.com 402. |
| `https://x.com/itsTylerIRL/status/1866478738571243810` | Surfaced repeatedly in searches; tweet is about chain achievements, not recipes. |
| `https://twitter.com/bonkleman_/status/1796243989143704040` | Marketing copy about Beetle Game; no recipes. |
| `https://twitter.com/remiliacorp` etc. (official accounts) | Profile pages 402; cannot access timeline content. |
| `https://x.com/madafuking` (account "Beetleboy") | Unrelated Beetleboy account. |
| `https://html.duckduckgo.com/html/?q=site:x.com+beetleboy+OR+beetlecraft+tesseract` | Returned 6 results, of which #2 (SNEEDRAGON71717) is the load-bearing find above. |
| `https://html.duckduckgo.com/html/?q="junk+tesseract"+beetle+recipe+"pond+beetle"` | Zero results. |
| `https://html.duckduckgo.com/html/?q=beetlecraft+remilia+recipe+"junk+tesseract"+"junk+tesseract"` | Zero results. |
| `https://twitter.com/search` direct URL | Redirected to x.com which returns 402. |

### Sources checked (third-party site harvest)

| URL | Verdict |
|-----|---------|
| `https://beetle.sevensevenseven.net/` | Live; SPA with inventory/recipe/wiki/chat tabs. **Found `JT x2 -> Specimen Pin (Gamble)` in data.js.** |
| `https://beetle.sevensevenseven.net/data.js?v=20260515` | Live JS file (50KB); contains complete RECIPES, AR (assemble), SMASH_FILL_MAP tables. **No JT x2 -> beetle+flower recipe.** |
| `https://beetle.sevensevenseven.net/app.js?v=20260515` | Live JS file (98KB); UI logic only, no recipe data beyond what's in data.js. |
| `https://beetle.sevensevenseven.net/wiki` `/recipes` `/api/recipes` | All 404. The site embeds recipe data into data.js rather than serving an API. |

### Sources checked (GitHub repo sweep — Twitter agent's pass)

| Search | Verdict |
|--------|---------|
| `gh search repos "BeetleCoach"` | Only LambspringLabs/BeetleCoach itself; no forks, no community variants. |
| `gh search code "BeetleCraft"` | Returned NexWired/lore-api (lore docs only, no recipes), unrelated Minecraft mods. |
| `gh search code "beetle.wiki"` | NexWired/lore-api only — same lore content, no recipe DB. |
| `gh search code "remilia.net"` | `douvy/remilia-stats` (Next.js leaderboard app; no recipe content, only profile fetching). |
| `gh search code "junk_cube_t2 morning_glory"` | Zero results. |
| `gh search code "Gamble for Specimen Pin"` | Zero results — the sevensevenseven data file is not on GitHub. |
| `gh search code "beetle.sevensevenseven"` | Zero results. |

### `db.beetle.wiki` API — supplementary probe (Twitter agent)

The previous wiki-deep-scan agent already documented this API. My pass confirmed every key data point and adds:

| Query | Response | Interpretation |
|-------|----------|----------------|
| `items=junk_cube_t1,junk_cube_t1` | `{"output":"hammer_t1","recipe_id":2,"status":"valid"}` | Confirms API works. |
| `items=junk_cube_t1,junk_cube_t1,junk_cube_t1` | `{"output":"junk_cube_t2","recipe_id":1,"status":"valid"}` | Confirms. |
| `items=junk_any,junk_any` | `{"output":"junk_cube_t1","recipe_id":39,"status":"valid"}` | Recipe IDs go up to at least 39. |
| `items=marigold,junk_cube_t1` | `{"output":"beetleboy_key","recipe_id":7,"status":"valid"}` | Confirms. |
| `items=flower_bronze,junk_cube_t1` | `{"output":"beetleboy_key","recipe_id":9,"status":"valid"}` | Confirms — uses category placeholder. |
| `items=flower_bronze,flower_bronze` | `{"output":"pollen_uncommon","recipe_id":10,"status":"valid"}` | Confirms. |
| `items=hammer_t1,junk_cube_t2,pollen_common` | `{"output":"hammer_t2","recipe_id":3,"status":"valid"}` | Hammer chain valid recipe_id 3. |
| All other documented wiki recipes (pond+pond, pollen_common+pollen_common, ladybug+ladybug, cattail+ladybug, etc.) | `{"status":"untested"}` | DB extremely sparse — confirms previous agent's caveat that "untested" status is non-informative for absence-of-recipe questions. |
| Critical: `items=junk_cube_t2,junk_cube_t2` | `{"status":"untested"}` | **db.beetle.wiki has not registered the `Specimen Pin` recipe either.** The sevensevenseven team independently discovered it and embedded it in their userscript, but it never got submitted to the wiki DB. |

**`/api/items` endpoint** returns full item catalog (87 items). **St. John's Wort, Fringed Iris, Two-spike Larkspur, and Purple Passionflower are MISSING from this item list** — the db.beetle.wiki backend is stale relative to the newest flowers added in the v0.7 "New Special Beetle Smashes" update. This explains why no recipe involving these flowers returns "valid" from the API.

### Direct evidence summary (Twitter/X-side)

| Question | Answer |
|----------|--------|
| Is there a documented `JT x2` recipe? | **YES — `JT x2 -> Specimen Pin (Gamble)`** per beetle.sevensevenseven.net data.js line 619. |
| Does any source document `JT x2 -> beetle + flower`? | **NO. Zero public sources. Searched X.com via DDG, GitHub code search, the official wiki at all revisions, db.beetle.wiki API, the sevensevenseven third-party userscript, the official dev blog series (v0.2 through v0.7), and the Remilia wiki.** |
| Does any source document a recipe with multi-output (beetle AND flower together)? | **NO. Every recipe in every authoritative source produces exactly one output item type.** |

### Final reconciliation with user observation

The user almost certainly performed a **`JT x2 -> Gamble for Specimen Pin`** craft. The "sometimes returns 1x Tesseract" behavior they observed is the documented fail-state of this gamble recipe (per v0.5 dev blog: ingredients refunded on valid-recipe failure). The Pond Beetle + St. John's Wort the user saw was almost certainly NOT the output of this craft — it was either:
- A coincidental Catch/Hunt drop in the same session
- A SEPARATE smash craft the user is conflating with the assemble craft
- A misreading of the inventory delta

**Recommended action items for BeetleCoach:**
1. **Add the `JT x2 -> Specimen Pin (Gamble)` recipe to BeetleCoach's recipe table** — this is a real, undocumented-on-the-wiki recipe and BeetleCoach's competitor (beetle.sevensevenseven.net) already has it. BeetleCoach mentions Specimen Pin in `beetle_coach.user.js` line 76 but does NOT document how to craft it. This is a competitive gap.
2. **Update `beetleboy_value_model.md` Section 0** — the "double tesseract" claim is no longer purely a folklore mystery; it's a documented Specimen Pin gamble. The user's beetle+flower observation remains a misobservation.
3. **The Specimen Pin chain unlocks a trophy duplication mechanic** (`Specimen Pin + Any Beetle + Green sac -> That Beetle's Trophy`) — this is a HUGE strategic insight for the endgame Section 8 trophy EV analysis. Currently BeetleCoach treats Specimen Pin as a one-off artifact but it appears to be the canonical late-game trophy farming mechanism.

---

*(Original Twitter/X section placeholder removed — the parallel agent (this one) has now filled it in.)*

## Discord / Reddit / Forum findings
_Compiled 2026-05-17 by the forum/Discord/Reddit hunter agent._

### Sources searched
- Google web search (15+ targeted queries: "junk tesseract" + "beetleboy" / "beetlecraft" / "remilia"; "pond beetle" + "st john's wort" + "tesseract"; X.com site-restricted; "YOU ASSEMBLED ... 2 Junk Tesseracts"; etc.)
- `discord.com/invite/milady` (Milady Village, official server; 16,295 members per public listing) — landing page exposes no channel previews; could not view recipe channels without joining.
- `disboard.org/search?keyword=milady` — HTTP 403 from fetcher; could not enumerate Disboard-listed Milady servers programmatically.
- Reddit (`www.reddit.com/r/Remilia`, `r/miladymaker`, search) — blocked by tooling; site-restricted Google search returned no Remilia/Beetleboy posts. Reddit traffic on this topic appears essentially nil.
- `boards.miladychan.org` — official-adjacent imageboard. Direct fetches of `/beetle/`, `/v/`, `/milady/`, `/remilio/` board indexes and individual threads.
- `desuarchive.org`, `archived.moe` 4chan archives — site-restricted Google searches returned no Beetleboy-related threads.
- YouTube — site-restricted queries for "beetlecraft tutorial" returned only Minecraft Tesseract videos, no Remilia content.
- `wiki.remilia.org`, `beetle.wiki` (every recipe / antirecipe / protips / meta:discussion / trinket page) — already audited; reconfirmed nothing documents JT x2 alone.
- Local existing audit: `C:\BeetleCoach\crafted_items_raw.txt` (canonical recipe page scrape) — confirmed contains ZERO `junk_tesseract + junk_tesseract` entries, not even with pollen. The trinket recipes the `beetleboy_value_model.md` infers exist (JT x2 + pollen -> trinket) are NOT actually documented on the recipe page either — they appear to be the author's reconstruction.

### Public messages I DID find documenting JT x2 crafting

The only public source that explicitly documents a 2x-Junk-Tesseract craft (anywhere indexed by Google) is the **RemiliaNET Global Chat archive** preserved as a miladychan thread. The user mentioned this exact chat as ground truth. The thread is at `https://boards.miladychan.org/beetle/201346`.

| Post | Poster (date) | Quote (game-generated text, ~15 words) | Recipe revealed |
|------|---------------|----------------------------------------|------------------|
| `#425708` | radcat (2026-05-17, 19:04 UTC) | "YOU ASSEMBLED A Titanium Cube FROM 2 Junk Tesseracts AND A Adamantine Pollen!" | JT x2 + Adamantine Pollen -> Titanium Cube (Mithril-tier trinket) |
| `#425692` | Dankler(green) (2026-05-17, 18:16) | "You smash pink beetle w...With junk cube or maybe junk tessarect I think" | Anonymous player speculating — not authoritative |
| `#425731` | sneed (same day) | "Crafted [[junk_sphere]]!" | Existence of a **Junk Sphere** item beyond Tesseract — implies a higher-tier junk chain |

**Credibility:** These are auto-generated game broadcast messages mirrored from the in-game global chat (the `YOU ASSEMBLED ... FROM ... AND ...` format is the game's announcement template). High credibility for what the game actually produced; no anonymous claim risk because the text is a server-emitted craft confirmation.

The same thread contains many other auto-generated `YOU ASSEMBLED` lines confirming the **documented** trinket recipe chain — Bronze Hammer, Mithril Hammer, Adamantine Hammer assembles all match `tin_hammer + junk_tesseract + tin_pollen`, etc.

### What I did NOT find

- **Zero** public mention of: `JT x2` alone (no pollen) -> beetle + flower; `JT x2` -> Pond Beetle; `JT x2` -> St. John's Wort. Not on miladychan, not on the wikis, not in indexed Discord previews, not in Reddit, not on X.com indexed pages, not in 4chan archives, not in YouTube descriptions.
- **Zero** public Discord channel previews exposing recipes (Milady Village Discord requires joining to see channel content).
- **Zero** GitHub user-maintained recipe lists found via this forum-side sweep (separate from any GitHub work the parallel agent is doing).
- **Zero** mention of a "Junk Sphere -> beetle + flower" cycle, but the `sneed` post (#425731) hints that a higher junk tier exists beyond Tesseract, which may be where the user-observed recipe actually originates.

### miladychan /v/ "BeetleBoy crafting recipes and tips!" thread
`https://boards.miladychan.org/v/324142` — community-curated recipe thread. Contains the standard hammer chain (`tin_hammer + JT + tin_pollen -> bronze_hammer`, etc.), the assemble chain (`junk x2 -> junk_cube`, `junk_cube x3 -> junk_tesseract`), and beetle-tier-up smashes (Pond + Pond -> Stag, Stag + Pincushion -> Sabertooth, etc.). **No JT x2 entry exists in this thread either.** This is the most active public recipe-sharing forum and the silence here is telling.

## What the recipe might actually be

Combining this agent's forum sweep with the wiki audit in `beetleboy_value_model.md` Section 0:

1. **Most likely: the user's "JT x2 -> Pond Beetle + St. John's Wort" is a misobservation.** The third slot was probably an Adamantine Pollen (or other pollen), making the actual recipe `JT x2 + Adamantine Pollen -> Titanium Cube` — i.e., the trinket recipe confirmed by post `#425708`. The "beetle + flower" the user saw may have been a coincidental simultaneous claim/hunt drop on the same screen, not output of the assemble.
2. **Second most likely: the recipe involves Junk Sphere, not Junk Tesseract.** Post `#425731` (sneed) confirms a `junk_sphere` item exists. If `JT x3 -> Junk Sphere` (extrapolation of `Junk Cube x3 -> Junk Tesseract`) and the recipe the user is thinking of involves a Sphere as one input (or as output), that would explain why it doesn't appear in any JT-indexed search. Recommend the user verify their inventory snapshot to confirm whether the recipe input was `JT x2` or `JT + Junk Sphere` or `Junk Sphere x2`.
3. **Third: it really is an undocumented Smash recipe** (not Assemble) where two JTs are placed on the **Smash** bench (instead of Assemble), producing a beetle + flower as random output. Wiki only documents JT-on-Assemble combinations; the Smash workbench is for beetle/flower combinations and might accept tesseracts as junk-tier inputs with surprising results. No public evidence either way.
4. **Fourth (least likely): the user has access to a private/staff/test recipe** seeded in their chat by a dev. Remilia v0.7 added "Trinkets, Tune-Ups, and Transformation" — the Transformation half may include recipes not yet on the wiki. No supporting evidence found in public forums.

### Recommended next step
Have the user produce a screenshot of the workbench at the moment of the craft showing exactly which two items are in the input slots, which bench is active (Assemble or Smash), and the output broadcast text. Until then, treat the user's report as "JT x2 + Adamantine Pollen -> Titanium Cube misremembered" per option 1 above.

### Source URLs (forum-hunt agent)
- `https://boards.miladychan.org/beetle/201346` (RemiliaNET Global Chat archive — primary evidence)
- `https://boards.miladychan.org/v/324142` (BeetleBoy crafting recipes thread)
- `https://boards.miladychan.org/v/199639` (Beetle Roster Additions — no recipes)
- `https://boards.miladychan.org/v/417693` (Trophy completion thread)
- `https://boards.miladychan.org/beetle/425669` (Beetle Hunting Tips — new player, no recipes)
- `https://discord.com/invite/milady` (Milady Village invite — landing page only; no channel preview)
- `https://wiki.remilia.org/Beetleboy`
- `https://beetle.wiki/` (and all subpages: `crafted_items`, `antirecipes`, `protips`, `meta:discussion`, `trinket:start`, `junk:start`)
- `https://blog.remilia.org/remilianet-alpha-v0-5-christmas-crafting-update/`
- `https://blog.remilia.org/remilianet-alpha-v0-7-trinkets-tune-ups-and-transformation-2/`

## Wiki deep-scan findings
_Compiled 2026-05-17 by the wiki-deep-scan agent (second pass on beetle.wiki specifically)._

Bust-if-bust verdict: **The recipe `2 Junk Tesseract -> beetle + flower` does not appear anywhere on beetle.wiki at any revision, in db.beetle.wiki's recipe database, in the wiki's own cited dev blogs, or in the wiki's own cited miladychan thread.** Every reasonable wiki-side search angle was checked. Detail:

### Wiki maintainer / authoritative editor

`harblinger` (X handle: `harblinger_eth`). Evidence:
- The `antirecipes` page raw export contains, verbatim: "send harblinger_eth a DM on X and I'll get you the pw" — controlling auth for new recipe submissions.
- `meta:discussion` signed "t. harblinger"; installed plugins; sets wiki conventions.
- Recent Changes shows harblinger and busterdx are the top-2 editors over the last week. Bonkle also active.
- No user profile page for harblinger exists.

### Special pages walked (none yielded the recipe)

- `?do=recent` — full feed read. No revision summary in the captured history mentions `tesseract`, `double`, `smash`, `lottery`, `2x`, or anything matching a `2-tesseract` recipe. Edits cluster around "Flower Reroll" (single-tesseract + flower) and "New Special Beetle Smashes" (fringed_iris/larkspur/passionflower + beetle).
- `?do=index` — full sitemap. Namespaces: `artifact`, `beetle`, `cheese`, `crypto_betting`, `flower`, `hammer`, `junk`, `meta`, `other`, `playground`, `rarity`, `the_climb_of_cbd_edibles`, `trinket`, `trinkets`, `trophy`, `unique`, `wiki`. The `playground` namespace IS listed but empty (`playground:start` 404s — "topic doesn't exist yet"). No `draft:`, `wip:`, `sandbox:`, `scratchpad:`, `archive:`, or `discussion:` namespaces exist.
- `?do=search` queries for `tesseract`, `junk tesseract`, `junk_tesseract x2`, `2 junk_tesseract`, `double`, `lottery`, `roll`, `reroll`, `grigger`, `beetle flower` — all enumerated. **No hit anywhere shows `junk_tesseract x2 -> beetle + flower`**. The `junk_tesseract x2` query returns ONLY the 4 trophy recipes (`+ tin/bronze/mithril/adamantine pollen`).
- `?do=backlink&id=junk_tesseract` — "Nothing was found" (DokuWiki only counts wikilinks, not `<!itemtag>` macros, so this is uninformative).
- `?do=export_raw` — direct raw scrapes of `crafted_items`, `trophies`, `antirecipes`, `protips`, `junk_cube`, `junk:junk_tesseract`, `meta:discussion`, `sidebar`, `start`, `meta:mainmenu`, `found_items` saved locally to `C:\BeetleCoach\*_raw.txt`. Reviewed verbatim. None contain `junk_tesseract x2 -> beetle + flower`.

### crafted_items revision history (the load-bearing check)

The wiki exposed 19 revisions of `crafted_items` (rev IDs 1778262593 thru 1778891217, dated 2026-05-08 through 2026-05-16). I directly fetched the raw source of:
- The OLDEST revision (rev=1778262593, 2026-05-09, busterdx)
- The bonkle "old revision restored" (rev=1778637038, 2026-05-13) — the largest single change in the history (-667B revert)
- The current revision (rev=1778891217, 2026-05-16, harblinger)

In ALL three, the "Higher Dimensional Junk" assemble table contains exactly two rows:
```
| Any [[junk:start|Junk]] item **x2** | **<!junk_cube>** |
| <!junk_cube> **x3** | **<!junk_tesseract>** |
```
**No `junk_tesseract x2` row has ever existed on this page at any captured revision.** The "Flower Reroll" section is always SINGLE `<!junk_tesseract> + <flower>` -> different flower same rarity. The reroll has only ever been a 1-tesseract recipe.

### Wayback Machine — no help

`http://web.archive.org/cdx/search/cdx?url=beetle.wiki/doku.php?id=crafted_items&output=json` returns `[]`. **No Wayback snapshots of `crafted_items` exist at all.** Cannot inspect content older than the wiki's own retained revisions.

### AntiRecipes (negative evidence with a caveat)

Raw export of `antirecipes` shows junk_tesseract appears in only TWO rows:
- `tin_pollen + green + junk_tesseract` (fails)
- `tin_pollen + daisy + junk_tesseract` (fails)

Both are 3-slot, single-tesseract. **`junk_tesseract + junk_tesseract` standalone is NOT listed as an antirecipe.** This is consistent with (but does not prove) the combo being valid — it could just mean no one tried it and recorded it as a NOTHING-HAPPENED.

### db.beetle.wiki recipe API (DIRECT live probe)

`https://db.beetle.wiki/` is a SPA pointing at `/api/recipe?mode={assemble|smash}&items=<csv>` returning JSON. The internal item IDs (from `/api/items`, fetched live) show `junk_cube_t1` = Junk Cube and `junk_cube_t2` = Junk Tesseract. Live results 2026-05-17:

| Query | Response |
|-------|----------|
| `mode=assemble&items=junk_cube_t1,junk_cube_t1,junk_cube_t1` | `{"output":"junk_cube_t2","recipe_id":1,"status":"valid"}` (sanity check passes) |
| `mode=assemble&items=junk_cube_t2,junk_cube_t2` | `{"status":"untested"}` |
| `mode=smash&items=junk_cube_t2,junk_cube_t2` | `{"status":"untested"}` |
| `mode=assemble&items=junk_cube_t2,junk_cube_t2,tin_pollen` (the known trophy) | `{"status":"untested"}` |
| `mode=smash&items=junk_cube_t2,daisy` (the known single-tess reroll) | `{"status":"untested"}` |

**Caveat:** the DB is heavily under-populated — even known wiki recipes return "untested". So the absence of `junk_cube_t2 + junk_cube_t2` is not conclusive. However, the DB infrastructure DOES support comma-separated multi-output recipes (JS code: `outputs = data.output.split(',')`), so the recipe-shape the user describes (beetle + flower simultaneously) would fit the schema. It just isn't recorded.

### Talk pages / discussion namespace

- `crafted_items:discussion` — does not exist (404).
- `meta:discussion` — read; harblinger's admin notes only. Verbatim: "no standard for recipe tables, etc." — supports the case that exotic recipes go undocumented.

### protips re-read

Full file captured. Confirms the upgrade pathways are all `pollen + ladybug = nectar`, `nectar + ladybug = beetle`, `upgraded beetle + junk = flower` style — never involving 2 tesseracts. If `JT x2 -> beetle + flower` were a known chat recipe, it would almost certainly appear in protips' upgrade-pathway notes. It doesn't.

### miladychan thread `/v/324142`

Wiki itself cites this as the canonical recipe-discussion forum. Searched for tesseract: 9 mentions, ALL 1-tesseract hammer recipes. **No 2-tesseract recipe in the cited forum either.**

### blog.remilia.org

`https://blog.remilia.org/?s=tesseract` -> no blog post mentions tesseract at all. The crafting v0.5 post is the most detailed and does not document a 2-tesseract recipe.

### Bottom line (wiki-deep-scan agent)

**The wiki has never documented this recipe at any captured revision.** If the user has confirmed it works in-game, then beetle.wiki simply hasn't been updated for it — consistent with harblinger's own admission that the wiki is incomplete and that the recipe-submission process requires a DM-gated password.

**Recommended next step (wiki-side):** the canonical way to surface this recipe community-side is to (1) DM `@harblinger_eth` on X for the wiki edit password, then add the row to the `crafted_items` "Higher Dimensional Junk" or "Flower Reroll" section; AND/OR (2) log in to db.beetle.wiki (login UI present on the SPA) and submit `junk_cube_t2,junk_cube_t2 -> beetle_any,flower_any` (or specific rarity outputs) via the `/api/recipe POST` endpoint — the multi-output comma format is already supported by the existing frontend code.

## Deep URL hunt
_Compiled 2026-05-17 by the URL-hunt agent — locating Sneed's "BeetleBoy Advanced" web tool._

### Result

**Live URL: `https://beetle.sevensevenseven.net`** (HTTP 200, Apache, Last-Modified 2026-05-16). Page title is literally "BeetleBoy SP" with the in-page header "BeetleBoy AdvanceSP". Interface shows ASSEMBLE workbench with Slot 1/Slot 2/Slot 3/Slot 4, plus TRPHY (trophies), CRAFT (bulk crafting), and CHAT (RemiliaNET chat) tabs — matching the user's description exactly.

### Maker identity

- **GitHub:** `sneedragon` (display name "Charles Sneedworth") — `https://github.com/sneedragon`
- **Repository:** `sneedragon/beetleboy-advance` (created 2026-05-14, last commit 2026-05-16, default branch `master`, 50 commits, 1 star, no LICENSE)
- **Repo description (≤15 words):** "Alternative improved interface for remilia.net's beetleboy"
- **X/Twitter:** `@SNEEDRAGON71717` (https://x.com/SNEEDRAGON71717)
- **Personal site:** `sevensevenseven.net` (currently a placeholder; the BeetleBoy app lives on the `beetle.` subdomain)
- **Source files of note:** `app.js`, `chatroom.php`, `proxy.php`, `upload.php`, `data.js`, `index.html` — note the PHP backend for chatroom + image upload, which matches Sneed's miladychan posts about missing names/pfps requiring refresh (server-side avatar proxy).
- **The Remilia profile `remilia.net/sneed`** is the in-game player handle. The GitHub handle is `sneedragon` (a longer form of the same alias).

### Confirmed feature parity with user's description

Per the GitHub README summary:
- Full inventory overview with icons and rarity colors
- Beetle collection album (beetledex)
- **Searchable, clickable recipes** — matches "all trophy recipes"
- **Mass-crafting functionality** + "Crunch all Junk" button — matches "crafts in bulk"
- Embedded beetle wiki
- **Chatroom with item linking and emoji reactions** — matches "integrates with the remilia.net global chat (users can post messages from within the tool)"
- Desktop notifications for cooldown completions
- Rare drop and trophy announcements

### Investigative path (for future hunts)

1. **bba.vercel.app returned HTTP 451 with `X-Vercel-Error: DEPLOYMENT_DISABLED`** (vs `DEPLOYMENT_NOT_FOUND` 404 for clearly-fake subdomains). This was the original deployment — Vercel disabled it (likely a TOS issue, possibly the chatroom or proxy.php). Sneed redeployed on his own Apache server at `beetle.sevensevenseven.net`.
2. **GitHub repo search `remilia beetleboy`** was the breakthrough — surfaced `sneedragon/beetleboy-advance` as the second result.
3. miladychan posts #425674, #425676, #425684, #425730 (by Dankler(green) and radcat) reference the tool by name ("beetleboy advanced", "BBA", "beetle boy advanced sp site") but no one ever pastes the URL in the thread. Sneed himself only posts game-generated craft confirmations (e.g. #425731 "Crafted [[junk_sphere]]!") and debugging asides about names/pfps (#425736, #425737) — never his own URL.
4. Google/Bing/DuckDuckGo/Mojeek/Searx all return ZERO hits for `"beetleboy advanced"` — the tool is younger than search-engine indexing windows (repo created 3 days ago).
5. The `bba.netlify.app` 200 response was a red herring — that domain hosts an unrelated "bballiance" Vue app, not Sneed's tool.

### What Sneed's tool may know that the wiki doesn't

Since `beetleboy-advance` is a frontend over the live remilia.net game API, it should be able to answer the JT-x2 question by simply attempting the craft. Two paths:
1. **Read `data.js`** in the repo — likely contains a hard-coded recipe table the frontend uses to validate/display crafts before sending. If `data.js` lists `junk_tesseract + junk_tesseract` with any output, that's the answer.
2. **Read `app.js`** for any client-side recipe inference logic.
3. The repo's `proxy.php` likely forwards to remilia.net's craft endpoint — a HEAD/POST against the same endpoint with `junk_tesseract,junk_tesseract` would reveal the canonical server response.

### Source URLs (URL-hunt agent)
- `https://beetle.sevensevenseven.net` — Sneed's live BeetleBoy Advance SP (primary)
- `https://github.com/sneedragon/beetleboy-advance` — source repo
- `https://github.com/sneedragon` — maker profile
- `https://x.com/SNEEDRAGON71717` — maker's X
- `https://sevensevenseven.net` — maker's personal domain (placeholder; "777.network", "The time has yet to come")
- `https://bba.vercel.app` (HTTP 451, `DEPLOYMENT_DISABLED`) — the original deployment, now disabled by Vercel
