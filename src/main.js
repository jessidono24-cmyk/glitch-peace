'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE  —  main.js  —  v4 Vite Edition
//  Entry point: state machine + game loop.
//  All game logic lives in src/game/, src/ui/, src/core/.
// ═══════════════════════════════════════════════════════════════════════
import { T, DREAMSCAPES, UPGRADE_SHOP, VISION_WORDS, CELL, GAP, PAL_A, PAL_B } from './core/constants.js';
import { CFG, UPG, CURSOR, phase, setPhase, resetUpgrades, resetSession,
         checkOwned, matrixActive, setMatrix, matrixHoldTime, setMatrixHoldTime, addMatrixHoldTime,
         insightTokens, addInsightToken, spendInsightTokens,
         sessionRep, addSessionRep, dreamHistory, pushDreamHistory,
         highScores, setHighScores,
         PLAYER_PROFILE, savePlayerProfile } from './core/state.js';
import { rnd, pick } from './core/utils.js';
import { saveHighScores, loadHighScores } from './core/storage.js';
import { SZ, DIFF, GP, CW, CH, buildDreamscape } from './game/grid.js';
import { stepEnemies } from './game/enemy.js';
import { tryMove, triggerGlitchPulse, stepTileSpread, setEmotion, showMsg,
         activateArchetype, executeArchetypePower } from './game/player.js';
import { burst, resonanceWave } from './game/particles.js';
import { drawGame } from './ui/renderer.js';
import { drawTitle, drawDreamSelect, drawOptions, drawHighScores,
         drawUpgradeShop, drawPause, drawInterlude, drawDead,
         drawOnboarding, drawLanguageOptions, drawHowToPlay } from './ui/menus.js';
// ─── Phase 2-5 systems ───────────────────────────────────────────────────
import { sfxManager } from './audio/sfx-manager.js';
import { temporalSystem } from './systems/temporal-system.js';
import { EmotionalField } from './systems/emotional-engine.js';
import { ConsequencePreview } from './recovery/consequence-preview.js';
import { ImpulseBuffer } from './recovery/impulse-buffer.js';
import { ShooterMode } from './modes/shooter-mode.js';
// ─── Phase 6: Learning Systems ───────────────────────────────────────────
import { vocabularyEngine } from './systems/learning/vocabulary-engine.js';
import { patternRecognition } from './systems/learning/pattern-recognition.js';
// ─── Phase 6+: Language System + Sigil System ────────────────────────────
import { languageSystem, LANGUAGES, LANGUAGE_PATHS, LANG_LIST } from './systems/learning/language-system.js';
import { sigilSystem } from './systems/learning/sigil-system.js';
// ─── Phase 6+: Adaptive Difficulty ───────────────────────────────────────
import { adaptiveDifficulty, DIFFICULTY_TIERS } from './systems/difficulty/adaptive-difficulty.js';
// ─── Phase 7: Cessation Tools ────────────────────────────────────────────
import { sessionTracker } from './systems/cessation/session-tracker.js';
// ─── Phase 7 continuation: Cessation Tools ───────────────────────────────
import { urgeManagement } from './systems/cessation/urge-management.js';
// ─── Phase 8: Awareness Features ─────────────────────────────────────────
import { selfReflection } from './systems/awareness/self-reflection.js';
import { emergenceIndicators } from './systems/awareness/emergence-indicators.js';
// ─── Phase 10: Cosmology Integration ─────────────────────────────────────
import { chakraSystem } from './systems/cosmology/chakra-system.js';
import { TAROT_ARCHETYPES, getRandomArchetype } from './systems/cosmology/tarot-archetypes.js';
// ─── Phase 11: Integration Dashboard ─────────────────────────────────────
import { drawDashboard, dashboard } from './systems/integration/progress-dashboard.js';
// ─── Phase 9: Intelligence Enhancement ───────────────────────────────────
import { logicPuzzles }       from './intelligence/cognitive/logic-puzzles.js';
import { strategicThinking }  from './intelligence/cognitive/strategic-thinking.js';
import { empathyTraining }    from './intelligence/emotional/empathy-training.js';
import { emotionRecognition } from './intelligence/emotional/emotion-recognition.js';
// ─── Phase M3: Campaign Structure ────────────────────────────────────────
import { campaignManager } from './modes/campaign-manager.js';
// ─── Phase M4+: Play Modes System (from glitch-peace-vite) ───────────────
import { PLAY_MODES, PLAY_MODE_LIST, applyPlayMode, getPlayModeMeta } from './systems/play-modes.js';
// ─── Phase 10+: Cosmologies (from glitch-peace-vite) ─────────────────────
import { COSMOLOGIES, DREAMSCAPE_COSMOLOGY, getCosmologyForDreamscape } from './systems/cosmology/cosmologies.js';
// ─── Phase 2.5: Dream Yoga System ────────────────────────────────────────
import { dreamYoga } from './systems/awareness/dream-yoga.js';
// ─── Phase M5: RPG Basics ─────────────────────────────────────────────────
import { characterStats } from './systems/rpg/character-stats.js';
import { archetypeDialogue } from './systems/rpg/archetype-dialogue.js';
// ─── Phase M3.5: Boss System ──────────────────────────────────────────────
import { bossSystem, BOSS_TYPES } from './systems/boss-system.js';
// ─── Phase M5: Quest System ───────────────────────────────────────────────
import { questSystem } from './systems/rpg/quest-system.js';
// ─── Phase M6: Alchemy System ─────────────────────────────────────────────
import { alchemySystem, TILE_ELEMENT_MAP } from './systems/alchemy-system.js';

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
let prevTs     = performance.now(); // initialise to now so first dt ≈ 0
let lastMove   = 0;
let gameMode   = 'grid'; // 'grid' | 'shooter'
const EMOTION_THRESHOLD      = 0.15;   // emotion must exceed this to affect gameplay
const INTERLUDE_DURATION_MS  = 10000;  // auto-advance after 10 s
const INTERLUDE_MIN_ADVANCE_MS = 3500; // player may skip after 3.5 s (all content visible)
// Pre-allocated tile-type sets to avoid array creation in the hot path
const SOMATIC_TILES  = new Set([17, 18, 19, 20]);
const HAZARD_TILES   = new Set([1, 2, 3, 8, 9, 10, 14, 16]);

