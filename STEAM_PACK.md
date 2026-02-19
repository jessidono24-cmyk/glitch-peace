# GLITCH·PEACE — Steam Integration Metadata
# SteamPack v1.0

## App Information
- **App Name**: GLITCH·PEACE
- **Short Description**: A consciousness-awakening dreamscape simulation — navigate through 18 dreamscapes, face your archetypes, and integrate your shadows.
- **Genre**: Indie, Puzzle, Adventure, Psychological
- **Tags**: healing, trauma-informed, psychedelic, meditation, puzzle, roguelike, learning, consciousness
- **Platforms**: Windows, macOS, Linux, Steam Deck

## Steam Store Details

### Description
GLITCH·PEACE is a psychedelic, trauma-informed, consciousness-exploration game.

Navigate 18 procedurally-generated DREAMSCAPES — each a symbolic realm drawn from depth psychology (Jung), somatic therapy, and cross-cultural mythology.

**6 Gameplay Modes:**
- 🗂️ **Grid Mode** — Strategic tile navigation, collect PEACE nodes, avoid shadows
- 🔫 **Shooter Mode** — Fast-paced arena survival  
- ✦ **Constellation Mode** (M6) — Meditative star-connection puzzle
- 🌸 **Meditation Mode** (M7) — Breathing & somatic awareness, no enemies
- 🤝 **Co-op Mode** (M8) — Local 2-player shared dreamscape
- 📅 **Daily Challenge** — Seeded new run every 24 hours

**25 Steam Achievements** — from "First Breath" to "Philosopher's Stone"

**Systems:**
- Adaptive difficulty (5+ to adult tiers)
- Multilingual vocabulary learning (12 languages)
- Pattern recognition & IQ training
- Emotional field engine (10 emotions)
- Lunar temporal system
- Jungian archetype system (Dragon, Child, Orb, Captor, Protector)
- Alchemical transmutation
- Boss encounters
- Dream Yoga & lucid dreaming mechanics
- Cessation & recovery tools

**Content Warning**: Contains symbolic representations of difficult emotions (despair, terror, self-harm, rage). Non-graphic. Trauma-informed design with compassionate framing.

## Achievement List (SteamPack v1.0)

| Steam API Name | Display Name | Description | Points |
|---|---|---|---|
| FIRST_BREATH | First Breath | Begin your first journey | 5 |
| PEACE_FOUND | Peace Found | Collect your first peace node | 5 |
| SURVIVOR | Survivor | Complete a dreamscape without dying | 10 |
| DEEP_DREAMER | Deep Dreamer | Complete 5 dreamscapes in one session | 25 |
| DREAM_ARCHITECT | Dream Architect | Complete all 18 dreamscapes | 100 |
| GRID_MASTER | Grid Master | Reach level 10 in grid mode | 30 |
| MARKSMAN | Marksman | Reach wave 10 in shooter mode | 30 |
| STAR_NAVIGATOR | Star Navigator | Complete a constellation in skymap mode | 25 |
| INNER_STILLNESS | Inner Stillness | Play meditation mode for 3 minutes | 15 |
| TOGETHER | Together | Complete a dreamscape in co-op mode | 20 |
| AWAKENING | Awakening | Reach 1,000 score | 10 |
| ILLUMINATED | Illuminated | Reach 10,000 score | 25 |
| SOVEREIGN | Sovereign | Reach 50,000 score | 50 |
| FULL_SPECTRUM | Full Spectrum | Experience 8 different emotional states | 20 |
| COHERENT_MIND | Coherent Mind | Maintain coherence > 0.8 for 60 seconds | 20 |
| WORD_WEAVER | Word Weaver | Learn 10 vocabulary words | 10 |
| LINGUIST | Linguist | Learn 100 vocabulary words | 50 |
| PATTERN_SEEKER | Pattern Seeker | Discover 5 patterns in one session | 15 |
| ALCHEMIST | Alchemist | Perform your first transmutation | 15 |
| PHILOSOPHERS_STONE | Philosopher's Stone | Achieve the Philosopher's Stone | 75 |
| MATRIX_WALKER | Matrix Walker | Toggle matrix 50 times | 20 |
| GHOST | Ghost | Complete a dreamscape without taking damage | 40 |
| FLOW_STATE | Flow State | Achieve a ×10 combo | 30 |
| DRAGON_TAMER | Dragon Tamer | Defeat a boss | 50 |
| SPEED_DREAMER | Speed Dreamer | Complete a dreamscape in under 90 seconds | 35 |
| SOVEREIGNTY | Sovereignty | Unlock all archetypes in one run | 100 |

## Steam Deck Compatibility
- Input: Full keyboard/gamepad support
- Resolution: Adaptive full-screen (scales to any viewport)
- Aspect ratio: Flexible (centered canvas fills screen)
- Text size: Legible at 720p (Steam Deck native resolution)

## Content Rating
- **ESRB**: T (Teen) — Mature Themes (symbolic trauma content)
- **PEGI**: 12 — Mature Themes
- **Content Descriptors**: Symbolic violence (non-graphic), mature psychological themes

## SteamWorks API Notes
- Achievements: Use `window._achieveDefs` for achievement list
- Achievement unlock: Calls `achievementSystem.unlock(id)` internally
- Leaderboard: High scores stored locally (localStorage); Steam leaderboard integration ready
- Cloud Save: Player profile + high scores in localStorage (ready for Steam Cloud sync)

---
*GLITCH·PEACE — Navigate the dreamscapes. Integrate the shadows. Find sovereignty.*
