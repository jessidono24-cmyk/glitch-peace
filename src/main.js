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
         highScores, setHighScores } from './core/state.js';
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
// ─── Phase 2-5 systems ───────────────────────────────────────────────────
import { sfxManager } from './audio/sfx-manager.js';
import { temporalSystem } from './systems/temporal-system.js';
import { EmotionalField } from './systems/emotional-engine.js';
import { ConsequencePreview } from './recovery/consequence-preview.js';
import { ImpulseBuffer } from './recovery/impulse-buffer.js';
import { ShooterMode } from './modes/shooter-mode.js';

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

// ─── Shared systems ─────────────────────────────────────────────────────
const emotionalField = new EmotionalField();
const consequencePreview = new ConsequencePreview();
const impulseBuffer = new ImpulseBuffer();
window.sfxManager = sfxManager; // allow player.js to access for future hooks

// Shooter mode instance (shared systems)
const shooterSharedSystems = {
  emotionalField, temporalSystem, sfxManager,
  impulseBuffer: null, consequencePreview,
};
const shooterMode = new ShooterMode(shooterSharedSystems);

// ─── Runtime globals ────────────────────────────────────────────────────
let game       = null;
let deadGame   = null; // snapshot used by death screen (survives game=null)
let animId     = null;
let prevTs     = 0;
let lastMove   = 0;
let gameMode   = 'grid'; // 'grid' | 'shooter'
const EMOTION_THRESHOLD = 0.15; // emotion must exceed this to affect gameplay

// Expose tokens/dreamIdx to renderer via window (avoids circular import)
window._insightTokens = insightTokens;
window._dreamIdx      = CFG.dreamIdx;

let glitchFrames = 0, glitchTimer = 500;
let anomalyActive = false, anomalyData = { row:-1, col:-1, t:0 };
let hallucinations = [];
let backgroundStars = [];
let visions = [];
let interludeState = { text:'', subtext:'', timer:0, ds:null };

const keys = new Set();

// ─── Stars / visions ────────────────────────────────────────────────────
function initStars(w, h) {
  backgroundStars = [];
  for (let i = 0; i < 30; i++)
    backgroundStars.push({ x:Math.random()*w, y:Math.random()*h, r:0.5+Math.random()*1.5, a:Math.random()*0.15, phase:Math.random()*Math.PI*2 });
}

function spawnVisions(w, h) {
  visions = [];
  for (let i = 0; i < 5; i++)
    visions.push({ text:pick(VISION_WORDS), x:40+Math.random()*(w-80), y:90+Math.random()*(h-140),
      alpha:0, targetAlpha:0.04+Math.random()*0.07, life:200+rnd(500), maxLife:700,
      dx:(Math.random()-0.5)*0.05, dy:-0.03-Math.random()*0.04 });
}

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

