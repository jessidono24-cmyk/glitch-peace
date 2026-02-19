# GLITCH·PEACE — MASTER GAP ANALYSIS
## Base Layer v4 (Built) vs. Full Blueprint (All 3 Docs)
### Generated: 2026-02-18

---

## HOW TO READ THIS

- ✅ **BUILT** — exists in the base layer zip, working
- 🟡 **STUBBED** — hooks exist, wiring not complete
- ❌ **NOT BUILT** — documented in blueprint, zero code yet
- 🔒 **INTENTIONAL DEFER** — explicitly planned for later phases

Priority tiers: **P1** (next sprint) → **P2** (month 1) → **P3** (month 2) → **P4** (long-term)

---

## LAYER 0 — CORE LOOP

| Feature | Status | Notes |
|---------|--------|-------|
| Grid-based movement (WASD/Arrows) | ✅ | |
| 17 tile types | ✅ | All in constants.js |
| HP system | ✅ | |
| Score tracking | ✅ | |
| Level progression | ✅ | |
| Tile spread (despair/hopeless) | ✅ | stepTileSpread() |
| Fibonacci peace scaling | ✅ | fibonacci(level+2) |
| Canvas 2D rendering | ✅ | |
| Mobile d-pad controls | ✅ | |
| Save/load high scores | ✅ | localStorage |
| Particle system (burst, wave, trail, echo) | ✅ | |
| Screen shake + flash | ✅ | |
| **Fog of war / visibility radius** | ❌ | Designed in docs, zero code |
| **Tile mutation over time (beyond spread)** | ❌ | Void→despair, peace cleanse adj tiles |

---

## LAYER 1 — PERCEPTION / VISUAL MODES

| Feature | Status | Notes |
|---------|--------|-------|
| Grid renderer | ✅ | |
| HUD (HP, energy, score, level, matrix) | ✅ | |
| Matrix A/B toggle with visual shift | ✅ | |
| Scanlines + background stars | ✅ | |
| Vision words (ambient text) | ✅ | |
| Hallucinations (level 3+) | ✅ | |
| Anomaly system (row/col glow) | ✅ | |
| **Constellation mode** (node-graph navigation) | ❌ P2 | Fully designed, zero code |
| **Flow-field orb world** (continuous 2D physics) | ❌ P3 | |
| **First-person raycasting mode** | ❌ P4 | Doom-style corridors |
| **Isometric/tactical view** | ❌ P4 | |
| **Visual style switcher** (grid/constellation/flow) | ❌ P2 | Needs mode-selector.js |
| **Field Guide overlay** (H key, tabbed) | ❌ P1 | Legend, dreamscapes, archetypes, controls tabs |
| Emotion-driven color tinting of world | 🟡 P1 | flashColor exists, not wired to emotion field |
| Realm tint overlay (Mind/Purgatory/Heaven/Hell) | ❌ P1 | Designed, no code |

---

## LAYER 2 — EMOTIONAL ENGINE

| Feature | Status | Notes |
|---------|--------|-------|
| 10 base emotions (data only in constants) | 🟡 | UPG.emotion exists as string, no full engine |
| Valence / arousal / coherence axes | ❌ P1 | Fully specced, zero code |
| Distortion calculation | ❌ P1 | Σ(emotion × arousal × (1-coherence)) / 10 |
| Coherence calculation | ❌ P1 | Σ(emotion × coherence) / Σ(emotion) |
| Valence calculation | ❌ P1 | |
| 7 emotional synergy states | ❌ P1 | FOCUSED_FORCE, CHAOS_BURST, DEEP_INSIGHT, etc. |
| Emotional decay (scaled by weekday coherenceMul) | ❌ P1 | |
| **EmotionalField class** (emotional-engine.js) | ❌ P1 | Task E1 in AGENT_TASKS |
| Emotional HUD row (dominant + coherence + distortion bars) | ❌ P1 | Task E3 |
| **Realm inference** (distortion→purgDepth→realm label) | ❌ P1 | Mind/Purgatory/Heaven/Imagination/Hell |
| Realm label in HUD | ❌ P1 | |
| Emotion-reactive visual tinting | ❌ P1 | |
| Tile events triggering emotion updates | 🟡 P1 | setEmotion() stubs exist in player.js |
| Slow moves when hopeless/despair | ✅ | game.slowMoves exists |
| Emotion icon/name in HUD | ❌ P1 | |
| **Emotion registry as extensible graph** (blah.md spec) | ❌ P2 | Graph architecture vs simple list |
| Emotion clusters (fear-family, joy-family, etc.) | ❌ P2 | |
| Synergy detection live during gameplay | ❌ P1 | |

