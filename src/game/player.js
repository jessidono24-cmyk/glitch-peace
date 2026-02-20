'use strict';
import { T, TILE_DEF, ARCHETYPES, CELL, GAP } from '../core/constants.js';
import { CFG, UPG } from '../core/state.js';
import { rnd, pick } from '../core/utils.js';
import { burst, resonanceWave, addEcho } from './particles.js';

// Push message labels for tiles that push the player back
const PUSH_MSG = {
  [T.RAGE]:  '-RAGE (pushed!)',
  [T.TRAP]:  '-TRAP (pushed!)',
};

export function setEmotion(g, em) {
  UPG.emotion = em; UPG.emotionTimer = 120;
  g.emotionTimer = 120; g.slowMoves = (em === 'hopeless' || em === 'despair');
}

export function showMsg(g, text, color, timer) {
  if (!g) return;
  g.msg = text; g.msgColor = color; g.msgTimer = timer;
}

export function activateArchetype(g, type, matrixActive) {
  const arch = ARCHETYPES[type]; if (!arch) return;
  g.archetypeActive = true; g.archetypeType = type; g.archetypeTimer = 180;
  g.lastArchetypeActivated = type; // Phase M5: expose for archetype dialogue
  UPG.archetypePower = arch.power; UPG.archetypeDuration = 180;
  showMsg(g, arch.activationMsg, '#ffdd00', 70);
  resonanceWave(g, g.player.x, g.player.y, '#ffdd00');
  burst(g, g.player.x, g.player.y, '#ffdd00', 24, 4);
  if (type === 'child') {
    for (let y = 0; y < g.sz; y++) for (let x = 0; x < g.sz; x++)
      if (g.grid[y][x] === T.HIDDEN) g.tileFlicker.push({ y, x, t: 200, reveal: true });
    showMsg(g, 'CHILD REVEALS THE PATH…', '#aaffcc', 60);
  }
  if (type === 'protector') { UPG.shield = true; UPG.shieldTimer = 30; burst(g, g.player.x, g.player.y, '#88ccff', 20, 5); }
  if (type === 'orb')       { UPG.phaseShift = true; UPG.phaseTimer = 15; }
  if (type === 'captor')    { UPG.temporalRewind = true; UPG.rewindBuffer = UPG.rewindBuffer.slice(-3); }
}

export function executeArchetypePower(g) {
  const power = UPG.archetypePower; if (!power) return;
  const sz = g.sz;
  if (power === 'wall_jump') {
    for (const [dy, dx] of [[-2,0],[2,0],[0,-2],[0,2]]) {
      const ny = g.player.y + dy, nx = g.player.x + dx;
      if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] !== T.WALL) {
        addEcho(g, 'B'); g.player.y = ny; g.player.x = nx;
        burst(g, nx, ny, '#ffaa00', 16, 3); showMsg(g, 'DRAGON LEAP!', '#ffaa00', 35); break;
      }
    }
  } else if (power === 'phase_walk') {
    UPG.phaseShift = true; UPG.phaseTimer = 10; showMsg(g, 'ORB PHASE ACTIVE', '#aaddff', 35);
  } else if (power === 'rewind') {
    if (UPG.rewindBuffer.length > 0) {
      const snap = UPG.rewindBuffer.pop();
      g.player.y = snap.y; g.player.x = snap.x;
      if (snap.grid) for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) g.grid[y][x] = snap.grid[y][x];
      burst(g, g.player.x, g.player.y, '#ffaadd', 20, 3); showMsg(g, 'TEMPORAL REWIND', '#ffaadd', 40);
    } else showMsg(g, 'NO REWIND MEMORY', '#443344', 30);
  } else if (power === 'shield_burst') {
    UPG.shield = true; UPG.shieldTimer = 25;
    for (const e of g.enemies) e.stunTimer = 1500;
    if (g.boss) g.boss.stunTimer = 2000;
    burst(g, g.player.x, g.player.y, '#88ccff', 30, 6); showMsg(g, 'PROTECT — ENEMIES STUNNED!', '#88ccff', 55);
  }
}