// ─── Onboarding state ────────────────────────────────────────────────────
// LANG_LIST is imported from language-system.js — single canonical source
const onboardState = { step: 0, ageIdx: 4, nativeIdx: 0, targetIdx: 0 };

// ─── Language options state ───────────────────────────────────────────────
const langOptState = { row: 0, nativeIdx: LANG_LIST.indexOf(PLAYER_PROFILE.nativeLang || 'en'),
                       targetIdx: 0, modeIdx: 1 };

// ─── Apply adaptive difficulty tier on startup ────────────────────────────
adaptiveDifficulty.setAgeGroup(PLAYER_PROFILE.ageGroup || 'adult');
if (PLAYER_PROFILE.diffTier) adaptiveDifficulty.setTier(PLAYER_PROFILE.diffTier);
languageSystem.setNativeLang(PLAYER_PROFILE.nativeLang || 'en');
if (PLAYER_PROFILE.targetLang) languageSystem.setTargetLang(PLAYER_PROFILE.targetLang);

// Expose tokens/dreamIdx to renderer via window (avoids circular import)
window._insightTokens = insightTokens;
window._dreamIdx      = CFG.dreamIdx;

let glitchFrames = 0, glitchTimer = 500;
let anomalyActive = false, anomalyData = { row:-1, col:-1, t:0 };
let hallucinations = [];
let backgroundStars = [];
let visions = [];
let interludeState = { text:'', subtext:'', elapsed:0, duration: INTERLUDE_DURATION_MS, minAdvanceMs: INTERLUDE_MIN_ADVANCE_MS, ds:null, nextGame:null };

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
  } else if (event === 'bird_migration') {
    // Forest Sanctuary: spawn clusters of somatic + peace tiles
    const habTiles = [T.BODY_SCAN, T.BREATH_SYNC, T.ENERGY_NODE, T.GROUNDING, T.PEACE]; // somatic + peace
    let n=0, itr=0;
    while (n < 5 && itr < 999) { itr++; const y=rnd(sz),x=rnd(sz); if(g.grid[y][x]===0){g.grid[y][x]=pick(habTiles);n++;} }
    _showMsg('MIGRATION WAVE — BIRDS ARRIVE','#88ffaa',55);
  } else if (event === 'mycelium_growth') {
    // Mycelium Depths: spread ENERGY_NODE / GROUNDING tiles around player
    for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++) {
      const ny=g.player.y+dy, nx=g.player.x+dx;
      if (ny>=0&&ny<sz&&nx>=0&&nx<sz&&g.grid[ny][nx]===T.VOID&&Math.random()<0.3) {
        g.grid[ny][nx] = Math.random()<0.5 ? T.ENERGY_NODE : T.GROUNDING;
      }
    }
    _showMsg('MYCELIUM GROWS…','#88ddaa',50);
  } else if (event === 'structure_reveal') {
    // Ancient Structure: reveal HIDDEN→INSIGHT; spawn COVER + MEMORY tiles
    let n=0;
    for (let y=0;y<sz&&n<4;y++) for (let x=0;x<sz&&n<4;x++) {
      if (g.grid[y][x]===T.HIDDEN) { g.grid[y][x]=T.INSIGHT; n++; }
    }
    let m=0,itr=0; while(m<3&&itr<999){itr++;const y=rnd(sz),x=rnd(sz);if(g.grid[y][x]===T.VOID){g.grid[y][x]=Math.random()<0.5?T.COVER:T.MEMORY;m++;}}
    _showMsg('ANCIENT STRUCTURE REVEALS…','#aa88cc',50);
  } else if (event === 'solar_pulse') {
    // Solar Temple: ENERGY_NODE tiles pulse outward, RAGE→PEACE in ring around player
    for (let dy=-3;dy<=3;dy++) for (let dx=-3;dx<=3;dx++) {
      const ny=g.player.y+dy, nx=g.player.x+dx;
      if (ny>=0&&ny<sz&&nx>=0&&nx<sz&&g.grid[ny][nx]===T.RAGE) g.grid[ny][nx]=T.PEACE;
    }
    let n=0,itr=0; while(n<3&&itr<999){itr++;const y=rnd(sz),x=rnd(sz);if(g.grid[y][x]===T.VOID){g.grid[y][x]=T.ENERGY_NODE;n++;}}
    _showMsg('SOLAR PULSE — fire transforms rage','#ff8800',55);
  } else if (event === 'ocean_surge') {
    // Deep Ocean: BREATH_SYNC tiles surge; DESPAIR→HOPELESS→BREATH_SYNC wave
    for (let y=0;y<sz;y++) {
      if (Math.random()<0.25) {
        for (let x=0;x<sz;x++) {
          if (g.grid[y][x]===T.DESPAIR) g.grid[y][x]=T.BREATH_SYNC;
        }
      }
    }
    _showMsg('OCEAN SURGE — breathe through the wave','#0088ff',55);
  } else if (event === 'crystal_resonance') {
    // Crystal Cave: HIDDEN→INSIGHT; INSIGHT tiles pulse; MEMORY nodes appear
    let n=0;
    for (let y=0;y<sz&&n<5;y++) for (let x=0;x<sz&&n<5;x++) {
      if (g.grid[y][x]===T.HIDDEN){g.grid[y][x]=T.INSIGHT;n++;}
    }
    let m=0,itr=0; while(m<2&&itr<999){itr++;const y=rnd(sz),x=rnd(sz);if(g.grid[y][x]===T.VOID){g.grid[y][x]=T.MEMORY;m++;}}
    _showMsg('CRYSTAL RESONANCE — truth surfaces','#88ccff',50);
  } else if (event === 'wind_drift') {
    // Cloud City: random gentle nudge + BODY_SCAN tiles appear
    const dir=[[-1,0],[1,0],[0,-1],[0,1]][rnd(4)];
    const ny=g.player.y+dir[0], nx=g.player.x+dir[1];
    if (ny>=0&&ny<sz&&nx>=0&&nx<sz&&g.grid[ny][nx]!==T.WALL){g.player.y=ny;g.player.x=nx;}
    let n=0,itr=0; while(n<3&&itr<999){itr++;const y=rnd(sz),x=rnd(sz);if(g.grid[y][x]===T.VOID){g.grid[y][x]=T.BODY_SCAN;n++;}}
    _showMsg('WIND DRIFT — rise above','#aaddff',45);
  } else if (event === 'void_expansion') {
    // Void Nexus: VOID tiles expand; some hazards vanish; INSIGHT appears
    let ni=0,itr=0; while(ni<3&&itr<999){itr++;const y=rnd(sz),x=rnd(sz);if(g.grid[y][x]===T.VOID){g.grid[y][x]=T.INSIGHT;ni++;}}
    for (let y=0;y<sz;y++) for (let x=0;x<sz;x++) {
      if ([T.PAIN,T.HOPELESS].includes(g.grid[y][x])&&Math.random()<0.3) g.grid[y][x]=T.VOID;
    }
    _showMsg('VOID EXPANSION — dissolution is not death','#cc88ff',55);
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
  // Apply cosmology data for display
  g.cosmology = getCosmologyForDreamscape(ds.id);
  // Apply active play mode
  applyPlayMode(g, CFG.playMode || 'arcade');
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
    game = null;
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
  // Phase 6-8: start learning & session tracking
  vocabularyEngine.resetSession();
  selfReflection.resetSession();
  emergenceIndicators.resetSession();
  sessionTracker.startSession();
  patternRecognition.onScoreChange(0);
  // Phase 9: reset intelligence systems
  logicPuzzles.resetSession();
  strategicThinking.resetSession();
  empathyTraining.resetSession();
  emotionRecognition.resetSession();
  // Phase 2.5: reset dream yoga
  dreamYoga.resetSession();
  // Phase M3: start tutorial for first dreamscape
  campaignManager.startTutorial(CFG.dreamIdx);
  // Phase M5: reset RPG session
  characterStats.resetSession();
  archetypeDialogue.reset();
  bossSystem.reset();
  alchemySystem.resetSession();
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

function nextDreamscape() {
  const g = game;
  const nextIdx = (CFG.dreamIdx + 1) % DREAMSCAPES.length;
  CFG.dreamIdx = nextIdx; window._dreamIdx = nextIdx;
  pushDreamHistory(g.ds.id);
  sfxManager.playDreamComplete();
  sessionTracker.onDreamscapeComplete();
  // Phase 8: get a reflection prompt for the completed dreamscape
  const prompt = selfReflection.getPrompt(g.ds.emotion);
  const affirmation = selfReflection.getAffirmation();
  // Phase 6: show a vocabulary word on the interlude screen
  const vocabWord = vocabularyEngine.getInterludeWord(g.ds.emotion);
  // Phase 8: record emergence events
  emergenceIndicators.record('dream_completion');
  if (prompt.depth === 'mid' || prompt.depth === 'deep') emergenceIndicators.record('reflection_depth');
  // Phase 6: record vocabulary growth
  if (vocabularyEngine.sessionCount >= 8) emergenceIndicators.record('vocabulary_growth');
  // Phase 9: surface sequence challenge + empathy reflection
  logicPuzzles.onDreamscapeComplete(CFG.dreamIdx);
  const empathyReflection = empathyTraining.getReflection();
  // Phase M3: campaign completion
  const milestone = campaignManager.onDreamscapeComplete(g.ds.id % DREAMSCAPES.length, g.score);
  // Phase M5: RPG — reward XP on dreamscape completion
  characterStats.onDreamComplete();
  // Quest: dream completion
  questSystem.onDreamComplete(g.ds.id);
  // Boss system: reset on dreamscape change
  bossSystem.reset();

  // Pre-build next game immediately so it is ready when the player dismisses the interlude.
  // Storing it in interludeState avoids any setTimeout race conditions.
  resizeCanvas();
  const nextGame = initGame(nextIdx, g.score + 400 + g.level * 60, g.level, g.hp);
  nextGame.msg = DREAMSCAPES[nextIdx].name; nextGame.msgColor = '#ffdd00'; nextGame.msgTimer = 90;

  // Boss spawn: integration/ancient_structure/void_nexus get bosses
  if (DREAMSCAPES[nextIdx].id === 'integration' && !nextGame.boss) {
    bossSystem.spawnBossForGame(nextGame, 'integration_master');
    sfxManager.playBossEnter();
  } else if (DREAMSCAPES[nextIdx].id === 'ancient_structure' && !nextGame.boss) {
    bossSystem.spawnBossForGame(nextGame, 'void_keeper');
    sfxManager.playBossEnter();
  } else if (DREAMSCAPES[nextIdx].id === 'void_nexus' && !nextGame.boss) {
    bossSystem.spawnBossForGame(nextGame, 'fear_guardian');
    sfxManager.playBossEnter();
  }

  interludeState = {
    text: g.ds.completionText,
    subtext: DREAMSCAPES[nextIdx].narrative,
    elapsed: 0,
    duration: INTERLUDE_DURATION_MS,
    minAdvanceMs: INTERLUDE_MIN_ADVANCE_MS,
    ds: DREAMSCAPES[nextIdx],
    nextGame,
    reflectionPrompt: prompt,
    affirmation,
    vocabWord,
    empathyReflection,
    milestone,
  };
  setPhase('interlude');
}

// Transition out of the interlude into the pre-built next game.
function _advanceFromInterlude() {
  if (phase !== 'interlude') return;
  if (!interludeState.nextGame) return; // safety guard
  game = interludeState.nextGame;
  campaignManager.startTutorial(CFG.dreamIdx);
  setPhase('playing');
}

function buyUpgrade(id) {
  const up = UPGRADE_SHOP.find(u => u.id === id);
  if (!up || insightTokens < up.cost || checkOwned(id)) return;
  spendInsightTokens(up.cost); window._insightTokens = insightTokens;
  strategicThinking.onTokenSpent(id);  // Phase 9: track resource investment
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
  const dt = Math.min(ts - prevTs, 100); prevTs = ts; // cap at 100 ms to absorb tab-switch spikes
  const w = CW(), h = CH();

  if (phase === 'onboarding')  { drawOnboarding(ctx, w, h, onboardState); animId=requestAnimationFrame(loop); return; }
  if (phase === 'langopts')    { drawLanguageOptions(ctx, w, h, langOptState); animId=requestAnimationFrame(loop); return; }
  if (phase === 'howtoplay')   { drawHowToPlay(ctx, w, h); animId=requestAnimationFrame(loop); return; }
  if (phase === 'title')       { drawTitle(ctx, w, h, backgroundStars, ts, CURSOR.menu, gameMode); animId=requestAnimationFrame(loop); return; }
  if (phase === 'dreamselect') { drawDreamSelect(ctx, w, h, CFG.dreamIdx); animId=requestAnimationFrame(loop); return; }
  if (phase === 'options')     { drawOptions(ctx, w, h, CURSOR.opt); animId=requestAnimationFrame(loop); return; }
  if (phase === 'highscores')  { drawHighScores(ctx, w, h, highScores); animId=requestAnimationFrame(loop); return; }
  if (phase === 'upgrade')     { drawUpgradeShop(ctx, w, h, CURSOR.shop, insightTokens, checkOwned); animId=requestAnimationFrame(loop); return; }
  if (phase === 'dead')        { drawDead(ctx, w, h, deadGame, highScores, dreamHistory, insightTokens, sessionRep); animId=requestAnimationFrame(loop); return; }
  if (phase === 'paused')      { drawPause(ctx, w, h, game, CURSOR.pause); animId=requestAnimationFrame(loop); return; }
  if (phase === 'interlude') {
    interludeState.elapsed = (interludeState.elapsed || 0) + dt;
    drawInterlude(ctx, w, h, interludeState, ts);
    if (interludeState.elapsed >= interludeState.duration) _advanceFromInterlude();
    animId = requestAnimationFrame(loop); return;
  }

  // ── Shooter mode ─────────────────────────────────────────────────────
  if (gameMode === 'shooter') {
    // Expose shooter state for pause menu display
    window._shooterState = { wave: shooterMode.wave, score: shooterMode.player.score, health: Math.round(shooterMode.player.health) };
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

  // ── Play Mode: Speedrun countdown ───────────────────────────────────
  if (game.speedrunActive && game.speedrunTimer > 0) {
    game.speedrunTimer -= dt;
    window._speedrunTimer = game.speedrunTimer;
    if (game.speedrunTimer <= 0) {
      _showMsg('TIME\'S UP!', '#ff4422', 60);
      game.speedrunTimer = 0; game.speedrunActive = false;
      game.hp = 0; // end run
    }
  }

  // ── Play Mode: Zen auto-heal ─────────────────────────────────────────
  if (game.autoHealRate > 0) {
    game.hp = Math.min(UPG.maxHp, game.hp + game.autoHealRate * dt / 1000);
  }

  // ── Dream Yoga: tick + expose to renderer ───────────────────────────
  dreamYoga.tick(dt);
  window._dreamYoga = {
    lucidity:  dreamYoga.lucidity,
    rcActive:  dreamYoga.rcActive,
    rcPrompt:  dreamYoga.rcPrompt,
    rcAlpha:   dreamYoga.rcAlpha,
    topSign:   dreamYoga.topDreamSign,
    checks:    dreamYoga.totalChecks,
  };
  if (dreamYoga.lucidity >= 50) questSystem.onLucidityReached();

  const MOVE_DELAY = UPG.moveDelay * (game.slowMoves ? 1.5 : 1) * (game.ritualSlowMul || 1);
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
      // Phase 6: teach vocabulary on tile step (before move consumes the tile)
      if (targetTile > 0) {
        const vword = vocabularyEngine.onTileStep(targetTile, game.ds.emotion);
        if (vword) window._vocabWord = vword; // immediately expose (tick will handle fade)
        // Phase 6: pattern recognition on peace collect
        if (targetTile === 4) { // T.PEACE
          patternRecognition.onPeaceCollected(game.peaceLeft);
          dreamYoga.onPeaceCollect();
          questSystem.onPeaceCollect();
        }
        // Phase 8: Record emergence events on tile step
        if (targetTile === 6) { emergenceIndicators.record('insight_accumulation'); dreamYoga.onInsightCollect(); questSystem.onInsightCollect(); }
        if (targetTile === 4 && UPG.comboCount >= 4) emergenceIndicators.record('peace_chain'); // T.PEACE
        // Sigil system: show sigil on INSIGHT(6), ARCHETYPE(11), PEACE(4), MEMORY(15), GLITCH(10)
        if ([4, 6, 10, 11, 15].includes(targetTile)) {
          const sigil = sigilSystem.onSpecialTile(targetTile, adaptiveDifficulty.tier.vocabTier || 'advanced');
          if (sigil) { window._activeSigil = sigil; window._sigilAlpha = 1; }
        }
        // Dream yoga: record dream sign for every special tile
        dreamYoga.onTileStep(targetTile);
        // Quest: somatic tile hooks
        if (targetTile === T.BODY_SCAN)    questSystem.onBodyScanTile();
        if (targetTile === T.BREATH_SYNC)  questSystem.onBreathSyncTile();
        if (targetTile === T.ENERGY_NODE)  questSystem.onEnergyNodeTile();
        if (targetTile === T.GROUNDING)    questSystem.onGroundingTile();
        // Alchemy: collect element seed when stepping on element tile
        // Ritual Space mode doubles the seed yield
        if (TILE_ELEMENT_MAP[targetTile]) {
          const seedCount = game.ritualSeedMultiplier || 1;
          const seedResult = alchemySystem.onElementTile(targetTile, seedCount);
          if (seedResult) {
            const ed = seedResult.elementDef;
            _showMsg(ed.symbol + '  ' + ed.name + ' SEED ×' + seedResult.seeds + (seedCount > 1 ? ' (×2 ritual)' : ''), ed.color, 50);
          }
        }
      }
      // Phase 9: track move mindfulness
      const wasPreviewActive = consequencePreview.active && consequencePreview.ghostPath.length > 0;
      const wasImpulseActive = !!impulseBuffer.activeDirection;
      if (wasPreviewActive || wasImpulseActive) {
        strategicThinking.onMindfulMove(); characterStats.onMindfulMove();
        questSystem.onPreviewMove();
        alchemySystem.onMindfulMove(); // ether charge
      } else strategicThinking.onImpulsiveMove();
      logicPuzzles.onMove(wasPreviewActive, wasImpulseActive);
      // Phase M5: RPG stat events on each move
      const _prevLevel = characterStats.level;
      if (targetTile === 6) characterStats.onInsightCollect();                         // T.INSIGHT
      if (SOMATIC_TILES.has(targetTile)) characterStats.onEmbodimentTile();            // somatic tiles
      // Award hazard-survival XP when player moves to a safe tile while enemies are nearby
      if (targetTile === 0 || targetTile === 4) {   // T.VOID or T.PEACE
        const nearbyEnemies = game.enemies.filter(e =>
          Math.abs(e.y - game.player.y) + Math.abs(e.x - game.player.x) <= 2).length;
        if (nearbyEnemies > 0) characterStats.onHazardSurvived();
      }
      if (characterStats.level > _prevLevel) {
        sfxManager.playLevelUp();
        _showMsg('LEVEL UP!  RPG·' + characterStats.level, '#ffdd88', 90);
      }
      // Quest: ×4 combo check
      if (UPG.resonanceMultiplier >= 4) questSystem.onComboX4();
      sfxManager.resume();
      if (targetTile === 4)              sfxManager.playPeaceCollect();   // T.PEACE
      else if (targetTile === 6)         sfxManager.playInsightCollect(); // T.INSIGHT
      else if (SOMATIC_TILES.has(targetTile)) sfxManager.playSomaticTile();   // somatic
      else if (HAZARD_TILES.has(targetTile))  sfxManager.playDamage();        // hazards
      // Quest flash → play quest SFX exactly once on new quest completion
      if (window._questFlash?.playSound) {
        sfxManager.playQuestComplete();
        window._questFlash.playSound = false;
      }
      // Play Mode: count moves for puzzle mode
      if (game.moveLimit) {
        game.movesRemaining = Math.max(0, (game.movesRemaining || game.moveLimit) - 1);
        window._movesRemaining = game.movesRemaining;
        if (game.movesRemaining === 0 && game.peaceLeft > 0) {
          _showMsg('OUT OF MOVES!', '#ff8800', 60);
          game.hp = 0; // end run
        }
      }
      tryMove(game, dy, dx, matrixActive, nextDreamscape, _showMsg, insightTokens,
        (n) => { while (insightTokens < n) addInsightToken(); window._insightTokens = insightTokens; });
      lastMove = ts;
      impulseBuffer.reset();
    }
  } else if (!activeDir) {
    // Phase 9: track impulse cancellations (buffer was active, key released)
    if (impulseBuffer.activeDirection) strategicThinking.onImpulseCancel();
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
  const _hpBeforeEnemies = game.hp;
  // Play mode: scale enemy timing by enemySpeedMul (zenMode enemies already cleared)
  if (!game.zenMode) {
    const eSpeedDt = dt * (game.enemySpeedMul || 1);
    stepEnemies(game, eSpeedDt, keys, matrixActive, hallucinations, _showMsg, setEmotion);
  }
  // Phase 9: track damage events for strategic analysis
  if (game.hp < _hpBeforeEnemies) {
    strategicThinking.onDamage(matrixActive);
    dreamYoga.onHazardHit();
  }

  // ── Phase 6: Learning Systems tick ─────────────────────────────────
  vocabularyEngine.tick();
  const _prevPatterns = patternRecognition.sessionCount;
  patternRecognition.tick();
  patternRecognition.checkScore(game.score);
  // Phase 9: propagate pattern discovery to logic puzzle IQ tracker
  if (patternRecognition.sessionCount > _prevPatterns) logicPuzzles.onPatternDiscovered();

  // ── Language System: upgrade active vocab word to multilingual ──────
  const rawVocab = vocabularyEngine.activeWord;
  const vocabTier = adaptiveDifficulty.tier.vocabTier || 'advanced';
  let displayVocab = rawVocab;
  if (rawVocab && languageSystem.targetLang !== languageSystem.nativeLang) {
    const tileType = rawVocab.tileType || 4;
    const multiWord = languageSystem.getWordForTile(tileType, vocabTier);
    if (multiWord) {
      multiWord.tileType = tileType;
      // Record word as seen for progressive unlock
      languageSystem.onWordSeen(multiWord.id, languageSystem.targetLang);
      displayVocab = multiWord;
    }
  }
  window._vocabWord      = displayVocab;
  window._patternBanner  = patternRecognition.activeBanner;
  window._learnStats     = {
    words: vocabularyEngine.sessionCount,
    patterns: patternRecognition.sessionCount,
    langWords: languageSystem.targetWordCount,
    targetLang: languageSystem.targetLangMeta?.name || '',
  };

  // ── Sigil system tick + trigger on special tiles ─────────────────────
  sigilSystem.tick();
  window._activeSigil = sigilSystem.activeSigil;
  window._sigilAlpha  = sigilSystem.displayAlpha;

  // ── Phase 7: Session tracker + urge management tick ────────────────
  sessionTracker.tick();
  urgeManagement.tick(dt / 1000);
  window._sessionWellness = sessionTracker.wellness;
  window._sessionDuration = sessionTracker.durationFormatted;
  if (sessionTracker.hasPendingSuggestion && phase === 'playing') {
    const sug = sessionTracker.consumeSuggestion();
    if (sug) _showMsg(sug.msg, '#aaffcc', 160);
  }

  // ── Phase 8: Awareness — emergence indicators tick ─────────────────
  emergenceIndicators.tick();
  window._emergence = {
    level:   emergenceIndicators.emergenceLevel,
    label:   emergenceIndicators.levelLabel,
    flash:   emergenceIndicators.newFlash,
    alpha:   emergenceIndicators.flashAlpha,
    session: emergenceIndicators.sessionScore,
  };

  // ── Phase 10: Chakra system tick ────────────────────────────────────
  chakraSystem.update(emotionalField);
  chakraSystem.tick();
  window._chakra = {
    dominant: chakraSystem.dominant,
    openness: chakraSystem.openness,
    kundalini: chakraSystem.kundalini,
    flash: chakraSystem.flashChakra,
    alpha: chakraSystem.flashAlpha,
  };
  // ── Phase 11: Dashboard data feed ───────────────────────────────────
  window._emergenceAllTime = emergenceIndicators.allTimeCount;
  window._reflections      = selfReflection.totalReflections;
  window._chakraAwakened   = chakraSystem.awakenedCount;
  window._learnStats       = {
    words: vocabularyEngine.sessionCount,
    totalWords: vocabularyEngine.totalCount,
    patterns: patternRecognition.sessionCount,
  };
  window._trackerData = {
    todayCount:    sessionTracker.sessionsTodayCount,
    totalTime:     sessionTracker.totalPlayTimeFormatted,
    totalSessions: sessionTracker.sessionHistory.length,
  };
  window._dreamscapesThisSession = sessionTracker.dreamscapesCompleted;

  // ── Phase 9: Intelligence Enhancement tick ──────────────────────────
  logicPuzzles.tick();
  empathyTraining.tick();
  emotionRecognition.tick();
  // EQ observation: feed dominant emotion to emotion-recognition
  const domEmo = emotionalField.getDominantEmotion();
  emotionRecognition.observe(domEmo.id, domEmo.value, matrixActive);
  // Expose intelligence data to window for dashboard + renderer
  window._iqData = {
    iqScore:          logicPuzzles.iqScore,
    strategicScore:   strategicThinking.strategicScore,
    eqScore:          emotionRecognition.eqScore,
    empathyScore:     empathyTraining.empathyScore,
    challenge:        logicPuzzles.activeChallenge,
    challengeAlpha:   logicPuzzles.challengeAlpha,
    strategicTip:     strategicThinking.coachingTip,
    eqInsight:        emotionRecognition.currentInsight,
    flashEmotion:     empathyTraining.flashEmotion,
    empathyAlpha:     empathyTraining.flashAlpha,
    compassPhrase:    empathyTraining.compassPhrase,
    eqFlash:          emotionRecognition.flashLabel,
    eqFlashAlpha:     emotionRecognition.flashAlpha,
    behaviorsWitnessed: empathyTraining.behaviorsWitnessed,
  };
  // Campaign tutorial hints
  window._tutorialHints = campaignManager.getTutorialHints(CFG.dreamIdx);
  campaignManager.tickTutorial();
  const _at = campaignManager.activeTutorial;
  window._currentTutorialHint = _at
    ? { text: _at.hints[_at.index], timer: _at.timer, total: _at.hints.length, index: _at.index }
    : null;
  window._campaignTotal = campaignManager.totalComplete;

  // Phase M5: RPG character stats + archetype dialogue
  characterStats.tick();
  archetypeDialogue.tick();
  // Trigger archetype dialogue if archetype tile was just activated
  if (game.lastArchetypeActivated) {
    archetypeDialogue.onArchetypeCollect(game.lastArchetypeActivated);
    questSystem.onArchetypeActivated();
    game.lastArchetypeActivated = null;
  }
  window._archetypeDialogue = archetypeDialogue.active;
  window._characterStats    = characterStats.statObj;

  // ── Phase M3.5: Boss System tick ────────────────────────────────────
  if (game.boss) {
    const _wasBossAlive = game.boss.hp > 0;
    bossSystem.update(game, dt, sfxManager, _showMsg, burst);
    if (_wasBossAlive && game.boss.hp <= 0) {
      questSystem.onBossSurvived();
      emergenceIndicators.record('dream_completion'); // boss defeat = emergence event
    }
  }
  // ── Quest system tick ────────────────────────────────────────────────
  questSystem.tick();
  // ── Alchemy system tick ──────────────────────────────────────────────
  alchemySystem.tick();

  // ── Expose all system data to window globals (grouped) ──────────────
  window._questData     = questSystem.getAllProgress();
  window._alchemy = {
    seeds:               alchemySystem.seeds,
    seedsDisplay:        alchemySystem.seedsDisplay,
    phase:               alchemySystem.phase,
    transmutations:      alchemySystem.transmutations,
    stones:              alchemySystem.philosopherStones,
    classicElements:     alchemySystem.classicElementsUsed,
    active:              game.playModeId === 'alchemist' || game.playModeId === 'ritual_space',
  };
  window._playModeLabel = game.playModeLabel || null;

  if (game.hp <= 0) {
    sfxManager.playDeath();
    deadGame = game; // snapshot for death screen
    sessionTracker.endSession(game.score, sessionTracker.dreamscapesCompleted);
    saveScore(game.score, game.level, game.ds);
    setPhase('dead'); animId=requestAnimationFrame(loop); return;
  }

  drawGame(ctx, ts, game, matrixActive, backgroundStars, visions, hallucinations, anomalyActive, anomalyData, glitchFrames, DPR, consequencePreview.getGhostPath());
  // Phase 11: Draw dashboard overlay if visible
  if (dashboard.visible) drawDashboard(ctx, CW(), CH());
  animId = requestAnimationFrame(loop);
}

// ─── Input ───────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  keys.add(e.key);

  // ── Onboarding screen ───────────────────────────────────────────────
  if (phase === 'onboarding') {
    const AGE_OPTS_N = 5;
    const path = LANGUAGE_PATHS[LANG_LIST[onboardState.nativeIdx] || 'en'] || LANGUAGE_PATHS.en;
    if (e.key === 'ArrowUp') {
      if (onboardState.step === 0) onboardState.ageIdx = (onboardState.ageIdx - 1 + AGE_OPTS_N) % AGE_OPTS_N;
      else if (onboardState.step === 1) onboardState.nativeIdx = (onboardState.nativeIdx - 1 + LANG_LIST.length) % LANG_LIST.length;
      else if (onboardState.step === 2) onboardState.targetIdx = (onboardState.targetIdx - 1 + Math.min(8, path.length)) % Math.min(8, path.length);
      sfxManager.resume(); sfxManager.playMenuNav();
    }
    if (e.key === 'ArrowDown') {
      if (onboardState.step === 0) onboardState.ageIdx = (onboardState.ageIdx + 1) % AGE_OPTS_N;
      else if (onboardState.step === 1) onboardState.nativeIdx = (onboardState.nativeIdx + 1) % LANG_LIST.length;
      else if (onboardState.step === 2) onboardState.targetIdx = (onboardState.targetIdx + 1) % Math.min(8, path.length);
      sfxManager.resume(); sfxManager.playMenuNav();
    }
    if (e.key === 'Enter') {
      sfxManager.resume(); sfxManager.playMenuSelect();
      if (onboardState.step < 3) {
        onboardState.step++;
      } else {
        // Confirm: save profile
        const AGE_TIERS = ['tiny','gentle','explorer','standard','standard'];
        const ageKey  = ['child5','child8','teen12','teen16','adult'][onboardState.ageIdx] || 'adult';
        const tierKey = AGE_TIERS[onboardState.ageIdx] || 'standard';
        const nCode   = LANG_LIST[onboardState.nativeIdx] || 'en';
        const tCode   = path[onboardState.targetIdx] || path[0] || 'no';
        PLAYER_PROFILE.onboardingDone = true;
        PLAYER_PROFILE.ageGroup   = ageKey;
        PLAYER_PROFILE.diffTier   = tierKey;
        PLAYER_PROFILE.nativeLang = nCode;
        PLAYER_PROFILE.targetLang = tCode;
        savePlayerProfile();
        adaptiveDifficulty.setAgeGroup(ageKey);
        adaptiveDifficulty.setTier(tierKey);
        languageSystem.setNativeLang(nCode);
        languageSystem.setTargetLang(tCode);
        setPhase('title');
      }
    }
    if (e.key === 'Backspace' && onboardState.step > 0) onboardState.step--;
    if (e.key === 'Escape') { PLAYER_PROFILE.onboardingDone = true; savePlayerProfile(); setPhase('title'); }
    e.preventDefault(); return;
  }

  // ── Language options screen ─────────────────────────────────────────
  if (phase === 'langopts') {
    const nativeList = LANG_LIST;
    const targetPath = LANGUAGE_PATHS[LANG_LIST[langOptState.nativeIdx] || 'en'] || LANGUAGE_PATHS.en;
    const modeList   = ['native', 'bilingual', 'target'];
    if (e.key === 'ArrowUp')    { langOptState.row = (langOptState.row - 1 + 3) % 3; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key === 'ArrowDown')  { langOptState.row = (langOptState.row + 1) % 3; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key === 'ArrowLeft'||e.key === 'ArrowRight') {
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      if (langOptState.row === 0) langOptState.nativeIdx = (langOptState.nativeIdx + dir + nativeList.length) % nativeList.length;
      else if (langOptState.row === 1) langOptState.targetIdx = (langOptState.targetIdx + dir + Math.min(8, targetPath.length)) % Math.min(8, targetPath.length);
      else if (langOptState.row === 2) langOptState.modeIdx   = (langOptState.modeIdx   + dir + modeList.length) % modeList.length;
      sfxManager.resume(); sfxManager.playMenuNav();
    }
    if (e.key === 'Enter' || e.key === 'Escape') {
      // Save language selections
      const nCode = nativeList[langOptState.nativeIdx] || 'en';
      const tCode = targetPath[langOptState.targetIdx] || targetPath[0] || 'no';
      const mode  = modeList[langOptState.modeIdx] || 'bilingual';
      PLAYER_PROFILE.nativeLang = nCode; PLAYER_PROFILE.targetLang = tCode;
      savePlayerProfile();
      languageSystem.setNativeLang(nCode);
      languageSystem.setTargetLang(tCode);
      languageSystem.setDisplayMode(mode);
      setPhase(CURSOR.optFrom === 'paused' ? 'paused' : 'title');
    }
    e.preventDefault(); return;
  }

  if (phase === 'howtoplay') {
    if (e.key === 'Enter' || e.key === 'Escape') {
      sfxManager.resume();
      setPhase('title');
      CURSOR.menu = 2;
    }
    e.preventDefault(); return;
  }

  // Interlude: player can advance once minimum display time has elapsed
  if (phase === 'interlude') {
    if ((e.key === 'Enter' || e.key === ' ') && (interludeState.elapsed || 0) >= (interludeState.minAdvanceMs || INTERLUDE_MIN_ADVANCE_MS)) {
      sfxManager.resume();
      _advanceFromInterlude();
    }
    e.preventDefault(); return;
  }
  if (phase === 'title') {
    if (e.key==='ArrowUp')   { CURSOR.menu=(CURSOR.menu-1+6)%6; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.menu=(CURSOR.menu+1)%6; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='m'||e.key==='M') {
      gameMode = gameMode === 'grid' ? 'shooter' : 'grid';
      sfxManager.resume(); sfxManager.playMatrixSwitch(gameMode === 'grid');
    }
    if (e.key==='Enter'||e.key===' ') {
      sfxManager.resume(); sfxManager.playMenuSelect();
      if (CURSOR.menu===0)      startGame(CFG.dreamIdx);
      else if (CURSOR.menu===1) setPhase('dreamselect');
      else if (CURSOR.menu===2) setPhase('howtoplay');
      else if (CURSOR.menu===3) { CURSOR.opt=0; CURSOR.optFrom='title'; setPhase('options'); }
      else if (CURSOR.menu===4) setPhase('highscores');
      else if (CURSOR.menu===5) { CURSOR.shop=0; CURSOR.upgradeFrom='title'; setPhase('upgrade'); }
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
    if (e.key==='ArrowUp')   { CURSOR.opt=(CURSOR.opt-1+6)%6; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowDown') { CURSOR.opt=(CURSOR.opt+1)%6; sfxManager.resume(); sfxManager.playMenuNav(); }
    if (e.key==='ArrowLeft'||e.key==='ArrowRight') {
      const dir=e.key==='ArrowLeft'?-1:1;
      if(CURSOR.opt===0){const i=['small','medium','large'].indexOf(CFG.gridSize);CFG.gridSize=['small','medium','large'][(i+dir+3)%3];}
      else if(CURSOR.opt===1){const i=['easy','normal','hard'].indexOf(CFG.difficulty);CFG.difficulty=['easy','normal','hard'][(i+dir+3)%3];}
      else if(CURSOR.opt===2) CFG.particles=!CFG.particles;
      else if(CURSOR.opt===3) {  // PLAY STYLE cycling
        const i=PLAY_MODE_LIST.indexOf(CFG.playMode||'arcade');
        CFG.playMode=PLAY_MODE_LIST[(i+dir+PLAY_MODE_LIST.length)%PLAY_MODE_LIST.length];
      }
      sfxManager.resume(); sfxManager.playMenuNav();
    }
    if (e.key==='Enter') {
      if(CURSOR.opt===4) { setPhase('langopts'); }  // Language settings
      else if(CURSOR.opt===5) setPhase(CURSOR.optFrom==='paused' ? 'paused' : 'title');
    }
    if (e.key==='Escape') setPhase(CURSOR.optFrom==='paused' ? 'paused' : 'title');
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
    // B key: cycle breathing patterns (Phase 7)
    if (e.key==='b'||e.key==='B') {
      const patterns = ['box', '4-7-8', 'coherent'];
      if (!urgeManagement.isActive) {
        urgeManagement.start('box');
      } else {
        const next = patterns[(patterns.indexOf(urgeManagement.patternKey) + 1) % patterns.length];
        if (next === 'box') urgeManagement.stop();
        else urgeManagement.start(next);
      }
    }
    // Update breath state for pause menu renderer
    if (urgeManagement.isActive) {
      const ph = urgeManagement.currentPhase;
      window._breathState = {
        isActive: true, label: ph.label, color: ph.color,
        radius: urgeManagement.breathRadius, cycles: urgeManagement.cycleCount,
        phrase: urgeManagement.surfPhrase,
      };
    } else {
      window._breathState = { isActive: false };
    }
    if (e.key==='Enter') {
      if(CURSOR.pause===0) {
        if(gameMode==='shooter') shooterMode.paused=false;
        else { sessionTracker.resumeSession(); urgeManagement.stop(); }
        setPhase('playing');
      }
      else if(CURSOR.pause===1){CURSOR.opt=0; CURSOR.optFrom='paused'; setPhase('options');}
      else if(CURSOR.pause===2 && gameMode!=='shooter'){CURSOR.shop=0;CURSOR.upgradeFrom='paused';setPhase('upgrade');}
      else if(CURSOR.pause===2 && gameMode==='shooter'){ shooterMode.paused=false; setPhase('playing'); }
      else { if(gameMode==='shooter') shooterMode.paused=false; else { sessionTracker.endSession(0,0); } setPhase('title'); CURSOR.menu=0; game=null; }
    }
    if (e.key==='Escape') {
      if(gameMode==='shooter') { shooterMode.paused=false; setPhase('playing'); }
      else { sessionTracker.resumeSession(); urgeManagement.stop(); setPhase('playing'); }
    }
    e.preventDefault(); return;
  }
  if (phase === 'playing') {
    // Shooter mode: ESC pauses (not instant title exit)
    if (gameMode === 'shooter') {
      if (e.key==='Escape') { shooterMode.paused = true; CURSOR.pause=0; setPhase('paused'); }
      e.preventDefault(); return;
    }
    if (e.key==='Escape') { CURSOR.pause=0; sessionTracker.pauseSession(); emergenceIndicators.record('pause_frequency'); characterStats.onPauseUsed(); questSystem.onPause(); dashboard.hide(); setPhase('paused'); }
    if ((e.key==='h'||e.key==='H') && !e.repeat) dashboard.toggle();
    if (e.key==='Shift' && !e.repeat) {
      const next = matrixActive === 'A' ? 'B' : 'A';
      setMatrix(next); setMatrixHoldTime(0);
      sfxManager.resume(); sfxManager.playMatrixSwitch(next === 'A');
      questSystem.onMatrixSwitch();
      emergenceIndicators.record('matrix_mastery');
      logicPuzzles.onMatrixSwitch();  // Phase 9
      dreamYoga.onMatrixSwitch();     // Phase 2.5
      const lbl = next==='A'?'MATRIX·A  ⟨ERASURE⟩':'MATRIX·B  ⟨COHERENCE⟩';
      const col = next==='A'?'#ff0055':'#00ff88';
      _showMsg(lbl, col, 55);
      if (CFG.particles) burst(game, game.player.x, game.player.y, col, 22, 4);
    }
    // Dream yoga: any key dismisses the reality check prompt
    if (dreamYoga.rcActive && !e.repeat) {
      dreamYoga.acknowledgeRealityCheck();
      _showMsg('REALITY CHECK ✓ +LUCIDITY', '#aaddff', 45);
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
      if (UPG.freeze && UPG.freezeTimer<=0) {
        UPG.freezeTimer=2500; _showMsg('FREEZE ACTIVE!','#0088ff',50); burst(game,game.player.x,game.player.y,'#0088ff',20,4);
        strategicThinking.onFreezeUsed();  // Phase 9
        characterStats.onFreezeUsed();    // Phase M5
        // Phase 9: empathy — stun enemies' behaviors
        if (game.enemies && game.enemies.length > 0) {
          const randEnemy = game.enemies[Math.floor(Math.random() * game.enemies.length)];
          empathyTraining.onEnemyStunned(randEnemy.behavior || randEnemy.type || 'rush');
        }
      }
    }
    // Alchemy transmutation — X key: cycle elements and transmute
    // Available in Alchemist mode and Ritual Space mode
    if ((e.key==='x'||e.key==='X') && !e.repeat && (game.playModeId === 'alchemist' || game.playModeId === 'ritual_space')) {
      const seeds = alchemySystem.seeds;
      const elements = ['fire','water','earth','air','ether'];
      const ready = elements.find(el => seeds[el] >= 3);
      if (ready) {
        alchemySystem.tryTransmute(ready, game, burst, _showMsg);
        sfxManager.resume();
        // Philosopher's stone uses special grand chord; normal transmutation uses shimmer
        if (window._alchemyFlash?.stone) sfxManager.playPhilosopherStone();
        else sfxManager.playTransmutation();
      } else {
        const display = alchemySystem.seedsDisplay || 'none';
        _showMsg('⚗️  NEED 3 OF ONE ELEMENT  ·  seeds: ' + display, '#cc88ff', 50);
      }
    }
    if ((e.key==='c'||e.key==='C') && !e.repeat) {
      if (insightTokens>=2) {
        spendInsightTokens(2); window._insightTokens=insightTokens;
        if (!game.contZones) game.contZones=[];
        game.contZones.push({x:game.player.x,y:game.player.y,timer:240,maxTimer:240});
        strategicThinking.onContainmentZone();  // Phase 9
        characterStats.onContainmentUsed();     // Phase M5
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
// Show onboarding screen on first ever launch (no saved profile)
if (!PLAYER_PROFILE.onboardingDone) {
  setPhase('onboarding');
  onboardState.step = 0; onboardState.ageIdx = 4; onboardState.nativeIdx = 0; onboardState.targetIdx = 0;
}
animId = requestAnimationFrame(loop);