---

## LAYER 3 — TEMPORAL SYSTEM

| Feature | Status | Notes |
|---------|--------|-------|
| **8 Lunar Phases** (temporal-system.js) | ❌ P1 | Fully specced, Task T1 |
| Lunar phase names in HUD | ❌ P1 | |
| Lunar modifier: enemyMul | ❌ P1 | |
| Lunar modifier: insightMul | ❌ P1 | |
| Lunar modifier: fogRadius | ❌ P1 | (fog not built yet either) |
| **7 Weekly Planetary Harmonics** | ❌ P1 | Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn |
| Weekly coherenceMul wired to emotion decay | ❌ P1 | |
| **12 Chinese Zodiac Years** | ❌ P3 | Year-scale modifiers |
| **8 Celtic Wheel of Year seasonal markers** | ❌ P3 | Samhain, Yule, Imbolc, etc. |
| **Matrix A/B toggle** | ✅ | |
| Real-time date sync (lunar/weekly from actual date) | ❌ P2 | Optional toggle |
| Phase/day name shown in HUD footer | ❌ P1 | |
| **MNF 7 block presets** (Wake/Invocation/Training/CEO/Study/Chores/Wind-down) | ❌ P3 | Pacing governor per session |
| **Gameplay paths** (Arcade/Recovery/Explorer/Ritual) | ❌ P2 | Multiplier presets |

---

## LAYER 4 — ARCHETYPE SYSTEM (EXPANDED)

| Feature | Status | Notes |
|---------|--------|-------|
| 5 base archetypes (Dragon/Child/Orb/Captor/Protector) | ✅ | Powers coded |
| Archetype activation via ARCHETYPE tile | ✅ | |
| Archetype power cooldown system | ✅ | archetypeTimer |
| Archetype display in HUD | 🟡 | Shows text, no icon |
| **10 additional archetypes** | ❌ P2 | Cartographer, Guardian, Devourer, Mirror, Weaver, Witness, Wanderer, Judge, Alchemist, Herald |
| **Archetype fusion system** | ❌ P3 | Guardian+Wanderer→Wayfinder, etc. |
| **Archetype selector screen** (character select) | ❌ P2 | Pre-game choice |
| Archetype unlock via insight tokens | ❌ P2 | |
| **Sovereign Codex archetypes** (blah.md) | ❌ P2 | Consent Warden, Gatekeeper, Hearthkeeper, Statistician |
| **Functional archetypes** (blah.md) | ❌ P2 | Cartographer (reveals map), Lantern (visibility), Weaver (hazard→points), Hearthkeeper (rest nodes) |
| Per-archetype stat modifiers | ❌ P2 | |
| Fusion preview UI | ❌ P3 | |
| Weekly archetype availability (from pantheon) | ❌ P3 | |

---

## LAYER 5 — COSMOLOGY SYSTEMS (9 Traditions)