export function tryMove(g, dy, dx, matrixActive, onNextDreamscape, onMsg, insightTokens, setInsightTokens) {
  const sz = g.sz;
  const ny = g.player.y + dy, nx = g.player.x + dx;
  if (ny < 0 || ny >= sz || nx < 0 || nx >= sz) return false;

  const tileType = g.grid[ny][nx];

  if (tileType === T.WALL) {
    if (UPG.phaseShift && UPG.phaseTimer > 0) { /* pass through */ } else return false;
  }
  if (tileType === T.HIDDEN && matrixActive === 'A' && !UPG.phaseShift) return false;

  // Rewind save
  if (UPG.temporalRewind && UPG.rewindBuffer.length < 8) {
    const gridSnap = g.grid.map(row => [...row]);
    UPG.rewindBuffer.push({ y: g.player.y, x: g.player.x, grid: gridSnap });
  }
  g.moveHistory.push({ y: g.player.y, x: g.player.x });
  if (g.moveHistory.length > 15) g.moveHistory.shift();

  addEcho(g, matrixActive);
  if (CFG.particles) g.trail.push({
    x: g.player.x * (CELL + GAP) + CELL / 2,
    y: g.player.y * (CELL + GAP) + CELL / 2,
    life: 14, maxLife: 14,
    color: matrixActive === 'A' ? 'rgba(180,0,80,0.45)' : 'rgba(0,255,136,0.38)',
  });

  g.player.y = ny; g.player.x = nx;

  // Timers
  if (UPG.phaseShift && UPG.phaseTimer > 0) { UPG.phaseTimer--; if (UPG.phaseTimer <= 0) { UPG.phaseShift = false; onMsg('PHASE FADED', '#445566', 25); } }
  if (UPG.shield && UPG.shieldTimer > 0)    { UPG.shieldTimer--; if (UPG.shieldTimer <= 0) { UPG.shield = false; onMsg('SHIELD FADED', '#445566', 25); } }
  if (matrixActive === 'A') UPG.energy = Math.max(0, UPG.energy - 0.9);
  else                      UPG.energy = Math.min(UPG.energyMax, UPG.energy + 0.5);
  if (g.archetypeActive) { g.archetypeTimer--; if (g.archetypeTimer <= 0) { g.archetypeActive = false; UPG.archetypePower = null; } }

  // ── Tile effects ──
  const d = { dmgMul: CFG.difficulty === 'hard' ? 1.45 : CFG.difficulty === 'easy' ? 0.55 : 1.0 };
  const sMul = g.scoreMulMode || 1.0; // play-mode score multiplier (e.g. Horror 3×, Nightmare 5×)

  if (tileType === T.PEACE) {
    const pts = Math.round((150 + g.level * 20) * UPG.resonanceMultiplier * sMul);
    g.score += pts;
    // Reverse mode: peace tiles damage instead of healing
    if (g.reverseMode) {
      g.hp = Math.max(0, g.hp - 15);
      g.grid[ny][nx] = T.VOID; g.peaceLeft--;
      burst(g, nx, ny, '#ff2244', 12, 3);
      onMsg('REVERSED! PEACE DAMAGES -15', '#ff2244', 45);
      g.shakeFrames = 4;
    } else {
      g.hp = Math.min(UPG.maxHp, g.hp + 20);
      g.grid[ny][nx] = T.VOID; g.peaceLeft--;
      burst(g, nx, ny, UPG.particleColor, 18, 3.5);
      UPG.shieldCount++; UPG.comboCount++;
      UPG.resonanceMultiplier = Math.min(4, 1 + UPG.comboCount * 0.25);
      UPG.glitchPulseCharge = Math.min(100, UPG.glitchPulseCharge + 15);
      if (UPG.comboCount >= 3 && !UPG.shield) {
        UPG.shield = true; UPG.shieldTimer = 20;
        resonanceWave(g, nx, ny, '#00ffcc');
        burst(g, nx, ny, '#00ffcc', 26, 5);
        onMsg('SHIELD ACTIVE! ×' + UPG.resonanceMultiplier.toFixed(1), '#00ffcc', 55);
      } else {
        onMsg('+PEACE +' + pts + (UPG.comboCount > 1 ? ' ×' + UPG.resonanceMultiplier.toFixed(1) : ''), '#00ffcc', 38);
      }
      setEmotion(g, 'peace');
    }
    if (g.peaceLeft === 0) onNextDreamscape();

  } else if (tileType === T.INSIGHT) {
    const pts = Math.round((300 + g.level * 50) * UPG.resonanceMultiplier * sMul);
    g.score += pts; setInsightTokens(insightTokens + 1);
    g.grid[ny][nx] = T.VOID; g.insightLeft--;
    burst(g, nx, ny, '#00eeff', 24, 4);
    resonanceWave(g, nx, ny, '#00eeff');
    onMsg('INSIGHT ◆×' + (insightTokens + 1), '#00eeff', 60);
    for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++)
      if (g.grid[y][x] === T.HIDDEN) g.tileFlicker.push({ y, x, t: 100, reveal: true });
    setEmotion(g, 'clarity');

  } else if (tileType === T.ARCHETYPE) {
    g.grid[ny][nx] = T.VOID;
    const archKey = g.ds.archetype === 'all' ? pick(Object.keys(ARCHETYPES)) : (g.ds.archetype || 'orb');
    activateArchetype(g, archKey, matrixActive);

  } else if (tileType === T.TELEPORT) {
    let tries = 0, ty = rnd(sz), tx = rnd(sz);
    while ((g.grid[ty][tx] !== T.VOID || (ty === ny && tx === nx)) && tries < 200) { ty = rnd(sz); tx = rnd(sz); tries++; }
    g.player.y = ty; g.player.x = tx; g.grid[ny][nx] = T.VOID;
    burst(g, tx, ty, '#00aaff', 16, 3); onMsg('LEAP!', '#00aaff', 30);

  } else if (tileType === T.COVER) {
    onMsg('COVER', '#446688', 20);
    for (const e of g.enemies) if (Math.abs(e.y - ny) + Math.abs(e.x - nx) <= 2) e.stunTimer = 600;

  } else if (tileType === T.MEMORY) {
    g.grid[ny][nx] = T.VOID; g.score += Math.round(50 * sMul);
    onMsg('MEMORY ECHO…', '#88bbaa', 30); burst(g, nx, ny, '#88bbaa', 10, 2);

  // ── Phase 2.6: Embodiment / Somatic Tiles ──────────────────────────
  } else if (tileType === T.BODY_SCAN) {
    g.grid[ny][nx] = T.VOID; g.score += Math.round(80 * sMul);
    g.hp = Math.min(UPG.maxHp, g.hp + 10);
    burst(g, nx, ny, '#00aa44', 14, 2.5);
    onMsg('BODY SCAN +10 HP  ·  notice sensations…', '#00cc44', 55);
    setEmotion(g, 'peace');

  } else if (tileType === T.BREATH_SYNC) {
    g.grid[ny][nx] = T.VOID; g.score += Math.round(60 * sMul);
    UPG.energy = Math.min(UPG.energyMax, UPG.energy + 20);
    burst(g, nx, ny, '#6688ff', 14, 2.5);
    onMsg('BREATH SYNC  ·  inhale 4  ·  hold 4  ·  exhale 4…', '#6688ff', 100);

  } else if (tileType === T.ENERGY_NODE) {
    g.grid[ny][nx] = T.VOID; g.score += Math.round(120 * sMul);
    UPG.energy = Math.min(UPG.energyMax, UPG.energy + 40);
    UPG.glitchPulseCharge = Math.min(100, UPG.glitchPulseCharge + 20);
    burst(g, nx, ny, '#cc44ff', 18, 3);
    resonanceWave(g, nx, ny, '#cc44ff');
    onMsg('ENERGY NODE  +40 ENERGY  ✦', '#cc44ff', 45);

  } else if (tileType === T.GROUNDING) {
    g.grid[ny][nx] = T.VOID; g.score += Math.round(70 * sMul);
    g.slowMoves = false; UPG.emotion = 'neutral'; UPG.emotionTimer = 0;
    g.hp = Math.min(UPG.maxHp, g.hp + 5);
    burst(g, nx, ny, '#886644', 12, 2);
    onMsg('GROUNDED  ·  feel your feet  ·  breathe  +5 HP', '#aa8855', 65);

  } else if (TILE_DEF[tileType] && TILE_DEF[tileType].dmg > 0) {
    if (UPG.shield && UPG.shieldTimer > 0) {
      onMsg('SHIELDED', '#00ffcc', 20);
    } else {
      const def = TILE_DEF[tileType];
      let dmg = Math.round(def.dmg * d.dmgMul * (matrixActive === 'A' ? 1.25 : 1) * (g.dmgMul ?? 1));
      if (TILE_DEF[tileType]?.push > 0) {
        const pby = ny + dy * def.push, pbx = nx + dx * def.push;
        if (pby >= 0 && pby < sz && pbx >= 0 && pbx < sz && g.grid[pby][pbx] !== T.WALL) {
          g.player.y = pby; g.player.x = pbx;
          onMsg(PUSH_MSG[tileType] || '-PUSHED!', '#ff0066', 40);
        }
      }
      if (tileType === T.SELF_HARM)  g.grid[ny][nx] = T.PAIN;
      if (tileType === T.HOPELESS)   setEmotion(g, 'hopeless');
      if (tileType === T.DESPAIR) {
        // DESPAIR: spread first (seeps outward, 30% chance), THEN the tile the player
        // stepped on always dissolves.  Symbolically: confronting your despair doesn't
        // prevent it from touching nearby spaces, but it removes the exact despair you
        // faced — it can't hold you once you've walked through it.
        if (Math.random() < 0.3) {
          const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
          const [sdy, sdx] = pick(dirs);
          const sy = ny + sdy, sx = nx + sdx;
          if (sy >= 0 && sy < sz && sx >= 0 && sx < sz && g.grid[sy][sx] === T.VOID) g.grid[sy][sx] = T.DESPAIR;
        }
        g.grid[ny][nx] = T.VOID; // the tile you walked through dissolves
      }
      if (tileType === T.TERROR) {
        // TERROR vanishes when confronted directly — it only holds power while unmet.
        g.grid[ny][nx] = T.VOID;
      }
      g.hp = Math.max(0, g.hp - dmg);
      g.shakeFrames = 5;
      if (window.sfxManager) window.sfxManager.playPlayerHurt();
      const dmgColors = { [T.DESPAIR]:'#2244ff',[T.TERROR]:'#ff0000',[T.SELF_HARM]:'#660000',[T.RAGE]:'#ff0044',[T.HOPELESS]:'#004488',[T.GLITCH]:'#aa00ff',[T.TRAP]:'#ff8800',[T.PAIN]:'#440000' };
      const pColors   = { [T.DESPAIR]:'#3355ff',[T.TERROR]:'#ff2222',[T.SELF_HARM]:'#880000',[T.RAGE]:'#ff0044',[T.HOPELESS]:'#004488',[T.GLITCH]:'#aa00ff',[T.TRAP]:'#ff8800',[T.PAIN]:'#440000' };
      const msgs      = { [T.DESPAIR]:'-DESPAIR',[T.TERROR]:'-TERROR!',[T.SELF_HARM]:'-SELF·HARM',[T.RAGE]:'-RAGE',[T.HOPELESS]:'-HOPELESS',[T.GLITCH]:'-GLITCH',[T.TRAP]:'-TRAP',[T.PAIN]:'-PAIN' };
      g.flashColor = dmgColors[tileType] || '#ff0000'; g.flashAlpha = 0.28;
      burst(g, nx, ny, pColors[tileType] || '#ff2222', 10, 3);
      onMsg((msgs[tileType] || '-HAZARD') + ' -' + dmg, pColors[tileType] || '#ff3333', 38);
      UPG.shieldCount = 0; UPG.comboCount = 0; UPG.resonanceMultiplier = 1;
    }
  }

  // ── Magnet upgrade: auto-collect peace/insight tiles within radius 2 ──
  if (UPG.magnet) {
    const MAGNET_R = 2;
    let magnetInsightBonus = 0; // track additional tokens collected this sweep
    outer: for (let mdy = -MAGNET_R; mdy <= MAGNET_R; mdy++) {
      for (let mdx = -MAGNET_R; mdx <= MAGNET_R; mdx++) {
        if (mdy === 0 && mdx === 0) continue;
        if (g.peaceLeft <= 0) break outer;
        const my = g.player.y + mdy, mx = g.player.x + mdx;
        if (my < 0 || my >= sz || mx < 0 || mx >= sz) continue;
        const mt = g.grid[my][mx];
        if (mt === T.PEACE && !g.reverseMode) {
          g.score += Math.round((80 + g.level * 10) * UPG.resonanceMultiplier * sMul);
          g.hp = Math.min(UPG.maxHp, g.hp + 8);
          g.grid[my][mx] = T.VOID; g.peaceLeft--;
          burst(g, mx, my, UPG.particleColor || '#00ffaa', 8, 2);
          if (g.peaceLeft === 0) { onNextDreamscape(); return true; }
        } else if (mt === T.INSIGHT) {
          g.score += Math.round((150 + g.level * 20) * UPG.resonanceMultiplier * sMul);
          magnetInsightBonus++;
          g.grid[my][mx] = T.VOID; g.insightLeft--;
          burst(g, mx, my, '#00eeff', 10, 2.5);
        }
      }
    }
    if (magnetInsightBonus > 0) setInsightTokens(insightTokens + magnetInsightBonus);
  }

  return true;
}

