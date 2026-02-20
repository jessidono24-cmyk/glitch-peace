# GLITCH·PEACE — Bug Report
*Documented from code analysis and gameplay testing session*

---

## BUG-01 · TRAP tile push effect never fires
**Severity:** Medium  
**Location:** `src/game/player.js` — `tryMove()` ~line 197  
**Reproducibility:** 100% — step onto any TRAP (×) tile

**Description:**  
`TILE_DEF[T.TRAP]` declares `push: 1`, indicating the tile should push the player one step in the direction of travel. However, the push logic is gated on `tileType === T.RAGE`:

```js
if (tileType === T.RAGE && def.push > 0) {
    const pby = ny + dy * def.push, pbx = nx + dx * def.push;
    ...
}
```

TRAP tiles never enter this branch. Players take 16 damage from TRAP tiles but are never pushed — the data intent is broken.

---

## BUG-02 · Hallucinations deal damage through an active shield
**Severity:** High  
**Location:** `src/game/enemy.js` — `stepEnemies()` ~line 35  
**Reproducibility:** 100% with hallucination + active shield (level 3+, combo shield active)

**Description:**  
When a hallucination overlaps the player it applies 8 HP damage with no shield check:

```js
if (h.y === g.player.y && h.x === g.player.x) {
    g.hp = Math.max(0, g.hp - 8);   // no UPG.shield check
    h.life = 0;
```

Regular enemy collisions correctly check `if (UPG.shield && UPG.shieldTimer > 0)` before dealing damage. Hallucinations bypass this entirely, making shields useless against phantoms.

---

## BUG-03 · Capture zone damage bypasses the player shield
**Severity:** Medium  
**Location:** `src/game/enemy.js` — `stepEnemies()` ~line 213  
**Reproducibility:** Trigger a capture zone event (Childhood Neighborhood dreamscape) while a shield is active

**Description:**  
Per-enemy capture zone damage (5 HP) is applied without a shield check:

```js
for (const cz of g.captureZones) {
    if (Math.abs(e.x - g.player.x) <= cz.r && Math.abs(e.y - g.player.y) <= cz.r) {
        g.hp = Math.max(0, g.hp - 5);   // no shield check
    }
}
```

The shield is supposed to absorb the next source of damage but capture zones chip through it silently.

---

## BUG-04 · Boss moves through walls
**Severity:** High  
**Location:** `src/game/enemy.js` — boss movement block ~line 56  
**Reproducibility:** Spawn a boss (integration / ancient_structure / void_nexus dreamscapes or Boss Rush mode) and position a wall between the player and the boss

**Description:**  
Regular enemy movement always checks `g.grid[ny][nx] !== T.WALL`. The boss movement code performs only a bounds check:

```js
if (dy && b.y + dy >= 0 && b.y + dy < sz) b.y += dy;
else if (dx && b.x + dx >= 0 && b.x + dx < sz) b.x += dx;
```

No wall check is present. The boss teleports through walls, removing the tactical importance of terrain during boss fights.

---

## BUG-05 · Boss death produces no particle burst (missing parameter)
**Severity:** Low  
**Location:** `src/systems/boss-system.js` — `_handleBossDeath()` line 187  
**Reproducibility:** 100% — defeat any boss

**Description:**  
`_handleBossDeath` is called with four arguments including `burstFn`:

```js
this._handleBossDeath(game, sfxManager, showMsg, burstFn);
```

But the function signature only declares three parameters:

```js
_handleBossDeath(game, sfxManager, showMsg) {
```

`burstFn` is never used. No particle burst plays on boss death, resulting in an anticlimactic, visually empty defeat moment.

---

## BUG-06 · Philosopher's Stone always restores HP to 100, ignoring max HP upgrades
**Severity:** Medium  
**Location:** `src/systems/alchemy-system.js` — `_checkPhilosopherStone()` line 162  
**Reproducibility:** Trigger the Philosopher's Stone (4 classic elements transmuted) after buying the `+MAX HP` upgrade

**Description:**  
The heal uses `game.maxHp || 100`:

```js
game.hp = game.maxHp || 100;
```