| Feature | Status | Notes |
|---------|--------|-------|
| **Hindu Chakra System** (7 vertical layers) | ❌ P2 | Muladhara→Sahasrara, gravity modifier, kundalini meter, 7 mantras |
| **Buddhist Wheel of Becoming** (12 links) | ❌ P3 | 12 rooms circular, Dukkha meter, reverse mechanics |
| **Tantric Union** (polarity balance) | ❌ P3 | Shiva/Shakti grid split, balance meter, 5 elements |
| **Taoist Wu Wei** (effortless action) | ❌ P3 | Effort meter, Wu Wei state, Yin/Yang alternation, 5 phases cycle |
| **Norse Yggdrasil** (9-realm tree) | ❌ P3 | Vertical tree nav, realm physics, 24 Runes, Ragnarok cycle |
| **Celtic Otherworld** (veil navigation) | ❌ P3 | Two overlaid grids, veil toggle, Wheel of Year markers |
| **Zoroastrian Duality** (order vs chaos) | ❌ P3 | Asha/Druj balance, field states |
| **Hermetic Principles** (7 universal laws) | ❌ P3 | 7 levels, Tree of Life upgrade path, Alchemy transmutation |
| **Confucian Harmony** (5 relationships) | ❌ P4 | NPC types, 5 virtue stats, social harmony meter |
| Cosmology selector screen | ❌ P2 | |
| Cosmology-specific physics modifiers | ❌ P2 | |
| Cosmology palette/visual theming | ❌ P2 | |

---

## LAYER 6 — GAMEPLAY MODES (Beyond Grid)

| Feature | Status | Notes |
|---------|--------|-------|
| Grid mode | ✅ | |
| **Constellation mode** (node-graph, star-field renderer) | ❌ P2 | Designed with full data structure |
| **Flow-field orb world** (continuous 2D physics) | ❌ P3 | Magnetic forces, smooth rendering |
| **First-person raycasting** | ❌ P4 | |
| **Isometric/tactical view** | ❌ P4 | |
| **Dialogue/visual novel mode** | ❌ P3 | Choice trees, character portraits |
| **Side-scrolling platformer mode** | ❌ P3 | Leaping Field dreamscape natural fit |
| **Mode selector** (mode-selector.js) | ❌ P2 | Switch between modes mid-campaign |
| Mode-specific controls remapping | ❌ P2 | |
| Mode-specific tutorials | ❌ P3 | |
| **Moral choice system** (Fable-inspired) | ❌ P3 | Compassion/Cruelty + Selfless/Selfish axes, visual morphing |
| **Dialogue wheel** | ❌ P3 | |
| **Companion system** | ❌ P4 | |
| **RTS layer** (multi-unit control) | ❌ P4 | |

---

## LAYER 7 — SPATIAL / DREAMSCAPE SYSTEM

| Feature | Status | Notes |
|---------|--------|-------|
| 10 dreamscapes (data defined) | ✅ | |
| Per-dreamscape enemy behavior | ✅ | |
| Per-dreamscape hazard sets | ✅ | |
| Per-dreamscape special tiles | ✅ | |
| Environment events (8 types) | ✅ | |
| Interlude screens between dreamscapes | ✅ | |
| Boss system (level 6+ summit/integration) | ✅ | |
| **8 Biome system** (separate from dreamscapes) | ❌ P2 | Fracture Fields, Water Archives, Spiral Gardens, Static Cathedrals, Echo Deserts, Convergence Storms, Void State, Radiant Core |
| Biome selection from emotional state | ❌ P2 | Joy+Hope → Radiant Core, Shame+Anger → Fracture Fields |
| **Fog of war** (tile radius visibility) | ❌ P2 | 3-tile default, insight tiles reveal 5-tile radius |
| **Tile mutation** (peace cleanse adj tiles, void→despair over time) | ❌ P2 | Beyond current simple spread |
| Dreamscape-specific win condition variants | 🟡 | Peace collection only, no variants yet |
| Dreamscape-specific lore fragments | ❌ P1 | Narrative text defined, no display system |
| **Memory Temple** (10 chambers as world map backbone) | ❌ P3 | Hearth routing rule, chamber-hub structure |
| Procedural lore per dreamscape on entry | ❌ P2 | |
| **Weather system** (clear/rain/storm/fog) | ❌ P3 | Affects visibility + feel |
| **Wind direction** (N/E/S/W, affects particles) | ❌ P3 | |
| **Elements system** (earth/water/fire/air/aether) | ❌ P3 | Biases mutation + emotional settling |