// ─── Environment events ─────────────────────────────────────────────────
function triggerEnvironmentEvent(g) {
  const event = g.ds.environmentEvent, sz = g.sz;
  if (!event) return;
  if (event === 'gravity_shift') {
    const [dy, dx] = pick([[-1,0],[1,0],[0,-1],[0,1]]);
    const ny = g.player.y+dy, nx = g.player.x+dx;
    if (ny>=0&&ny<sz&&nx>=0&&nx<sz&&g.grid[ny][nx]!==5) { g.player.y=ny; g.player.x=nx; _showMsg('GRAVITY SHIFTS…','#8888ff',40); }
  } else if (event === 'loop_reset') {
    for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++) {
      const ny=g.player.y+dy, nx=g.player.x+dx;
      if (ny>=0&&ny<sz&&nx>=0&&nx<sz&&g.grid[ny][nx]===0&&Math.random()<0.25) g.grid[ny][nx]=8;
    }
    _showMsg('THE LOOP TIGHTENS…','#ff8800',40);
  } else if (event === 'capture_zones') {
    const e = pick(g.enemies); if (e) g.captureZones = [{ x:e.x, y:e.y, r:2, timer:300 }];
    _showMsg('CAPTURE ZONE ACTIVATED','#ff2244',40);
  } else if (event === 'rapid_spawn') {
    if (g.enemies.length < 10) {
      const y=2+rnd(sz-4), x=2+rnd(sz-4);
      g.enemies.push({ y, x, timer:0, stunTimer:0, behavior:'rush', patrolAngle:0, orbitAngle:0, orbitR:2, prevY:y, prevX:x, momentum:[0,0], type:'rush' });
      _showMsg('CHAOS ERUPTS!','#ff0044',40);
    }
  } else if (event === 'wall_phase') {
    let n=0;
    for (let y=0;y<sz&&n<4;y++) for (let x=0;x<sz&&n<4;x++) if (g.grid[y][x]===5&&Math.random()<0.3) { g.grid[y][x]=10; n++; }
    _showMsg('MEMBRANE DISSOLVES…','#00ccff',40);
  } else if (event === 'glide_nodes') {
    let n=0, itr=0; while (n<2&&itr<999) { itr++; const y=rnd(sz),x=rnd(sz); if(g.grid[y][x]===0){g.grid[y][x]=12;n++;} }
    _showMsg('GLIDE NODES APPEAR','#00aaff',40);
  } else if (event === 'mashup') {
    const otherDs = pick(DREAMSCAPES.filter(d => d.id !== g.ds.id));
    if (otherDs.hazardSet[0]) { let n=0,itr=0; while(n<3&&itr<999){itr++;const y=rnd(sz),x=rnd(sz);if(g.grid[y][x]===0){g.grid[y][x]=otherDs.hazardSet[0];n++;}} }
    _showMsg('DREAMSCAPES MERGE…','#ffaaff',40);
  } else if (event === 'line_of_sight') {
    // Summit: enemies become alert and terror tiles appear at player's periphery
    for (const e of g.enemies) if (e.stunTimer > 0) e.stunTimer = 0;
    let n=0, itr=0; while (n<3&&itr<999) { itr++; const y=rnd(sz),x=rnd(sz); if(g.grid[y][x]===0&&Math.random()<0.5){g.grid[y][x]=2;n++;} }
    _showMsg('THE SUMMIT WATCHES…','#ff4422',40);
  } else if (event === 'dead_ends') {
    // Aztec: seal off random corridors with walls, penalising predictable routes
    let n=0, itr=0; while (n<4&&itr<999) { itr++; const y=1+rnd(sz-2),x=1+rnd(sz-2); if(g.grid[y][x]===0){g.grid[y][x]=5;n++;} }
    _showMsg('THE LABYRINTH SHIFTS…','#cc8800',40);
  }
  if (Math.random() < 0.4) {
    const row = rnd(sz);
    for (let x=0;x<sz;x++) {
      if (g.grid[row][x]===1) g.grid[row][x]=4;
      else if (g.grid[row][x]===4&&Math.random()<0.3) g.grid[row][x]=1;
    }
    anomalyData = { row, col:-1, t:50 }; anomalyActive = true;
  }
}

// ─── Game lifecycle ──────────────────────────────────────────────────────
function initGame(dreamIdx, prevScore, prevLevel, prevHp) {
  const level = (prevLevel || 0) + 1;
  resizeCanvas();
  const ds = DREAMSCAPES[dreamIdx % DREAMSCAPES.length];
  setMatrix(ds.matrixDefault);
  const g = buildDreamscape(ds, SZ(), level, prevScore, prevHp, UPG.maxHp, dreamHistory);
  spawnVisions(CW(), CH()); hallucinations = []; glitchTimer = 500 + rnd(500);
  initStars(CW(), CH());
  return g;
}