The game object has no `maxHp` property. Max HP is tracked in `UPG.maxHp` (default 100, +25 per upgrade purchase). `game.maxHp` is `undefined`, so the expression always evaluates to `100`. A player who purchased max HP upgrades (e.g. `UPG.maxHp = 125`) receives an incomplete heal.

**Fix hint:** Change to `UPG.maxHp`.

---

## BUG-07 · Pressing "Start Journey" after quitting Constellation / Meditation / Co-op puts the game in a broken state
**Severity:** High  
**Location:** `src/main.js` — `startGame()` ~line 343 and `gameMode` assignment ~line 1167  
**Reproducibility:** Select Constellation mode → play → ESC to title → "START JOURNEY"

**Description:**  
`gameMode` is never reset to `'grid'` when returning to the title screen from these modes. `startGame()` only has special handling for `gameMode === 'shooter'`; for anything else it initializes a grid game and sets `phase = 'playing'`. The main loop then dispatches to the still-active constellation/meditation/coop renderer, which was `cleanup()`d but never re-initialized. The player sees a blank canvas or broken render with a fully loaded grid game ticking in the background.

---

## BUG-08 · Restarting after death in Constellation / Meditation / Co-op mode starts a grid game
**Severity:** High  
**Location:** `src/main.js` line 1262  
**Reproducibility:** Die in Constellation mode → press Enter on death screen

**Description:**  
The death screen restart handler calls `startGame(CFG.dreamIdx)` unconditionally:

```js
if (phase === 'dead') {
    if (e.key==='Enter'||e.key===' ') { startGame(CFG.dreamIdx); }
```

`startGame` only has a special case for `gameMode === 'shooter'`. Dying in Constellation mode and pressing Enter initializes a grid game while `gameMode` stays `'constellation'`, producing the same broken state as BUG-07.

---

## BUG-09 · Magnet upgrade only adds one insight token per move regardless of how many insight tiles are collected
**Severity:** Medium  
**Location:** `src/game/player.js` — magnet block in `tryMove()` ~line 251  
**Reproducibility:** Buy the `PEACE MAGNET` upgrade. Move adjacent to 2+ INSIGHT (◆) tiles simultaneously

**Description:**  
`insightTokens` inside `tryMove` is a *captured parameter* (the value at call time, not a live reference). The `setInsightTokens` callback is:

```js
(n) => { while (insightTokens < n) addInsightToken(); window._insightTokens = insightTokens; }
```

In the magnet loop each collected INSIGHT tile calls `setInsightTokens(insightTokens + 1)` where `insightTokens` is always the *same original* parameter value. The target `n` is `originalValue + 1` for every tile. The second (and subsequent) collected INSIGHT tiles find `state.insightTokens` is already `originalValue + 1`, so `addInsightToken()` is never called again. The player receives exactly 1 token regardless of how many insight tiles the magnet collected.

---

## BUG-10 · "How to Play" exit sets menu cursor to position 2, not 3
**Severity:** Low  
**Location:** `src/main.js` ~line 1131  
**Reproducibility:** Navigate to HOW TO PLAY (menu item 3) → press Escape

**Description:**  

```js
if (e.key === 'Enter' || e.key === 'Escape') {
    setPhase('title');
    CURSOR.menu = 2;   // Bug: positions 0–6; HOW TO PLAY is at index 3
}
```

After closing HOW TO PLAY the cursor jumps to "SELECT DREAMSCAPE" (index 2) instead of staying on "HOW TO PLAY" (index 3). Minor navigation inconsistency — all other screens return the cursor to the position that opened them.

---

## BUG-11 · Shooter mode contact cooldown uses stale `_lastDt` instead of current frame delta
**Severity:** Low  
**Location:** `src/modes/shooter-mode.js` line 250  
**Reproducibility:** Consistent during shooter mode enemy contact

**Description:**  

```js
if (e._contactCooldown > 0) e._contactCooldown -= this._lastDt;
```

`this._lastDt` stores the delta from the **previous** frame (set at the top of `update`). Using a one-frame-old value causes the cooldown to drain at an incorrect rate whenever frame timing changes (e.g. tab focus/unfocus, frame drops). Should decrement by the current `dtSec` argument.