---

## LAYER 8 — PATTERN RECOGNITION / RECOVERY TOOLS

| Feature | Status | Notes |
|---------|--------|-------|
| **Hazard Pull** (magnetic craving simulation) | ❌ P1 | hazard-pull.js, proximity drift |
| **Impulse Buffer** (1-sec hold on hazard tiles) | ❌ P1 | Task P1 in AGENT_TASKS, progress bar |
| **Consequence Preview** (ghost path 3 moves ahead) | ❌ P1 | Task P2, HP projection |
| **Pattern Echo** (loop detection, 3-5 move repetition) | ❌ P2 | Visual trail overlay, awareness message |
| **Route Alternatives** (3 color-coded path suggestions) | ❌ P2 | |
| **Relapse Compassion** (small consequence, recovery tile spawns) | ❌ P2 | Non-punitive response |
| **Threshold Monitor** (near-miss tracking, risk display) | ❌ P2 | |
| Pattern training mode toggle | ❌ P2 | All 7 tools on/off |
| Tutorial for each recovery tool | ❌ P3 | |
| Effectiveness tracking per tool | ❌ P3 | Analytics |
| **Purgatory as a function** (distortion→purgDepth) | ❌ P1 | purgDepth 0-1, modifies healing/damage/fog |
| "PURGATORY RISING" warning cue (once per level) | ❌ P1 | |

---

## LAYER 9 — SESSION MANAGEMENT / CESSATION MACHINE

| Feature | Status | Notes |
|---------|--------|-------|
| **Session time tracking** | ❌ P1 | |
| **Session warnings** (30min / 1hr / 2hr) | ❌ P1 | |
| **Pause rewards** (rest 10min → +10 maxHP, rest 60min → +2 tokens) | ❌ P1 | |
| **Exit affirmations** (7 rotating messages) | ❌ P1 | "Thank you for playing. You chose to stop…" |
| **Craving detection** (3 quick returns → awareness message) | ❌ P2 | Monitors return patterns |
| Craving detection → 15-min alternative suggestion | ❌ P2 | |
| **Exit ritual** (30-sec wind-down, session stats, fade) | ❌ P2 | Gradual fade not abrupt cut |
| Save & exit → +10% score bonus | ❌ P2 | Rewards healthy boundaries |
| Natural break point highlighting | ❌ P2 | |
| **Hearthkeeper** (forces closure/rest nodes when intensity chains) | ❌ P2 | From blah.md SC enforcement |
| **Gatekeeper** (blocks compulsive loops/overstimulation) | ❌ P2 | |
| **Anti-compulsion filter** | ❌ P2 | MCA safety layer |

---

## LAYER 10 — AUDIO ENGINE

| Feature | Status | Notes |
|---------|--------|-------|
| **Emotion-reactive music** (coherence→calm, distortion→glitch) | ❌ P2 | sfx-manager.js |
| **Procedural SFX** (Web Audio API, no files) | ❌ P2 | peace collect, damage, matrix switch, level complete |
| **Weekday instrument sets** (Sun=brass, Moon=strings, etc.) | ❌ P3 | |
| **Dreamscape reverb profiles** | ❌ P3 | |
| **Binaural meditation tones** (optional toggle) | ❌ P4 | Theta/Alpha/Beta, chakra frequencies |
| Movement sound | ❌ P2 | |
| Enemy hit sound | ❌ P2 | |
| Matrix switch tone | ❌ P2 | |
| Audio settings (mute, volume) | ❌ P2 | |
| Audio accessibility options | ❌ P2 | |

---

## LAYER 11 — PROGRESSION / META