function startGame(dreamIdx) {
  sfxManager.resume();
  temporalSystem.refresh();
  const tmods = temporalSystem.getModifiers();
  window._tmods = tmods;
  if (gameMode === 'shooter') {
    resetSession();
    shooterMode.init({});
    setPhase('playing'); lastMove = 0;
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
    return;
  }
  resetUpgrades(); resetSession();
  emotionalField.setAll({ joy:0, hope:0, trust:0, surprise:0, fear:0, sadness:0, disgust:0, anger:0, shame:0, anticipation:0 });
  CFG.dreamIdx = dreamIdx || 0;
  window._insightTokens = 0; window._dreamIdx = CFG.dreamIdx;
  game = initGame(CFG.dreamIdx, 0, 0, undefined);
  setPhase('playing'); lastMove = 0; setMatrixHoldTime(0);
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

function nextDreamscape() {
  const g = game;
  const nextIdx = (CFG.dreamIdx + 1) % DREAMSCAPES.length;
  CFG.dreamIdx = nextIdx; window._dreamIdx = nextIdx;
  pushDreamHistory(g.ds.id);
  sfxManager.playLevelComplete();
  interludeState = { text:g.ds.completionText, subtext:DREAMSCAPES[nextIdx].narrative, timer:220, ds:DREAMSCAPES[nextIdx] };
  setPhase('interlude');
  setTimeout(() => {
    resizeCanvas();
    game = initGame(nextIdx, g.score + 400 + g.level * 60, g.level, g.hp);
    game.msg = DREAMSCAPES[nextIdx].name; game.msgColor = '#ffdd00'; game.msgTimer = 90;
    if (phase === 'interlude') setPhase('playing');
  }, 3600);
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

  if (phase === 'title')       { drawTitle(ctx, w, h, backgroundStars, ts, CURSOR.menu, gameMode); animId=requestAnimationFrame(loop); return; }
  if (phase === 'dreamselect') { drawDreamSelect(ctx, w, h, CFG.dreamIdx); animId=requestAnimationFrame(loop); return; }
  if (phase === 'options')     { drawOptions(ctx, w, h, CURSOR.opt); animId=requestAnimationFrame(loop); return; }
  if (phase === 'highscores')  { drawHighScores(ctx, w, h, highScores); animId=requestAnimationFrame(loop); return; }
  if (phase === 'upgrade')     { drawUpgradeShop(ctx, w, h, CURSOR.shop, insightTokens, checkOwned); animId=requestAnimationFrame(loop); return; }
  if (phase === 'dead')        { drawDead(ctx, w, h, deadGame, highScores, dreamHistory, insightTokens, sessionRep); animId=requestAnimationFrame(loop); return; }
  if (phase === 'paused')      { drawPause(ctx, w, h, game, CURSOR.pause); animId=requestAnimationFrame(loop); return; }
  if (phase === 'interlude')   { drawInterlude(ctx, w, h, interludeState, ts); interludeState.timer--; if (interludeState.timer <= 0 && phase === 'interlude') setPhase('playing'); animId=requestAnimationFrame(loop); return; }

  // ── Shooter mode ─────────────────────────────────────────────────────
  if (gameMode === 'shooter') {
    const result = shooterMode.update(dt, keys, matrixActive, ts);
    shooterMode.render(ctx, ts, { w, h, DPR });
    if (result && result.phase === 'dead') {
      // Create a dead-screen-compatible snapshot for shooter mode
      deadGame = { score: result.data.score, level: shooterMode.wave, ds: { name: 'SHOOTER ARENA' } };
      game = null;
      setPhase('dead');
    }
    animId = requestAnimationFrame(loop);
    return;
  }

  // ── Grid mode: Playing ───────────────────────────────────────────────
  // Apply temporal modifiers to enemy speed
  const tmods = window._tmods || temporalSystem.getModifiers();
  game.temporalEnemyMul = tmods.enemyMul;
  game.insightMul = tmods.insightMul;

  // Emotional field decay
  const coherenceMul = (matrixActive === 'B' ? 1.2 : 0.7) * (tmods.coherenceMul || 1);
  emotionalField.weekdayCoherenceMul = coherenceMul;
  emotionalField.decay(dt / 1000);
  // Propagate dominant emotion and synergy to UPG/window for HUD
  const domEmotion = emotionalField.getDominantEmotion();
  if (domEmotion.value > EMOTION_THRESHOLD) UPG.emotion = domEmotion.id;
  window._emotionSynergy = emotionalField.synergy;
  window._purgDepth = emotionalField.purgDepth;

  const MOVE_DELAY = game.slowMoves ? UPG.moveDelay * 1.5 : UPG.moveDelay;
  const DIRS = {
    ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],
    w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1],
  };

  // Consequence preview: update direction while any move key is held
  let activeDir = null;
  for (const [k,[dy,dx]] of Object.entries(DIRS)) {
    if (keys.has(k)) { activeDir = [dy,dx]; break; }
  }
  if (activeDir) consequencePreview.update(activeDir, game, 3);
  else consequencePreview.deactivate();

  // ImpulseBuffer: hold 1 second before entering hazard tiles
  if (activeDir && ts - lastMove > MOVE_DELAY) {
    const [dy, dx] = activeDir;
    const ny = game.player.y + dy, nx = game.player.x + dx;
    const targetTile = (ny >= 0 && ny < game.sz && nx >= 0 && nx < game.sz) ? game.grid[ny][nx] : 0;
    const ibStatus = impulseBuffer.activeDirection
      ? impulseBuffer.update(ts)
      : impulseBuffer.startMove(activeDir, targetTile, ts);

    window._impulseProgress = ibStatus.progress; // expose for HUD

    if (ibStatus.ready) {
      tryMove(game, dy, dx, matrixActive, nextDreamscape, _showMsg, insightTokens,
        (n) => { while (insightTokens < n) addInsightToken(); window._insightTokens = insightTokens; });
      lastMove = ts;
      impulseBuffer.reset();
    }
  } else if (!activeDir) {
    impulseBuffer.cancel();
    window._impulseProgress = 0;
  }

  if (game.emotionTimer > 0) { game.emotionTimer--; if (game.emotionTimer <= 0) { game.slowMoves = false; UPG.emotion = 'neutral'; } }

  addMatrixHoldTime(dt);
  if (matrixActive==='B' && matrixHoldTime>4000 && Math.random()<0.0002*dt) game.hp=Math.min(UPG.maxHp,game.hp+1);
  if (matrixActive==='A' && matrixHoldTime>2500 && Math.random()<0.0003*dt) game.hp=Math.max(0,game.hp-1);

  glitchTimer -= dt;
  if (glitchTimer <= 0) { glitchFrames = 2 + rnd(4); glitchTimer = 500 + rnd(700); }
  if (anomalyActive) { anomalyData.t--; if (anomalyData.t <= 0) anomalyActive = false; }

  game.environmentTimer -= dt;
  if (game.environmentTimer <= 0) { game.environmentTimer = 900 + rnd(700); if (Math.random()<0.6) triggerEnvironmentEvent(game); }

  stepTileSpread(game, dt);
  stepEnemies(game, dt, keys, matrixActive, hallucinations, _showMsg, setEmotion);

  if (game.hp <= 0) {
    deadGame = game; // snapshot for death screen
    saveScore(game.score, game.level, game.ds);
    setPhase('dead'); animId=requestAnimationFrame(loop); return;
  }

  drawGame(ctx, ts, game, matrixActive, backgroundStars, visions, hallucinations, anomalyActive, anomalyData, glitchFrames, DPR, consequencePreview.getGhostPath());
  animId = requestAnimationFrame(loop);
}