---

## BUG-12 · Daily challenge dreamscape index not persisted across page refreshes
**Severity:** Low  
**Location:** `src/main.js` ~line 1170  
**Reproducibility:** Start a Daily Challenge → refresh the page

**Description:**  

```js
CFG.dreamIdx = seed % DREAMSCAPES.length;
startGame(CFG.dreamIdx);
```

`CFG` is an in-memory object that is not saved to `localStorage`. Refreshing the page recalculates `CFG.dreamIdx = 0` (its initial value in `state.js`), meaning the player no longer starts on the daily-seeded dreamscape. The "same dreamscape for all players" promise is broken on refresh.

---

## BUG-13 · Play mode score multiplier (`scoreMulMode`) is set but never applied to tile scores
**Severity:** Medium  
**Location:** `src/systems/play-modes.js` line 201, `src/game/player.js` `tryMove()`  
**Reproducibility:** Play in Horror mode (3× score), Nightmare mode (5× score), or any other mode with a non-1 `scoreMul` — scores are identical to arcade mode

**Description:**  
`applyPlayMode` correctly stores the multiplier:

```js
game.scoreMulMode = typeof cfg.scoreMul === 'number' ? cfg.scoreMul : 1.0;
```

But inside `tryMove`, all scoring ignores it:

```js
// PEACE tile
const pts = Math.round((150 + g.level * 20) * UPG.resonanceMultiplier);
g.score += pts;   // scoreMulMode not multiplied

// INSIGHT tile
const pts = Math.round((300 + g.level * 50) * UPG.resonanceMultiplier);
g.score += pts;   // scoreMulMode not multiplied
```

Players in Horror mode (3× multiplier), Nightmare mode (5× multiplier), or other modes with elevated score rewards earn the same points as in arcade mode. The leaderboard score advantage advertised for high-difficulty modes does not exist.

---

## Summary

| # | Title | Severity | Area | Status |
|---|-------|----------|------|--------|
| 01 | TRAP push effect not implemented | Medium | player.js | ✅ Fixed |
| 02 | Hallucinations bypass shield | High | enemy.js | ✅ Fixed |
| 03 | Capture zones bypass shield | Medium | enemy.js | ✅ Fixed |
| 04 | Boss walks through walls | High | enemy.js | ✅ Fixed |
| 05 | Boss death missing particle burst | Low | boss-system.js | ✅ Fixed |
| 06 | Philosopher's Stone heals to 100 not max HP | Medium | alchemy-system.js | ✅ Fixed |
| 07 | Start Journey after non-grid mode = broken state | High | main.js | ✅ Fixed |
| 08 | Death restart in non-grid modes starts wrong game | High | main.js | ✅ Fixed |
| 09 | Magnet only adds 1 insight token per move | Medium | player.js | ✅ Fixed |
| 10 | How to Play exits to wrong cursor position | Low | main.js | ✅ Fixed |
| 11 | Shooter contact cooldown uses stale delta time | Low | shooter-mode.js | ✅ Fixed |
| 12 | Daily challenge index lost on page refresh | Low | main.js | ✅ Fixed |
| 13 | Play mode score multiplier never applied | Medium | play-modes.js / player.js | ✅ Fixed |
| 14 | Temporal enemy multiplier set but never consumed | Medium | enemy.js | ✅ Fixed |
| 15 | Temporal insight multiplier set but never consumed | Medium | player.js | ✅ Fixed |
| 16 | Realm dmgMul/healMul not applied to tile effects | Medium | main.js / player.js | ✅ Fixed |

---

## BUG-14 · Temporal enemy multiplier set but never consumed
**Severity:** Medium
**Location:** `src/game/enemy.js` — `stepEnemies()` line 18
**Status:** ✅ Fixed

**Description:**
`game.temporalEnemyMul` (from the lunar/planetary day system) was being written to the `game` object in `main.js` each frame but was never read by `enemy.js`. The enemy step interval `mSpeed` ignored the temporal modifier entirely, meaning lunar/planetary day difficulty changes had zero effect on enemies.

