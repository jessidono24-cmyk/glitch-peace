'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — archetype-dialogue.js — Phase M5: RPG Basics
//  Archetype NPCs speak when the player collects their tile.
//  Each archetype has 5 lines shown progressively across encounters.
//  All dialogue is therapeutic — affirming sovereignty, compassion.
//
//  Design law: sterilized wisdom framing; no dogma; player identity stable.
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'gp_archetype_encounters';

// 5 lines per archetype, indexed by encounter count (0–4, then cycling)
const DIALOGUE = {
  dragon: [
    'You have entered my domain. Show me your courage.',
    'Fear is the gatekeeper. Face it — I will stand beside you.',
    'The mountain tests those who wish to climb it. You are climbing.',
    'Your persistence has earned my respect, traveler.',
    'I see the sovereign emerging. The path ahead is yours.',
  ],
  child: [
    'Hi! I can see things you cannot yet. Follow me!',
    'This looks scary but I know a way through — I always do.',
    'The hidden things are not dangerous. They are curious.',
    'Seeing clearly is the best kind of power.',
    'You are getting better at seeing. I can tell.',
  ],
  orb: [
    'The membrane between worlds thins here.',
    'Phase through. You are not only what you appear to be.',
    'In the space between thoughts — there is a door.',
    'Movement through apparent solidity is remembering, not magic.',
    'You have passed through. The other side holds you now.',
  ],
  captor: [
    'You cannot escape the loop until you understand it.',
    'I am not your enemy. I am your teacher.',
    'The pattern repeats until the lesson is received.',
    'What keeps you here? Examine it without judgment.',
    'You have learned. The door was always open.',
  ],
  protector: [
    'I stand between you and that which would harm you.',
    'Safety is not the absence of danger — it is presence within it.',
    'The burst of light is my gift. Use it wisely.',
    'Protection and sovereignty are sisters — they walk together.',
    'You carry the protection now. It lives in you.',
  ],
};

export class ArchetypeDialogue {
  constructor() {
    this._encounters = this._load();
    this._current    = null;   // { key, text, alpha }
    this._alpha      = 0;
    this._timer      = 0;
    this._FADE_IN    = 15;
    this._HOLD       = 180;
    this._FADE_OUT   = 25;
    this._TOTAL      = this._HOLD + this._FADE_OUT;
  }

  // ─── Called from main.js after archetype tile collected ──────────
  onArchetypeCollect(archetypeKey) {
    const lines = DIALOGUE[archetypeKey];
    if (!lines) return;
    const count = this._encounters[archetypeKey] || 0;
    const text  = lines[count % lines.length];
    this._encounters[archetypeKey] = count + 1;
    this._current = { key: archetypeKey, text };
    this._timer   = this._TOTAL;
    this._alpha   = 0;
    this._save();
  }

  tick() {
    if (this._timer <= 0) { this._current = null; return; }
    this._timer--;
    // Fade-in over first FADE_IN frames
    if (this._timer > this._TOTAL - this._FADE_IN)
      this._alpha = Math.min(1, 1 - (this._timer - (this._TOTAL - this._FADE_IN)) / this._FADE_IN);
    // Steady-hold
    else if (this._timer > this._FADE_OUT) this._alpha = 1;
    // Fade-out
    else this._alpha = this._timer / this._FADE_OUT;
  }

  reset() {
    this._current = null; this._alpha = 0; this._timer = 0;
  }

  get active() {
    return (this._current && this._timer > 0)
      ? { key: this._current.key, text: this._current.text, alpha: this._alpha }
      : null;
  }

  // ─── Persistence ─────────────────────────────────────────────────
  _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._encounters)); } catch (_) {}
  }
  _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}; }
    catch (_) { return {}; }
  }
}

export const archetypeDialogue = new ArchetypeDialogue();