// ─── Input ───────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  keys.add(e.key);
  if (phase === 'title') {
    if (e.key==='ArrowUp')   { CURSOR.menu=(CURSOR.menu-1+5)%5; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.menu=(CURSOR.menu+1)%5; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='m'||e.key==='M') {
      gameMode = gameMode === 'grid' ? 'shooter' : 'grid';
      sfxManager.resume(); sfxManager.playMatrixSwitch(gameMode === 'grid');
    }
    if (e.key==='Enter'||e.key===' ') {
      sfxManager.resume(); sfxManager.playMenuSelect();
      if (CURSOR.menu===0)      startGame(CFG.dreamIdx);
      else if (CURSOR.menu===1) setPhase('dreamselect');
      else if (CURSOR.menu===2) { CURSOR.opt=0; setPhase('options'); }
      else if (CURSOR.menu===3) setPhase('highscores');
      else if (CURSOR.menu===4) { CURSOR.shop=0; CURSOR.upgradeFrom='title'; setPhase('upgrade'); }
    }
    e.preventDefault(); return;
  }
  if (phase === 'dreamselect') {
    if (e.key==='ArrowUp')   { CFG.dreamIdx=(CFG.dreamIdx-1+DREAMSCAPES.length)%DREAMSCAPES.length; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CFG.dreamIdx=(CFG.dreamIdx+1)%DREAMSCAPES.length; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='Enter')     { sfxManager.resume(); sfxManager.playMenuSelect(); startGame(CFG.dreamIdx); }
    if (e.key==='Escape')    setPhase('title');
    e.preventDefault(); return;
  }
  if (phase === 'options') {
    if (e.key==='ArrowUp')   { CURSOR.opt=(CURSOR.opt-1+4)%4; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.opt=(CURSOR.opt+1)%4; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowLeft'||e.key==='ArrowRight') {
      const dir=e.key==='ArrowLeft'?-1:1;
      if(CURSOR.opt===0){const i=['small','medium','large'].indexOf(CFG.gridSize);CFG.gridSize=['small','medium','large'][(i+dir+3)%3];}
      else if(CURSOR.opt===1){const i=['easy','normal','hard'].indexOf(CFG.difficulty);CFG.difficulty=['easy','normal','hard'][(i+dir+3)%3];}
      else if(CURSOR.opt===2) CFG.particles=!CFG.particles;
      sfxManager.resume(); sfxManager.playMenuNav();
    }
    if (e.key==='Enter'||e.key==='Escape') { if(CURSOR.opt===3||e.key==='Escape') setPhase(game?'paused':'title'); }
    e.preventDefault(); return;
  }
  if (phase === 'highscores') { if(e.key==='Enter'||e.key==='Escape') setPhase('title'); e.preventDefault(); return; }
  if (phase === 'upgrade') {
    if (e.key==='ArrowUp')   { CURSOR.shop=(CURSOR.shop-1+UPGRADE_SHOP.length)%UPGRADE_SHOP.length; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.shop=(CURSOR.shop+1)%UPGRADE_SHOP.length; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='Enter')     { sfxManager.resume(); sfxManager.playMenuSelect(); buyUpgrade(UPGRADE_SHOP[CURSOR.shop].id); }
    if (e.key==='Escape')    setPhase(CURSOR.upgradeFrom==='paused'?'paused':'title');
    e.preventDefault(); return;
  }
  if (phase === 'dead') {
    if (e.key==='Enter'||e.key===' ') { sfxManager.resume(); sfxManager.playMenuSelect(); startGame(CFG.dreamIdx); }
    if (e.key==='Escape') { setPhase('title'); CURSOR.menu=0; }
    e.preventDefault(); return;
  }
  if (phase === 'paused') {
    if (e.key==='ArrowUp')   { CURSOR.pause=(CURSOR.pause-1+4)%4; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.pause=(CURSOR.pause+1)%4; sfxManager.resume(); sfxManager.playMenuNav(); }
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
    // Shooter mode: ESC to title, no other special keys
    if (gameMode === 'shooter') {
      if (e.key==='Escape') { setPhase('title'); CURSOR.menu=0; }
      e.preventDefault(); return;
    }
    if (e.key==='Escape') { CURSOR.pause=0; setPhase('paused'); }
    if (e.key==='Shift' && !e.repeat) {
      const next = matrixActive === 'A' ? 'B' : 'A';
      setMatrix(next); setMatrixHoldTime(0);
      sfxManager.resume(); sfxManager.playMatrixSwitch(next === 'A');
      const lbl = next==='A'?'MATRIX·A  ⟨ERASURE⟩':'MATRIX·B  ⟨COHERENCE⟩';
      const col = next==='A'?'#ff0055':'#00ff88';
      _showMsg(lbl, col, 55);
      if (CFG.particles) burst(game, game.player.x, game.player.y, col, 22, 4);
    }
    if ((e.key==='j'||e.key==='J') && !e.repeat) {
      if (game.archetypeActive) { executeArchetypePower(game); sfxManager.resume(); sfxManager.playArchetypePower(); }
      else if (UPG.temporalRewind && UPG.rewindBuffer.length>0) { executeArchetypePower(game); sfxManager.resume(); sfxManager.playArchetypePower(); }
      else _showMsg('NO ARCHETYPE ACTIVE', '#334455', 25);
    }
    if ((e.key==='r'||e.key==='R') && !e.repeat) {
      if (UPG.glitchPulse && UPG.glitchPulseCharge>=100) triggerGlitchPulse(game, _showMsg);
      else if (UPG.glitchPulse) _showMsg('CHARGING… '+Math.round(UPG.glitchPulseCharge)+'%','#660088',22);
      else _showMsg('BUY GLITCH PULSE IN UPGRADES','#334455',28);
    }
    if ((e.key==='q'||e.key==='Q') && !e.repeat) {
      if (UPG.freeze && UPG.freezeTimer<=0) { UPG.freezeTimer=2500; _showMsg('FREEZE ACTIVE!','#0088ff',50); burst(game,game.player.x,game.player.y,'#0088ff',20,4); }
    }
    if ((e.key==='c'||e.key==='C') && !e.repeat) {
      if (insightTokens>=2) {
        spendInsightTokens(2); window._insightTokens=insightTokens;
        if (!game.contZones) game.contZones=[];
        game.contZones.push({x:game.player.x,y:game.player.y,timer:240,maxTimer:240});
        _showMsg('CONTAINMENT ZONE','#00ffcc',38);
      } else _showMsg('NEED 2 ◆ FOR CONTAINMENT','#334455',28);
    }
  }
  const prevent = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '];
  if (prevent.includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', e => keys.delete(e.key));

// ─── Mouse events for shooter mode ────────────────────────────────────
canvas.addEventListener('mousemove', e => {
  if (phase === 'playing' && gameMode === 'shooter') shooterMode.handleInput(null, 'mousemove', e);
});
canvas.addEventListener('mousedown', e => {
  if (phase === 'playing' && gameMode === 'shooter') { sfxManager.resume(); shooterMode.handleInput(null, 'mousedown', e); }
});
canvas.addEventListener('mouseup', e => {
  if (phase === 'playing' && gameMode === 'shooter') shooterMode.handleInput(null, 'mouseup', e);
});

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
