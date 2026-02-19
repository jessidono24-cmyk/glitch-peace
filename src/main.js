'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE  —  main.js  —  v4 Vite Edition
//  Entry point: state machine + game loop.
//  All game logic lives in src/game/, src/ui/, src/core/.
// ═══════════════════════════════════════════════════════════════════════
import { DREAMSCAPES, UPGRADE_SHOP, VISION_WORDS, CELL, GAP, PAL_A, PAL_B } from './core/constants.js';
import { CFG, UPG, CURSOR, phase, setPhase, resetUpgrades, resetSession,
         checkOwned, matrixActive, setMatrix, matrixHoldTime, setMatrixHoldTime, addMatrixHoldTime,
         insightTokens, addInsightToken, spendInsightTokens,
         sessionRep, addSessionRep, dreamHistory, pushDreamHistory,
         highScores, setHighScores, purgDepth, setPurgDepth } from './core/state.js';
import { rnd, pick } from './core/utils.js';
import { saveHighScores, loadHighScores } from './core/storage.js';
import { SZ, DIFF, GP, CW, CH, buildDreamscape } from './game/grid.js';
import { stepEnemies } from './game/enemy.js';
import { tryMove, triggerGlitchPulse, stepTileSpread, setEmotion, showMsg,
         activateArchetype, executeArchetypePower } from './game/player.js';
import { burst, resonanceWave } from './game/particles.js';
import { drawGame } from './ui/renderer.js';
import { drawTitle, drawDreamSelect, drawOptions, drawHighScores,
         drawUpgradeShop, drawPause, drawInterlude, drawDead } from './ui/menus.js';
import { EmotionalField } from './systems/emotional-engine.js';
import { temporalSystem } from './systems/temporal-system.js';
import { ImpulseBuffer } from './recovery/impulse-buffer.js';
import { ConsequencePreview } from './recovery/consequence-preview.js';
import { sfxManager } from './audio/sfx-manager.js';
import { ModeManager } from './modes/mode-manager.js';
import { GridMode } from './modes/grid-mode.js';

// ─── Canvas setup ───────────────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const DPR    = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  const w = CW(), h = CH();
  canvas.width  = w * DPR; canvas.height = h * DPR;
  canvas.style.width  = Math.min(w, window.innerWidth - 16) + 'px';
  canvas.style.height = 'auto';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(DPR, DPR);
}
resizeCanvas();

// ─── Runtime globals ────────────────────────────────────────────────────
let game       = null;
window._game = game;
let animId     = null;
let prevTs     = 0;
let lastMove   = 0;

// Expose tokens/dreamIdx to renderer via window (avoids circular import)
window._insightTokens = insightTokens;
window._dreamIdx      = CFG.dreamIdx;

window._temporalSystem = temporalSystem;

let glitchFrames = 0, glitchTimer = 500;
let anomalyActive = false, anomalyData = { row:-1, col:-1, t:0 };
let hallucinations = [];
let backgroundStars = [];
let visions = [];
let interludeState = { text:'', subtext:'', timer:0, ds:null };
// ─── Emotional field (E1) ────────────────────────────────────────────────
let emotionalField = new EmotionalField();
window._emotionalField = emotionalField;   // lets renderer read it without circular import

// ─── Pattern Recognition (Phase 4) ───────────────────────────────────────
let impulseBuffer = new ImpulseBuffer();
let consequencePreview = new ConsequencePreview();
window._impulseBuffer = impulseBuffer;
window._consequencePreview = consequencePreview;

const keys = new Set();
window._keys = keys;

// ─── Stars / visions (shared with modes) ────────────────────────────────
// Note: GridMode manages its own stars/visions, these are kept for menu screens
// (Variables already declared above around line 59-64)

function initStars(w, h) {
  backgroundStars = [];
  for (let i = 0; i < 30; i++)
    backgroundStars.push({ x:Math.random()*w, y:Math.random()*h, r:0.5+Math.random()*1.5, a:Math.random()*0.15, phase:Math.random()*Math.PI*2 });
}

