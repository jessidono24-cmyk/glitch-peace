'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — campaign-manager.js — Phase M3: Campaign Structure
//  Manages sequential campaign progression, dreamscape unlocks, and
//  tutorial hints for first-time visits.  Freeplay (all dreamscapes
//  accessible) is preserved via Dream Select — campaign is opt-in.
// ═══════════════════════════════════════════════════════════════════════

// ─── Tutorial hints (shown on first visit, by dreamscape index) ──────
const TUTORIAL_HINTS = [
  // 0: Void State
  ['Move with WASD or Arrow Keys.', 'Collect ◈ PEACE tiles to advance.', 'Avoid red hazard tiles — they drain HP.'],
  // 1: Mountain Dragon Realm
  ['SHIFT toggles Matrix A/B. Matrix B (green) aids recovery.', 'Hold into a hazard tile for 1 second to pause and reconsider.', '◆ INSIGHT tiles restore energy — seek them.'],
  // 2: Courtyard of Ojos
  ['Consequence preview (ghost path) shows your next 3 steps.', 'Archetype ☆ tiles grant special powers — press J to activate.', 'ESC pauses anytime. You can always stop.'],
  // 3: Leaping Field  (no hints — player is learning)
  [],
  // 4: Summit
  [],
  // 5: Neighborhood
  [],
  // 6: Modern Bedroom
  [],
  // 7: Aztec Chase
  [],
  // 8: Orb Escape
  [],
  // 9: Integration
  ['You have reached Dreamscape Integration.', 'All systems are available — use them together.'],
];

// ─── Campaign milestone narratives ───────────────────────────────────
const MILESTONES = {
  1:  'First circuit complete. The signal strengthens.',
  3:  'Three loops traversed. The pattern becomes visible.',
  5:  'Halfway through. The observer notices the observer.',
  10: 'One full cycle complete. Integration begins.',
  25: 'Twenty-five journeys. The game is no longer the game.',
  50: 'Fifty completions. You are the dreamscape.',
};

// First three dreamscapes unlocked from the start in campaign mode
const INITIAL_UNLOCKED = [0, 1, 2];
const TOTAL_DREAMSCAPES = 10;
const STORAGE_KEY = 'gp_campaign';

export class CampaignManager {
  constructor() {
    this._data          = this._load();
    this._unlocked      = new Set(this._data.unlocked     || INITIAL_UNLOCKED);
    this._bestScores    = this._data.bestScores           || {};
    this._completions   = this._data.completions          || {};
    this._totalComplete = this._data.totalComplete        || 0;
    this._hintShown     = new Set(this._data.hintShown    || []);
    this._pendingMilestone = null;
    // Tutorial overlay state (active during first visits)
    this._activeTutorial = null; // { hints: [], index, timer }
  }

  // ─── Called when a dreamscape completes ──────────────────────────
  onDreamscapeComplete(dreamIdx, score) {
    this._completions[dreamIdx] = (this._completions[dreamIdx] || 0) + 1;
    this._totalComplete++;
    if (!this._bestScores[dreamIdx] || score > this._bestScores[dreamIdx]) {
      this._bestScores[dreamIdx] = score;
    }
    // Unlock the next dreamscape in sequence
    const nextIdx = (dreamIdx + 1) % TOTAL_DREAMSCAPES;
    this._unlocked.add(nextIdx);
    // Check milestone
    this._pendingMilestone = MILESTONES[this._totalComplete] || null;
    this._save();
    return this._pendingMilestone;
  }

  // ─── Tutorial hint management ─────────────────────────────────────
  startTutorial(dreamIdx) {
    if (this._hintShown.has(dreamIdx)) { this._activeTutorial = null; return; }
    const hints = TUTORIAL_HINTS[dreamIdx];
    if (!hints || hints.length === 0) { this._activeTutorial = null; return; }
    this._activeTutorial = { hints, index: 0, timer: 200, dreamIdx };
  }

  // ─── Tick tutorial overlay ────────────────────────────────────────
  tickTutorial() {
    if (!this._activeTutorial) return;
    this._activeTutorial.timer--;
    if (this._activeTutorial.timer <= 0) {
      this._activeTutorial.index++;
      if (this._activeTutorial.index >= this._activeTutorial.hints.length) {
        this._hintShown.add(this._activeTutorial.dreamIdx);
        this._activeTutorial = null;
        this._save();
      } else {
        this._activeTutorial.timer = 180;
      }
    }
  }

  // ─── Mark tutorial shown for a dreamscape ────────────────────────
  markTutorialShown(dreamIdx) {
    this._hintShown.add(dreamIdx);
    this._data.hintShown = [...this._hintShown];
    this._save();
  }

  // ─── Get first-visit hints (returns [] if already shown) ─────────
  getTutorialHints(dreamIdx) {
    if (this._hintShown.has(dreamIdx)) return [];
    return TUTORIAL_HINTS[dreamIdx] || [];
  }

  // ─── Campaign unlock check ────────────────────────────────────────
  isUnlocked(dreamIdx) { return this._unlocked.has(dreamIdx); }

  // ─── Accessors ────────────────────────────────────────────────────
  get activeTutorial()     { return this._activeTutorial; }
  get totalComplete()      { return this._totalComplete; }
  get unlockedCount()      { return this._unlocked.size; }
  get pendingMilestone()   { return this._pendingMilestone; }
  clearMilestone()         { this._pendingMilestone = null; }

  get progressSummary() {
    return {
      totalComplete: this._totalComplete,
      unlockedCount: this._unlocked.size,
      bestScores:    { ...this._bestScores },
      completions:   { ...this._completions },
    };
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    this._data = {
      unlocked:      [...this._unlocked],
      bestScores:    this._bestScores,
      completions:   this._completions,
      totalComplete: this._totalComplete,
      hintShown:     [...this._hintShown],
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); } catch (_) {}
  }

  _load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (_) { return {}; }
  }
}

export const campaignManager = new CampaignManager();
