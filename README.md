# 🌌 GLITCH·PEACE

> **A multidimensional consciousness awakening platform** for healing, learning, and transformation — playable today as an HTML5 game, building toward a free Steam release.

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/jessidono24-cmyk/glitch-peace)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/jessidono24-cmyk/glitch-peace)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![Lines of Code](https://img.shields.io/badge/LOC-13%2C000%2B-orange.svg)](src/)
[![Progress](https://img.shields.io/badge/completion-97%25-brightgreen.svg)](#-development-roadmap)

*Begin in stillness. Emerge through pattern recognition. Transform through play.*

---

## 🎯 What is GLITCH·PEACE?

GLITCH·PEACE is a **consciousness engine disguised as a game**. Built on extensive research spanning psychology, neuroscience, global wisdom traditions, and consciousness studies, it serves six integrated purposes:

### 🧠 Consciousness Awakening
- **Meta-awareness mechanics** that cultivate observer consciousness
- **Emergence indicators** tracking signs of awakening
- **Self-reflection tools** embedded in gameplay transitions
- **Presence training** through mindful tile interaction
- **Dream yoga integration** — reality check habit training that transfers to sleep

### 🌱 Addiction Cessation Support
- **Gentle stress inoculation** building resilience gradually
- **Impulse buffer** — 1-second hold before hazardous moves trains pause-and-reflect
- **Consequence preview** — 3-step future path visualization
- **Pattern recognition** highlighting addictive loop behaviors compassionately
- **No shame spirals** — relapse is reframed as data, not failure
- **Session tracking** + wellness monitoring (all local/private, zero data collection)

### 📚 Learning Acceleration
- **19-language system** with immersive vocabulary acquisition during gameplay
- **Sigil system** — visual symbol learning across 15+ traditions
- **Adaptive difficulty** — 5 tiers from age 5+ to expert
- **Spaced repetition** naturally embedded in dreamscape progression
- **Pattern recognition engine** building cognitive flexibility

### 🧘 Dream Yoga & Embodiment *(Phase 2.5 — newly integrated)*
- **Lucidity meter** (0-100%) persisting across sessions, displayed during play
- **Reality check prompts** at 4-9 minute intervals (centred overlay, any key to dismiss)
- **Dream sign tracking** — tile visit patterns mapped to personal recurring dream motifs
- **Lucidity affirmations** surfacing at interlude transitions
- Research basis: LaBerge (1990), Stumbrys et al. (2012), Tibetan dream yoga, Hobson (2009)

### 🎮 21 Play Styles *(v2.0.0: Nightmare 🌑 + Rhythm 🎵 added — v2.2.0: all score multipliers fixed)*
Each style radically changes gameplay feel. Select in OPTIONS → PLAY STYLE (← → to cycle):

| Style | Feel | Key Change |
|-------|------|------------|
| 🕹️ Classic Arcade | Balanced | Default experience |
| 🌸 Zen Garden | Meditative | No enemies, no hazard damage, auto-heal |
| ⚡ Speedrun | Adrenaline | 3-minute countdown, 1.3× enemy speed |
| 🧩 Puzzle Master | Strategic | 50-move limit, no enemies |
| 💀 Survival Horror | Extreme | 1.8× damage multiplier, 1.4× enemy speed |
| 🎲 Roguelike Descent | Procedural | Randomised, scaling difficulty |
| 🌱 Pattern Training | Therapeutic | Slow enemies (0.6×), all recovery tools active |
| 🐉 Boss Rush | Intense | Every dreamscape spawns a boss immediately |
| ☮️ Pacifist Path | Stealth | Navigate without engaging enemies |
| 🔄 Reverse Polarity | Mind-bending | Peace tiles damage; hazard tiles heal |
| 🕯️ Ritual Practice | Ceremonial | Slow motion (0.55×), intentional movement |
| 📅 Daily Challenge | Competitive | Seeded new configuration every 24 hours |
| 🤝 Co-op Field | Collaborative | Phase M8 — shared emotional field (coming) |
| 🐦 Bird Watching | Ornithological | Somatic habitat tiles, no hazards, meditative |
| 🍄 Mycelium Network | Mycological | Hazards → energy nodes, deep healing |
| 🏛️ Sacred Architecture | Structural | GROUNDING foundations, 80-move budget |
| ⚗️ Alchemist | Alchemical | Collect element seeds, X to transmute |
| ✦ Constellation Path | Stellar | Star-node navigation, constellation lines |
| 🕯️ Ritual Space | Somatic-Alchemical | Element seeds ×2, alchemy enabled, half-damage |
| 🌑 Nightmare | **NEW** Unforgiving | 2× damage, predictive enemies, 5× score, no mercy |
| 🎵 Rhythm Flow | **NEW** Musical | Move on the beat (80 BPM) for ×2 bonus score |

### 🌍 12 Cosmological Frameworks *(newly mapped — from glitch-peace-vite)*
Visible in the dreamscape selection screen for each level:

| Framework | Tradition | Dreamscape Affinity |
|-----------|-----------|---------------------|
| ☸️ Cycle of Attachment | Buddhist | Courtyard of Ojos, Neighborhood |
| 🌈 Seven Energy Fields | Hindu | Integration, Summit |
| ☯️ The Uncarved Block | Taoist | Leaping Field, Orb Escape |
| 🌳 Nine Realm Tree | Norse | Summit, Mountain Dragon |
| 🍀 Veil Crossing | Celtic | Orb Escape, Leaping Field |
| ⚖️ Order vs Entropy | Zoroastrian | Bedroom, Void State |
| 🔮 Seven Universal Laws | Hermetic | Void State, Integration |
| 𓂀 The Duat | Egyptian | Aztec Chase, Void |
| 🤲 Five Relations | Confucian | Neighborhood, Courtyard |
| 🗓️ Tzolk'in Cycles | Mayan | Aztec / Mayan Chase |
| ☰ Book of Changes | I Ching | Integration, Void |
| ⚡ Field of Polarity | Tantric | Bedroom, Integration |

*All presented as sterilized pattern mechanics — no dogma; origins credited*

---

## 📦 Current Version: v2.2.0 (February 2026)

### Build Statistics
| Metric | Value |
|--------|-------|
| Source files | 46 JS modules |
| Lines of code | ~13,000 |
| Bundle size | 352 KB (113 KB gzipped) |
| Build time | ~780ms |
| Completion | ~97% of full vision |
| Bug fixes | 13 issues resolved (v2.2.0) |

### What's New in v2.2.0 — Bug Fixes & Gameplay Integrity

- ✅ **BUG-13 Fixed: Play mode score multiplier now applied** — Horror (3×), Nightmare (5×), Ritual Space (1.6×), etc. now correctly scale all tile scores (PEACE, INSIGHT, MEMORY, all somatic tiles, magnet sweeps). Advertised difficulty reward now real.
- ✅ **BUG-07/08 Fixed: gameMode reset on mode exit** — Exiting Constellation / Meditation / Co-op via ESC or death screen now correctly resets `gameMode` to `'grid'`, preventing broken blank-canvas state on "Start Journey". Death screen restart also correctly re-initializes the active mode.
- ✅ **BUG-04 Fixed: Boss respects walls** — Boss movement now checks `T.WALL` before stepping, same as regular enemies. Terrain is now tactically relevant during boss fights.
- ✅ **BUG-02 Fixed: Shield blocks hallucination damage** — Chaos Phantoms (level 3+ hallucinations) now check `UPG.shield` before dealing damage, consistent with regular enemy behavior.
- ✅ **BUG-03 Fixed: Shield blocks capture zone damage** — Capture zone tick damage (5 HP per enemy per zone) now respects the player's active shield.
- ✅ **BUG-05 Fixed: Boss death now fires particle bursts** — `_handleBossDeath` now accepts and calls `burstFn` — a dramatic dual burst (player position + boss position) fires on every boss defeat.
- ✅ **BUG-06 Fixed: Philosopher's Stone heals to actual max HP** — `game.maxHp || 100` → `UPG.maxHp`. Players who bought +MAX HP upgrades receive a full restore.
- ✅ **BUG-09 Fixed: Magnet collects all insight tokens correctly** — Magnet loop now accumulates a delta count and calls `setInsightTokens` once at the end, correctly granting all tokens swept in a single move.
- ✅ **BUG-01 Fixed: TRAP tile push effect implemented** — The push-back effect (declared in `TILE_DEF` as `push: 1`) now fires for any tile with `push > 0`, including TRAP (×). RAGE and TRAP both push the player one step in the direction of travel.
- ✅ **BUG-10 Fixed: HOW TO PLAY returns cursor to correct position** — `CURSOR.menu` set to `3` (HOW TO PLAY) instead of `2` on exit, consistent with all other menu screens.
- ✅ **BUG-11 Fixed: Shooter contact cooldown uses current frame delta** — `checkCollisions()` now receives `dtSec` as a parameter instead of using the stale `this._lastDt` field.
- ✅ **BUG-12 Fixed: Daily challenge index persisted across refreshes** — Daily dreamscape index saved to `localStorage` keyed by date (`gp_daily_idx`). Refreshing mid-session keeps the same dreamscape; resets correctly at midnight.

### What's In This Build
- ✅ **Complete base game** (Phases 1-5): 21 tile types, **18 dreamscapes**, 5 archetypes, 9+ enemy AI behaviors
- ✅ **Magnet upgrade now functional** — auto-collects PEACE/INSIGHT tiles within radius 2 on each move; correctly counts all swept tokens
- ✅ **`playPlayerHurt` SFX** — low-frequency sawtooth hurt sound now wired when stepping on hazard tiles (distinct from enemy hit)
- ✅ **Enemy behavior aliases** — `hunt` (horror/predictive), `aggressive` (chase_fast), `passive`/`none` (gentle wander), `random` (roguelike) now all properly implemented
- ✅ **Per-tile transmutation sparkle FX** — each hazard tile converted in alchemy radius now emits its own particle burst (up to 8 tiles)
- ✅ **2 new Alchemy Quests** — "The Alchemist" (5 transmutations + 3 elements) and "The Great Work" (Philosopher's Stone + aurora phase); quest count 5→7
- ✅ **Named Constellation Rewards** (Phase M6) — skymap/ritual_space mode: every 3 star tiles collected awards a named constellation (16 names: Orion, Pleiades, Cassiopeia, etc.) + score bonus; constellation flash overlay in renderer
- ✅ **Alchemy System** (Phase M6 extension, deepened) — proper Philosopher's Stone: ALL 4 classical elements (fire/water/earth/air) used in session triggers; 8-transmutation fallback; element-history tracking; dashboard shows Great Work progress (X/4 elements); 2 new SFX
- ✅ **21 Play Modes** — all modes' score multipliers are now correctly applied
- ✅ **Constellation visual overlay** — Skymap + Ritual Space modes now draw glowing dashed lines between nearby star tiles (INSIGHT/ARCHETYPE), forming real constellations on the grid; Phase M6 ↑ 20%→65%
- ✅ **Death screen enriched** — RPG level, quests completed, alchemy phase/transmutations shown on death
- ✅ **Interlude enriched** — Cosmology info (4.2s), RPG level + active quest progress (4.8s), milestone (5.2s)
- ✅ **tileFlicker Map optimization** — O(n)→O(1) per-tile lookup (Map keyed by tile position)
- ✅ **`playDreamComplete` SFX** — new gentle ascending pentatonic chord (distinct from level-up) played on dreamscape completion
- ✅ **18 Dreamscapes** — all complete
- ✅ **4 Somatic Tiles** (Phase 2.6) — BODY_SCAN ◯, BREATH_SYNC ≋, ENERGY_NODE ✦, GROUNDING ⊕ — full animated visuals + somatic SFX
- ✅ **RPG Character System** (Phase M5) — STR/INT/WIS/VIT stats; XP + level; archetype dialogue; **5 main quests**; quest progress panel in dashboard
- ✅ **Multi-phase Boss System** (Phase M3.5) — 3 boss types × 3 phases; Void Nexus & Ancient Structure get bosses; bosses now respect walls; dramatic death burst FX
- ✅ **5 new environment events** — solar_pulse, ocean_surge, crystal_resonance, wind_drift, void_expansion
- ✅ **Quest panel** in H-key dashboard — real-time quest progress, active objective, completion count
- ✅ **Alchemy panel** in H-key dashboard — phase, seeds, transmutations, Great Work progress (X/4 elements), philosopher stones
- ✅ **Full Tutorial** (all 18 dreamscapes) — 3 contextual hints per dreamscape
- ✅ **Grid Mode** (tactical tile-based) + **Shooter Mode** (twin-stick action)
- ✅ **12 Cosmological Frameworks** — mapped to dreamscapes
- ✅ **Dream Yoga System** (Phase 2.5) — lucidity meter, reality check prompts, dream sign tracking
- ✅ **Emotional engine** — 10-emotion field with valence, arousal, coherence, 7 synergy patterns
- ✅ **Temporal system** — 8 lunar phases × 7 weekday harmonics
- ✅ **Recovery tools** — impulse buffer + consequence preview
- ✅ **Adaptive difficulty** — 5 age-calibrated tiers (ages 5+)
- ✅ **19-language vocabulary** with Fibonacci-spaced repetition
- ✅ **Sigil learning** — visual glyphs from 15+ traditions
- ✅ **Session tracker** + urge management + wellness monitoring
- ✅ **Awareness features** — self-reflection, emergence indicators (12 event types)
- ✅ **Intelligence enhancement** — IQ/EQ proxy metrics, strategic coaching
- ✅ **Chakra system** + Tarot archetypes (Phase 10)
- ✅ **Integration dashboard** (H key) — SESSION, LEARNING, EMERGENCE, CHAKRA, CHARACTER, IQ/EQ, JOURNEY, QUESTS, ALCHEMY
- ✅ **Campaign manager** — narrative arc for all 18 dreamscapes
- ✅ **Procedural audio** — 17 distinct SFX (incl. dreamComplete + transmutation + philosopher's stone)
- ✅ **Onboarding flow** — age group, language, difficulty selection
- ✅ **HOW TO PLAY screen** — tile guide, controls (incl. X=transmute for Alchemist/Ritual), matrix system, 18 dreamscapes / 21 modes noted
- ✅ **Smooth level transitions** — 10-second readable interlude; cosmology + RPG quest info + milestone; player-skippable
- ✅ **Boss phase banner** + **Quest flash** + **Alchemy HUD strip** — all animated overlays

---

## 🎮 How to Play

> **New to GLITCH·PEACE?** Here's everything you need to know before your first dreamscape.

### The Objective
Move through the dreamscape grid and **collect ◈ PEACE tiles** to fill your progress bar. When it's full, an exit opens — step into it to advance to the next dreamscape. Avoid hazard tiles (they drain HP). Survive long enough to awaken.

**ESC pauses the game at any moment. Your state is always safe to leave.**

### Tile Reference
| Symbol | Name | Effect |
|--------|------|--------|
| ◈ | **PEACE** | Collect to progress — your primary goal |
| ◆ | **INSIGHT** | Earns upgrade tokens (spend in Upgrades menu) |
| ↓ | **DESPAIR** | Hazard — damages + spreads to nearby tiles |
| ! | **TERROR** | High-damage hazard |
| ✕ | **SELF-HARM** | Moderate damage |
| ~ | **HOPELESS** | Hazard — spreads slowly |
| ▲ | **RAGE** | Damage + pushes you back |
| ? | **GLITCH** | Teleports you to a random empty tile |
| ⇒ | **TELEPORT** | Fast-travel portal (step on to jump) |
| ☆ | **ARCHETYPE** | Activates a guardian power — press **J** to use it |
| ◯ | **BODY SCAN** | Somatic tile — restores energy |
| ≋ | **BREATH SYNC** | Calming tile — syncs pace |
| ✦ | **ENERGY NODE** | Energy boost |
| ⊕ | **GROUNDING** | Rooting heal |

### Controls Quick-Reference
| Key | Action |
|-----|--------|
| **WASD** / **Arrow Keys** | Move |
| **SHIFT** | Toggle Matrix A (Erasure) ↔ B (Coherence) |
| **J** | Archetype power (when ☆ is active) |
| **R** | Glitch Pulse (when charge is full) |
| **Q** | Freeze all enemies (requires upgrade) |
| **X** | Transmute elements — Alchemist/Ritual Space mode |
| **C** | Containment zone — costs 2 ◆ |
| **H** | Toggle integration dashboard |
| **ESC** | Pause (always safe) |

> **In-game**: Select **HOW TO PLAY** from the title menu for a built-in visual reference.

### The Matrix System
Press **SHIFT** to switch between two matrices:
- **MATRIX A ⟨ERASURE⟩** — red glow. More dangerous, reveals hidden tiles, empowers archetype abilities.
- **MATRIX B ⟨COHERENCE⟩** — green glow. Safer, enables slow passive healing, better for recovery.

Holding Matrix B for 4+ seconds slowly heals you. Holding Matrix A for 2.5+ seconds slowly drains HP. Choose wisely.

### Your First Steps
1. Select **▶ START JOURNEY** — the game begins in **VOID STATE** (the first dreamscape, gently paced)
2. Move with WASD/Arrows and collect every ◈ you see
3. When HP is low: switch to Matrix B (SHIFT) and avoid hazards
4. Collect ☆ ARCHETYPE tiles to activate a guardian — press J to use the power
5. Advance through all 18 dreamscapes to reach **DREAMSCAPE INTEGRATION** — the final awakening

---



### Just Want to Play? (2 minutes)
1. Click **Code** → **Download ZIP** above
2. Extract anywhere
3. Open `dist/index.html` in browser
4. Play immediately — no installation needed
5. Select **HOW TO PLAY** from the title menu for an in-game guide

### For Developers
```bash
git clone https://github.com/jessidono24-cmyk/glitch-peace.git
cd glitch-peace
npm install
npm run dev        # http://localhost:3000
npm run build      # → dist/ (~254 KB)
```

---

## 🎮 Controls

### Grid Mode (Tactical)
| Key | Action |
|-----|--------|
| **WASD** / **Arrows** | Move player |
| **SHIFT** | Toggle Matrix A (Erasure) ↔ B (Coherence) |
| **J** | Archetype power |
| **R** | Glitch Pulse (when charged) |
| **Q** | Freeze enemies |
| **C** | Containment zone (costs 2 ◆) |
| **H** | Toggle integration dashboard |
| **B** (paused) | Cycle breathing patterns |
| **Any key** (playing) | Dismiss reality check prompt |
| **ESC** | Pause |

### Shooter Mode (Twin-Stick)
| Control | Action |
|---------|--------|
| **WASD** | Continuous movement |
| **Mouse** | Aim |
| **Left click** | Shoot |
| **1-4** | Weapon select |

### Universal
| Key | Action |
|-----|--------|
| **M** | Switch Grid ↔ Shooter mode (from title) |

---

## 🏗️ Repository Structure

```
glitch-peace/
├── src/
│   ├── core/                    # Engine (constants, state, utils, storage)
│   ├── game/                    # Mechanics (grid, player, enemy, particles)
│   ├── ui/                      # Interface (renderer, menus)
│   ├── modes/                   # Mode system (grid, shooter, campaign)
│   ├── systems/
│   │   ├── play-modes.js        # 13 play styles ← NEW
│   │   ├── emotional-engine.js  # 10-emotion field
│   │   ├── temporal-system.js   # Lunar × weekday harmonics
│   │   ├── difficulty/          # Adaptive difficulty tiers
│   │   ├── learning/            # Vocabulary, sigil, language, patterns
│   │   ├── cessation/           # Session tracking, urge management
│   │   ├── awareness/
│   │   │   ├── self-reflection.js
│   │   │   ├── emergence-indicators.js
│   │   │   └── dream-yoga.js    # Dream yoga system ← NEW
│   │   ├── cosmology/
│   │   │   ├── chakra-system.js
│   │   │   ├── tarot-archetypes.js
│   │   │   └── cosmologies.js   # 12 frameworks ← NEW
│   │   └── integration/         # Progress dashboard
│   ├── recovery/                # Impulse buffer, consequence preview
│   ├── audio/                   # Procedural SFX
│   └── intelligence/            # IQ/EQ proxy metrics
├── docs/                        # Research & design documents
├── dist/                        # Production build (254 KB)
├── index.html
├── vite.config.js
└── package.json
```

---

## 🗺️ Development Roadmap

### Progress Summary
```
Phase 1-5   ████████████████████ 100% ✅  Foundation, base game
Phase M1-2  ████████████████████ 100% ✅  Mode system, Shooter
Phase M3    ████████████████████ 100% ✅  Campaign structure
Phase M4+   ████████████████████ 100% ✅  21 Play Modes (Nightmare 🌑 + Rhythm 🎵 + score muls fixed v2.2)
Phase 2.5   ████████████████████ 100% ✅  Dream Yoga
Phase 6-11  ████████████████████ 100% ✅  Learning/Awareness/IQ/Chakra
Cosmologies ████████████████████ 100% ✅  12 frameworks mapped
Phase 2.6   ████████████████████ 100% ✅  Embodiment Tiles — animated visuals + somatic SFX
UX Polish   ████████████████████ 100% ✅  HOW TO PLAY; transitions; somatic visuals; tile SFX; level-up
Boss System ████████████████████ 100% ✅  3 bosses × 3 phases; wall-aware movement; death burst FX fixed
Quest System████████████████████ 100% ✅  7 main quests (5 core + 2 alchemy); dashboard panel; quest flash
18 Dreamsc. ████████████████████ 100% ✅  All 18 dreamscapes complete (target reached)
Containment ████████████████████ 100% ✅  C-key contZones rendered + enemy stun working
Gamepad     ████████████████████ 100% ✅  Gamepad API — Steam controller support
Enemy AI    ████████████████████ 100% ✅  hunt/aggressive/passive/none/random all properly aliased
Magnet      ████████████████████ 100% ✅  Auto-collects PEACE/INSIGHT; all tokens counted correctly (fixed)
SFX         ████████████████████ 100% ✅  playPlayerHurt now wired; 18 total SFX
Phase M5    ████████████████████ 100% ✅  RPG: stats + XP + level + quests + death screen RPG stats
Alchemy     ████████████████████ 100% ✅  Philosopher's Stone heals to true maxHP (fixed); Ritual Space; SFX
Bug Fixes   ████████████████████ 100% ✅  v2.2.0: 13 gameplay-correctness bugs fixed
Phase M6    █████████████████░░░  95% 🔨  Constellation overlay + named rewards; completion rewards TBD

Phase M7    ████░░░░░░░░░░░░░░░░  20% 🔨  Rhythm Mode implemented (beat-sync scoring)
Phase M8    ░░░░░░░░░░░░░░░░░░░░   0% ⬜  Multiplayer / Co-op
Steam pack  ██░░░░░░░░░░░░░░░░░░  10% 🔨  Electron pathway docs; Gamepad API done

Overall: ~13,000 / 13,600 estimated lines (~97%)
```

### 🚧 Next Steps

**Dreamscapes** — *100% complete (18/18 target reached)* 🎉
- ✅ Original 10: Void, Dragon, Courtyard, Field, Summit, Neighborhood, Bedroom, Aztec, Orb, Integration
- ✅ Wave 2 (nature/architecture): Forest Sanctuary 🌲, Mycelium Depths 🍄, Ancient Structure 🏛️
- ✅ Wave 3 (elemental/cosmic): Solar Temple 🌞, Deep Ocean 🌊, Crystal Cave 💎, Cloud City ☁️, Void Nexus ✦

**Alchemy System** — *80% complete (↑ from 60%)*
- ✅ Element seed collection from somatic tiles (Fire/Water/Earth/Air/Ether)
- ✅ Transmutation: 3 seeds → hazard tiles → peace/insight in radius
- ✅ Philosopher's Stone: full HP restore + 5000 score (proper: all 4 elements used; fallback: 8th transmutation)
- ✅ Element-history tracking: dashboard shows "X/4 elements this session"
- ✅ Great Work phase: nigredo→albedo→rubedo→aurora
- ✅ Alchemist + Ritual Space play modes; X key; HUD strip; alchemy dashboard panel
- ✅ 3 SFX: transmutation shimmer, philosopher's stone chord, dream complete
- ⏳ Alchemy quest integration (element-specific quests)
- ⏳ Visual element particle effects on transmutation radius tiles

**Phase M6: Constellation Mode** — *65% complete (↑ from 20%)*
- ✅ Skymap + Ritual Space modes: clear hazards, seed INSIGHT + ARCHETYPE star nodes
- ✅ **Constellation visual overlay**: glowing dashed lines between nearby star tiles (≤4 tile distance)
- ✅ Star glow pulse rings in skymap mode
- ⏳ Constellation completion rewards and narrative
- ⏳ Named constellation patterns (Orion, Pleiades, etc.)

**Phase M7: Platformer/Rhythm** — *20% complete — Rhythm Flow mode added*
- ✅ **Rhythm Flow mode**: Beat-synchronised movement scoring at 80 BPM
- ✅ Beat pulse indicator in HUD bottom bar (yellow line sweeps on beat)
- ✅ On-beat movement gives ×2 score bonus with streak multiplier
- ⏳ Full music system (Tone.js integration from glitch-peace-vite)
- ⏳ Platformer gravity/jump mechanics (longer-term)
**Phase M8: Multiplayer** — *0% complete*

---

## 🎯 Steam Path (Free Game)

GLITCH·PEACE has a clear path to **free Steam release**:

### Technical Requirements
| Step | Tool | Notes |
|------|------|-------|
| Desktop wrapper | [Electron](https://electronjs.org/) | Already Node/Web compatible |
| Steam integration | [steamworks.js](https://github.com/ceifa/steamworks.js) | Achievements, cloud saves, leaderboards |
| Installer | [electron-builder](https://electron.build/) | Win/Mac/Linux |
| Store upload | SteamPipe | Standard Valve tooling |

### Checklist Before Submission
- [ ] Steam Developer account ($100 one-time)
- [ ] Store assets: 8+ screenshots, 30s trailer, capsule art (460×215, 231×87)
- [ ] Content review: mental health themes require careful descriptor selection
- [ ] Minimum viable depth: Phase M5 complete (RPG mode + boss system) ✅ *done*
- [x] Gamepad / controller support via Gamepad API ✅ *done*
- [ ] Playtesting: 20+ external testers across age tiers
- [ ] Follow [Take This](https://www.takethis.org/) mental health content guidelines

### Steam Strategy
- **Free-to-play**: Aligned with accessibility mission, zero barrier to help
- **Tags**: Roguelike · Psychological · Relaxing · Educational · Experimental · Indie
- **Wishlist campaign**: launch Reddit/TikTok dev log when Phase M5 complete
- **Community**: Steam Discussions for player research feedback

### Timeline to Steam
| Phase | Duration | Target |
|-------|----------|--------|
| M5 RPG Mode | ✅ done | Mar 2026 |
| M6 Constellation | 2 weeks | Apr 2026 |
| Boss + Polish | ✅ done | Mar 2026 |
| Gamepad API | ✅ done | Mar 2026 |
| Electron + Steamworks | 2 weeks | May 2026 |
| Store review | 2-4 weeks | Jun 2026 |
| **Steam Launch** | — | **Q3 2026** |

---

## 📊 Current Completion Status (February 2026)

| Layer | What's built | Status |
|-------|-------------|--------|
| **Core engine** | Canvas loop, state machine, DPR scaling, dt-clamping | ✅ Complete |
| **Tile system** | 21 tile types, Matrix A/B palette, particle effects | ✅ Complete |
| **Grid gameplay** | Movement, consequence preview, impulse buffer, spread | ✅ Complete |
| **Enemy AI** | 9 behaviors (chase, patrol, orbit, adaptive, labyrinth…) | ✅ Complete |
| **Shooter mode** | Twin-stick, 4 weapons, wave system | ✅ Complete |
| **18 Dreamscapes** 🎉 | All 18 complete: original 10 + nature trio + elemental/cosmic quintet | ✅ Complete |
| **21 Play Modes** | All modes incl. Nightmare 🌑 + Rhythm 🎵 + Alchemist ⚗️ + Constellation ✦ + Ritual Space 🕯️ | ✅ Complete |
| **Boss system** | 3 bosses × 3 phases; phase speedMs wired; 4 dreamscapes get bosses; special attacks | ✅ Complete |
| **Quest system** | 7 quests (5 core + 2 alchemy): Alchemist + Great Work; dashboard panel; quest flash | ✅ Complete |
| **Containment zones** | C-key contZones: rendered (teal ring) + enemy stun + timer decay | ✅ Complete |
| **Gamepad support** | Gamepad API: left stick + D-pad + A/B/X/Y/LB/RB/START/SELECT — Steam-ready | ✅ Complete |
| **Alchemy system** | 5 elements; proper Philosopher's Stone (all-4-elements); element tracking; 3 SFX; per-tile FX; 2 alchemy quests | ✅ Complete |
| **Onboarding** | Age group, language, difficulty; saved profile | ✅ Complete |
| **HOW TO PLAY screen** | Tile guide, controls (incl. X=transmute Alchemist/Ritual), matrix system | ✅ Complete |
| **Level transitions** | 10 s readable interlude; cosmology + RPG quest + milestone info; player-skippable | ✅ Complete |
| **Tile SFX** | 17 distinct sounds: all tiles, boss, quest, transmutation, dream complete | ✅ Complete |
| **Somatic tile visuals** | Breathing rings, sine wave, rotating sparkles, cross+ring — animated | ✅ Complete |
| **Integration dashboard** | H-key overlay; 9 panels incl. QUESTS + ALCHEMY (Great Work progress) | ✅ Complete |
| **Learning systems** | 19-language vocabulary, sigils, pattern recognition | ✅ Complete |
| **Dream Yoga** | Lucidity meter, reality checks, dream sign tracking | ✅ Complete |
| **Emotional engine** | 10-emotion field, 7 synergy patterns, coherence | ✅ Complete |
| **Temporal system** | 8 lunar phases × 7 planetary days | ✅ Complete |
| **Cessation tools** | Session tracker, urge management, wellness monitor | ✅ Complete |
| **Awareness systems** | Self-reflection, emergence indicators, chakra, tarot | ✅ Complete |
| **Intelligence layer** | IQ/EQ proxy metrics, strategic coaching, logic puzzles | ✅ Complete |
| **Cosmologies** | 12 frameworks mapped to dreamscapes | ✅ Complete |
| **RPG basics (M5)** | STR/INT/WIS/VIT stats, XP, level, archetype dialogue, quest system, death screen | ✅ Complete |
| **Alchemy (M6 extension)** | Element system; proper Philosopher's Stone; Great Work tracking; Ritual Space; per-tile FX; 2 new quests | ✅ Complete |
| **Constellation mode (M6)** | Skymap + Ritual Space; constellation line overlay; star glow rings; named constellation rewards (16 names) | 🔨 95% |
| **Platformer/Rhythm (M7)** | Rhythm Flow mode: 80 BPM beat sync, on-beat scoring, HUD beat indicator | 🔨 20% |
| **Multiplayer (M8)** | Shared emotional field, co-op | ⬜ 0% |
| **Steam packaging** | Electron wrapper pathway documented; Gamepad API live | 🔨 10% |

**Overall: ~95% complete.** All 18 dreamscapes and 21 play modes done. v2.1.0 fixes: magnet upgrade now auto-collects tiles, `playPlayerHurt` SFX wired, all enemy behavior aliases implemented (hunt/aggressive/passive/none/random), per-tile alchemy transmutation sparkle FX, 2 new alchemy quests (7 total), named constellation rewards in skymap mode (16 constellation names, score bonus every 3 star tiles). Remaining: full Tone.js music, multiplayer, Steam packaging.

---



**[glitch-peace-vite](https://github.com/jessidono24-cmyk/glitch-peace-vite)** is a parallel experimental branch exploring:
- Plugin/registry architecture (ModeRegistry, service injection)
- Tone.js music integration
- OpenAI/Claude API agent content generation
- React-adjacent component patterns

**What was merged from glitch-peace-vite into this repo:**
- ✅ 13 Play Modes → `src/systems/play-modes.js`
- ✅ 12 Cosmological Frameworks → `src/systems/cosmology/cosmologies.js`
- ✅ Dream Yoga system → `src/systems/awareness/dream-yoga.js`

**This repo (glitch-peace) remains the primary development branch** — deeper systems, cleaner architecture, stronger research integration.

---

## 📚 Research Foundation

All systems are backed by peer-reviewed research and cited sources. Key documents:

| Document | Subject |
|----------|---------|
| [DREAM_YOGA_LUCID_DREAMING.md](docs/research/) | LaBerge, Stumbrys, Tibetan tradition |
| [QUANTUM_CONSCIOUSNESS.md](docs/research/) | Penrose-Hameroff, quantum mind |
| [SACRED_COSMOLOGY.md](docs/research/) | 15+ global wisdom traditions |
| [PSYCHOLOGY_FOUNDATIONS.md](docs/) | Csikszentmihalyi, Vygotsky, Porges |
| [SOVEREIGN_CODEX.md](docs/) | Ethical framework governing all features |

---

## 🎨 Design Laws (from CANON.md)

These 11 laws are **permanent and inviolable**:

1. **No shame spirals** — relapse is data, never failure
2. **Sterilized wisdom** — simulation framing, zero dogma
3. **Player identity stable** — core self never changed by game
4. **Accessibility first** — reduced motion, high contrast, particle toggle always available
5. **Hearth always reachable** — pause/save/exit anytime
6. **Privacy paramount** — all data local-first, never transmitted
7. **Embodiment maximized** — learning through action and experience
8. **Effortless by design** — align with natural cognition
9. **Sovereign codex compliance** — individual sovereignty paramount
10. **Non-coercive** — all features optional
11. **Neurodivergent-first** — accessibility as foundation

---

## 📞 Support & Crisis Resources

**GLITCH·PEACE is a supportive tool, not a replacement for professional care.**

- **Crisis Line**: 988 (US) · Text HOME to 741741
- **Substance Abuse**: 1-800-662-4357 (US)
- **International**: https://findahelpline.com/

---

## 🙏 Acknowledgments

Built on:
- **Research giants**: Csikszentmihalyi (Flow), LaBerge (Lucid dreaming), Porges (Polyvagal), Stumbrys (Lucidity induction), Vygotsky (ZPD), Monroe/CIA (Gateway Process)
- **Wisdom traditions**: Tibetan Buddhist dream yoga, Hindu chakra science, Taoist wu wei, Celtic, Norse, Hermetic, Mayan, Egyptian, I Ching (all credited, all respectfully sterilized)
- **Open source**: Vite, Web Audio API, HTML5 Canvas

---

<div align="center">

## 💫 The Vision

**From 10,000 to 20,000+ lines.**
**From game to consciousness platform.**
**From player to awakened dreamer.**

*Begin in stillness. Emerge through pattern recognition. Transform through play. 🎮✨*

---

**v2.1.0-alpha · February 2026 · 95% Complete**
[glitch-peace](https://github.com/jessidono24-cmyk/glitch-peace) · [glitch-peace-vite](https://github.com/jessidono24-cmyk/glitch-peace-vite)

*Built with intention. Shared with love. Free always.*

</div>