function spawnVisions(w, h) {
  visions = [];
  for (let i = 0; i < 5; i++) {
    visions.push({
      text: pick(VISION_WORDS),
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: 0.15 + Math.random() * 0.2,
      scale: 0.5 + Math.random() * 0.5
    });
  }
}

// ─── Mode Manager (Phase M1) ─────────────────────────────────────────────
const sharedSystems = {
  emotionalField,
  temporalSystem,
  sfxManager,
  impulseBuffer,
  consequencePreview
};
const modeManager = new ModeManager(sharedSystems);
modeManager.registerMode('grid', GridMode);
window._modeManager = modeManager;

// ─── Helpers shared across systems ──────────────────────────────────────
function _showMsg(text, color, timer) { if (game) { game.msg = text; game.msgColor = color; game.msgTimer = timer; } }

function saveScore(score, level, ds) {
  const scores = loadHighScores();
  scores.push({ score, level, dreamscape: ds?.name||'?', date: new Date().toLocaleDateString() });
  scores.sort((a,b) => b.score - a.score);
  const trimmed = scores.slice(0, 8);
  setHighScores(trimmed);
  saveHighScores(trimmed);
}

function startGame(dreamIdx) {
  resetUpgrades(); resetSession();
  emotionalField = new EmotionalField();
  window._emotionalField = emotionalField;
  temporalSystem.refresh();
  impulseBuffer.reset();
  consequencePreview.deactivate();
  sfxManager.resume(); // Resume audio context on user interaction
  
  // Update shared systems reference
  sharedSystems.emotionalField = emotionalField;
  
  // Initialize grid mode through ModeManager
  resizeCanvas();
  CFG.dreamIdx = dreamIdx || 0;
  window._insightTokens = 0; window._dreamIdx = CFG.dreamIdx;
  
  modeManager.switchMode('grid', {
    dreamIdx: CFG.dreamIdx,
    prevScore: 0,
    prevLevel: 0,
    prevHp: undefined
  });
  
  game = window._game;  // GridMode exposes game to window
  setPhase('playing'); lastMove = 0; setMatrixHoldTime(0);
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

function buyUpgrade(id) {
  const up = UPGRADE_SHOP.find(u => u.id === id);
  if (!up || insightTokens < up.cost || checkOwned(id)) return;
  spendInsightTokens(up.cost); window._insightTokens = insightTokens;
  if (id==='maxhp')  { UPG.maxHp+=25; if(game) game.hp=Math.min(game.hp+25,UPG.maxHp); }
  if (id==='speed')  UPG.moveDelay = Math.max(55, UPG.moveDelay - 15);
  if (id==='magnet') UPG.magnet = true;
  if (id==='freeze') UPG.freeze = true;
  if (id==='aura')   UPG.aura   = true;
  if (id==='energy') UPG.energyMax = Math.min(200, UPG.energyMax + 30);
  if (id==='rewind') UPG.temporalRewind = true;
  if (id==='pulse')  UPG.glitchPulse = true;
}

// ─── Main loop ───────────────────────────────────────────────────────────
function loop(ts) {
  const dt = ts - prevTs; prevTs = ts;
  const w = CW(), h = CH();

  if (phase === 'title')       { drawTitle(ctx, w, h, backgroundStars, ts, CURSOR.menu); animId=requestAnimationFrame(loop); return; }
  if (phase === 'dreamselect') { drawDreamSelect(ctx, w, h, CFG.dreamIdx); animId=requestAnimationFrame(loop); return; }
  if (phase === 'options')     { drawOptions(ctx, w, h, CURSOR.opt); animId=requestAnimationFrame(loop); return; }
  if (phase === 'highscores')  { drawHighScores(ctx, w, h, highScores); animId=requestAnimationFrame(loop); return; }
  if (phase === 'upgrade')     { drawUpgradeShop(ctx, w, h, CURSOR.shop, insightTokens, checkOwned); animId=requestAnimationFrame(loop); return; }
  if (phase === 'dead')        { drawDead(ctx, w, h, game, highScores, dreamHistory, insightTokens, sessionRep); animId=requestAnimationFrame(loop); return; }
  if (phase === 'paused')      { drawPause(ctx, w, h, game, CURSOR.pause); animId=requestAnimationFrame(loop); return; }
  if (phase === 'interlude')   { drawInterlude(ctx, w, h, interludeState, ts); interludeState.timer--; if (interludeState.timer <= 0 && phase === 'interlude') setPhase('playing'); animId=requestAnimationFrame(loop); return; }

  // ── Playing (delegated to ModeManager) ──────────────────────────────────
  const stateChange = modeManager.update(dt, keys, matrixActive, ts);
  
  // Handle state changes from mode
  if (stateChange) {
    if (stateChange.phase === 'dead') {
      game = window._game;
      saveScore(game.score, game.level, game.ds);
      setPhase('dead');
      animId = requestAnimationFrame(loop);
      return;
    } else if (stateChange.phase === 'interlude') {
      interludeState = stateChange.data.interludeState;
      setPhase('interlude');
      // Schedule next dreamscape
      setTimeout(() => {
        const g = window._game;
        const nextIdx = CFG.dreamIdx;
        resizeCanvas();
        modeManager.switchMode('grid', {
          dreamIdx: nextIdx,
          prevScore: g.score + 400 + g.level * 60,
          prevLevel: g.level,
          prevHp: g.hp
        });
        game = window._game;
        game.msg = DREAMSCAPES[nextIdx].name;
        game.msgColor = '#ffdd00';
        game.msgTimer = 90;
        if (phase === 'interlude') setPhase('playing');
      }, 3600);
      animId = requestAnimationFrame(loop);
      return;
    }
  }
  
  // Render through ModeManager
  modeManager.render(ctx, ts, {
    DPR,
    backgroundStars,
    visions,
    hallucinations,
    anomalyActive,
    anomalyData,
    glitchFrames
  });
  animId = requestAnimationFrame(loop);
}

// ─── Input ───────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  keys.add(e.key);
  if (phase === 'title') {
    if (e.key==='ArrowUp')   { CURSOR.menu=(CURSOR.menu-1+5)%5; sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.menu=(CURSOR.menu+1)%5; sfxManager.playMenuNav(); }
    if (e.key==='Enter'||e.key===' ') {
      sfxManager.playMenuSelect();
      if (CURSOR.menu===0)      startGame(CFG.dreamIdx);
      else if (CURSOR.menu===1) setPhase('dreamselect');
      else if (CURSOR.menu===2) { CURSOR.opt=0; setPhase('options'); }
      else if (CURSOR.menu===3) setPhase('highscores');
      else if (CURSOR.menu===4) { CURSOR.shop=0; CURSOR.upgradeFrom='title'; setPhase('upgrade'); }
    }
    e.preventDefault(); return;
  }
  if (phase === 'dreamselect') {
    if (e.key==='ArrowUp')   CFG.dreamIdx=(CFG.dreamIdx-1+DREAMSCAPES.length)%DREAMSCAPES.length;
    if (e.key==='ArrowDown') CFG.dreamIdx=(CFG.dreamIdx+1)%DREAMSCAPES.length;
    if (e.key==='Enter')     startGame(CFG.dreamIdx);
    if (e.key==='Escape')    setPhase('title');
    e.preventDefault(); return;
  }
  if (phase === 'options') {
    if (e.key==='ArrowUp')   CURSOR.opt=(CURSOR.opt-1+4)%4;
    if (e.key==='ArrowDown') CURSOR.opt=(CURSOR.opt+1)%4;
    if (e.key==='ArrowLeft'||e.key==='ArrowRight') {
      const dir=e.key==='ArrowLeft'?-1:1;
      if(CURSOR.opt===0){const i=['small','medium','large'].indexOf(CFG.gridSize);CFG.gridSize=['small','medium','large'][(i+dir+3)%3];}
      else if(CURSOR.opt===1){const i=['easy','normal','hard'].indexOf(CFG.difficulty);CFG.difficulty=['easy','normal','hard'][(i+dir+3)%3];}
      else if(CURSOR.opt===2) CFG.particles=!CFG.particles;
    }
    if (e.key==='Enter'||e.key==='Escape') { if(CURSOR.opt===3||e.key==='Escape') setPhase(game?'paused':'title'); }
    e.preventDefault(); return;
  }
  if (phase === 'highscores') { if(e.key==='Enter'||e.key==='Escape') setPhase('title'); e.preventDefault(); return; }
  if (phase === 'upgrade') {
    if (e.key==='ArrowUp')   CURSOR.shop=(CURSOR.shop-1+UPGRADE_SHOP.length)%UPGRADE_SHOP.length;
    if (e.key==='ArrowDown') CURSOR.shop=(CURSOR.shop+1)%UPGRADE_SHOP.length;
    if (e.key==='Enter')     buyUpgrade(UPGRADE_SHOP[CURSOR.shop].id);
    if (e.key==='Escape')    setPhase(CURSOR.upgradeFrom==='paused'?'paused':'title');
    e.preventDefault(); return;
  }
  if (phase === 'dead') {
    if (e.key==='Enter'||e.key===' ') startGame(CFG.dreamIdx);
    if (e.key==='Escape') { setPhase('title'); CURSOR.menu=0; }
    e.preventDefault(); return;
  }
  if (phase === 'paused') {
    if (e.key==='ArrowUp')   CURSOR.pause=(CURSOR.pause-1+4)%4;
    if (e.key==='ArrowDown') CURSOR.pause=(CURSOR.pause+1)%4;
    if (e.key==='Enter') {
      if(CURSOR.pause===0) setPhase('playing');
      else if(CURSOR.pause===1){CURSOR.opt=0;setPhase('options');}
      else if(CURSOR.pause===2){CURSOR.shop=0;CURSOR.upgradeFrom='paused';setPhase('upgrade');}
      else { setPhase('title'); CURSOR.menu=0; game=null; }
    }
    if (e.key==='Escape') setPhase('playing');
    e.preventDefault(); return;
  }
  if (phase === 'playing') {
    // Try mode-specific input handling first
    if (!modeManager.handleInput(e.key, 'keydown', e)) {
      // Fallback to global playing phase inputs
      if (e.key==='Escape') { CURSOR.pause=0; setPhase('paused'); }
    }
  }
  const prevent = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '];
  if (prevent.includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', e => keys.delete(e.key));

// ─── Mobile controls ─────────────────────────────────────────────────────
function dpadBtn(id, key) {
  const btn = document.getElementById(id); if (!btn) return;
  let rel;
  btn.addEventListener('touchstart', e => { e.preventDefault(); keys.add(key); if(phase==='title')startGame(CFG.dreamIdx); rel=()=>keys.delete(key); }, { passive:false });
  btn.addEventListener('touchend',   e => { e.preventDefault(); if(rel)rel(); }, { passive:false });
  btn.addEventListener('mousedown',  () => { keys.add(key); if(phase==='title')startGame(CFG.dreamIdx); });
  btn.addEventListener('mouseup',    () => keys.delete(key));
}
dpadBtn('btn-up','ArrowUp'); dpadBtn('btn-down','ArrowDown');
dpadBtn('btn-left','ArrowLeft'); dpadBtn('btn-right','ArrowRight');
canvas.addEventListener('click', () => { if(phase==='title')startGame(CFG.dreamIdx); });

// ─── Boot ─────────────────────────────────────────────────────────────────
setHighScores(loadHighScores());
initStars(CW(), CH());
animId = requestAnimationFrame(loop);
