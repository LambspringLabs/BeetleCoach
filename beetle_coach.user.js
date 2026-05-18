// ==UserScript==
// @name         Remilia Beetle Coach
// @namespace    http://tampermonkey.net/
// @version      12.4.23
// @description  BeetleBoy coach: state-machine automation, auto-claim/hunt/cheese, auto-login, smart pathways.
// @match        https://www.remilia.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/beetle_coach.user.js
// @downloadURL  https://raw.githubusercontent.com/LambspringLabs/BeetleCoach/master/beetle_coach.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Suppress OIDC auth error alerts that freeze the page
  var _origAlert = window.alert;
  window.alert = function(msg) {
    if (msg && /oidc|security|auth|framable|sessionRestoration/i.test(msg)) {
      console.warn('[BC] Suppressed OIDC alert:', msg);
      return;
    }
    _origAlert.call(window, msg);
  };

  /* ═══════════════════════════════════════════════════════
     1. CONFIG
     ═══════════════════════════════════════════════════════ */
  var VER = '12.4.23';
  var STORE_KEY = 'beetle_coach_v8_store';
  var PANEL_ID = 'bc8-panel';
  var BTN_ID = 'bc8-toggle';
  var STYLE_ID = 'bc8-style';
  var STALE_MS = 120000;
  var HUNT_COST = 20;
  var MIN_CHEESE = 100;
  var TICK_MS = 10000;        // 10s between ticks
  var ACTION_TIMEOUT = 30000;
  var LOGIN_COOLDOWN = 15000;
  var LOGIN_MAX = 10;
  var NAV_COOLDOWN = 60000;
  var VIEW_COOLDOWN = 8000;
  var HUNT_RETRY_DELAY = 3500;
  var BOOT_GRACE = 10000;     // 10s grace before any navigation
  var LOG_THROTTLE = 30000;

  /* ═══════════════════════════════════════════════════════
     2. DATA TABLES
     ═══════════════════════════════════════════════════════ */
  var LABELS = {
    // Beetles (per beetle.wiki itemtag_docs)
    green:'Green Beetle',ladybug:'Ladybug',purple:'Purple Beetle',pond:'Pond Beetle',
    monarch:'Monarch',goliath:'Goliath Beetle',stag:'Stag Beetle',bombardier:'Bombardier Beetle',
    giraffe_weevil:'Giraffe Weevil',pillbug:'Pillbug',imperial_tortoise:'Imperial Tortoise Beetle',
    sabertooth_longhorn:'Sabertooth Longhorn Beetle',sunset_moth:'Sunset Moth',
    mars_rhino:'Mars Rhino Beetle',golden_scarab:'Golden Scarab',hercules:'Hercules Beetle',
    skull:'Skull Beetle',christmas:'Christmas Beetle',
    // v12.4.18: Christmas-update / post-April-2026 beetles
    cucumber:'Striped Cucumber Beetle',bumblebee:'Bumblebee',
    blue_longicorn:'Black-Spotted Blue Longicorn',golden_tiger:'Golden-Spotted Tiger Beetle',
    death_feigning:'Blue Death Feigning Beetle',
    // Flowers
    daisy:'Daisy',poppy:'Poppy',sunflower:'Sunflower',marigold:'Marigold',
    gallic_rose:'Gallic Rose',milk_thistle:'Milk Thistle',royal_poinciana:'Royal Poinciana',
    camellia:'Camellia',morning_glory:'Morning Glory',pincushion:'Pincushion',gazania:'Gazania',
    black_lotus:'Black Lotus',
    // v12.4.18: new flowers
    carnation:'Chinese Pink Carnation',snapdragon:'Common Snapdragon',petunia:'Large White Petunia',
    st_johns_wort:"Spotted St. John's Wort",magnolia:'Southern Magnolia',
    fringed_iris:'Fringed Iris',larkspur:'Two-spike Larkspur',
    passionflower:'Purple Passionflower',
    // Artifacts (5 original + Specimen Pin added v12.4.18)
    nectar:'Nectar',cattail:'Cattail',pinecone:'Pinecone',moss:'Moss',gunpowder:'Gunpowder',
    specimen_pin:'Specimen Pin',
    junk_cube_t1:'Junk Cube',junk_cube_t2:'Junk Tesseract',beetleboy_key:'BeetleBoy Key',
    pollen_tin:'Tin Pollen',pollen_bronze:'Bronze Pollen',pollen_mithril:'Mithril Pollen',
    pollen_adamantine:'Adamantine Pollen',
    cheese:'Cheese',
    hammer_t1:'Tin Hammer',hammer_t2:'Bronze Hammer',hammer_t3:'Mithril Hammer',
    hammer_t4:'Adamantine Hammer',hammer_t5:'Diamond Hammer',
    // Junk items (full 45-item list per wiki itemtag_docs)
    ballpoint_pen:'Ballpoint Pen',bendy_straw:'Bendy Straw',bike_reflector:'Bike Reflector',
    bottle_cap:'Bottle Cap',broken_firework:'Broken Firework',burger_wrapper:'Burger Wrapper',
    button:'Button',chewed_eraser:'Chewed Eraser',chip_bag:'Chip Bag',
    chocolate_bar:'Chocolate Bar',chocolate_wrapper:'Chocolate Wrapper',cigarette_butt:'Cigarette Butt',
    coffee_can:'Coffee Can',cracker_wrapper:'Cracker Wrapper',deodorant_can:'Deodorant Can',
    empty_noodle_cup:'Empty Noodle Cup',event_band:'Event Band',glue_stick:'Glue Stick',
    green_army_man:'Green Army Man',grenade_pin:'Grenade Pin',guitar_pick:'Guitar Pick',
    gum_wrapper:'Gum Wrapper',headphones_90s:'90s Headphones',jack_adapter:'Jack Adapter',
    juicebox:'Juice Box',marble:'Marble',matchbook:'Matchbook',origami_crane:'Origami Crane',
    paperclip:'Paperclip',pebble:'Pebble',pill_bottle:'Empty Pill Bottle',pokkiri_box:'Pokkiri Box',
    ramune_bottle:'Ramune Bottle',red_whistle:'Red Whistle',rubber_band:'Rubber Band',
    salt_pepper_packet:'Salt & Pepper Packet',scratch_off:'Scratch Off',sim_card:'SIM Card',
    smiley_pebble:'Smiley Pebble',soda_can_tab:'Soda Can Tab',stamp:'Stamp',
    train_ticket_stub:'Train Ticket Stub',watch_battery:'Watch Battery',wine_cork:'Wine Cork',
    wristband:'Plastic Wristband'
  };

  var TIER_MAP = {
    green:'Tin',ladybug:'Bronze',purple:'Bronze',pond:'Mithril',monarch:'Mithril',
    goliath:'Adamantine',stag:'Adamantine',bombardier:'Adamantine',
    giraffe_weevil:'Rare',pillbug:'Rare',imperial_tortoise:'Rare',
    sabertooth_longhorn:'Epic',sunset_moth:'Epic',
    mars_rhino:'Legendary',golden_scarab:'Legendary',hercules:'Legendary',
    skull:'Uncommon',christmas:'Special',
    // v12.4.18: new beetles
    cucumber:'Bronze',bumblebee:'Rare',
    blue_longicorn:'Rare',golden_tiger:'Rare',
    death_feigning:'Epic',
    daisy:'Tin',poppy:'Tin',sunflower:'Tin',
    marigold:'Bronze',gallic_rose:'Bronze',milk_thistle:'Bronze',
    royal_poinciana:'Mithril',camellia:'Mithril',morning_glory:'Mithril',
    pincushion:'Adamantine',gazania:'Adamantine',black_lotus:'Legendary',
    // v12.4.18: new flowers
    carnation:'Tin',snapdragon:'Tin',petunia:'Tin',
    st_johns_wort:'Bronze',magnolia:'Bronze',
    fringed_iris:'Mithril',larkspur:'Mithril',
    passionflower:'Adamantine',
    pollen_tin:'Tin',pollen_bronze:'Bronze',pollen_mithril:'Mithril',pollen_adamantine:'Adamantine',
    nectar:'Bridge',cattail:'Bridge',pinecone:'Bridge',moss:'Bridge',gunpowder:'Bridge',
    specimen_pin:'Bridge'
  };
  var TIER_COLORS = {
    Tin:'#7a8a7a',Bronze:'#b87333',Mithril:'#5b8dd9',Adamantine:'#9b59b6',
    Rare:'#e67e22',Epic:'#e74c3c',Legendary:'#f1c40f',Bridge:'#1abc9c',
    Uncommon:'#6a9955',Special:'#e84393'
  };

  var ITEM_ALIASES = {
    pollen_common:'pollen_tin',pollen_uncommon:'pollen_bronze',pollen_rare:'pollen_mithril',
    tin_hammer:'hammer_t1',bronze_hammer:'hammer_t2',mithril_hammer:'hammer_t3',
    adamantine_hammer:'hammer_t4',diamond_hammer:'hammer_t5',
    junk_cube:'junk_cube_t1',junk_tesseract:'junk_cube_t2',
    green_beetle:'green',purple_beetle:'purple',pond_beetle:'pond',
    goliath_beetle:'goliath',stag_beetle:'stag',bombardier_beetle:'bombardier',
    imperial_tortoise_beetle:'imperial_tortoise',sabertooth_longhorn_beetle:'sabertooth_longhorn',
    mars_rhino_beetle:'mars_rhino',hercules_beetle:'hercules',
    gallicrose:'gallic_rose',royalpoinciana:'royal_poinciana',
    morningglory:'morning_glory',milkthistle:'milk_thistle',blacklotus:'black_lotus',
    // v12.4.18: game uses 'golden.png' for Golden Scarab — must alias for collection detection.
    golden:'golden_scarab',goldenscarab:'golden_scarab',
    // v12.4.18: itemtag uses 'death_feigning' for Blue Death Feigning Beetle.
    blue_death_feigning:'death_feigning',blue_death_feigning_beetle:'death_feigning',
    striped_cucumber:'cucumber',striped_cucumber_beetle:'cucumber',
    black_spotted_blue_longicorn:'blue_longicorn',golden_spotted_tiger:'golden_tiger',
    golden_spotted_tiger_beetle:'golden_tiger',
    chinese_pink_carnation:'carnation',common_snapdragon:'snapdragon',
    large_white_petunia:'petunia',spotted_st_johns_wort:'st_johns_wort',
    southern_magnolia:'magnolia',two_spike_larkspur:'larkspur',
    purple_passionflower:'passionflower'
  };

  // v12.4.18: flower lists updated per beetle.wiki itemtag_docs.
  var TIN_FLOWERS = ['daisy','poppy','sunflower','carnation','snapdragon','petunia'];
  var BRONZE_FLOWERS = ['marigold','gallic_rose','milk_thistle','st_johns_wort','magnolia'];
  var MITHRIL_FLOWERS = ['royal_poinciana','camellia','morning_glory','fringed_iris','larkspur'];
  var ADAMANTINE_FLOWERS = ['pincushion','gazania','passionflower'];
  // BRONZE_BEETLES / MITHRIL_BEETLES intentionally exclude cucumber / bumblebee:
  // wiki: "Special beetles like Striped Cucumber Beetle and Bumblebee cannot be
  // transmuted into flowers." Likely they also can't be used in bridge recipes
  // (unverified). Keep them out until in-game testing confirms otherwise.
  var BRONZE_BEETLES = ['ladybug','purple'];
  var MITHRIL_BEETLES = ['pond','monarch'];
  var ADAMANTINE_BEETLES = ['goliath','stag','bombardier'];
  // v12.4.18: junk list updated per beetle.wiki itemtag_docs (45 items, was 27).
  var ANY_JUNK = [
    'ballpoint_pen','bendy_straw','bike_reflector','bottle_cap','broken_firework',
    'burger_wrapper','button','chewed_eraser','chip_bag','chocolate_bar',
    'chocolate_wrapper','cigarette_butt','coffee_can','cracker_wrapper','deodorant_can',
    'empty_noodle_cup','event_band','glue_stick','green_army_man','grenade_pin',
    'guitar_pick','gum_wrapper','headphones_90s','jack_adapter','juicebox',
    'marble','matchbook','origami_crane','paperclip','pebble',
    'pill_bottle','pokkiri_box','ramune_bottle','red_whistle','rubber_band',
    'salt_pepper_packet','scratch_off','sim_card','smiley_pebble','soda_can_tab',
    'stamp','train_ticket_stub','watch_battery','wine_cork','wristband'
  ];
  var JUNK_SET = new Set(ANY_JUNK);
  var SKIP_DISPLAY = new Set(['hammer_t1','hammer_t2','hammer_t3','hammer_t4','hammer_t5','beetleboy_key']);
  var TOKEN_GROUPS = {
    any_junk:ANY_JUNK, any_tin_flower:TIN_FLOWERS, any_bronze_flower:BRONZE_FLOWERS,
    any_mithril_flower:MITHRIL_FLOWERS, any_adamantine_flower:ADAMANTINE_FLOWERS,
    any_bronze_beetle:BRONZE_BEETLES, any_mithril_beetle:MITHRIL_BEETLES,
    any_adamantine_beetle:ADAMANTINE_BEETLES
  };
  var HAMMER_TIERS = ['hammer_t1','hammer_t2','hammer_t3','hammer_t4','hammer_t5'];
  // v12.4.18: postFirstBreak captures the wiki's documented post-first-use bump
  // for Adamantine (2% → 5%) and Diamond (1% → 9%). Display still uses baseBreak
  // for backwards compatibility; future EV logic can read postFirstBreak.
  var HAMMER_STATS = {
    hammer_t1:{bonus:0,baseBreak:10,postFirstBreak:10},
    hammer_t2:{bonus:5,baseBreak:5,postFirstBreak:5},
    hammer_t3:{bonus:20,baseBreak:10,postFirstBreak:10},
    hammer_t4:{bonus:35,baseBreak:2,postFirstBreak:5},
    hammer_t5:{bonus:90,baseBreak:1,postFirstBreak:9}
  };
  var HAMMER_RECIPE_KEY = {
    'Tin Hammer':'hammer_t1','Bronze Hammer':'hammer_t2','Mithril Hammer':'hammer_t3',
    'Adamantine Hammer':'hammer_t4','Diamond Hammer':'hammer_t5'
  };

  // v12.4.18: collection vocabulary expanded.
  // Black Widow / Candycane Tiger Moth (Diamond holiday drops) intentionally
  // omitted — wiki pages are empty and they're only catchable during seasonal
  // windows, so flagging them as "missing" year-round would be noise. Add them
  // when wiki confirms drop windows / recipes.
  var ALL_BEETLES = ['green','ladybug','purple','pond','monarch','goliath','stag','bombardier',
    'giraffe_weevil','pillbug','imperial_tortoise','sabertooth_longhorn','sunset_moth',
    'mars_rhino','golden_scarab','hercules','skull','christmas',
    'cucumber','bumblebee','blue_longicorn','golden_tiger','death_feigning'];
  var ALL_FLOWERS = ['daisy','poppy','sunflower','marigold','gallic_rose','milk_thistle',
    'royal_poinciana','camellia','morning_glory','pincushion','gazania','black_lotus',
    'carnation','snapdragon','petunia','st_johns_wort','magnolia',
    'fringed_iris','larkspur','passionflower'];
  var COLLECTIBLES = new Set([].concat(ALL_BEETLES, ALL_FLOWERS));

  var RECIPES = [
    {label:'Junk Cube',type:'assemble',inputs:['any_junk','any_junk']},
    {label:'Junk Tesseract',type:'assemble',inputs:['junk_cube_t1','junk_cube_t1','junk_cube_t1']},
    {label:'Tin Hammer',type:'assemble',inputs:['junk_cube_t1','junk_cube_t1']},
    {label:'Bronze Hammer',type:'assemble',inputs:['hammer_t1','junk_cube_t2','pollen_tin']},
    {label:'Mithril Hammer',type:'assemble',inputs:['hammer_t2','junk_cube_t2','pollen_bronze']},
    {label:'Adamantine Hammer',type:'assemble',inputs:['hammer_t3','junk_cube_t2','pollen_mithril']},
    {label:'Diamond Hammer',type:'assemble',inputs:['hammer_t4','junk_cube_t2','pollen_adamantine']},
    {label:'Tin Pollen',type:'assemble',inputs:['any_tin_flower','any_tin_flower']},
    {label:'Bronze Pollen',type:'assemble',inputs:['any_bronze_flower','any_bronze_flower']},
    {label:'Mithril Pollen',type:'assemble',inputs:['any_mithril_flower','any_mithril_flower']},
    {label:'Adamantine Pollen',type:'assemble',inputs:['any_adamantine_flower','any_adamantine_flower']},
    {label:'Nectar / Cattail Bridge',type:'smash',inputs:['any_bronze_beetle','pollen_bronze']},
    {label:'Pinecone / Moss / Gunpowder Bridge',type:'smash',inputs:['any_mithril_beetle','pollen_mithril']},
    {label:'Pond Beetle',type:'smash',inputs:['cattail','ladybug']},
    {label:'Monarch',type:'smash',inputs:['nectar','ladybug']},
    // v12.4.20: removed Monarch (alt) [nectar+purple], Bombardier (alt)
    // [gunpowder+monarch], and Goliath (alt) [pinecone+monarch]. Per WIKI_AUDIT
    // section A.2 these substitutions are wiki-ambiguous (the recipes table
    // shows only "+ Ladybug" / "+ Pond"). User priority: never recommend an
    // unverified craft. They can still be crafted manually if the user wants
    // to test in-game. Stag has no (alt), so removal also restores internal
    // consistency among the three Adamantine artifact-craft beetles.
    {label:'Bombardier Beetle',type:'smash',inputs:['gunpowder','pond']},
    {label:'Stag Beetle',type:'smash',inputs:['moss','pond']},
    {label:'Goliath Beetle',type:'smash',inputs:['pinecone','pond']},
    {label:'Giraffe Weevil',type:'smash',inputs:['royal_poinciana','pond']},
    {label:'Giraffe Weevil (alt)',type:'smash',inputs:['royal_poinciana','monarch']},
    {label:'Pillbug',type:'smash',inputs:['camellia','pond']},
    {label:'Pillbug (alt)',type:'smash',inputs:['camellia','monarch']},
    {label:'Imperial Tortoise Beetle',type:'smash',inputs:['morning_glory','pond']},
    {label:'Imperial Tortoise Beetle (alt)',type:'smash',inputs:['morning_glory','monarch']},
    {label:'Sabertooth Longhorn Beetle',type:'smash',inputs:['pincushion','goliath']},
    {label:'Sabertooth Longhorn (Stag)',type:'smash',inputs:['pincushion','stag']},
    {label:'Sabertooth Longhorn (Bomb)',type:'smash',inputs:['pincushion','bombardier']},
    {label:'Sunset Moth',type:'smash',inputs:['gazania','goliath']},
    {label:'Sunset Moth (Stag)',type:'smash',inputs:['gazania','stag']},
    {label:'Sunset Moth (Bomb)',type:'smash',inputs:['gazania','bombardier']},
    {label:'Black Lotus',type:'smash',inputs:['gunpowder','moss','pinecone']},
    {label:'Mars Rhino Beetle',type:'smash',inputs:['black_lotus','sunset_moth','sabertooth_longhorn']},
    {label:'Hercules Beetle',type:'smash',inputs:['golden_scarab','pollen_adamantine','purple']},
    // v12.4.18: New special-beetle smashes per beetle.wiki crafted_items page.
    {label:'Black-Spotted Blue Longicorn',type:'smash',inputs:['fringed_iris','any_mithril_beetle']},
    {label:'Golden-Spotted Tiger Beetle',type:'smash',inputs:['larkspur','any_mithril_beetle']},
    {label:'Blue Death Feigning Beetle',type:'smash',inputs:['passionflower','any_adamantine_beetle']},
    // v12.4.18: Transmute recipes rewritten to wiki-canonical 2-input form
    // (single beetle + Junk Cube → same-tier flower). Pre-v12.4.18 recipes used
    // a 3-input form (green + beetle + junk_cube) sourced from chat folklore
    // that the wiki does not document. The 2-input form is what
    // beetle.wiki/doku.php?id=crafted_items shows. Cucumber and Bumblebee are
    // excluded from any_bronze_beetle / any_mithril_beetle because the wiki
    // explicitly says "Special beetles like Striped Cucumber Beetle and
    // Bumblebee cannot be transmuted into flowers."
    {label:'Tin Flower Transmute',type:'smash',inputs:['green','junk_cube_t1']},
    {label:'Bronze Flower Transmute',type:'smash',inputs:['any_bronze_beetle','junk_cube_t1']},
    {label:'Mithril Flower Transmute',type:'smash',inputs:['any_mithril_beetle','junk_cube_t1']},
    {label:'Adamantine Flower Transmute',type:'smash',inputs:['any_adamantine_beetle','junk_cube_t1']},
    // v12.4.21: Flower Reroll recipes (Assemble — Junk Tesseract + Flower
    // yields a random different flower of the same tier). Confirmed by /v/324142
    // game broadcasts (e.g. "YOU ASSEMBLED A Purple Passionflower FROM A Gazania
    // AND A Junk Tesseract!"). RNG-output — output can include the input flower
    // itself (broadcast: "Gazania + Junk Tesseract -> Gazania"), so mean ~3
    // attempts to hit a specific target in a 3-flower tier. Annotated with
    // MULTI_OUTPUT_RECIPES so the panel shows "(random sibling)".
    {label:'Tin Flower Reroll',type:'assemble',inputs:['junk_cube_t2','any_tin_flower']},
    {label:'Bronze Flower Reroll',type:'assemble',inputs:['junk_cube_t2','any_bronze_flower']},
    {label:'Mithril Flower Reroll',type:'assemble',inputs:['junk_cube_t2','any_mithril_flower']},
    {label:'Adamantine Flower Reroll',type:'assemble',inputs:['junk_cube_t2','any_adamantine_flower']},
    // v12.4.21: Junk Tesseract Gamble (Assemble — 2 Junk Tesseracts alone
    // yields a probabilistic output: confirmed game broadcasts include
    // Bumblebee, random Mithril flower, Specimen Pin (~1.3% rare jackpot),
    // and per user observation also random Pond/Wort with occasional 1x JT
    // refund. The /v/324142 thread and beetle.sevensevenseven.net data file
    // label this "Gamble for Specimen Pin" -- Specimen Pin is the labeled
    // target but real distribution is much wider. See V_THREAD_FINDINGS.md.
    // Moderate RECIPE_VALUE (30) so it surfaces as a backup option but
    // doesn't dominate purposeful crafts.
    {label:'Junk Tesseract Gamble',type:'assemble',inputs:['junk_cube_t2','junk_cube_t2']}
  ];
  var RECIPE_VALUE = {
    'Hercules Beetle':100,'Mars Rhino Beetle':95,'Black Lotus':88,'Diamond Hammer':82,
    'Sabertooth Longhorn Beetle':78,'Sunset Moth':78,'Sabertooth Longhorn (Stag)':78,'Sabertooth Longhorn (Bomb)':78,
    'Sunset Moth (Stag)':78,'Sunset Moth (Bomb)':78,'Adamantine Pollen':75,'Adamantine Hammer':65,
    // v12.4.18: new special-beetle recipes
    'Blue Death Feigning Beetle':78,
    'Black-Spotted Blue Longicorn':60,'Golden-Spotted Tiger Beetle':60,
    'Goliath Beetle':60,'Stag Beetle':60,
    'Bombardier Beetle':55,
    'Giraffe Weevil':55,'Giraffe Weevil (alt)':55,'Pillbug':55,'Pillbug (alt)':55,
    'Imperial Tortoise Beetle':55,'Imperial Tortoise Beetle (alt)':55,
    'Pinecone / Moss / Gunpowder Bridge':50,'Nectar / Cattail Bridge':40,'Mithril Pollen':40,
    'Mithril Hammer':30,'Pond Beetle':25,'Monarch':25,
    'Bronze Hammer':15,'Bronze Pollen':12,
    'Tin Flower Transmute':4,'Bronze Flower Transmute':10,'Mithril Flower Transmute':35,
    'Adamantine Flower Transmute':55,
    // v12.4.21: Flower Rerolls + Junk Tesseract Gamble. Reroll values
    // reflect that the user typically has plenty of JTs but the tier's
    // flowers may be a bottleneck (Adamantine especially). Adamantine
    // Reroll set above Transmute because it's the cheapest path to the
    // missing Passionflower for endgame collection.
    'Tin Flower Reroll':4,'Bronze Flower Reroll':10,'Mithril Flower Reroll':40,
    'Adamantine Flower Reroll':60,
    'Junk Tesseract Gamble':30,
    'Junk Tesseract':8,'Tin Hammer':6,'Tin Pollen':5,'Junk Cube':1
  };
  var RECIPE_OUTPUT = {
    'Pond Beetle':'pond','Monarch':'monarch',
    'Goliath Beetle':'goliath',
    'Stag Beetle':'stag','Bombardier Beetle':'bombardier',
    'Giraffe Weevil':'giraffe_weevil','Giraffe Weevil (alt)':'giraffe_weevil',
    'Pillbug':'pillbug','Pillbug (alt)':'pillbug',
    'Imperial Tortoise Beetle':'imperial_tortoise','Imperial Tortoise Beetle (alt)':'imperial_tortoise',
    'Sabertooth Longhorn Beetle':'sabertooth_longhorn','Sabertooth Longhorn (Stag)':'sabertooth_longhorn','Sabertooth Longhorn (Bomb)':'sabertooth_longhorn',
    'Sunset Moth':'sunset_moth','Sunset Moth (Stag)':'sunset_moth','Sunset Moth (Bomb)':'sunset_moth',
    'Mars Rhino Beetle':'mars_rhino','Hercules Beetle':'hercules','Black Lotus':'black_lotus',
    // v12.4.18: new special-beetle recipe outputs
    'Black-Spotted Blue Longicorn':'blue_longicorn',
    'Golden-Spotted Tiger Beetle':'golden_tiger',
    'Blue Death Feigning Beetle':'death_feigning'
  };
  var NEEDED_AS_INGREDIENT = new Set(['sabertooth_longhorn','sunset_moth','black_lotus']);

  var PREREQ_RECIPES = {
    'pinecone':['Pinecone / Moss / Gunpowder Bridge'],'moss':['Pinecone / Moss / Gunpowder Bridge'],
    'gunpowder':['Pinecone / Moss / Gunpowder Bridge'],
    'nectar':['Nectar / Cattail Bridge'],'cattail':['Nectar / Cattail Bridge'],
    'pollen_tin':['Tin Pollen'],'pollen_bronze':['Bronze Pollen'],
    'pollen_mithril':['Mithril Pollen'],'pollen_adamantine':['Adamantine Pollen'],
    // v12.4.18: passionflower needed for Blue Death Feigning
    // v12.4.21: Adamantine Flower Reroll added as alternative path
    // (cheaper for users with plenty of JTs; same RNG over the 3
    // Adamantine flowers). Order matters — Reroll listed first so the
    // progression engine prefers it when both are craftable.
    'gazania':['Adamantine Flower Reroll','Adamantine Flower Transmute'],
    'pincushion':['Adamantine Flower Reroll','Adamantine Flower Transmute'],
    'passionflower':['Adamantine Flower Reroll','Adamantine Flower Transmute'],
    // v12.4.21: Mithril Flower Reroll for new special flowers
    'fringed_iris':['Mithril Flower Reroll','Mithril Flower Transmute'],
    'larkspur':['Mithril Flower Reroll','Mithril Flower Transmute'],
    'any_adamantine_beetle':['Goliath Beetle','Stag Beetle','Bombardier Beetle'],
    'junk_cube_t1':['Junk Cube'],'junk_cube_t2':['Junk Tesseract']
  };

  var STAGES = [
    {n:1,name:'Gathering',check:['green']},
    {n:2,name:'Pollen & Bridges',check:['pollen_tin']},
    {n:3,name:'Mithril Beetles',check:['pond','monarch']},
    {n:4,name:'Adamantine Beetles',check:['bombardier','stag','goliath']},
    {n:5,name:'Rare Beetles',check:['giraffe_weevil','pillbug','imperial_tortoise']},
    {n:6,name:'Epic Beetles',check:['sabertooth_longhorn','sunset_moth']},
    {n:7,name:'Endgame',check:['black_lotus','mars_rhino','hercules']}
  ];
  var ENDGAME_CHAIN = [
    {key:'goliath',recipe:'Goliath Beetle',prereqs:['pinecone'],via:'Mithril Bridge for Pinecone'},
    {key:'sunset_moth',recipe:'Sunset Moth',prereqs:['gazania','any_adamantine_beetle'],via:'Need Gazania'},
    {key:'black_lotus',recipe:'Black Lotus',prereqs:['gunpowder','moss','pinecone'],via:'All 3 Mithril artifacts'},
    {key:'mars_rhino',recipe:'Mars Rhino Beetle',prereqs:['black_lotus','sunset_moth','sabertooth_longhorn'],via:'Black Lotus + Sunset + Sabertooth'},
    {key:'hercules',recipe:'Hercules Beetle',prereqs:['golden_scarab','pollen_adamantine'],via:'Golden Scarab is drop-only'}
  ];
  var BROAD_CHAIN = [
    {key:'pollen_bronze',recipe:'Bronze Pollen',prereqs:[],via:'Assemble 2 Bronze flowers',minQty:3},
    {key:'goliath',recipe:'Goliath Beetle',prereqs:['pinecone'],via:'Mithril Bridge for Pinecone'},
    {key:'stag',recipe:'Stag Beetle',prereqs:['moss'],via:'Mithril Bridge for Moss'},
    {key:'bombardier',recipe:'Bombardier Beetle',prereqs:['gunpowder'],via:'Mithril Bridge for Gunpowder'},
    {key:'gazania',recipe:'Adamantine Flower Transmute',prereqs:[],via:'Adamantine beetle + Junk Cube (random Adamantine flower)'},
    {key:'pincushion',recipe:'Adamantine Flower Transmute',prereqs:[],via:'Adamantine beetle + Junk Cube (random Adamantine flower)'},
    {key:'black_lotus',recipe:'Black Lotus',prereqs:['gunpowder','moss','pinecone'],via:'All 3 Mithril artifacts'},
    {key:'sabertooth_longhorn',recipe:'Sabertooth Longhorn Beetle',prereqs:['pincushion','any_adamantine_beetle'],via:'Pincushion + Adamantine beetle'},
    {key:'sunset_moth',recipe:'Sunset Moth',prereqs:['gazania','any_adamantine_beetle'],via:'Gazania + Adamantine beetle'},
    {key:'mars_rhino',recipe:'Mars Rhino Beetle',prereqs:['black_lotus','sunset_moth','sabertooth_longhorn'],via:'All 3 endgame pieces'},
    {key:'hercules',recipe:'Hercules Beetle',prereqs:['golden_scarab','pollen_adamantine'],via:'Golden Scarab + Adamantine Pollen'}
  ];
  var FLOWER_CHAIN = [
    {key:'pollen_bronze',recipe:'Bronze Pollen',prereqs:[],via:'Assemble 2 Bronze flowers',minQty:5},
    {key:'nectar',recipe:'Nectar / Cattail Bridge',prereqs:['pollen_bronze'],via:'Bronze beetle + Bronze Pollen',minQty:3},
    {key:'cattail',recipe:'Nectar / Cattail Bridge',prereqs:['pollen_bronze'],via:'Bronze beetle + Bronze Pollen',minQty:3},
    {key:'pollen_mithril',recipe:'Mithril Pollen',prereqs:[],via:'Assemble 2 Mithril flowers',minQty:3},
    {key:'pinecone',recipe:'Pinecone / Moss / Gunpowder Bridge',prereqs:['pollen_mithril'],via:'Mithril beetle + Mithril Pollen'},
    {key:'moss',recipe:'Pinecone / Moss / Gunpowder Bridge',prereqs:['pollen_mithril'],via:'Mithril beetle + Mithril Pollen'},
    {key:'gunpowder',recipe:'Pinecone / Moss / Gunpowder Bridge',prereqs:['pollen_mithril'],via:'Mithril beetle + Mithril Pollen'},
    {key:'gazania',recipe:'Adamantine Flower Transmute',prereqs:[],via:'Adamantine beetle + Junk Cube (random Adamantine flower)'},
    {key:'pincushion',recipe:'Adamantine Flower Transmute',prereqs:[],via:'Adamantine beetle + Junk Cube (random Adamantine flower)'},
    {key:'pollen_adamantine',recipe:'Adamantine Pollen',prereqs:[],via:'Assemble Pincushion + Gazania'}
  ];
  var FLOWER_CONSUMING = new Set(['Tin Pollen','Bronze Pollen','Mithril Pollen','Adamantine Pollen','Bronze Flower Transmute','Mithril Flower Transmute']);
  // v12.4.20: recipes that produce ONE OF several siblings, not a deterministic
  // output. Used by renderPanel to annotate goal/step recipes that look
  // deterministic but aren't (e.g. "Adamantine Flower Transmute" yields a
  // random Adamantine flower — Pincushion, Gazania, or Passionflower).
  // Keep this set in sync with any new RNG-output recipe.
  var MULTI_OUTPUT_RECIPES = new Set([
    'Nectar / Cattail Bridge',
    'Pinecone / Moss / Gunpowder Bridge',
    'Tin Flower Transmute',
    'Bronze Flower Transmute',
    'Mithril Flower Transmute',
    'Adamantine Flower Transmute',
    // v12.4.21: Flower Rerolls + Junk Tesseract Gamble — all RNG output.
    // The Gamble has the widest output menu (Bumblebee / Mithril flower /
    // Specimen Pin / random beetle / partial refund) so its "(random
    // sibling)" annotation understates the variance — consider promoting
    // to a stronger "(LOTTERY)" badge in a future revision.
    'Tin Flower Reroll',
    'Bronze Flower Reroll',
    'Mithril Flower Reroll',
    'Adamantine Flower Reroll',
    'Junk Tesseract Gamble'
  ]);
  var BLOCKLIST = /^(svg|icon|button|slot|empty|more|smash|eject|assemble|home|search|left|right|go_back|show_password|claim|load|logo|dots|arrow|cheeseman|static\d*|beetleboy_logo|beetle_catch|craft|beetle_shader)$/i;
  var PFP_HASH = /^(pfp_\d+|retart|remilio|radbro|default|[a-f0-9]{20,})$/i;

  /* ═══════════════════════════════════════════════════════
     3. HELPERS
     ═══════════════════════════════════════════════════════ */
  function norm(raw) { if (!raw) return null; var k = String(raw).toLowerCase().trim().replace(/\.[a-z0-9]+$/i,'').replace(/%20/g,'_').replace(/[^\w]+/g,'_').replace(/^_+|_+$/g,''); return ITEM_ALIASES[k] || k; }
  function dn(k) { return LABELS[k] || k; }
  function cnt(inv, arr) { return arr.reduce(function(s,k) { return s + (inv[k]||0); }, 0); }
  function tokenCount(inv, t) { var g = TOKEN_GROUPS[t]; return g ? cnt(inv,g) : (inv[t]||0); }
  function tokHuman(t) { var m = {any_junk:'any junk',any_tin_flower:'Tin flowers x2',any_bronze_flower:'Bronze flower',any_mithril_flower:'Mithril flower',any_adamantine_flower:'Adamantine flower',any_bronze_beetle:'Bronze beetle',any_mithril_beetle:'Mithril beetle',any_adamantine_beetle:'Adamantine beetle'}; return m[t] || dn(t); }
  function isValid(k) { return k && !BLOCKLIST.test(k) && !PFP_HASH.test(k); }
  function isVisible(el) { return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }
  function bodyText() { return (document.body && document.body.innerText) || ''; }
  function currentCartridge() { var m = window.location.href.match(/[?&]cartridge=([^&#]+)/i); return m ? m[1].toLowerCase() : ''; }
  function safeClick(el) { if (!el) return false; try { el.click(); return true; } catch(e) {} try { el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); return true; } catch(e2) {} return false; }
  function firstVisible(sels) { for (var i = 0; i < sels.length; i++) { var nodes = document.querySelectorAll(sels[i]); for (var j = 0; j < nodes.length; j++) if (isVisible(nodes[j])) return nodes[j]; } return null; }
  function buttonText(el) { return ((el && (el.textContent || el.value || el.getAttribute('aria-label') || '')) || '').replace(/\s+/g,' ').trim(); }
  function buttonUsable(btn) { return !!(btn && !btn.disabled && !btn.classList.contains('disabled') && btn.getAttribute('aria-disabled') !== 'true'); }
  function findButton(sels) { var btn = firstVisible(sels); return buttonUsable(btn) ? btn : null; }
  function findTextButton(root, re) {
    if (!root) return null;
    var nodes = root.querySelectorAll('button, a, div[role="button"], input[type="button"], input[type="submit"]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!isVisible(el) || !buttonUsable(el)) continue;
      if (re.test(buttonText(el))) return el;
    }
    return null;
  }
  function bestHammerTier() { return S.ownedHammers.length ? Math.max.apply(null, S.ownedHammers.map(function(h) { return HAMMER_TIERS.indexOf(h); })) : -1; }

  /* ═══════════════════════════════════════════════════════
     4. STATE MANAGEMENT
     ═══════════════════════════════════════════════════════ */
  function defaultSession() {
    return {claims:0, hunts:0, cheeseClaims:0, cheeseGained:0, gains:[], totalXP:0, startTime:Date.now()};
  }
  function defaults() {
    return { ver:VER, mergedInventory:{}, currentHammer:null, ownedHammers:[], brokenHammers:[], discoveredHammers:[],
      currentHammerBonus:null, currentHammerBreakChance:null, timers:{}, lastFullScan:0, lastPassiveScan:0,
      autoClaim:true, autoHunt:true, paused:false, panelOpen:true, level:null, craftMode:null, strategy:'endgame',
      log:[], machineState:'BOOTING', stateEnteredAt:Date.now(), lastActionAt:0, stuckReloads:0,
      disconnectedSince:0, disconnectReloads:0,
      // v12.4.22: chat monitor + compact mode + free-smash tracking
      compact:false,         // collapse panel to essentials when true
      lastUbcAt:0,           // last UBC daily-cheese claim timestamp (resets hammer break-chance)
      lastSmashAt:0,         // last detected smash from chat broadcast (global flag, kept for backwards compat)
      craftCounters:{},      // {recipeOutputKey: countThisSession} — incremented by chat broadcast parser
      myUsername:'sails',    // user's chat display name (matched against broadcast author)
      // v12.4.23: per-hammer free-smash tracking. Each owned hammer gets one
      // 0%-break smash per day after UBC daily reset (per wiki/protips). We
      // track per-hammer instead of a single global flag so users with
      // multiple hammers see independent indicators. Heuristic: smash
      // detected from chat → attribute to S.currentHammer (the highest-tier
      // non-broken hammer). Wrong if user manually selects a lower-tier
      // hammer in the bench (Grigger Maxxing), but the chat broadcast
      // doesn't say which hammer was used.
      hammerSmashedSince:{}, // {hammer_t1: timestamp, hammer_t2: timestamp, ...}
      session:defaultSession() };
  }
  function normalizeSession(rawSession) {
    var session = Object.assign(defaultSession(), rawSession || {});
    var gains = [];
    if (Array.isArray(session.gains)) {
      gains = session.gains.slice();
    } else if (session.gains && typeof session.gains === 'object') {
      Object.keys(session.gains).forEach(function(name) {
        var count = parseInt(session.gains[name], 10) || 0;
        for (var i = 0; i < count; i++) gains.push(name);
      });
    } else if (Array.isArray(session.beetles)) {
      gains = session.beetles.slice();
    }
    session.claims = parseInt(session.claims, 10) || 0;
    session.hunts = parseInt(session.hunts, 10) || 0;
    session.cheeseClaims = parseInt(session.cheeseClaims, 10) || 0;
    session.cheeseGained = parseInt(session.cheeseGained, 10) || 0;
    session.totalXP = parseInt(session.totalXP, 10) || 0;
    if (!session.startTime || !isFinite(session.startTime)) session.startTime = Date.now();
    session.gains = gains;
    return session;
  }
  function load() {
    try {
      var raw = GM_getValue(STORE_KEY, null);
      if (!raw) return defaults();
      var parsed = JSON.parse(raw);
      var p = Object.assign(defaults(), parsed);
      p.session = normalizeSession((parsed || {}).session);
      if ((p.ver||'0').split('.')[0] !== VER.split('.')[0]) { p.mergedInventory = {}; p.log = []; p.session = defaultSession(); }
      // v12.4.23: backward-compat migration. v12.4.22 used a single
      // S.lastSmashAt flag; v12.4.23 adds per-hammer S.hammerSmashedSince.
      // If old state has a smash recorded post-UBC but no per-hammer
      // entries yet, conservatively mark the current hammer as smashed
      // so the indicator doesn't incorrectly show all-free on first load.
      if (!p.hammerSmashedSince) p.hammerSmashedSince = {};
      if (p.lastSmashAt && p.lastSmashAt > (p.lastUbcAt||0) && Object.keys(p.hammerSmashedSince).length === 0 && p.currentHammer) {
        p.hammerSmashedSince[p.currentHammer] = p.lastSmashAt;
      }
      p.ver = VER; p.machineState = 'BOOTING'; p.stateEnteredAt = Date.now();
      return p;
    } catch(e) { return defaults(); }
  }
  function save() { try { GM_setValue(STORE_KEY, JSON.stringify(S)); } catch(e) {} }
  var S = load(), _huntRetryTimer = null;
  function transition(state) {
    if (state !== 'HUNTING' && _huntRetryTimer) { clearTimeout(_huntRetryTimer); _huntRetryTimer = null; }
    S.machineState = state; S.stateEnteredAt = Date.now(); save();
  }
  function stateAge() { return Date.now() - S.stateEnteredAt; }

  var _throttled = {};
  function logEvent(msg) { var ts = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); S.log.push(ts+' '+msg); if (S.log.length > 30) S.log = S.log.slice(-30); save(); var el = document.getElementById('bc8-log'); if (el) el.innerHTML = S.log.slice().reverse().map(function(l) { return '<div class="bc8-log-line">'+l+'</div>'; }).join(''); }
  function logThrottled(key, msg, ms) { var now = Date.now(); if (now - (_throttled[key]||0) < (ms||LOG_THROTTLE)) return; _throttled[key] = now; logEvent(msg); }
  // Desktop notification when the script genuinely needs the user (e.g.
  // Chrome autofill needs a real click, Auth Portal stuck after reload).
  // Throttled so we don't spam — at most one per category per 10 minutes.
  // GM_notification works in background tabs without permission prompts.
  var _notified = {};
  function notify(key, title, body) {
    var now = Date.now();
    if (now - (_notified[key]||0) < 600000) return;
    _notified[key] = now;
    try {
      if (typeof GM_notification === 'function') {
        GM_notification({title: 'Beetle Coach: ' + title, text: body, timeout: 0, onclick: function(){ try { window.focus(); } catch(e){} }});
      }
    } catch(e) { /* GM_notification unavailable; the panel log still has the message */ }
  }
  function scheduleHuntRetry(ms) {
    if (_huntRetryTimer) clearTimeout(_huntRetryTimer);
    _huntRetryTimer = setTimeout(function() {
      _huntRetryTimer = null;
      // v12.4.22: respect S.paused. Previously, a hunt-retry scheduled
      // pre-pause could fire ~3.5s after the user paused, doing one more
      // hunt attempt before the state-machine dispatch noticed pause.
      // Now we bail explicitly. Logged in LESSONS_LEARNED.md §8.
      if (S.paused) return;
      if (S.machineState === 'HUNTING') handleHunting();
    }, ms || HUNT_RETRY_DELAY);
  }

  /* ═══════════════════════════════════════════════════════
     5. DOM PARSING
     ═══════════════════════════════════════════════════════ */
  function resolveItemKey(itemEl, imgEl) {
    if (imgEl) {
      var bg = (imgEl.style && imgEl.style.backgroundImage) || '';
      if (!bg || bg === 'none') try { bg = getComputedStyle(imgEl).backgroundImage || ''; } catch(e) {}
      var m = bg.match(/\/beetle\/images\/icons\/[^/]+\/([^."')]+)\.(png|jpg|webp|gif|svg)/i);
      if (m && m[1]) return norm(m[1]);
      var img = imgEl.querySelector('img') || (imgEl.tagName === 'IMG' ? imgEl : null);
      if (img) { var src = img.getAttribute('src') || ''; var m2 = src.match(/\/beetle\/images\/icons\/[^/]+\/([^."'?#]+)\.(png|jpg|webp|gif|svg)/i); if (m2 && m2[1]) return norm(m2[1]); var m3 = src.match(/\/([^/."'?#]+)\.(png|jpg|webp|gif|svg)/i); if (m3 && m3[1]) return norm(m3[1]); }
    }
    var cands = imgEl ? [imgEl, itemEl] : [itemEl];
    for (var i = 0; i < cands.length; i++) { var el = cands[i]; if (!el) continue; var txt = el.getAttribute('alt') || el.getAttribute('title') || el.getAttribute('aria-label') || ''; if (txt) return norm(txt); }
    return null;
  }
  function scanPage(sel, imgCls, cntCls) {
    var r = {}, unresolved = 0;
    document.querySelectorAll(sel).forEach(function(item) { var imgEl = item.querySelector(imgCls); var k = resolveItemKey(item, imgEl); if (!k || !isValid(k)) { unresolved++; return; } var el = item.querySelector(cntCls); r[k] = Math.max(r[k]||0, el ? (parseInt(el.textContent.trim(),10)||1) : 1); });
    return {items:r, unresolved:unresolved};
  }
  function fingerprint(items) { return Object.keys(items).sort().map(function(k) { return k+':'+items[k]; }).join(','); }

  var _scanning = false;
  async function fullScan() {
    if (_scanning || !tabVisible()) return;
    _scanning = true; var totalUnresolved = 0, oldInv = Object.assign({}, S.mergedInventory);
    try {
      var merged = {};
      var merge = function(r) { for (var k in r.items) merged[k] = Math.max(merged[k]||0, r.items[k]); totalUnresolved += r.unresolved; };
      var seenFP = {};
      merge(scanPage('.crafting-module__inventory-grid .crafting-module__beetle-item','.crafting-module__beetle-img','.crafting-module__beetle-item-count'));
      for (var i = 0; i < 20; i++) { var more = document.querySelector('.crafting-module__pagination-button'); if (!more || more.disabled || more.classList.contains('disabled')) break; more.click(); await new Promise(function(r){setTimeout(r,600);}); var page = scanPage('.crafting-module__inventory-grid .crafting-module__beetle-item','.crafting-module__beetle-img','.crafting-module__beetle-item-count'); var fp = fingerprint(page.items); if (seenFP[fp]) break; seenFP[fp] = true; merge(page); }
      var seenFP2 = {};
      merge(scanPage('.beetle-catch-module__beetle-item','.beetle-catch-module__beetle-img','.beetle-catch-module__beetle-item-count'));
      for (var j = 0; j < 20; j++) { var more2 = document.querySelector('.beetle-catch-module__pagination-button'); if (!more2 || more2.disabled || more2.classList.contains('disabled')) break; more2.click(); await new Promise(function(r){setTimeout(r,600);}); var page2 = scanPage('.beetle-catch-module__beetle-item','.beetle-catch-module__beetle-img','.beetle-catch-module__beetle-item-count'); var fp2 = fingerprint(page2.items); if (seenFP2[fp2]) break; seenFP2[fp2] = true; merge(page2); }
      if (Object.keys(merged).length > 0) {
        // First-population scan (post-Reset or first ever): we have no
        // baseline to diff against, so every item would look "new" and
        // dump 191 ladybugs into session.gains as if just caught. Log
        // the populate but don't credit gains on this pass.
        var firstPopulation = Object.keys(oldInv).length === 0;
        S.mergedInventory = merged;
        var changes = [];
        for (var k in merged) { var old = oldInv[k]||0; if (merged[k] > old && !JUNK_SET.has(k) && k !== 'cheese') { changes.push(dn(k)+' +'+(merged[k]-old)); if (!firstPopulation && ALL_BEETLES.indexOf(k) > -1 && k !== 'green') for (var bi = 0; bi < merged[k]-old; bi++) S.session.gains.push(dn(k)); } }
        var jd = cnt(merged,ANY_JUNK) - cnt(oldInv,ANY_JUNK); if (jd > 0) changes.push('Junk +'+jd);
        var cd = (merged.cheese||0) - (oldInv.cheese||0); if (cd !== 0) changes.push('Cheese '+(cd>0?'+':'')+cd);
        // v12.4.18: only log scans with actual changes. Pre-v12.4.18 logged
        // every scan including no-ops, which filled the 30-line log cap with
        // "Scan: no changes (1 unresolved)" within an idle hour. Unresolved is
        // surfaced separately when meaningful (changes occurred). Pure no-op
        // scans are silent.
        if (changes.length) {
          logEvent('Scan: '+changes.join(', ')+(totalUnresolved ? ' ('+totalUnresolved+' unresolved)' : ''));
        } else if (totalUnresolved && totalUnresolved !== S._lastUnresolved) {
          // Log only when unresolved COUNT changes — indicates a new item type
          // appeared (likely a wiki update). Suppresses steady-state noise.
          logEvent('Scan: '+totalUnresolved+' unresolved item type(s) — script may need a data refresh');
          S._lastUnresolved = totalUnresolved;
        } else if (!totalUnresolved && S._lastUnresolved) {
          S._lastUnresolved = 0;
        }
        S.lastFullScan = Date.now(); S.lastPassiveScan = Date.now();
      } else { logEvent('Scan: no items found'); }
    } finally { _scanning = false; }
    parseTimers(); parseHammer(); parseLevel(); parseCraftMode(); save(); renderPanel();
  }

  function passiveScan() {
    if (_scanning || document.hidden) return;
    if (!document.querySelector('.crafting-module__beetle-item, .beetle-catch-module__beetle-item')) return;
    var vis = {}, updated = false;
    var r1 = scanPage('.crafting-module__inventory-grid .crafting-module__beetle-item','.crafting-module__beetle-img','.crafting-module__beetle-item-count');
    var r2 = scanPage('.beetle-catch-module__beetle-item','.beetle-catch-module__beetle-img','.beetle-catch-module__beetle-item-count');
    for (var k in r1.items) vis[k] = Math.max(vis[k]||0, r1.items[k]);
    for (var k2 in r2.items) vis[k2] = Math.max(vis[k2]||0, r2.items[k2]);
    if (!Object.keys(vis).length) return;
    for (var k3 in vis) {
      if (S.mergedInventory.hasOwnProperty(k3)) { if (vis[k3] !== S.mergedInventory[k3]) { S.mergedInventory[k3] = vis[k3]; updated = true; } }
      else if (isValid(k3) && LABELS[k3]) { if (!S._pending) S._pending = {}; if (S._pending[k3]) { S.mergedInventory[k3] = vis[k3]; updated = true; delete S._pending[k3]; } else S._pending[k3] = Date.now(); }
    }
    if (S._pending) { var now = Date.now(); for (var pk in S._pending) if (now - S._pending[pk] > 300000) delete S._pending[pk]; }
    S.lastPassiveScan = Date.now(); if (updated) save();
    parseTimers(); parseHammer();
  }

  function parseTimers() {
    var t = {beetleCatch:null, dailyCheese:null, huntCooldown:null};
    var bc = document.querySelector('.beetle-game-nav .info span:last-child');
    if (bc) { var v = bc.textContent.trim(); if (/\d/.test(v)) t.beetleCatch = v; }
    if (!t.beetleCatch) { var nav = document.querySelector('.beetle-game-nav .info'); if (nav && /ready/i.test(nav.textContent)) t.beetleCatch = 'Ready!'; }
    var dc = document.querySelector('.cheese-claim-nav .info span:last-child');
    if (dc) { var v2 = dc.textContent.trim(); if (/\d/.test(v2)) t.dailyCheese = v2; }
    if (!t.dailyCheese) { var navC = document.querySelector('.cheese-claim-nav .info'); if (navC && /ready/i.test(navC.textContent)) t.dailyCheese = 'Ready!'; }
    var cd = document.querySelector('.beetle-catch-module__cooldown-timer');
    if (cd) { var v3 = cd.textContent.trim().replace(/\s*to\s+next\s+claim\s*/i,'').trim(); if (/\d/.test(v3)) t.beetleCatch = v3; }
    var hc = document.querySelector('.beetle-catch-module__hunt-button-cheese-cost');
    if (hc) { var txt = hc.textContent.trim(); if (/cooldown/i.test(txt)) { var cl = txt.replace(/\s*cooldown\s*/i,'').trim(); if (/\d/.test(cl)) t.huntCooldown = cl; } else if (/cheese/i.test(txt)) t.huntCooldown = 'Ready!'; }
    // v12.4.23: detect manual UBC claim. If the cheese-claim timer was "Ready"
    // last tick and is now a countdown like "23h 59m", the daily-cheese
    // claim just fired — either via BC's clickCheeseButton (which already
    // sets lastUbcAt directly) or by the user manually clicking in-game.
    // In either case, mark the UBC event so the free-smash indicator
    // resets. Guards (from code review):
    //   - boot grace: ignore for first 60s after script boot (React mount
    //     can briefly show "Ready" before transitioning to the real timer)
    //   - recently auto-claimed: bail if clickCheeseButton fired in the
    //     last 30s — that path already set lastUbcAt directly
    var prevDC = (S.timers && S.timers.dailyCheese) || '';
    var wasReady = /ready/i.test(prevDC);
    var nowCountdown = t.dailyCheese && !/ready/i.test(t.dailyCheese) && /\d/.test(t.dailyCheese);
    var recentlyAutoClaimed = (Date.now() - (S.lastUbcAt || 0)) < 30000;
    var pastBootGrace = (Date.now() - (_bootTime || 0)) > 60000;
    if (wasReady && nowCountdown && !recentlyAutoClaimed && pastBootGrace) {
      S.lastUbcAt = Date.now();
      S.hammerSmashedSince = {};
      logEvent('Manual UBC claim detected — hammer break chance reset.');
    }
    S.timers = t;
  }
  function parseHammer() {
    var owned = [], broken = [], discovered = [];
    document.querySelectorAll('.crafting-module__hammer-row .crafting-module__hammer-slot').forEach(function(s) {
      if (s.classList.contains('crafting-module__hammer-slot--undiscovered')) return;
      var img = s.querySelector('.crafting-module__beetle-img'); if (!img) return;
      var k = resolveItemKey(s, img);
      if (k && k.indexOf('hammer_t') === 0) { discovered.push(k); if (s.classList.contains('crafting-module__hammer-slot--empty')) broken.push(k); else owned.push(k); }
    });
    function dedupe(a) { var s = {}; return a.filter(function(v) { return s[v] ? false : (s[v]=true); }); }
    S.ownedHammers = dedupe(owned).sort(function(a,b) { return HAMMER_TIERS.indexOf(b) - HAMMER_TIERS.indexOf(a); });
    S.brokenHammers = dedupe(broken); S.discoveredHammers = dedupe(discovered);
    S.currentHammer = S.ownedHammers[0] || null;
    var st = S.currentHammer ? HAMMER_STATS[S.currentHammer] : null;
    S.currentHammerBonus = st ? st.bonus : null; S.currentHammerBreakChance = st ? st.baseBreak : null;
  }
  function parseLevel() {
    var el = document.querySelector('.beetle-card__level');
    if (el) {
      var m = el.textContent.match(/(\d+)/);
      if (m) {
        var lv = parseInt(m[1],10);
        if (S.level && lv > S.level) logEvent('LEVEL UP! '+S.level+' -> '+lv);
        S.level = lv;
      }
    }
    var posts = document.querySelectorAll('.postBody');
    var xpValues = [];
    posts.forEach(function(p) {
      var xpM = (p.textContent || '').match(/\+(\d+)\s*XP/i);
      if (xpM) xpValues.push(parseInt(xpM[1], 10));
    });
    if (!S._xpPostsSeen) S._xpPostsSeen = 0;
    if (xpValues.length > S._xpPostsSeen) {
      if (!S.session.totalXP) S.session.totalXP = 0;
      S.session.totalXP += xpValues.slice(S._xpPostsSeen).reduce(function(sum, xp) { return sum + xp; }, 0);
      S._xpPostsSeen = xpValues.length;
    }
  }
  function parseCraftMode() { var cm = document.querySelector('.crafting-module'); S.craftMode = cm ? (cm.classList.contains('crafting-module--smash') ? 'Smash' : 'Assemble') : null; }
  function isFresh() { return Date.now() - (S.lastPassiveScan||0) < STALE_MS || Date.now() - (S.lastFullScan||0) < STALE_MS; }

  /* ═══════════════════════════════════════════════════════
     5.5. CHAT BROADCAST MONITOR (v12.4.22)
     ═══════════════════════════════════════════════════════
     Watches the Global Chat element for the user's own crafting
     broadcasts. Parses the game's deterministic message templates
     and updates:
       - S.lastSmashAt       (for free-smash indicator gating)
       - S.craftCounters[k]  (per-output session count)
       - S.session.gains     (when a beetle output is detected)
       - S.log               (added "Chat: ..." entries for visibility)

     The chat element on remilia.net is rendered server-side; we
     don't have a stable class to query. We use a tolerant selector
     and silently skip if not found. Runs each tick — see tick().
     Observation-only; safe to run while paused.

     v12.4.23: _seenSigs Set replaces v12.4.22's single _lastChatSig.
     The earlier design double-counted when the MutationObserver and
     pollChat raced: observer would process line N-1 and N (set sig to
     sig of N), then pollChat would iterate the last 10 lines, see N-2
     wasn't sig-matched to N, and re-process N-2. Set-based dedup
     tracks all recently-processed sigs and skips them in both paths.
     Pruned at 100 entries (chat moves slowly enough that 100 is
     several minutes of history). */
  var _seenSigs = new Set();
  function chatSigSeen(sig) {
    if (!sig) return false;
    if (_seenSigs.has(sig)) return true;
    _seenSigs.add(sig);
    if (_seenSigs.size > 100) {
      var arr = Array.from(_seenSigs);
      _seenSigs = new Set(arr.slice(arr.length - 50));
    }
    return false;
  }
  var _lastChatSig = ''; // legacy, kept as a fast-path hint; primary dedup is _seenSigs
  function parseChatBroadcast(text) {
    if (!text) return null;
    // Long-form ASSEMBLE: "YOU ASSEMBLED A <out> FROM <ingredients>!"
    var m = text.match(/YOU ASSEMBLED\s+(?:A|AN|\d+)?\s*([A-Za-z][A-Za-z'\- ]+?)(?:\s+TROPHY)?\s+FROM/i);
    if (m) return {type:'assemble', output:m[1].trim().toLowerCase().replace(/\s+/g,'_'), raw:text};
    // Long-form SMASH: "YOU SACRIFICED A <sac> AND SMASHED <ing> INTO A <out>!"
    m = text.match(/AND SMASHED.+?INTO\s+(?:A|AN|\d+)?\s*([A-Za-z][A-Za-z'\- ]+?)(?:\s+TROPHY)?\s*!/i);
    if (m) return {type:'smash', output:m[1].trim().toLowerCase().replace(/\s+/g,'_'), raw:text};
    // Trophy short-form: "🏆 Crafted [[item_key]]!" or similar emoji prefix
    m = text.match(/Crafted\s+\[\[([a-z0-9_]+)\]\]/i);
    if (m) return {type:'trophy', output:m[1].toLowerCase(), raw:text};
    return null;
  }
  function findChatContainer() {
    // Tolerant lookup — chat element class isn't stable. Try several patterns.
    var candidates = [
      '.messages',
      '[class*="global-chat"] .messages',
      '[class*="GlobalChat"] .messages',
      '[class*="chat-messages"]',
      '[class*="chat"] [class*="messages"]'
    ];
    for (var i = 0; i < candidates.length; i++) {
      var el = document.querySelector(candidates[i]);
      if (el && el.children && el.children.length > 0) return el;
    }
    return null;
  }
  function processChatLine(text) {
    // v12.4.23: shared parser used by both pollChat and the MutationObserver.
    // Idempotency via _lastChatSig (caller's responsibility to update sig
    // BEFORE calling this to prevent observer/poll double-count race).
    if (!text || text.length < 5) return false;
    var myName = (S.myUsername || 'sails').toLowerCase();
    if (text.toLowerCase().indexOf(myName) < 0) return false;
    var bc = parseChatBroadcast(text);
    if (!bc) return false;
    // Only SMASH recipes consume hammer durability + the daily 0%-break
    // bonus. Assemble recipes (Junk Cube, Pollen, Reroll, Tesseract
    // Gamble) don't use a hammer at all per wiki — they should NOT mark
    // a smash event. v12.4.23 narrows the smash-tracking to type==='smash'
    // (v12.4.22 incorrectly bucketed both, per code review).
    if (bc.type === 'smash') {
      S.lastSmashAt = Date.now();
      if (S.currentHammer) {
        S.hammerSmashedSince = S.hammerSmashedSince || {};
        S.hammerSmashedSince[S.currentHammer] = Date.now();
      }
    }
    S.craftCounters = S.craftCounters || {};
    S.craftCounters[bc.output] = (S.craftCounters[bc.output] || 0) + 1;
    if (ALL_BEETLES.indexOf(bc.output) > -1 && bc.output !== 'green') {
      S.session.gains.push(dn(bc.output));
    }
    logEvent('Chat: ' + bc.type + ' → ' + dn(bc.output));
    return true;
  }
  function setupChatObserver() {
    // v12.4.23: lower-latency chat monitor via MutationObserver. Once
    // attached, fires immediately on new chat lines instead of waiting
    // for the next 10s tick. Falls back to pollChat (which still runs
    // each tick) if the observer can't attach. Both share _lastChatSig
    // for dedup. Idempotent — only attaches once.
    if (window.__bcChatObs) return;
    var attempts = 0;
    var attach = function() {
      attempts++;
      if (attempts > 20) return; // ~5 min of retries, then give up
      var chat = findChatContainer();
      if (!chat) { setTimeout(attach, 15000); return; }
      try {
        window.__bcChatObs = new MutationObserver(function(muts) {
          muts.forEach(function(m) {
            for (var i = 0; i < m.addedNodes.length; i++) {
              var n = m.addedNodes[i];
              if (!n || n.nodeType !== 1) continue;
              var text = (n.textContent || '').trim().slice(0, 300);
              if (!text) continue;
              var sig = text.slice(0, 200);
              if (chatSigSeen(sig)) continue;
              if (processChatLine(text)) {
                save();
                renderPanel();
              }
            }
          });
        });
        window.__bcChatObs.observe(chat, {childList:true, subtree:false});
        logEvent('Chat monitor attached (live).');
      } catch (e) { /* fall back to polling */ }
    };
    attach();
  }
  function pollChat() {
    // Read latest chat line, parse if it's a craft broadcast from the user.
    // No-op safe: returns silently if chat element not present.
    try {
      var chat = findChatContainer();
      if (!chat) return;
      var lines = chat.children;
      if (!lines || !lines.length) return;
      // v12.4.23: shared chatSigSeen() Set-based dedup eliminates the
      // observer/poll double-count race. Both paths skip lines whose
      // sig is already in _seenSigs (added on first sighting).
      var startIdx = Math.max(0, lines.length - 10);
      var sigUpdated = false;
      for (var i = startIdx; i < lines.length; i++) {
        var ln = lines[i];
        var text = (ln.textContent || '').trim();
        var sig = text.slice(0, 200);
        if (chatSigSeen(sig)) continue;
        if (processChatLine(text)) sigUpdated = true;
      }
      if (sigUpdated) save();
    } catch (e) { /* defensive: chat structure may change; skip silently */ }
  }
  function dailyFreeSmashAvailable() {
    // v12.4.22 global helper kept for backwards compat — true if ANY hammer
    // has a free smash available. New per-hammer helpers below are preferred.
    var ubc = S.lastUbcAt || 0;
    var smash = S.lastSmashAt || 0;
    if (!ubc && !smash) return true;
    return smash < ubc;
  }
  function hammerIsFresh(hammerKey) {
    // v12.4.23: per-hammer free-smash check. True if this hammer hasn't been
    // smashed since the last UBC daily reset. Boot state (no UBC tracked
    // yet) treated optimistically as fresh.
    if (!hammerKey) return false;
    var ubc = S.lastUbcAt || 0;
    var smashed = (S.hammerSmashedSince && S.hammerSmashedSince[hammerKey]) || 0;
    if (!ubc && !smashed) return true;
    return smashed < ubc;
  }
  function freeSmashSummary() {
    // v12.4.23: returns {freeCount, totalOwned, perHammer:[{key, label, fresh, abbr}]}
    // for use in renderPanel's status strip and tooltip.
    var owned = S.ownedHammers || [];
    var abbrMap = {hammer_t1:'T', hammer_t2:'B', hammer_t3:'M', hammer_t4:'A', hammer_t5:'D'};
    var perHammer = owned.map(function(k) {
      return {key:k, label:dn(k), fresh:hammerIsFresh(k), abbr:(abbrMap[k]||'?')};
    });
    var freeCount = perHammer.filter(function(h){return h.fresh;}).length;
    return {freeCount:freeCount, totalOwned:owned.length, perHammer:perHammer};
  }
  function computeJunkCompress(inv) {
    // Returns: {raw, possibleCubesFromRaw, currentCubes, totalCubesAfterCompress, possibleTess, currentTess, sessionCubesCrafted, sessionTessCrafted}
    var raw = cnt(inv, ANY_JUNK);
    var currentCubes = inv['junk_cube_t1'] || 0;
    var currentTess = inv['junk_cube_t2'] || 0;
    var possibleCubesFromRaw = Math.floor(raw / 2);
    var totalCubesAfterCompress = currentCubes + possibleCubesFromRaw;
    var possibleTess = Math.floor(totalCubesAfterCompress / 3);
    var cc = (S.craftCounters && S.craftCounters.junk_cube_t1) || (S.craftCounters && S.craftCounters.junk_cube) || 0;
    var tc = (S.craftCounters && S.craftCounters.junk_cube_t2) || (S.craftCounters && S.craftCounters.junk_tesseract) || 0;
    return {
      raw:raw, currentCubes:currentCubes, currentTess:currentTess,
      possibleCubesFromRaw:possibleCubesFromRaw,
      totalCubesAfterCompress:totalCubesAfterCompress,
      possibleTess:possibleTess,
      sessionCubesCrafted:cc, sessionTessCrafted:tc
    };
  }

  /* ═══════════════════════════════════════════════════════
     6. RECOMMENDATION ENGINE
     ═══════════════════════════════════════════════════════ */
  function canMake(r, inv) { var needed = {}; for (var i = 0; i < r.inputs.length; i++) { var t = r.inputs[i]; needed[t] = (needed[t]||0)+1; } for (var tok in needed) { var g = TOKEN_GROUPS[tok]; if (g ? cnt(inv,g) < needed[tok] : (inv[tok]||0) < needed[tok]) return false; } return true; }
  function wouldConsumeLastCollectible(recipe, inv) {
    if (S.strategy === 'flowers' && FLOWER_CONSUMING.has(recipe.label)) return false;
    var out = RECIPE_OUTPUT[recipe.label]||null, makesNew = out && COLLECTIBLES.has(out) && !(inv[out]||0);
    for (var i = 0; i < recipe.inputs.length; i++) {
      var t = recipe.inputs[i], g = TOKEN_GROUPS[t];
      if (g) { for (var gi = 0; gi < g.length; gi++) { if ((inv[g[gi]]||0) > 0 && COLLECTIBLES.has(g[gi]) && (inv[g[gi]]||0) <= 1) { var hasAlt = false; for (var ai = 0; ai < g.length; ai++) if (ai !== gi && (inv[g[ai]]||0) > 1) { hasAlt = true; break; } if (!hasAlt && !(makesNew && !isProtected(g[gi],inv,out))) return true; } } }
      else if (COLLECTIBLES.has(t) && (inv[t]||0) <= 1 && !(makesNew && !isProtected(t,inv,out))) return true;
      if (!g && isProtected(t,inv,out)) return true;
    }
    return false;
  }
  function isProtected(key, inv, forOut) {
    var needsAda = !(inv['bombardier']||0) || !(inv['stag']||0) || !(inv['goliath']||0);
    if (needsAda) { if (forOut === 'bombardier' || forOut === 'stag' || forOut === 'goliath') return false; if ((key === 'pond' || key === 'monarch') && (inv[key]||0) <= 2) return true; }
    if (!(inv['black_lotus']||0)) { if (forOut === 'black_lotus') return false; if ((key === 'pinecone' || key === 'moss' || key === 'gunpowder') && (inv[key]||0) <= 1) return true; }
    if (!(inv['sunset_moth']||0)) { if (forOut === 'sunset_moth') return false; if (key === 'gazania' && (inv[key]||0) <= 1) return true; }
    if (!(inv['sabertooth_longhorn']||0)) { if (forOut === 'sabertooth_longhorn') return false; if (key === 'pincushion' && (inv[key]||0) <= 1) return true; }
    if (!(inv['mars_rhino']||0)) { if (forOut === 'mars_rhino') return false; if ((key === 'black_lotus' || key === 'sunset_moth' || key === 'sabertooth_longhorn') && (inv[key]||0) <= 1) return true; }
    if (!(inv['hercules']||0)) { if (forOut === 'hercules') return false; if ((key === 'golden_scarab' || key === 'pollen_adamantine') && (inv[key]||0) <= 1) return true; }
    // v12.4.20: protect the new "special-beetle" mithril/adamantine flowers
    // (fringed_iris, larkspur, passionflower). Without these, the Mithril
    // Pollen / Adamantine Pollen / Mithril Flower Transmute recipes could
    // consume the user's last copy if at least one same-tier sibling has 2+.
    // Closes the gap RECIPE_AUDIT.md section 4 identified.
    if (!(inv['blue_longicorn']||0)) { if (forOut === 'blue_longicorn') return false; if (key === 'fringed_iris' && (inv[key]||0) <= 1) return true; }
    if (!(inv['golden_tiger']||0)) { if (forOut === 'golden_tiger') return false; if (key === 'larkspur' && (inv[key]||0) <= 1) return true; }
    if (!(inv['death_feigning']||0)) { if (forOut === 'death_feigning') return false; if (key === 'passionflower' && (inv[key]||0) <= 1) return true; }
    return false;
  }
  function getDirectCrafts(inv) {
    var ht = bestHammerTier();
    return RECIPES.filter(function(r) {
      if (r.label === 'Junk Cube' || !canMake(r,inv)) return false;
      var hk = HAMMER_RECIPE_KEY[r.label]; if (hk) { var isBroken = S.brokenHammers && S.brokenHammers.indexOf(hk) > -1; var ot = HAMMER_TIERS.indexOf(hk); if (!isBroken && (ot<=ht||ot>ht+1)) return false; }
      var out = RECIPE_OUTPUT[r.label]; if (out && COLLECTIBLES.has(out) && (inv[out]||0) > 0 && !NEEDED_AS_INGREDIENT.has(out)) return false;
      return !wouldConsumeLastCollectible(r,inv);
    }).sort(function(a,b) { return (RECIPE_VALUE[b.label]||5) - (RECIPE_VALUE[a.label]||5); });
  }
  function getStage(inv) { var c = 0; for (var i = 0; i < STAGES.length; i++) { if (STAGES[i].check.every(function(k) { return (inv[k]||0) > 0; })) c = STAGES[i].n; else break; } return c; }
  function getCollection(inv) { return { ownedB:ALL_BEETLES.filter(function(k){return (inv[k]||0)>0;}), ownedF:ALL_FLOWERS.filter(function(k){return (inv[k]||0)>0;}), missingB:ALL_BEETLES.filter(function(k){return !(inv[k]||0);}), missingF:ALL_FLOWERS.filter(function(k){return !(inv[k]||0);}), totalB:ALL_BEETLES.length, totalF:ALL_FLOWERS.length }; }
  function getProgressionMove(inv) {
    var chain = S.strategy === 'flowers' ? FLOWER_CHAIN : (S.strategy === 'broad' ? BROAD_CHAIN : ENDGAME_CHAIN);
    var bestD = null, bestP = null, bestB = null;
    for (var i = 0; i < chain.length; i++) {
      var g = chain[i]; if ((inv[g.key]||0) >= (g.minQty||1)) continue;
      var miss = g.prereqs.filter(function(p) { return tokenCount(inv,p) < 1; });
      var val = RECIPE_VALUE[g.recipe] || 30;
      if (miss.length === 0 && g.recipe) { var recs = RECIPES.filter(function(r) { return RECIPE_OUTPUT[r.label] === g.key || r.label === g.recipe; }); var d = recs.find(function(r) { return canMake(r,inv) && !wouldConsumeLastCollectible(r,inv); }); if (d && (!bestD || val > bestD.val)) { bestD = {val:val,type:'direct',goal:g.key,label:d.label}; } continue; }
      if (!bestP) { for (var mi = 0; mi < miss.length; mi++) { var pls = PREREQ_RECIPES[miss[mi]]; if (!pls) continue; for (var pi = 0; pi < pls.length; pi++) { var pr = RECIPES.find(function(r){return r.label===pls[pi];}); if (pr && canMake(pr,inv) && !wouldConsumeLastCollectible(pr,inv)) { bestP = {val:val,type:'prereq',goal:g.key,label:pls[pi],reason:'For '+dn(g.key)+': craft '+pls[pi]}; break; } } if (bestP) break; } }
      if (!bestB) bestB = {type:'blocked',goal:g.key,label:g.recipe,reason:miss.length?'Need: '+miss.map(tokHuman).join(', '):(g.via||'Need inputs'),via:g.via};
    }
    return bestD || bestP || bestB;
  }

  /* ═══════════════════════════════════════════════════════
     7. ACTIONS
     ═══════════════════════════════════════════════════════ */
  var _navBlockedUntil = 0, _viewBlockedUntil = 0, _bootTime = Date.now();

  // Cartridge eject detection + lever click. Scoped to .beetle-catch-module:
  // the page has THREE .toggle-container elements (catch / ubc / crafting),
  // each with its own .toggle-bar.ejected state. A global selector would
  // fire ejection recovery whenever the crafting cart is "ejected" (which
  // is normal — we're not playing it), and could click the wrong lever.
  // We only care about the catch module's lever.
  function isCartridgeEjected() {
    var bar = document.querySelector('.beetle-catch-module .toggle-bar');
    if (bar && bar.classList.contains('ejected')) return true;
    return !!document.querySelector(
      '.beetle-catch-module__catch-button.disconnected, ' +
      '.beetle-catch-module__hunt-button.disconnected'
    );
  }
  function loadCartridge() {
    // Why DOM clicks don't work when ejected: the game layers a
    // .carousel.disconnected overlay on top of .toggle-container when the
    // cartridge is out (the "SELECT A GAME CARTRIDGE" panel). Hit-testing
    // at the toggle's coordinates returns the overlay, so React's
    // event-delegation never fires the onClick on .toggle-container even
    // though c.click() dispatches a real event there. Direct invocation
    // of the React props.onClick bypasses hit-testing. Also: load/eject
    // is purely client state — no network call — and React commits the
    // class change ~1–3s later (verified empirically), not synchronously.
    var container = document.querySelector('.beetle-catch-module .toggle-container');
    if (!container || !isVisible(container)) return false;
    var barBefore = container.querySelector('.toggle-bar');
    var classBefore = barBefore ? barBefore.className : '(missing)';
    var propsKey = null;
    for (var k in container) { if (k.indexOf('__reactProps') === 0) { propsKey = k; break; } }
    var props = propsKey ? container[propsKey] : null;
    var fired = false;
    if (props && typeof props.onClick === 'function') {
      try {
        props.onClick({preventDefault:function(){},stopPropagation:function(){},currentTarget:container,target:container});
        fired = true;
      } catch(e) { /* fall through to DOM click */ }
    }
    if (!fired) fired = safeClick(container);
    // Verify ~2000ms later (state commit can take 1–3s). If still ejected
    // we log once per minute with class list + URL cart param so a
    // genuine no-op surfaces; transient delays don't.
    setTimeout(function() {
      var barAfter = document.querySelector('.beetle-catch-module .toggle-bar');
      var classAfter = barAfter ? barAfter.className : '(missing)';
      if (classAfter.indexOf('ejected') !== -1) {
        logThrottled('lever-noop',
          'Lever click did not clear ejection. cart='+(currentCartridge()||'(none)')+
          ' props='+(props?'yes':'no')+' before=['+classBefore+'] after=['+classAfter+']',
          60000);
      }
    }, 2000);
    return fired;
  }

  function authBlockReason() { var t = bodyText(); if (/oidc-spa:\s*for security reasons/i.test(t) || /auth response/i.test(t)) return 'auth'; if (/sign in\s*or\s*register/i.test(t)) return 'signed-out'; if (/\bsign in\b/i.test(t) && !document.querySelector('.beetle-game-nav .info, .cheese-claim-nav .info')) return 'signed-out'; return null; }
  function tabVisible() { return !document.visibilityState || document.visibilityState === 'visible'; }
  function gameReady() { return !authBlockReason() && !!document.querySelector('#root, #app, .navbar-content, header, nav'); }
  function onBeetle() { return currentCartridge() === 'beetle'; }
  function onCraftView() { return !!firstVisible(['.crafting-module','.crafting-module__inventory-grid','.crafting-module__hammer-row']); }
  function onCatchView() {
    return !!firstVisible([
      '.beetle-catch-module__catch-button',
      '.beetle-catch-module__hunt-button',
      '.beetle-catch-module__cooldown-timer',
      '.beetle-catch-module__hunt-button-cheese-cost'
    ]);
  }
  function navReady() { return gameReady() && !detectLoginScreen().screen && !(_navBlockedUntil && Date.now() < _navBlockedUntil) && Date.now() - _bootTime >= BOOT_GRACE && !!document.querySelector('.navbar-content, .search-input, .beetle-game-nav, .cheese-claim-nav'); }

  function ensureCartridge(cart, reason) {
    cart = (cart||'').toLowerCase();
    if (currentCartridge() === cart) return true;
    if (!navReady()) {
      if (detectLoginScreen().screen) logThrottled('nav-login-'+cart, 'Navigation deferred while login is active.', 60000);
      return false;
    }
    var target = cart === 'beetle' ? firstVisible(['.beetle-game-nav','a[href*="cartridge=beetle"]']) : cart === 'cheese' ? firstVisible(['.cheese-claim-nav','a[href*="cartridge=cheese"]']) : null;
    _navBlockedUntil = Date.now() + NAV_COOLDOWN;
    if (target && safeClick(target)) { logEvent('Switching to '+cart+' for '+reason); return false; }
    logEvent('Navigating to '+cart+' for '+reason); window.location.assign('https://www.remilia.net/home?cartridge='+cart); return false;
  }

  function ensureCatchView(reason) {
    if (!onBeetle()) return false;
    if (onCatchView()) return true;
    if (!gameReady()) return false;
    if (_viewBlockedUntil && Date.now() < _viewBlockedUntil) return false;
    if (onCraftView()) {
      _viewBlockedUntil = Date.now() + VIEW_COOLDOWN;
      logThrottled('catch-reload-'+reason, 'Reloading Beetle Catch for '+reason+'.', 30000);
      window.location.assign('https://www.remilia.net/home?cartridge=beetle');
      return false;
    }
    var nav = firstVisible(['.beetle-game-nav','a[href*="cartridge=beetle"]']);
    if (!nav) {
      _viewBlockedUntil = Date.now() + VIEW_COOLDOWN;
      logThrottled('catch-nav-missing', 'Beetle Catch nav not available yet. Reloading beetle.', 30000);
      window.location.assign('https://www.remilia.net/home?cartridge=beetle');
      return false;
    }
    _viewBlockedUntil = Date.now() + VIEW_COOLDOWN;
    logThrottled('catch-view-'+reason, 'Switching to Beetle Catch for '+reason+'.', 15000);
    safeClick(nav);
    return false;
  }

  function currentCheeseCount() {
    var m = bodyText().match(/YOU HAVE (\d[\d,]*) (?:PIECES OF )?CHEESE/i);
    if (m) return parseInt(m[1].replace(/,/g,''),10) || 0;
    return parseInt(S.mergedInventory.cheese,10) || 0;
  }

  function findCatchActionButton(kind) {
    var btn = findButton([kind === 'hunt' ? '.beetle-catch-module__hunt-button' : '.beetle-catch-module__catch-button']);
    if (btn) return btn;
    var root = firstVisible(['.beetle-catch-module']);
    return findTextButton(root, kind === 'hunt' ? /\bhunt(?:\s+beetle)?\b/i : /\bclaim(?:\s+beetle)?\b/i);
  }

  function findCheeseClaimButton() {
    var btn = findButton(['.claim-button']);
    if (btn) return btn;
    var root = firstVisible(['.cheese-claim-module','[class*="cheese"]']);
    return findTextButton(root, /\bclaim\b/i);
  }

  function clickHuntButton() {
    if (!onBeetle()) return 'wrong-cart';
    var btn = findCatchActionButton('hunt');
    if (!btn) return 'no-button';
    var text = buttonText(btn);
    if (/cooldown/i.test(text)) return 'cooldown';
    if (/processing|loading/i.test(text)) return 'processing';
    if (!safeClick(btn)) return 'click-failed';
    S.session.hunts++; S.lastActionAt = Date.now(); logEvent('Auto-hunted (-'+HUNT_COST+' cheese)'); save();
    return 'fired';
  }

  function clickClaimButton() {
    if (!onBeetle()) return 'wrong-cart';
    var btn = findCatchActionButton('claim');
    if (!btn) return 'no-button';
    var text = buttonText(btn);
    if (/processing|loading/i.test(text)) return 'processing';
    if (!safeClick(btn)) return 'click-failed';
    S.session.claims++; S.lastActionAt = Date.now(); logEvent('Auto-claimed beetle!'); save();
    return 'fired';
  }

  function clickCheeseButton() {
    var btn = findCheeseClaimButton();
    if (!btn) return 'no-button';
    if (!safeClick(btn)) return 'click-failed';
    // v12.4.22: track UBC timestamp — daily cheese claim is the daily reset
    // event that returns every hammer's Current Break Chance to 0% (per the
    // wiki + protips). The Free-Smash indicator uses this.
    // v12.4.23: also clear per-hammer smash flags so all hammers show free.
    S.lastUbcAt = Date.now();
    S.hammerSmashedSince = {};
    S.session.cheeseClaims++; S.lastActionAt = Date.now(); logEvent('Auto-claimed daily cheese!'); save();
    return 'fired';
  }

  function claimReady() { var nav = document.querySelector('.beetle-game-nav .info'); return nav && /ready/i.test(nav.textContent); }
  function huntReady() {
    if (!S.autoHunt) return false;
    var ch = currentCheeseCount();
    if (ch < HUNT_COST || ch - HUNT_COST < MIN_CHEESE) return false;
    var ce = firstVisible(['.beetle-catch-module__hunt-button-cheese-cost']);
    return !(ce && /cooldown/i.test(ce.textContent||''));
  }
  function cheeseReady() { var nav = document.querySelector('.cheese-claim-nav .info'); return nav && /ready/i.test(nav.textContent); }

  /* ═══════════════════════════════════════════════════════
     8. LOGIN FLOW
     ═══════════════════════════════════════════════════════ */
  var _loginAttempts = 0;
  // S.lastLoginTime is persisted via GM_setValue so the LOGIN_COOLDOWN
  // (15s) survives the page reloads triggered by failed login submits.
  // Without persistence, fail→reload→retry storms repeat every 100ms.
  function detectLoginScreen() {
    var url = window.location.href, body = bodyText();
    if (/\/oidc\/.*openid-connect/i.test(url)) {
      var email = document.querySelector('input[name="username"], input[type="email"], input[name="email"]');
      var pass = document.querySelector('input[name="password"], input[type="password"]');
      var submit = document.querySelector('input[type="submit"], button[type="submit"]');
      if (!submit) { var btns = document.querySelectorAll('button, input[type="button"], a'); for (var i = 0; i < btns.length; i++) if (/^\s*sign\s*in\s*$/i.test(btns[i].textContent.trim())) { submit = btns[i]; break; } }
      // Screen 3: login form with email + password
      if (email && pass) {
        var form = pass.closest('form') || email.closest('form') || null;
        // Browser autofill is inconsistent here, so we keep multiple submit paths ready.
        return {screen:3, el:submit || pass, pass:pass, submit:submit, form:form, desc:'Sign In (robust submit)', useRobustSubmit:true};
      }
      // Screen 2: Auth portal
      if (/AUTHENTICATION\s*PORTAL/i.test(body)) { var pb = document.querySelectorAll('button, a, div[role="button"]'); for (var j = 0; j < pb.length; j++) if (/^\s*SIGN\s*IN\s*$/i.test(pb[j].textContent.trim()) && !/NEW/i.test(pb[j].textContent)) return {screen:2,el:pb[j],desc:'Auth Portal SIGN IN'}; }
      return {screen:0,el:null,desc:'OIDC page, nothing actionable'};
    }
    // Screen 1: main site logged out
    if (/sign\s*in\s*(or\s*register)?/i.test(body) && !document.querySelector('.beetle-game-nav .info, .cheese-claim-nav .info')) {
      var si = null;
      document.querySelectorAll('a, button, div[role="button"]').forEach(function(el) { if (!si && /SIGN\s*IN/i.test(el.textContent) && el.closest('.navbar-content, header, nav, [class*="nav"]')) si = el; });
      if (!si) document.querySelectorAll('*').forEach(function(el) { if (!si && /^\s*SIGN\s*IN\s*$/i.test(el.textContent.trim()) && el.children.length <= 1) si = el; });
      if (si) return {screen:1,el:si,desc:'Main site SIGN IN'};
    }
    return {screen:0,el:null,desc:'Not a login screen'};
  }
  // One-time setup: listen for real user gestures (mousedown/keydown/
  // touch ONLY — NOT focus or visibilitychange, which fire on every page
  // load and would create a submit→reload→focus→submit redirect storm).
  // When the user makes a real gesture, Chrome releases the autofilled
  // password to JS within ~100ms. Triggers an immediate login retry.
  // Heavily debounced so a single mouse click (which fires mousedown +
  // click + sometimes focus) only runs ONE polling loop, not three.
  function setupAutofillUnlock() {
    if (window.__bcAutofillWatch) return;
    window.__bcAutofillWatch = true;
    var armed = function() {
      // Dedup: if a polling loop is already in flight from a recent
      // gesture, skip. Without this, mousedown+click+focus from a single
      // physical click each start their own loop and each call
      // tryAutoLogin, multiplying submissions.
      if (window.__bcGestureBusy) return;
      window.__bcGestureBusy = true;
      var done = false;
      var attempts = 0;
      var iv = setInterval(function() {
        attempts++;
        if (done || attempts > 8) {
          clearInterval(iv);
          // Hold the busy flag 2s after polling ends so back-to-back
          // gesture events from one click don't immediately re-arm.
          setTimeout(function(){ window.__bcGestureBusy = false; }, 2000);
          return;
        }
        var s = detectLoginScreen();
        if (s.screen === 3 && s.pass && s.pass.value) {
          done = true;
          clearInterval(iv);
          // Respect the cooldown (now persisted in S.lastLoginTime so it
          // survives page reloads). If we submitted recently, skip —
          // gesture detection is an optimization, not a license to
          // bypass throttling. Submitting again every 100ms causes the
          // redirect storm we just fixed.
          if (Date.now() - (S.lastLoginTime||0) > LOGIN_COOLDOWN) {
            logThrottled('gesture-submit', 'Gesture detected — autofill released, submitting.', 30000);
            _loginAttempts = 0;
            tryAutoLogin();
          }
          setTimeout(function(){ window.__bcGestureBusy = false; }, 2000);
        }
      }, 100);
    };
    document.addEventListener('mousedown', armed, true);
    document.addEventListener('keydown', armed, true);
    document.addEventListener('touchstart', armed, true);
    // NB: 'focus' and 'visibilitychange' DELIBERATELY excluded — they
    // fire on every page load/redirect, which would create a submit→
    // reload→focus→submit infinite loop. Real user gestures only.
  }

  function tryAutoLogin() {
    setupAutofillUnlock(); // idempotent — only registers listeners once
    if (Date.now() - (S.lastLoginTime||0) < LOGIN_COOLDOWN) return false;
    var s = detectLoginScreen(); if (!s.el) return false;
    // Auth Portal stuck-check MUST run BEFORE the LOGIN_MAX gate so we
    // can still recover even after the budget was burned by earlier
    // failed attempts on other screens. Symptom: SIGN IN button's React
    // onClick fires (s=>{s.preventDefault(),v(!0)}) but produces zero
    // network requests — verified live via Chrome DevTools. Cookies are
    // typically empty in this state. Recovery: 2 clicks → forced reload.
    if (s.screen === 2) {
      if (!S.authPortalStuck) S.authPortalStuck = 0;
      S.authPortalStuck++;
      if (S.authPortalStuck === 3) {
        logEvent('Auth Portal SIGN IN unresponsive after 2 clicks; reloading.');
        S.authPortalStuck = 99; // mark as already-reloaded so we don't loop
        save();
        window.location.reload();
        return true;
      }
      if (S.authPortalStuck > 3) {
        logThrottled('auth-portal-dead',
          'Auth Portal SIGN IN button is stuck (already reloaded once). ' +
          'Hard-refresh the page (Ctrl+Shift+R) or close+reopen the tab.',
          120000);
        notify('auth-portal-dead', 'Auth Portal stuck',
          'SIGN IN button unresponsive after auto-reload. Hard-refresh (Ctrl+Shift+R) or reopen the tab.');
        return false;
      }
      save();
    } else if (S.authPortalStuck) {
      // Successfully advanced past the Auth Portal — reset the counter.
      S.authPortalStuck = 0;
      save();
    }
    // LOGIN_MAX check moved here, AFTER the auth-portal recovery path,
    // so a stuck portal can still trigger reload even if budget burned.
    // Soft-reset the attempts every 5 min so we never permanently give
    // up — the user might come back and need us to try again.
    if (Date.now() - (S.lastLoginTime||0) > 300000) _loginAttempts = 0;
    if (_loginAttempts >= LOGIN_MAX) { logThrottled('login-max','Auto-login gave up after '+LOGIN_MAX+' attempts. Will retry in 5 min.',120000); return false; }
    S.lastLoginTime = Date.now(); _loginAttempts++;
    // Throttle per-screen so 4-5 retry lines per minute don't flood the log
    logThrottled('autologin-'+s.screen, 'Auto-login '+s.screen+'/3: '+s.desc, 60000); save();
    if (s.useRobustSubmit) {
      var pass = s.pass;
      // Just submit. Chrome autofill populates the actual form field —
      // the JS isolation only blocks scripted .value reads, NOT the
      // browser's form-submission read. form.requestSubmit() collects
      // field values internally and POSTs them. Earlier v12.4.13 bail-
      // on-empty was over-cautious — the spam loop it was guarding
      // against was actually caused by the focus-event listener (fixed
      // in v12.4.14), not by empty submissions. If the password is
      // genuinely wrong, invalidCredsBackoff() catches it on the next
      // render and pauses for 10 min.
      try { if (pass && typeof pass.focus === 'function') { pass.focus(); pass.blur(); } } catch(eF) {}
      // Path A: real <form> (Keycloak server-rendered) — submit directly.
      if (s.form) {
        try {
          if (s.submit && s.form.requestSubmit) s.form.requestSubmit(s.submit);
          else if (s.form.requestSubmit) s.form.requestSubmit();
          else s.form.submit();
        } catch(e) {
          if (s.submit) safeClick(s.submit);
        }
      } else {
        // Path B: no <form> (React-only). Fire input/change through the
        // native value-setter only if pass.value is readable, then click.
        try {
          if (pass && pass.value) {
            var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(pass, pass.value);
            pass.dispatchEvent(new Event('input', {bubbles:true}));
            pass.dispatchEvent(new Event('change', {bubbles:true}));
          }
        } catch(e) {}
        if (s.submit) safeClick(s.submit);
      }
    } else { safeClick(s.el); }
    return true;
  }
  // After a robust submit, watch for "Invalid username or password" on
  // the next render. If seen, back off hard — Keycloak rate-limits and
  // can lock the account after enough failures. We pause for 10 minutes
  // and ping the user so they can fix Chrome's saved password if it's
  // actually stale.
  function invalidCredsBackoff() {
    if (!/oidc-spa|oidc\/.*openid-connect/i.test(window.location.href + ' ' + (document.referrer||''))) return false;
    var body = bodyText();
    if (!/invalid\s+(?:username|password|user|credentials)/i.test(body)) return false;
    if (S.lastInvalidCreds && Date.now() - S.lastInvalidCreds < 600000) return true;
    S.lastInvalidCreds = Date.now();
    _loginAttempts = LOGIN_MAX; // park the budget so tryAutoLogin no-ops
    save();
    logEvent('Keycloak rejected credentials. Backing off 10 min — check Chrome saved password.');
    notify('invalid-creds', 'Login rejected',
      'Keycloak says invalid username/password. Pausing 10 min. Update your saved password in Chrome if you changed it elsewhere.');
    return true;
  }
  // NOTE: password storage helpers (bcSavePassword/bcClear/bcHas) were
  // intentionally NOT added. Public repo + @updateURL = supply-chain
  // exfiltration risk. Any future commit reading GM_getValue could leak
  // a stored password to all users on the next auto-update. Manual click
  // (or v12.4.8's gesture listener — any click anywhere) remains the
  // path. If true overnight autonomy is needed, remove @updateURL from
  // the script header and update manually from reviewed commits.

  /* ═══════════════════════════════════════════════════════
     9. STATE MACHINE
     ═══════════════════════════════════════════════════════ */
  function tick() {
    parseTimers(); refreshTimerDisplay();
    // v12.4.22: chat broadcast monitor runs every tick (observation-only,
    // safe under pause). Updates S.lastSmashAt + S.craftCounters from
    // visible game broadcasts so the free-smash indicator + junk compress
    // session counter stay live without waiting for the next full scan.
    // v12.4.23: also attempt MutationObserver attach (idempotent) for
    // lower-latency event-driven monitoring. Polling still runs as fallback.
    setupChatObserver();
    pollChat();
    // Master pause: skip ALL automation but keep the panel + timers
    // refreshing. Lets the user navigate freely (craft, browse) while
    // still seeing recipe guidance from the coach. No nav, no scan, no
    // claim, no hunt, no eject recovery, no PROCESSING reload.
    if (S.paused) { renderPanel(); return; }
    switch (S.machineState) {
      case 'BOOTING':         return handleBooting();
      case 'LOGGED_OUT':      return handleLoggedOut();
      case 'LOGGING_IN':      return handleLoggingIn();
      case 'IDLE':            return handleIdle();
      case 'CLAIMING':        return handleActionWait();
      case 'HUNTING':         return handleHunting();
      case 'CLAIMING_CHEESE': return handleActionWait();
      case 'SCANNING':        if (stateAge() > 60000) { logEvent('Scan timed out.'); _scanning = false; transition('IDLE'); } return;
      case 'STUCK':           return handleStuck();
    }
  }

  function handleBooting() {
    if (authBlockReason()) { transition('LOGGED_OUT'); return; }
    if (!document.querySelector('#root, #app, .navbar-content, header, nav')) { if (stateAge() > 30000) { logEvent('App never loaded, refreshing...'); window.location.reload(); } return; }
    if (document.querySelector('.beetle-game-nav .info, .cheese-claim-nav .info')) {
      logEvent('Game loaded, automation active.'); _loginAttempts = 0;
      parseHammer(); parseLevel(); parseCraftMode();
      transition('IDLE'); renderPanel(); return;
    }
    if (/\/oidc\/.*openid-connect/i.test(window.location.href) || detectLoginScreen().screen) { transition('LOGGED_OUT'); return; }
    if (stateAge() > 15000) ensureCartridge('beetle','startup');
  }

  function handleLoggedOut() {
    if (gameReady() && document.querySelector('.beetle-game-nav .info, .cheese-claim-nav .info')) { logEvent('Login successful.'); _loginAttempts = 0; S.lastInvalidCreds = 0; save(); transition('BOOTING'); return; }
    if (invalidCredsBackoff()) return; // Keycloak rejected creds — pause
    if (tryAutoLogin()) transition('LOGGING_IN');
    else if (stateAge() > 120000) logThrottled('login-stuck','Still logged out after 2min.',120000);
  }

  function handleLoggingIn() {
    if (gameReady() && document.querySelector('.beetle-game-nav .info, .cheese-claim-nav .info')) { transition('BOOTING'); return; }
    if (authBlockReason() && stateAge() > LOGIN_COOLDOWN) { transition('LOGGED_OUT'); return; }
    if (stateAge() > 30000) transition('BOOTING');
  }

  function handleIdle() {
    if (!gameReady()) { transition(authBlockReason() ? 'LOGGED_OUT' : 'BOOTING'); return; }

    // Cartridge ejected? Pull the LOAD lever every tick. The previous
    // version reloaded the page after 90s of stuck-eject — that turned
    // out to be useless, since reloads land on the same ejected state
    // and just chew through the retry cap. Just keep clicking; if the
    // lever genuinely isn't responding, that's an auth/session issue
    // no amount of clicking or reloading will fix.
    if (onBeetle() && isCartridgeEjected()) {
      if (!S.disconnectedSince) { S.disconnectedSince = Date.now(); save(); }
      var disconnDur = Date.now() - S.disconnectedSince;
      if (loadCartridge()) {
        logThrottled('cart-load','Cartridge ejected; pulling LOAD lever ('+Math.round(disconnDur/1000)+'s).',120000);
      } else {
        logThrottled('cart-load-fail','Cartridge ejected but LOAD lever not found in beetle-catch-module.',120000);
      }
      // Stuck >5 min: dump the bar class list every 5 min so we can see
      // whether React is updating state (click reaching handler) or the
      // game is forcing the eject (likely auth/session).
      if (disconnDur > 300000 && (!S.lastEjectDiag || Date.now() - S.lastEjectDiag > 300000)) {
        S.lastEjectDiag = Date.now();
        var diagBar = document.querySelector('.beetle-catch-module .toggle-bar');
        logEvent('Lever stuck '+Math.round(disconnDur/60000)+'m; bar.class='+(diagBar?diagBar.className:'(missing)'));
        save();
      }
      return;
    }
    // Reconnected — clear trackers
    if (S.disconnectedSince) { S.disconnectedSince = 0; S.lastEjectDiag = 0; save(); }

    // PROCESSING detection — only if we're on beetle cart, and only 30s+ after boot
    // (S.lastActionAt is persisted so it survives reloads unlike _lastActionTime)
    if (onBeetle() && Date.now() - _bootTime > 30000 && Date.now() - (S.lastActionAt||0) > 20000) {
      var cb = document.querySelector('.beetle-catch-module__catch-button'), hb = document.querySelector('.beetle-catch-module__hunt-button');
      if ((cb && (cb.classList.contains('loading') || /PROCESSING/i.test(cb.textContent))) || (hb && (hb.classList.contains('loading') || /PROCESSING/i.test(hb.textContent)))) {
        logEvent('Buttons stuck on PROCESSING...'); transition('STUCK'); return;
      }
    }

    // Passive scan only when visible and on beetle
    if (tabVisible() && onBeetle() && Date.now() - (S.lastPassiveScan||0) > 30000) passiveScan();

    // Priority 1: Claim (must be on beetle cartridge)
    if (S.autoClaim && claimReady()) {
      if (!onBeetle()) { ensureCartridge('beetle','claim'); return; }
      if (!ensureCatchView('claim')) return;
      var cr = clickClaimButton();
      if (cr === 'fired') { transition('CLAIMING'); return; }
      if (cr === 'processing') return; // wait, don't flag stuck yet
      if (cr === 'no-button') { _viewBlockedUntil = 0; ensureCatchView('claim refresh'); logThrottled('claim-no-button','Claim ready but Claim button is not available yet.',30000); return; }
      if (cr === 'click-failed') { logThrottled('claim-click-failed','Claim click failed; retrying.',30000); return; }
    }

    // Priority 2: Hunt (must be on beetle cartridge)
    if (huntReady()) {
      if (!onBeetle()) { ensureCartridge('beetle','hunt'); return; }
      if (!ensureCatchView('hunt')) return;
      var hr = clickHuntButton();
      if (hr === 'fired') { transition('HUNTING'); scheduleHuntRetry(HUNT_RETRY_DELAY); return; }
      if (hr === 'processing') { scheduleHuntRetry(HUNT_RETRY_DELAY); return; } // game is processing, wait
      if (hr === 'no-button') { _viewBlockedUntil = 0; ensureCatchView('hunt refresh'); logThrottled('hunt-no-button','Hunt ready but Hunt button is not available yet.',30000); return; }
      if (hr === 'click-failed') { logThrottled('hunt-click-failed','Hunt click failed; retrying.',30000); return; }
    }

    // Priority 3: Daily cheese (navigates to cheese cartridge, then back)
    if (cheeseReady()) {
      if (currentCartridge() !== 'cheese') { ensureCartridge('cheese','daily cheese'); return; }
      var chr = clickCheeseButton();
      if (chr === 'fired') { transition('CLAIMING_CHEESE'); return; }
    }

    // Priority 4: Full scan (only when visible and on beetle)
    if (tabVisible() && !_scanning && onBeetle() && Date.now() - (S.lastFullScan||0) > STALE_MS) {
      transition('SCANNING'); fullScan().then(function() { transition('IDLE'); });
      return;
    }

    // If on cheese after cheese claim, navigate back to beetle
    if (!onBeetle() && !cheeseReady()) { ensureCartridge('beetle','return home'); return; }

    if (tabVisible()) renderPanel();
  }

  // HUNTING state: revisit quickly so multi-hunt bursts don't wait for the global tick
  function handleHunting() {
    if (!gameReady()) { transition(authBlockReason() ? 'LOGGED_OUT' : 'BOOTING'); return; }
    if (!onBeetle()) { ensureCartridge('beetle','hunt follow-up'); scheduleHuntRetry(HUNT_RETRY_DELAY); return; }
    // If the cartridge ejected mid-hunt, bounce back to IDLE so the
    // disconnect-reload safety net can manage recovery.
    if (isCartridgeEjected()) { transition('IDLE'); return; }
    if (!ensureCatchView('hunt follow-up')) { scheduleHuntRetry(HUNT_RETRY_DELAY); return; }
    if (stateAge() < HUNT_RETRY_DELAY) { scheduleHuntRetry(HUNT_RETRY_DELAY - stateAge()); return; }

    // Check hunt button state
    var btn = findCatchActionButton('hunt');
    if (!btn) {
      _viewBlockedUntil = 0; ensureCatchView('hunt follow-up refresh');
      logThrottled('hunt-followup-missing','Waiting for Hunt button to return.',30000);
      if (stateAge() > ACTION_TIMEOUT) transition('IDLE');
      else scheduleHuntRetry(HUNT_RETRY_DELAY);
      return;
    }
    var text = buttonText(btn);

    // Cooldown started — hunting is done
    if (/cooldown/i.test(text) || /\d+\s*[mh]/i.test(text)) {
      logEvent('Hunt cooldown started.'); transition('IDLE');
      // Schedule post-hunt scan
      setTimeout(function() { if (S.machineState === 'IDLE' && onBeetle() && tabVisible() && !_scanning) { transition('SCANNING'); fullScan().then(function() { transition('IDLE'); }); } }, 5000);
      return;
    }

    // Still processing — keep waiting
    if (/processing|loading/i.test(text)) { scheduleHuntRetry(HUNT_RETRY_DELAY); return; }

    // Button is ready — hunt again!
    if (huntReady()) {
      var r = clickHuntButton();
      if (r === 'fired') { S.stateEnteredAt = Date.now(); save(); scheduleHuntRetry(HUNT_RETRY_DELAY); return; } // reset wait timer
      if (r === 'processing') { scheduleHuntRetry(HUNT_RETRY_DELAY); return; }
    }

    // Fallback: if we've been here 30s+ and nothing happened, go back to IDLE
    if (stateAge() > ACTION_TIMEOUT) { transition('IDLE'); }
    else scheduleHuntRetry(HUNT_RETRY_DELAY);
  }

  // CLAIMING / CLAIMING_CHEESE: wait for action to complete, then return to IDLE
  // Schedule a post-claim fullScan so newly-caught beetles (esp. rare
  // drops like Golden Scarab) appear in inventory and Next-Moves callouts
  // immediately, not on the next 2-min STALE_MS tick.
  function schedulePostClaimScan(delayMs) {
    setTimeout(function() {
      if (S.machineState === 'IDLE' && onBeetle() && tabVisible() && !_scanning) {
        transition('SCANNING');
        fullScan().then(function() { transition('IDLE'); });
      }
    }, delayMs || 5000);
  }
  function handleActionWait() {
    if (stateAge() > ACTION_TIMEOUT) {
      var wasClaiming = S.machineState === 'CLAIMING';
      // After cheese claim, return to beetle
      if (S.machineState === 'CLAIMING_CHEESE' && currentCartridge() === 'cheese') {
        ensureCartridge('beetle','return after cheese');
      }
      transition('IDLE');
      if (wasClaiming) schedulePostClaimScan();
      return;
    }
    // Early return to IDLE if buttons are no longer processing
    if (stateAge() > 5000) {
      if (S.machineState === 'CLAIMING') {
        var cb = document.querySelector('.beetle-catch-module__catch-button');
        if (cb && !/processing|loading/i.test(cb.textContent||'')) { transition('IDLE'); schedulePostClaimScan(); return; }
      }
      if (S.machineState === 'CLAIMING_CHEESE' && stateAge() > 10000) {
        // After cheese, navigate back to beetle
        if (currentCartridge() === 'cheese') ensureCartridge('beetle','return after cheese');
        transition('IDLE'); return;
      }
    }
  }

  function handleStuck() {
    // Don't flag stuck within 30s of boot (fresh page, buttons may still be loading)
    if (Date.now() - _bootTime < 30000) { transition('IDLE'); return; }
    if (stateAge() < 15000) return; // wait 15s before acting

    var cb = document.querySelector('.beetle-catch-module__catch-button'), hb = document.querySelector('.beetle-catch-module__hunt-button');
    var still = (cb && (cb.classList.contains('loading') || /PROCESSING/i.test(cb.textContent))) || (hb && (hb.classList.contains('loading') || /PROCESSING/i.test(hb.textContent)));
    if (!still) { logEvent('Recovered from stuck.'); transition('IDLE'); return; }

    // Track reload count in persisted state to prevent infinite loops
    if (!S.stuckReloads) S.stuckReloads = 0;
    if (S.stuckReloads >= 3) {
      logEvent('Stuck after 3 reloads. Waiting 5 min...');
      notify('stuck-reloads', 'Stuck after 3 reloads',
        'Buttons stuck on PROCESSING after 3 reloads. Pausing 5 min — check if the page needs attention.');
      S.stuckReloads = 0; save();
      // Just go IDLE and let the next cycle try again in 5 minutes
      setTimeout(function() { transition('IDLE'); }, 300000);
      return;
    }
    S.stuckReloads++; save();
    logEvent('Refreshing to recover (attempt '+S.stuckReloads+'/3)...');
    window.location.reload();
  }

  /* ═══════════════════════════════════════════════════════
     10. UI
     ═══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = '#'+BTN_ID+'{position:fixed;left:20px;bottom:20px;z-index:999999;padding:10px 14px;background:#d7f4f7;color:#11383d;border:1px solid #9bd8e0;border-radius:12px;font-weight:700;cursor:pointer;font-size:14px;}#'+BTN_ID+':hover{background:#c0edf2;}#'+PANEL_ID+'{position:fixed;left:20px;top:50px;z-index:999999;width:380px;min-width:300px;max-width:90vw;background:#fff;border:2px solid #b8e6ec;border-radius:16px;padding:16px;box-shadow:0 14px 40px rgba(0,0,0,.18);font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#163238;max-height:calc(100vh - 70px);display:flex;flex-direction:column;gap:6px;overflow:hidden;resize:both;}#'+PANEL_ID+'.hidden{display:none!important;}.bc8-header{display:flex;align-items:center;justify-content:space-between;cursor:grab;user-select:none;padding-bottom:4px;border-bottom:1px solid #e8f4f7;margin-bottom:2px;}.bc8-header:active{cursor:grabbing;}.bc8-title{font-size:18px;font-weight:800;}.bc8-sub{font-size:11px;color:#5a7379;font-weight:700;}.bc8-btns{display:flex;gap:3px;flex-wrap:wrap;}.bc8-btn{background:#d9f2f6;color:#17363b;border:1px solid #b8e6ec;border-radius:6px;padding:4px 7px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;}.bc8-btn:hover{background:#c0edf2;}.bc8-btn.on{background:#17363b;color:#fff;}.bc8-strip{display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#f7fcfd;border:1px solid #e0f0f3;border-radius:8px;font-size:11px;flex-shrink:0;}.bc8-strip-item{display:flex;align-items:center;gap:3px;}.bc8-strip-label{color:#6b8a90;font-weight:600;}.bc8-badge{display:inline-block;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;}.bc8-ready{background:#d4edda;color:#155724;}.bc8-countdown{background:#fff3cd;color:#856404;}.bc8-stale{background:#f8d7da;color:#721c24;}.bc8-fresh{background:#d4edda;color:#155724;}.bc8-card{background:#fafeff;border:1px solid #d5eef2;border-radius:8px;padding:8px;flex-shrink:0;}.bc8-focus{background:#f0f9fb;border:1px solid #b8e6ec;border-radius:8px;padding:10px;flex-shrink:0;}.bc8-scroll{background:#fafeff;border:1px solid #d5eef2;border-radius:10px;padding:8px;overflow-y:auto;overflow-x:hidden;flex-shrink:1;flex-grow:1;min-height:60px;}.bc8-scroll::-webkit-scrollbar{width:5px;}.bc8-scroll::-webkit-scrollbar-thumb{background:#b8e6ec;border-radius:3px;}.bc8-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;font-size:11px;line-height:1.4;}.bc8-row-name{display:flex;align-items:center;gap:4px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:65%;}.bc8-h{font-weight:800;font-size:13px;margin-bottom:6px;color:#11383d;}.bc8-muted{color:#6b8a90;font-size:10px;}.bc8-tier{font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;color:#fff;flex-shrink:0;letter-spacing:0.2px;}.bc8-free{background:#22c55e;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;letter-spacing:0.3px;}.bc8-free-used{background:#94a3b8;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;}.bc8-compress{background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:8px;flex-shrink:0;font-size:11px;}.bc8-compress-h{font-weight:800;font-size:12px;color:#854d0e;margin-bottom:4px;}.bc8-pin{background:#fdf2f8;border:1px solid #f9a8d4;border-radius:8px;padding:6px;flex-shrink:0;font-size:11px;color:#831843;font-weight:700;}.bc8-val{font-weight:700;text-align:right;white-space:nowrap;font-size:11px;}.bc8-recipe{padding:3px 0;border-bottom:1px solid #eef5f7;}.bc8-recipe:last-child{border-bottom:none;}.bc8-recipe-name{font-weight:700;font-size:11px;}.bc8-log-line{font-size:9px;color:#6b8a90;line-height:1.4;border-bottom:1px solid #f0f7f9;padding:1px 0;}.bc8-state{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:#e8f4f7;color:#11383d;}';
    document.head.appendChild(s);
  }
  function refreshTimerDisplay() {
    var fmt = function(v) { return !v ? '\u2014' : /ready/i.test(v) ? '<span class="bc8-badge bc8-ready">Ready</span>' : '<span class="bc8-badge bc8-countdown">'+v+'</span>'; };
    var el; el = document.getElementById('bc8-t-claim'); if (el) el.innerHTML = fmt(S.timers.beetleCatch);
    el = document.getElementById('bc8-t-hunt'); if (el) el.innerHTML = fmt(S.timers.huntCooldown);
    el = document.getElementById('bc8-t-cheese'); if (el) el.innerHTML = fmt(S.timers.dailyCheese);
    el = document.getElementById('bc8-state'); if (el) el.textContent = S.machineState;
    el = document.getElementById('bc8-fresh'); if (el) { var f = isFresh(); el.className = 'bc8-badge '+(f?'bc8-fresh':'bc8-stale'); el.textContent = f?'OK':'STALE'; }
  }
  var _drag = {on:false,ox:0,oy:0}, _dragBound = false;
  function bindDrag() { if (_dragBound) return; _dragBound = true; document.addEventListener('mousemove',function(e) { if (!_drag.on) return; var p = document.getElementById(PANEL_ID); if (p) { p.style.left = Math.max(0,e.clientX-_drag.ox)+'px'; p.style.top = Math.max(0,e.clientY-_drag.oy)+'px'; } }); document.addEventListener('mouseup',function() { _drag.on = false; }); }

  function renderPanel() {
    var panel = document.getElementById(PANEL_ID); if (!panel || panel.classList.contains('hidden')) return; bindDrag();
    var inv = S.mergedInventory||{}, stale = !isFresh(), crafts = stale ? [] : getDirectCrafts(inv), prog = stale ? null : getProgressionMove(inv);
    var fmt = function(v) { return !v ? '\u2014' : /ready/i.test(v) ? '<span class="bc8-badge bc8-ready">Ready</span>' : '<span class="bc8-badge bc8-countdown">'+v+'</span>'; };
    var h = '', cheese = inv.cheese ? inv.cheese.toLocaleString() : '';
    // Header
    h += '<div class="bc8-header"><span class="bc8-title"><span id="bc8-minimize" style="cursor:pointer;">\u{1FAB2}</span> Beetle Coach <span style="font-size:10px;color:#6b8a90;font-weight:600;">v'+VER+'</span>'+(S.paused?' <span style="font-size:11px;color:#fff;background:#f39c12;padding:2px 6px;border-radius:4px;font-weight:800;">PAUSED</span>':'')+'</span>';
    h += '<span class="bc8-sub">'+(S.level?'Lv.'+S.level:'')+(cheese?' \u00B7 '+cheese+' \u{1F9C0}':'');
    h += ' \u00B7 <span id="bc8-fresh" class="bc8-badge '+(isFresh()?'bc8-fresh':'bc8-stale')+'">'+(isFresh()?'OK':'STALE')+'</span>';
    h += ' \u00B7 <span id="bc8-state" class="bc8-state">'+S.machineState+'</span></span></div>';
    // Buttons
    var sl = S.strategy==='endgame'?'Endgame':(S.strategy==='flowers'?'Flowers':'Broad');
    h += '<div class="bc8-btns">';
    if (S.paused) h += '<button class="bc8-btn" id="bc8-pause" style="background:#f39c12;color:#fff;border-color:#d68910;font-weight:800;" title="Resume all automation">▶ Resume</button>';
    else h += '<button class="bc8-btn" id="bc8-pause" title="Pause all automation (no scan, no claim, no hunt, no nav, no eject recovery) so you can craft manually">⏸ Pause</button>';
    h += '<button class="bc8-btn" id="bc8-fs">Full Scan</button>';
    h += '<button class="bc8-btn '+(S.autoClaim?'on':'')+'" id="bc8-ac">Claim '+(S.autoClaim?'ON':'OFF')+'</button>';
    h += '<button class="bc8-btn '+(S.autoHunt?'on':'')+'" id="bc8-ah">Hunt '+(S.autoHunt?'ON':'OFF')+'</button>';
    h += '<button class="bc8-btn '+(S.strategy!=='broad'?'on':'')+'" id="bc8-strat">'+sl+'</button>';
    // v12.4.22: Compact mode toggle. Collapses panel to header+buttons+strip+
    // Next moves + (junk compress card if applicable). Hides Progression /
    // You-can-make-overflow / Inventory / Session / Log. Useful while
    // actively crafting and the user just wants the next action visible.
    h += '<button class="bc8-btn '+(S.compact?'on':'')+'" id="bc8-compact" title="Toggle compact mode (hide Inventory/Session/Log/Progression)">'+(S.compact?'□ Full':'□ Compact')+'</button>';
    h += '<button class="bc8-btn" id="bc8-rss" title="Reset session counters and gain log; leave inventory/settings alone">Reset Session</button>';
    h += '<button class="bc8-btn" id="bc8-rst" style="color:#c0392b;border-color:#e6b0aa;">Reset</button></div>';
    // Status strip
    h += '<div class="bc8-strip">';
    h += '<div class="bc8-strip-item"><span class="bc8-strip-label">Hammer:</span> '+(S.currentHammer?dn(S.currentHammer):'\u2014')+'</div>';
    if (S.currentHammerBonus!=null) h += '<div class="bc8-strip-item"><span class="bc8-strip-label">+'+S.currentHammerBonus+'%</span> / '+S.currentHammerBreakChance+'% break</div>';
    // v12.4.23: Per-hammer Daily free-smash indicator. Each owned hammer
    // gets its own 0%-break daily smash per wiki. Display: count "\u26a1 N/M free"
    // + tooltip listing each hammer's status. Color shifts: green when
    // any free, gray when 0/M. Heuristic for "smashed" detection: chat
    // broadcast attributed to S.currentHammer at the moment of smash (may
    // be wrong if user manually selects a lower hammer in the bench).
    if (S.ownedHammers && S.ownedHammers.length > 0) {
      var fs = freeSmashSummary();
      var tip = fs.perHammer.map(function(hh){return hh.label+': '+(hh.fresh?'\u26a1 free':'used');}).join('\n');
      tip += '\n\nFree smashes reset at the next UBC daily cheese claim.\nNote: each detected smash is attributed to your highest-tier non-broken hammer (S.currentHammer).\nIf you manually select a lower hammer in the bench, the indicator may be wrong.';
      // v12.4.23: three-tier badge color \u2014 green=all free, yellow=partial, gray=all used.
      var badgeCls, letters = fs.perHammer.map(function(hh){return hh.abbr + (hh.fresh ? '\u26a1' : '\u00b7');}).join(' ');
      if (fs.freeCount === fs.totalOwned) {
        badgeCls = 'bc8-free';        // all free \u2192 green
      } else if (fs.freeCount > 0) {
        badgeCls = 'bc8-countdown';   // partial \u2192 yellow
      } else {
        badgeCls = 'bc8-free-used';   // all used \u2192 gray
      }
      var label = fs.freeCount === 0 ? 'all used' : ('\u26a1 '+fs.freeCount+'/'+fs.totalOwned+' free');
      h += '<div class="bc8-strip-item" title="'+tip.replace(/"/g,'&quot;')+'"><span class="'+badgeCls+'" style="padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;">'+label+'</span>' + (fs.totalOwned > 1 ? ' <span style="font-size:9px;color:#475569;font-weight:600;">'+letters+'</span>' : '') + '</div>';
    }
    if (S.brokenHammers&&S.brokenHammers.length) h += '<div class="bc8-strip-item"><span style="color:#e74c3c;font-weight:700;">Broken:</span> '+S.brokenHammers.map(dn).join(', ')+'</div>';
    h += '<div class="bc8-strip-item"><span class="bc8-strip-label">Claim:</span> <span id="bc8-t-claim">'+fmt(S.timers.beetleCatch)+'</span></div>';
    h += '<div class="bc8-strip-item"><span class="bc8-strip-label">Hunt:</span> <span id="bc8-t-hunt">'+fmt(S.timers.huntCooldown)+'</span></div>';
    h += '<div class="bc8-strip-item"><span class="bc8-strip-label">Cheese:</span> <span id="bc8-t-cheese">'+fmt(S.timers.dailyCheese)+'</span></div>';
    if (S.craftMode) h += '<div class="bc8-strip-item"><span class="bc8-strip-label">Mode:</span> '+S.craftMode+'</div>';
    h += '</div>';
    if (stale) h += '<div style="background:#fff3f3;border:1px solid #e6b0aa;border-radius:8px;padding:6px;color:#c0392b;font-weight:800;font-size:11px;flex-shrink:0;">Inventory stale. Hit Full Scan.</div>';
    // Next moves
    var sb = S.strategy==='endgame'?'bc8-countdown':(S.strategy==='flowers'?'bc8-stale':'bc8-fresh');
    h += '<div class="bc8-focus"><div class="bc8-h">Next moves <span class="bc8-badge '+sb+'" style="font-size:8px;">'+sl.toUpperCase()+'</span></div>';
    if (prog && (prog.type==='direct'||prog.type==='prereq')) {
      var pr = RECIPES.find(function(r){return r.label===prog.label;});
      // v12.4.19: render goal and prereq recipes UNAMBIGUOUSLY. The previous
      // template showed only `prog.label`'s inputs under the goal heading; for
      // prereq moves that read as if the goal's ingredients were the prereq's
      // ingredients (e.g. "Black Lotus GOAL / Mithril beetle + Mithril Pollen"
      // \u2014 which is the bridge recipe, NOT the Black Lotus recipe). Now we
      // ALWAYS surface the goal recipe explicitly, then a separately-labeled
      // step recipe for prereq moves. Source of truth for the goal recipe:
      // the active chain (ENDGAME/BROAD/FLOWER) \u2014 chainEntry.recipe maps the
      // goal key back to its RECIPES label.
      var chainForDisplay = S.strategy === 'flowers' ? FLOWER_CHAIN : (S.strategy === 'broad' ? BROAD_CHAIN : ENDGAME_CHAIN);
      var chainEntry = chainForDisplay.find(function(c){return c.key===prog.goal;});
      var goalRecipe = chainEntry ? RECIPES.find(function(r){return r.label===chainEntry.recipe;}) : null;
      h += '<div style="font-weight:800;font-size:14px;">'+dn(prog.goal)+' <span class="bc8-badge bc8-fresh">GOAL</span></div>';
      // v12.4.20: annotate multi-output recipes so the user doesn't read the
      // recipe line as deterministic. E.g. "\ud83c\udfaf Gazania recipe: Adamantine
      // beetle + Junk Cube" \u2192 "...Junk Cube (random sibling)" because the
      // transmute yields ANY Adamantine flower, not specifically Gazania.
      var rngNote = function(rcp) { return rcp && MULTI_OUTPUT_RECIPES.has(rcp.label) ? ' <span style="color:#c87f0a;">(random sibling)</span>' : ''; };
      if (prog.type === 'direct') {
        // prog.label IS the goal recipe \u2014 single clean line.
        if (pr) h += '<div class="bc8-muted">\u2705 Craft now: '+pr.inputs.map(tokHuman).join(' + ')+rngNote(pr)+'</div>';
      } else {
        // Prereq: show BOTH recipes, labeled.
        if (goalRecipe) h += '<div class="bc8-muted">\u{1F3AF} '+dn(prog.goal)+' recipe: '+goalRecipe.inputs.map(tokHuman).join(' + ')+rngNote(goalRecipe)+'</div>';
        if (pr) h += '<div class="bc8-muted">\u{1F527} Step now: '+prog.label+' \u2014 '+pr.inputs.map(tokHuman).join(' + ')+rngNote(pr)+'</div>';
      }
    }
    var shown = 0; for (var ci = 0; ci < crafts.length && shown < 3; ci++) {
      if (prog && crafts[ci].label === prog.label) continue;
      h += '<div style="margin-top:4px;"><span style="font-weight:700;">'+crafts[ci].label+'</span> '+(crafts[ci].type==='assemble'?'<span class="bc8-badge bc8-fresh">SAFE</span>':'<span class="bc8-badge bc8-countdown">RNG</span>')+'</div>';
      h += '<div class="bc8-muted">'+crafts[ci].inputs.map(tokHuman).join(' + ')+'</div>'; shown++;
    }
    if (prog && prog.type==='blocked') { h += '<div class="bc8-muted" style="margin-top:4px;border-top:1px solid #e8f4f7;padding-top:4px;"><b>Goal: '+dn(prog.goal)+'</b> \u2014 '+prog.reason; if (prog.via) h += '<br><span style="color:#5b8dd9;">\u2192 '+prog.via+'</span>'; h += '</div>'; }
    if (!prog && !crafts.length) h += '<div class="bc8-muted">'+(stale?'Scan first.':'No craftable moves. Farm more.')+'</div>';
    h += '</div>';
    // v12.4.22: Specimen Pin badge \u2014 when owned, surface it prominently so
    // the user remembers it exists. Specimen Pin's only known use is the
    // Beetle Trophy creator (Specimen Pin + Beetle + Green sac \u2192 that
    // Beetle's Trophy). One-shot per pin. Don't burn on a low-tier beetle.
    var pinCount = inv['specimen_pin'] || 0;
    if (pinCount > 0) {
      h += '<div class="bc8-pin">\uD83D\uDC8E '+pinCount+' Specimen Pin'+(pinCount>1?'s':'')+' \u00B7 save for highest-tier Beetle Trophy (Pin + Beetle + Green sac)</div>';
    }
    // v12.4.22: Junk Compress advisor card. Show when raw junk is plentiful
    // (\u2265 30) OR when junk is bottlenecking other crafts. Math: raw \u2192 cubes
    // \u2192 tesseracts. Live session counter populated by chat broadcast parser.
    var jc = computeJunkCompress(inv);
    if (jc.raw >= 30 || jc.currentCubes < 5) {
      h += '<div class="bc8-compress"><div class="bc8-compress-h">\uD83D\uDDDC Junk Compression</div>';
      h += '<div>Raw junk: <b>'+jc.raw+'</b> \u2192 <b>'+jc.possibleCubesFromRaw+'</b> Cubes possible (have <b>'+jc.currentCubes+'</b>)</div>';
      h += '<div>Cubes available: <b>'+jc.totalCubesAfterCompress+'</b> \u2192 <b>'+jc.possibleTess+'</b> Tesseracts possible (have <b>'+jc.currentTess+'</b>)</div>';
      if (jc.sessionCubesCrafted || jc.sessionTessCrafted) {
        h += '<div class="bc8-muted" style="margin-top:3px;">Session: '+(jc.sessionCubesCrafted?jc.sessionCubesCrafted+' cubes':'')+(jc.sessionCubesCrafted&&jc.sessionTessCrafted?' \u00B7 ':'')+(jc.sessionTessCrafted?jc.sessionTessCrafted+' tesseracts':'')+' crafted</div>';
      }
      h += '</div>';
    }
    // v12.4.22: lower sections (Progression / You can make / Inventory /
    // Session / Log) are skipped in compact mode. Compact = panel shows
    // only the essentials needed while actively crafting.
    if (!S.compact) {
    // Progression
    var stage = getStage(inv), col = getCollection(inv);
    h += '<div class="bc8-card"><div style="display:flex;gap:2px;margin-bottom:4px;">';
    var sc = ['#7a8a7a','#b87333','#5b8dd9','#9b59b6','#e67e22','#e74c3c','#f1c40f'];
    for (var si = 0; si < 7; si++) h += '<div style="flex:1;height:4px;border-radius:2px;background:'+(si<stage?sc[si]:'#d5e8ec')+';"></div>';
    h += '</div><div class="bc8-row"><div>Stage '+stage+'/7</div><div class="bc8-val">Beetles '+col.ownedB.length+'/'+col.totalB+' \u00B7 Flowers '+col.ownedF.length+'/'+col.totalF+'</div></div>';
    var miss = col.missingB.map(dn).concat(col.missingF.map(dn));
    if (miss.length > 0 && miss.length <= 8) h += '<div class="bc8-muted">Missing: '+miss.join(', ')+'</div>';
    h += '</div>';
    // You can make
    h += '<div class="bc8-scroll" style="max-height:120px;"><div class="bc8-h">You can make ('+crafts.length+')</div>';
    if (!crafts.length) h += '<div class="bc8-muted">'+(stale?'Scan first.':'No recipes available.')+'</div>';
    for (var di = 0; di < crafts.length; di++) { var dc = crafts[di]; h += '<div class="bc8-recipe"><div class="bc8-recipe-name">'+dc.label+' '+(dc.type==='assemble'?'<span class="bc8-badge bc8-fresh">SAFE</span>':'<span class="bc8-badge bc8-countdown">RNG</span>')+'</div><div class="bc8-muted">'+dc.inputs.map(tokHuman).join(' + ')+'</div></div>'; }
    h += '</div>';
    // Inventory
    h += '<div class="bc8-scroll" style="max-height:200px;"><div class="bc8-h">Inventory</div>';
    var items = Object.keys(inv).filter(function(k) { return !JUNK_SET.has(k) && !SKIP_DISPLAY.has(k) && k !== 'cheese'; }).sort(function(a,b) { return (inv[b]||0)-(inv[a]||0); });
    for (var ii = 0; ii < items.length; ii++) { var ik = items[ii], tier = TIER_MAP[ik]; h += '<div class="bc8-row"><div class="bc8-row-name">'+dn(ik)+' '+(tier?'<span class="bc8-tier" style="background:'+(TIER_COLORS[tier]||'#888')+'">'+tier+'</span>':'')+'</div><div class="bc8-val">'+inv[ik]+'</div></div>'; }
    var jt = cnt(inv,ANY_JUNK); if (jt > 0) { var jn = ANY_JUNK.filter(function(k){return (inv[k]||0)>0;}).length; h += '<div class="bc8-row"><div class="bc8-row-name">Junk <span class="bc8-tier" style="background:#888">Junk</span></div><div class="bc8-val">'+jt+' ('+jn+' types)</div></div>'; }
    h += '</div>';
    // Session
    var sess = S.session||{}, mins = Math.round((Date.now()-(sess.startTime||Date.now()))/60000);
    var dur = mins < 60 ? mins+'m' : Math.floor(mins/60)+'h'+(mins%60?' '+(mins%60)+'m':'');
    h += '<div class="bc8-card"><div class="bc8-row"><div class="bc8-h" style="margin:0;">Session</div><div class="bc8-val">'+dur+' \u00B7 '+(sess.claims||0)+'c/'+(sess.hunts||0)+'h'+(sess.totalXP?' \u00B7 '+sess.totalXP+' XP':'')+'</div></div>';
    if (sess.gains && sess.gains.length) { var gc = {}; for (var gi = 0; gi < sess.gains.length; gi++) gc[sess.gains[gi]] = (gc[sess.gains[gi]]||0)+1; h += '<div class="bc8-muted">Gained: '+Object.keys(gc).map(function(n){return gc[n]>1?n+' x'+gc[n]:n;}).join(', ')+'</div>'; }
    h += '</div>';
    // Log
    h += '<div class="bc8-scroll" style="max-height:80px;flex:1;"><div class="bc8-h">Log</div><div id="bc8-log">'+S.log.slice().reverse().map(function(l){return '<div class="bc8-log-line">'+l+'</div>';}).join('')+'</div></div>';
    } // end if (!S.compact)
    panel.innerHTML = h;
    // Bind
    document.getElementById('bc8-pause').addEventListener('click',function() {
      S.paused = !S.paused;
      save();
      logEvent(S.paused ? 'Paused — all automation off. Click Resume to re-enable.' : 'Resumed — automation active.');
      renderPanel();
    });
    document.getElementById('bc8-fs').addEventListener('click',function() { transition('SCANNING'); fullScan().then(function(){transition('IDLE');}); });
    document.getElementById('bc8-ac').addEventListener('click',function() { S.autoClaim = !S.autoClaim; save(); renderPanel(); });
    document.getElementById('bc8-ah').addEventListener('click',function() { S.autoHunt = !S.autoHunt; save(); renderPanel(); });
    document.getElementById('bc8-strat').addEventListener('click',function() { var m = ['endgame','broad','flowers']; S.strategy = m[(m.indexOf(S.strategy)+1)%m.length]; save(); renderPanel(); });
    // v12.4.22: compact mode toggle
    document.getElementById('bc8-compact').addEventListener('click',function() { S.compact = !S.compact; save(); renderPanel(); });
    document.getElementById('bc8-rss').addEventListener('click',function() { S.session = defaultSession(); save(); renderPanel(); logEvent('Session reset.'); });
    document.getElementById('bc8-rst').addEventListener('click',function() { if (confirm('Clear all data?')) { S = defaults(); save(); renderPanel(); fullScan(); } });
    document.getElementById('bc8-minimize').addEventListener('click',function(e) { e.stopPropagation(); var p = document.getElementById(PANEL_ID); if (p) { p.classList.add('hidden'); S.panelOpen = false; save(); } });
    var hdr = document.querySelector('.bc8-header'); if (hdr) hdr.addEventListener('mousedown',function(e) { if (e.target.id==='bc8-minimize') return; var p = document.getElementById(PANEL_ID); if (!p) return; _drag.on=true; _drag.ox=e.clientX-p.offsetLeft; _drag.oy=e.clientY-p.offsetTop; e.preventDefault(); });
  }

  function ensureUI() {
    injectStyles();
    if (!document.getElementById(BTN_ID)) { var btn = document.createElement('button'); btn.id = BTN_ID; btn.textContent = '\u{1FAB2} Beetle Coach'; btn.addEventListener('click',function() { var p = document.getElementById(PANEL_ID); if (!p) { p = document.createElement('div'); p.id = PANEL_ID; document.body.appendChild(p); } p.classList.toggle('hidden'); S.panelOpen = !p.classList.contains('hidden'); save(); if (S.panelOpen) { parseTimers(); renderPanel(); } }); document.body.appendChild(btn); }
    if (!document.getElementById(PANEL_ID)) { var p = document.createElement('div'); p.id = PANEL_ID; if (!S.panelOpen) p.classList.add('hidden'); document.body.appendChild(p); }
  }

  /* ═══════════════════════════════════════════════════════
     11. BOOT
     ═══════════════════════════════════════════════════════ */
  var _booted = false;
  function boot() { if (_booted) return; _booted = true; _bootTime = Date.now(); transition('BOOTING'); ensureUI(); renderPanel(); setInterval(tick, TICK_MS); setTimeout(tick, 1000); console.log('[BeetleCoach v12] booted'); }
  function safeBoot() { try { boot(); } catch(e) { console.warn('[BC] boot fail',e); } }
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(safeBoot,1500);
  else window.addEventListener('load',function() { setTimeout(safeBoot,1500); });
  setTimeout(safeBoot,3000); setTimeout(safeBoot,5000);
  var obs = new MutationObserver(function() { if (!document.getElementById(BTN_ID)) { _booted = false; setTimeout(safeBoot,500); } });
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