**Fix:** `mSpeed` now multiplies by `g.temporalEnemyMul ?? 1.0`.

---

## BUG-15 · Temporal insight multiplier set but never consumed
**Severity:** Medium
**Location:** `src/game/player.js` — INSIGHT tile handler ~line 248
**Status:** ✅ Fixed

**Description:**
`game.insightMul` (combined lunar + planetary insight token value multiplier) was written each frame in `main.js` but the INSIGHT tile score calculation in `player.js` did not read it, giving the same flat score regardless of the day's temporal multiplier (up to 1.5× on Mercury/Full Moon days).

**Fix:** INSIGHT tile `pts` now multiplies by `g.insightMul ?? 1.0`.

---

## BUG-16 · Realm damage/heal modifiers set but never applied to tile effects
**Severity:** Medium
**Location:** `src/main.js` (missing computation) + `src/game/player.js` — PEACE healing ~line 229
**Status:** ✅ Fixed

**Description:**
The `purgDepth` realm system (HEAVEN/MIND/PURGATORY/HELL) is supposed to scale hazard-tile damage (+15–30% in PURGATORY/HELL) and peace-tile healing (+10–25% in HEAVEN/IMAGINATION). The damage multiplier `g.dmgMul` was already read by `player.js` but was never written by `main.js`. The heal multiplier `g.healMul` was never written anywhere and the peace-tile healing line simply used `+20` unconditionally.

**Fix:**
- `main.js` now computes `game.dmgMul` and `game.healMul` each frame from `emotionalField.purgDepth`.
- `player.js` peace-tile healing now uses `Math.round(20 * (g.healMul ?? 1))`.

---

## Future Fix Roadmap

### HIGH PRIORITY
- **Emotional HUD row not shown (E3 incomplete):** The `drawEmotionRow` function described in task-E3.md has not been added to `renderer.js`. The HUD height remains 106px without the coherence/distortion bar row.
- **Realm label not shown in HUD footer (E4-B incomplete):** `task-E4-B.md` describes showing the realm name (◈ MIND / ◈ PURGATORY etc.) in the footer bar. This renderer change is not yet present.
- **Temporal HUD banner incomplete (T2 EDIT 6):** The dreamscape banner should show the lunar phase and planetary day name (e.g. `VOID STATE · numbness | Waning Gibbous Mars`). The current renderer shows these separately in the right column instead of inline.

### MEDIUM PRIORITY
- **Archetype dialogue system not fully connected:** `archetypeDialogue.reset()` and related calls are present but the dialogue triggers need review for coverage across all 14 archetypes.
- **Rhythm mode death handling:** When `gameMode === 'rhythm'` and the player dies, `gameMode` is reset to `'grid'` but the death screen doesn't offer to restart in rhythm mode (unlike the constellation/meditation/coop fix from BUG-08).
- **Boss Rush mode boss spawning:** Boss Rush mode is referenced in the BUG_REPORT but integration with the boss-system's three boss types needs further testing to confirm all phases trigger correctly.

### LOW PRIORITY
- **Fog of war radius hard-coded in renderer:** `window._fogRadius` correctly updates (4 + insight tokens / 5, capped at 7) but the fog draw in `renderer.js` still uses a hard-coded constant in some code paths. Ensure all fog renders read `window._fogRadius`.
- **Achievement unlock sound sometimes fires twice:** When multiple achievements unlock on the same frame (e.g. boss kill + level up), `achievementSystem.popup` may cycle too fast to display both. Consider a queue.
- **Shooter mode high-score not merged into main leaderboard:** Shooter-mode scores (`result.data.score`) are handled in the dead phase but `leaderboard.add()` is only called with the grid-game score. Shooter kills/score should also persist.
- **Co-op mode second player input not rebindable:** P2 controls are hard-coded to WASD/Shift without an options screen entry.
- **Meditation mode `emotionalField.addEmotion` not called:** Meditation mode runs its own session but never calls `window._emotionalField.addEmotion()`, so the HUD emotional state freezes at the pre-meditation value.
