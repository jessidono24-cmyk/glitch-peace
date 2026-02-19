'use strict';

// ═══════════════════════════════════════════════════════════
//  RUNTIME CONFIG  (user-adjustable)
// ═══════════════════════════════════════════════════════════
export const CFG = {
  gridSize:   'medium',
  difficulty: 'normal',
  particles:  true,
  dreamIdx:   0,
};

// ═══════════════════════════════════════════════════════════
//  SESSION STATE
// ═══════════════════════════════════════════════════════════
export let highScores   = [];
export let sessionRep   = 0;
export let insightTokens = 0;
export let dreamHistory  = [];
export let matrixActive  = 'B';
export let matrixHoldTime = 0;

export function setMatrix(m)             { matrixActive = m; }
export function setMatrixHoldTime(t)     { matrixHoldTime = t; }
export function addMatrixHoldTime(dt)    { matrixHoldTime += dt; }
export function addInsightToken(n=1)     { insightTokens += n; }
export function spendInsightTokens(n)    { insightTokens = Math.max(0, insightTokens - n); }
export function addSessionRep(n)         { sessionRep += n; }
export function pushDreamHistory(id)     { dreamHistory.push(id); }
export function setHighScores(arr)       { highScores = arr; }

export function resetSession() {
  sessionRep    = 0;
  insightTokens = 0;
  dreamHistory  = [];
  matrixActive  = 'B';
  matrixHoldTime = 0;
}

// ═══════════════════════════════════════════════════════════
//  UPGRADES / POWERS
// ═══════════════════════════════════════════════════════════
export const UPG = {
  maxHp: 100, moveDelay: 120,
  magnet: false, shield: false, shieldTimer: 0, shieldCount: 0,
  energyMax: 100, energy: 100,
  aura: false, freeze: false, freezeTimer: 0,
  particleColor: '#00ff88',
  archetypePower: null, archetypeDuration: 0,
  phaseShift: false, phaseTimer: 0,
  temporalRewind: false, rewindBuffer: [],
  glitchPulse: false, glitchPulseCharge: 0,
  resonanceMultiplier: 1, comboCount: 0,
  emotion: 'neutral', emotionTimer: 0,
};

export function resetUpgrades() {
  Object.assign(UPG, {
    maxHp:100, moveDelay:120, magnet:false, shield:false, shieldTimer:0, shieldCount:0,
    energyMax:100, energy:100, aura:false, freeze:false, freezeTimer:0,
    particleColor:'#00ff88', archetypePower:null, archetypeDuration:0,
    phaseShift:false, phaseTimer:0, temporalRewind:false, rewindBuffer:[],
    glitchPulse:false, glitchPulseCharge:0, resonanceMultiplier:1, comboCount:0,
    emotion:'neutral', emotionTimer:0,
  });
}

export function checkOwned(id) {
  const m = {
    maxhp:  UPG.maxHp > 100,
    speed:  UPG.moveDelay < 120,
    magnet: UPG.magnet,
    freeze: UPG.freeze,
    aura:   UPG.aura,
    energy: UPG.energyMax > 100,
    rewind: UPG.temporalRewind,
    pulse:  UPG.glitchPulse,
  };
  return m[id] || false;
}

// ═══════════════════════════════════════════════════════════
//  PURGATORY DEPTH
// ═══════════════════════════════════════════════════════════
export let purgDepth = 0;
export function setPurgDepth(v) { purgDepth = Math.max(0, Math.min(1, v)); }

// ═══════════════════════════════════════════════════════════
//  PHASE / SCREEN STATE
// ═══════════════════════════════════════════════════════════
export let phase = 'title';
export function setPhase(p) { phase = p; }

// Menu cursor positions
export const CURSOR = {
  menu:    0,
  opt:     0,
  pause:   0,
  shop:    0,
  dream:   0,
  upgradeFrom: 'title',
};