| Feature | Status | Notes |
|---------|--------|-------|
| Upgrade shop (8 upgrades) | ✅ | |
| Insight token economy | ✅ | |
| High score tracking (local) | ✅ | |
| Dream history tracking | ✅ | |
| Session rep tracking | ✅ | |
| **Journal system** (logbook, not therapy) | ❌ P2 | Logs dreamscapes, archetypes, weekly overlays, glyphs, glitch-peace moments |
| Journal exportable as JSON | ❌ P2 | |
| **Glyph/symbol collection** (geometry system) | ❌ P3 | Triangle=choice, square=boundary, circle=continuity, spiral=progress, vesica=integration |
| Glyph as memory icons / buffs / unlock keys | ❌ P3 | |
| **Story mode spine** (intro→emotions→tiles→realms→loop+recovery) | ❌ P2 | |
| Story node progression graph | ❌ P2 | |
| Unlock system (dreamscapes, archetypes, cosmologies) | ❌ P2 | Currently all open |
| Per-archetype unlock via insight tokens | ❌ P2 | |
| **Renown system** (NPCs remember choices) | ❌ P4 | RPG mode |
| Titles earned dynamically from choices | ❌ P4 | |

---

## LAYER 12 — LORE + LEARNING

| Feature | Status | Notes |
|---------|--------|-------|
| Dreamscape narrative text (defined in constants) | 🟡 | Text exists, no display system beyond msg |
| **Procedural lore generator** (myth fragments) | ❌ P3 | Sterilized, universal, no metaphysical claims |
| Lore displayed between levels (interlude) | ❌ P2 | |
| **Invisible learning drops** | ❌ P3 | Glyph cards (1 sentence), micro puzzles (10 sec), bilingual pairs, physics fragments |
| Learning drops: disable toggle | ❌ P3 | Accessibility rule |
| Learning drops: no time pressure | ❌ P3 | |
| **Dialogue trees** (NPC conversations) | ❌ P4 | |
| **Pantheon overlay system** (blah.md priority #1) | ❌ P2 | Aesthetic skins + micro buffs, weekly routing, 5 node types per deck |
| Pantheon: no metaphysical claims enforcement | ❌ P2 | Boundary nodes |
| Pantheon: user fills their own deck | ❌ P2 | Template structure in blah.md |

---

## LAYER 13 — ACCESSIBILITY + SAFETY

| Feature | Status | Notes |
|---------|--------|-------|
| Particle toggle | ✅ | CFG.particles |
| Difficulty modes (easy/normal/hard) | ✅ | |
| Grid size options | ✅ | |
| No shame messaging | ✅ | Compassionate text throughout |
| Pause anytime | ✅ | |
| **High contrast mode** | 🟡 | CSS class exists in uploaded index.html, not wired to settings toggle |
| **Reduced motion mode** | 🟡 | CSS class exists, not wired |
| **Stillness mode** (no enemies) | ❌ P1 | Defined in README, zero code |
| **Intensity auto-soften** (discomfort detection) | ❌ P2 | SC enforcement node |
| **Reality-anchor messaging** ("This is a simulation") | 🟡 | Implied in design, no explicit UI system |
| **Consent gates** for deep mode features | ❌ P2 | SC Consent Warden |
| Accessibility settings menu | 🟡 | Options screen exists, missing these toggles |
| **Pacing as design constraint** (nervous system) | 🟡 | Implicit in slow-moves, not explicit system |

---

## LAYER 14 — SOCIAL / MULTIPLAYER

| Feature | Status | Notes |
|---------|--------|-------|
| **Multiplayer Resonance Mode** | ❌ P4 | Shared coherence field, co-op stabilizing, P2P |
| One player "holds Hearth" while other explores | ❌ P4 | |
| Consent gates on social features | ❌ P4 | |
| No competitive humiliation loops | ❌ P4 | Design rule enforced when built |
| **Reality Sync Mode** (real-time calendar/weather) | ❌ P4 | Optional |
| **Leaderboard** (community) | ❌ P4 | Currently local only |
| Dreamscape sharing | ❌ P4 | |
| Mod support | ❌ P4 | |
| Custom cosmology creator | ❌ P4 | |

---

## SUMMARY COUNTS

| Status | Count |
|--------|-------|
| ✅ Built | ~42 features |
| 🟡 Stubbed/Partial | ~12 features |
| ❌ Not built (P1 — next sprint) | ~24 features |
| ❌ Not built (P2 — month 1) | ~38 features |
| ❌ Not built (P3 — month 2) | ~32 features |
| ❌ Not built (P4 — long-term) | ~18 features |
| **Total blueprint features** | **~166** |

**Current completion: ~32% of blueprint**

---

## RECOMMENDED BUILD ORDER (AGENT TASK SEQUENCE)

### Sprint 1 — Emotional + Temporal Core (P1, ~1,400 lines)
1. `E1` — `src/systems/emotional-engine.js` — EmotionalField class (400 lines)
2. `E2` — Wire EmotionalField into main.js game loop (50 lines)
3. `E3` — Emotional HUD row in renderer.js (80 lines)
4. `E4` — Realm inference from distortion/valence (purgDepth) (60 lines)
5. `T1` — `src/systems/temporal-system.js` — lunar + weekly (300 lines)
6. `T2` — Wire temporal modifiers into spawns/decay/HUD (80 lines)
7. `S1` — Session manager (time tracking + session warnings + pause rewards) (150 lines)
8. `S2` — Exit affirmations system (40 lines)

### Sprint 2 — Recovery + Safety Layer (P1/P2, ~900 lines)
9. `P1` — `src/recovery/impulse-buffer.js` (200 lines)
10. `P2` — `src/recovery/consequence-preview.js` (200 lines)
11. `P3` — `src/recovery/hazard-pull.js` (150 lines)
12. `A1` — Stillness mode (no enemies toggle) (30 lines to enemy.js)
13. `A2` — High contrast + reduced motion wired to settings (30 lines)
14. `A3` — Reality-anchor footer message (20 lines)

### Sprint 3 — Field Guide + Lore Display (P1/P2, ~400 lines)
15. `G1` — Field guide overlay (H key, 4 tabs: legend/dreamscapes/archetypes/controls) (200 lines)
16. `L1` — Lore display system in interlude screen (100 lines)
17. `L2` — Dreamscape narrative text system (per-level lore drops) (100 lines)

### Sprint 4 — Expanded Archetypes + Unlock System (P2, ~800 lines)
18. `AR1` — 10 additional archetypes in constants.js (200 lines)
19. `AR2` — Archetype selector screen (pre-game) (150 lines)
20. `AR3` — Unlock system wired to insight tokens (100 lines)
21. `AR4` — Sovereign Codex archetypes (Hearthkeeper, Gatekeeper, Consent Warden) (150 lines)

### Sprint 5 — Audio (P2, ~600 lines)
22. `AU1` — `src/audio/sfx-manager.js` (Web Audio API, procedural, no files) (250 lines)
23. `AU2` — Emotion-reactive music layer (coherence→calm, distortion→glitch) (200 lines)
24. `AU3` — Audio settings wired to options screen (50 lines)

### Sprint 6 — Constellation Mode + Biomes (P2, ~900 lines)
25. `C1` — `src/modes/constellation-mode.js` (400 lines)
26. `C2` — Mode selector (mode-selector.js) (100 lines)
27. `B1` — Biome system (8 biomes, emotional state → biome mapping) (300 lines)
28. `B2` — Fog of war (3-tile radius, insight reveals 5-tile) (100 lines)

### Sprint 7 — Hindu Chakra + Pantheon (P2/P3, ~700 lines)
29. `CO1` — `src/cosmologies/hindu-chakra.js` (450 lines)
30. `PA1` — Pantheon overlay system (cosmetic + micro buffs) (250 lines)

### Sprint 8 — Journal + Story Mode (P2, ~500 lines)
31. `J1` — Journal system (logbook, exportable JSON) (200 lines)
32. `ST1` — Story mode spine (chapter progression graph) (300 lines)

### Sprints 9-12 — Remaining Cosmologies (P3, ~2,500 lines)
Buddhist → Tantric → Taoist → Norse → Celtic → Zoroastrian → Hermetic

### Sprints 13-15 — Additional Gameplay Modes (P3/P4, ~2,200 lines)
Flow-field → Dialogue → Platformer → Isometric

### Sprint 16+ — Multiplayer, Mod support (P4)

---

## FILE STRUCTURE — FULL TARGET

```
src/
  main.js                           ✅ (state machine)
  core/
    constants.js                    ✅ (needs archetype expansion)
    state.js                        ✅
    utils.js                        ✅
    storage.js                      ✅ (needs journal export)
  game/
    grid.js                         ✅ (needs biome + fog)
    player.js                       ✅ (needs impulse buffer hook)
    enemy.js                        ✅ (needs stillness mode)
    particles.js                    ✅
  systems/                          ❌ ENTIRE FOLDER MISSING
    emotional-engine.js             ❌ P1
    temporal-system.js              ❌ P1
    session-manager.js              ❌ P1
    biome-system.js                 ❌ P2
    pattern-recognition.js          ❌ P2
    mode-selector.js                ❌ P2
    cosmology-router.js             ❌ P2
  recovery/                         ❌ ENTIRE FOLDER MISSING
    impulse-buffer.js               ❌ P1
    consequence-preview.js          ❌ P1
    hazard-pull.js                  ❌ P1
    pattern-echo.js                 ❌ P2
    route-discovery.js              ❌ P2
    relapse-compassion.js           ❌ P2
    threshold-monitor.js            ❌ P2
  modes/                            ❌ ENTIRE FOLDER MISSING
    constellation-mode.js           ❌ P2
    flow-field-mode.js              ❌ P3
    dialogue-mode.js                ❌ P3
    platformer-mode.js              ❌ P3
    isometric-mode.js               ❌ P4
    first-person-mode.js            ❌ P4
  cosmologies/                      ❌ ENTIRE FOLDER MISSING
    hindu-chakra.js                 ❌ P2
    buddhist-wheel.js               ❌ P3
    tantric-union.js                ❌ P3
    taoist-wuwei.js                 ❌ P3
    norse-yggdrasil.js              ❌ P3
    celtic-otherworld.js            ❌ P3
    zoroastrian-duality.js          ❌ P3
    hermetic-principles.js          ❌ P3
    confucian-harmony.js            ❌ P4
  archetypes/                       ❌ ENTIRE FOLDER MISSING
    archetype-system.js             ❌ P2
    [15 individual archetype files] ❌ P2
  audio/                            ❌ ENTIRE FOLDER MISSING
    sfx-manager.js                  ❌ P2
    music-engine.js                 ❌ P2
    binaural-generator.js           ❌ P4
  lore/                             ❌ ENTIRE FOLDER MISSING
    procedural-lore.js              ❌ P3
    dialogue-trees.js               ❌ P4
    learning-drops.js               ❌ P3
  multiplayer/                      ❌ ENTIRE FOLDER MISSING
    resonance-mode.js               ❌ P4
    network-sync.js                 ❌ P4
  accessibility/                    ❌ ENTIRE FOLDER MISSING
    settings.js                     ❌ P1
    intensity-control.js            ❌ P2
    stillness-mode.js               ❌ P1
    disclaimers.js                  ❌ P2
  progression/                      ❌ ENTIRE FOLDER MISSING
    session-manager.js              ❌ P1
    journal.js                      ❌ P2
    unlock-system.js                ❌ P2
  ui/
    renderer.js                     ✅ (needs emotion HUD + realm tint)
    menus.js                        ✅ (needs field guide + journal + archetype select)
    field-guide.js                  ❌ P1
    narrative.js                    ❌ P2
    tutorial.js                     ❌ P2
```

---

*This document should be updated after each sprint. Cross off items as they ship.*