export function triggerGlitchPulse(g, onMsg) {
  if (!g || UPG.glitchPulseCharge < 100) return;
  UPG.glitchPulseCharge = 0;
  let cleared = 0;
  for (let y = 0; y < g.sz; y++) for (let x = 0; x < g.sz; x++) {
    if (Math.abs(y - g.player.y) + Math.abs(x - g.player.x) <= 3 && TILE_DEF[g.grid[y][x]]?.dmg > 0) {
      g.grid[y][x] = T.VOID; cleared++;
    }
  }
  for (const e of g.enemies) if (Math.abs(e.y - g.player.y) + Math.abs(e.x - g.player.x) <= 4) e.stunTimer = 1800;
  resonanceWave(g, g.player.x, g.player.y, '#aa00ff');
  burst(g, g.player.x, g.player.y, '#aa00ff', 32, 6);
  onMsg('GLITCH PULSE! ' + cleared + ' CLEARED', '#aa00ff', 55);
}

export function stepTileSpread(g, dt) {
  g.spreadTimer -= dt;
  if (g.spreadTimer > 0) return;
  g.spreadTimer = 3000 + rnd(1000);
  const sz = g.sz, candidates = [];
  for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
    const v = g.grid[y][x];
    if ((v === T.DESPAIR || v === T.HOPELESS) && TILE_DEF[v].spread) {
      for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < sz && nx >= 0 && nx < sz && g.grid[ny][nx] === T.VOID && Math.random() < 0.2)
          candidates.push({ y: ny, x: nx, type: v });
      }
    }
  }
  for (const c of candidates.slice(0, 2)) g.grid[c.y][c.x] = c.type;
}
