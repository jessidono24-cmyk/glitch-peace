'use strict';

// ═══════════════════════════════════════════════════════════
//  TILE TYPE ENUM
// ═══════════════════════════════════════════════════════════
export const T = {
  VOID: 0, DESPAIR: 1, TERROR: 2, SELF_HARM: 3, PEACE: 4, WALL: 5,
  INSIGHT: 6, HIDDEN: 7, RAGE: 8, HOPELESS: 9, GLITCH: 10,
  ARCHETYPE: 11, TELEPORT: 12, COVER: 13, TRAP: 14, MEMORY: 15, PAIN: 16,
  // Phase 2.6: Embodiment / Somatic Tiles
  BODY_SCAN: 17, BREATH_SYNC: 18, ENERGY_NODE: 19, GROUNDING: 20,
};

// ═══════════════════════════════════════════════════════════
//  TILE DEFINITIONS  — dmg, spread, push, colors, symbol
// ═══════════════════════════════════════════════════════════
export const TILE_DEF = {
  [T.VOID]:     { dmg:0,  spread:false, push:0, bg:'#06060f', bd:'rgba(255,255,255,0.04)', glow:null,      sym:'' },
  [T.DESPAIR]:  { dmg:8,  spread:true,  push:0, bg:'#0d0d55', bd:'#1a1aff', glow:'#2233ff', sym:'↓' },
  [T.TERROR]:   { dmg:20, spread:false, push:0, bg:'#500000', bd:'#cc1111', glow:'#ff2222', sym:'!' },
  [T.SELF_HARM]:{ dmg:14, spread:false, push:0, bg:'#360000', bd:'#880000', glow:'#aa0000', sym:'✕' },
  [T.PEACE]:    { dmg:0,  spread:false, push:0, bg:'#002810', bd:'#00ff88', glow:'#00ffcc', sym:'◈' },
  [T.WALL]:     { dmg:0,  spread:false, push:0, bg:'#0e0e18', bd:'#252535', glow:null,      sym:'' },
  [T.INSIGHT]:  { dmg:0,  spread:false, push:0, bg:'#001a18', bd:'#00ddbb', glow:'#00ffee', sym:'◆' },
  [T.HIDDEN]:   { dmg:0,  spread:false, push:0, bg:'#04040a', bd:'rgba(0,200,100,0.08)', glow:null, sym:'' },
  [T.RAGE]:     { dmg:18, spread:false, push:2, bg:'#3a0010', bd:'#cc0044', glow:'#ff0066', sym:'▲' },
  [T.HOPELESS]: { dmg:12, spread:true,  push:0, bg:'#002040', bd:'#0044cc', glow:'#0066ff', sym:'~' },
  [T.GLITCH]:   { dmg:5,  spread:false, push:0, bg:'#1a0a1a', bd:'#aa00ff', glow:'#dd00ff', sym:'?' },
  [T.ARCHETYPE]:{ dmg:0,  spread:false, push:0, bg:'#0a1a0a', bd:'#ffdd00', glow:'#ffee44', sym:'☆' },
  [T.TELEPORT]: { dmg:0,  spread:false, push:0, bg:'#001820', bd:'#00aaff', glow:'#00ccff', sym:'⇒' },
  [T.COVER]:    { dmg:0,  spread:false, push:0, bg:'#101018', bd:'#446688', glow:null,      sym:'▪' },
  [T.TRAP]:     { dmg:16, spread:false, push:1, bg:'#1a0800', bd:'#cc6600', glow:'#ff8800', sym:'×' },
  [T.MEMORY]:   { dmg:0,  spread:false, push:0, bg:'#06060a', bd:'rgba(100,200,150,0.2)', glow:null, sym:'·' },
  [T.PAIN]:     { dmg:6,  spread:false, push:0, bg:'#200808', bd:'#661111', glow:'#880000', sym:'·' },
  // Phase 2.6: Embodiment / Somatic Tiles — no damage; somatic healing & grounding
  [T.BODY_SCAN]:  { dmg:0, spread:false, push:0, bg:'#020a06', bd:'rgba(0,200,100,0.35)',   glow:'#00aa44', sym:'◯' },
  [T.BREATH_SYNC]:{ dmg:0, spread:false, push:0, bg:'#020812', bd:'rgba(100,150,255,0.35)', glow:'#6688ff', sym:'≋' },
  [T.ENERGY_NODE]:{ dmg:0, spread:false, push:0, bg:'#0a0820', bd:'rgba(200,100,255,0.35)', glow:'#cc44ff', sym:'✦' },
  [T.GROUNDING]:  { dmg:0, spread:false, push:0, bg:'#060402', bd:'rgba(160,110,55,0.35)',  glow:'#886644', sym:'⊕' },
};

// ═══════════════════════════════════════════════════════════
//  GRID / CANVAS CONFIG
// ═══════════════════════════════════════════════════════════
export const CELL = 44;
export const GAP  = 2;

export const GRID_SIZES = { small: 10, medium: 13, large: 17 };

export const DIFF_CFG = {
  // Age-accessible tiers (see adaptive-difficulty.js for full profiles)
  tiny:   { eSpeedBase: 2000, eSpeedMin: 1200, dmgMul: 0.25, hazMul: 0.0  }, // 5+ 🌱
  gentle: { eSpeedBase: 1400, eSpeedMin:  700, dmgMul: 0.45, hazMul: 0.45 }, // 8+ 🌿
  // Standard tiers
  easy:   { eSpeedBase:  950, eSpeedMin:  350, dmgMul: 0.55, hazMul: 0.7  },
  normal: { eSpeedBase:  720, eSpeedMin:  210, dmgMul: 1.0,  hazMul: 1.0  },
  hard:   { eSpeedBase:  520, eSpeedMin:  150, dmgMul: 1.45, hazMul: 1.35 },
};

// ═══════════════════════════════════════════════════════════
//  MATRIX PALETTES
// ═══════════════════════════════════════════════════════════
function makePal(shifts) {
  const p = {};
  for (const [id, def] of Object.entries(TILE_DEF)) {
    p[id] = { bg: def.bg, bd: def.bd, glow: def.glow };
  }
  if (shifts) for (const [id, ov] of Object.entries(shifts)) Object.assign(p[id], ov);
  return p;
}

export const PAL_B = makePal(null);

export const PAL_A = makePal({
  [T.VOID]:     { bg:'#0a0208', bd:'rgba(180,30,60,0.05)' },
  [T.DESPAIR]:  { bg:'#220011', bd:'#aa0044', glow:'#dd1155' },
  [T.TERROR]:   { bg:'#600010', bd:'#ee0022', glow:'#ff3333' },
  [T.SELF_HARM]:{ bg:'#440008', bd:'#aa0011', glow:'#cc0022' },
  [T.PEACE]:    { bg:'#001408', bd:'#00aa44', glow:'#00dd66' },
  [T.INSIGHT]:  { bg:'#000a18', bd:'#0088cc', glow:'#00aaff' },
  [T.RAGE]:     { bg:'#500008', bd:'#ee1133', glow:'#ff2244' },
  [T.HOPELESS]: { bg:'#001025', bd:'#0033aa', glow:'#0055dd' },
  [T.GLITCH]:   { bg:'#1a0028', bd:'#cc00ff', glow:'#ff00ff' },
});

// ═══════════════════════════════════════════════════════════
//  ARCHETYPES
// ═══════════════════════════════════════════════════════════
export const ARCHETYPES = {
  dragon:    { name:'DRAGON',          color:'#ffaa00', glow:'#ff8800', power:'wall_jump',    powerDesc:'DRAGON LEAP — jump 2 tiles (J)',       activationMsg:'Dragon grants you passage…',        completionBonus:'dragon protection persists…' },
  child:     { name:'CHILD GUIDE',     color:'#aaffcc', glow:'#00ffaa', power:'reveal',       powerDesc:'CHILD SIGHT — hidden nodes revealed',   activationMsg:'Child guide illuminates the path…', completionBonus:'child\'s sight lingers…' },
  orb:       { name:'ORB / SHEEP',     color:'#aaddff', glow:'#00ccff', power:'phase_walk',   powerDesc:'ORB PHASE — walk through walls (J)',    activationMsg:'Orb opens the membrane…',           completionBonus:'orb carries you forward…' },
  captor:    { name:'CAPTOR-TEACHER',  color:'#ffaadd', glow:'#dd0088', power:'rewind',       powerDesc:'REWIND — undo last 3 moves (J)',        activationMsg:'Captor shows you the loop…',        completionBonus:'you learned from the captor…' },
  protector: { name:'PROTECTOR',       color:'#88ccff', glow:'#4488ff', power:'shield_burst', powerDesc:'PROTECT — shield burst (J)',            activationMsg:'Protector stands between…',         completionBonus:'protection endures…' },
};

// ═══════════════════════════════════════════════════════════
//  DREAMSCAPES
// ═══════════════════════════════════════════════════════════
export const DREAMSCAPES = [
  {
    id:'void', name:'VOID STATE', subtitle:'raw survival · awakening',
    matrixDefault:'B', bgColor:'#03030a', bgAccent:'#001a0a', emotion:'numbness',
    archetype:null, hazardSet:[T.DESPAIR,T.TERROR,T.SELF_HARM], hazardCounts:[8,5,4],
    specialTiles:[], enemyBehavior:'wander', enemyCount:3, environmentEvent:null,
    narrative:'the void holds you… begin', completionText:'you surfaced from the void…',
  },
  {
    id:'mountain_dragon', name:'MOUNTAIN DRAGON REALM', subtitle:'initiation · fear · guardian presence',
    matrixDefault:'B', bgColor:'#020508', bgAccent:'#0a0518', emotion:'fear',
    archetype:'dragon', hazardSet:[T.DESPAIR,T.TERROR,T.HOPELESS], hazardCounts:[6,5,4],
    specialTiles:[T.ARCHETYPE], enemyBehavior:'patrol', enemyCount:4, environmentEvent:'gravity_shift',
    narrative:'the dragon watches… do not falter', completionText:'dragon acknowledged your courage…',
  },
  {
    id:'courtyard', name:'MOUNTAIN COURTYARD OF OJOS', subtitle:'loop · language puzzles · captor-teacher',
    matrixDefault:'A', bgColor:'#080502', bgAccent:'#180a00', emotion:'frustration',
    archetype:'captor', hazardSet:[T.RAGE,T.DESPAIR,T.GLITCH], hazardCounts:[5,6,5],
    specialTiles:[T.TRAP,T.ARCHETYPE], enemyBehavior:'patrol', enemyCount:4, environmentEvent:'loop_reset',
    narrative:'the courtyard repeats… find the door', completionText:'you escaped the captor\'s loop… empathy found',
  },
  {
    id:'leaping_field', name:'LEAPING FIELD', subtitle:'mobility · orb-sheep guide · vulnerability',
    matrixDefault:'B', bgColor:'#020a06', bgAccent:'#002210', emotion:'vulnerability',
    archetype:'orb', hazardSet:[T.TERROR,T.SELF_HARM,T.HOPELESS], hazardCounts:[4,3,5],
    specialTiles:[T.TELEPORT,T.ARCHETYPE], enemyBehavior:'orbit', enemyCount:3, environmentEvent:'glide_nodes',
    narrative:'the orb drifts ahead… follow', completionText:'you leapt where fear said stay…',
  },
  {
    id:'summit', name:'MOUNTAIN SUMMIT REALM', subtitle:'high stakes · multi-plane · dragon guardian',
    matrixDefault:'B', bgColor:'#04050a', bgAccent:'#080418', emotion:'exhaustion',
    archetype:'dragon', hazardSet:[T.TERROR,T.RAGE,T.HOPELESS,T.SELF_HARM], hazardCounts:[5,4,5,3],
    specialTiles:[T.ARCHETYPE,T.HIDDEN], enemyBehavior:'adaptive', enemyCount:5, environmentEvent:'line_of_sight',
    narrative:'the summit demands everything…', completionText:'from the peak, the path below is clear…',
  },
  {
    id:'neighborhood', name:'CHILDHOOD NEIGHBORHOOD', subtitle:'pursuit · panic · early hazard',
    matrixDefault:'A', bgColor:'#080408', bgAccent:'#150510', emotion:'panic',
    archetype:null, hazardSet:[T.DESPAIR,T.TERROR,T.SELF_HARM,T.PAIN], hazardCounts:[7,6,4,3],
    specialTiles:[T.MEMORY], enemyBehavior:'chase_fast', enemyCount:5, environmentEvent:'capture_zones',
    narrative:'they are close… run', completionText:'you outran the pursuing shadow…',
  },
  {
    id:'bedroom', name:'MODERN BEDROOM GUNFIGHT', subtitle:'reflex · cover · sudden chaos',
    matrixDefault:'A', bgColor:'#050508', bgAccent:'#0a0a18', emotion:'chaos',
    archetype:'protector', hazardSet:[T.TERROR,T.RAGE,T.GLITCH], hazardCounts:[6,5,4],
    specialTiles:[T.COVER,T.ARCHETYPE], enemyBehavior:'rush', enemyCount:6, environmentEvent:'rapid_spawn',
    narrative:'chaos erupts… find cover', completionText:'protector stood firm… chaos receded',
  },
  {
    id:'aztec', name:'AZTEC / MAYAN CHASE', subtitle:'labyrinth · traps · captor-teacher',
    matrixDefault:'A', bgColor:'#080400', bgAccent:'#1a0800', emotion:'anxiety',
    archetype:'captor', hazardSet:[T.TRAP,T.RAGE,T.DESPAIR,T.TERROR], hazardCounts:[6,4,5,4],
    specialTiles:[T.TRAP,T.ARCHETYPE], enemyBehavior:'labyrinth', enemyCount:4, environmentEvent:'dead_ends',
    narrative:'the stone corridors close in…', completionText:'you traced the ancient path… free',
  },
  {
    id:'orb_escape', name:'ORB ESCAPE EVENT', subtitle:'flight · wall-phase · fleeting hope',
    matrixDefault:'B', bgColor:'#010a08', bgAccent:'#002018', emotion:'hope',
    archetype:'orb', hazardSet:[T.HOPELESS,T.DESPAIR,T.GLITCH], hazardCounts:[4,4,4],
    specialTiles:[T.TELEPORT,T.ARCHETYPE,T.INSIGHT], enemyBehavior:'scatter', enemyCount:3, environmentEvent:'wall_phase',
    narrative:'the orb leads through the membrane…', completionText:'you passed through… the other side holds',
  },
  {
    id:'integration', name:'DREAMSCAPE INTEGRATION', subtitle:'all matrices · sovereignty · final emergence',
    matrixDefault:'B', bgColor:'#020208', bgAccent:'#080418', emotion:'integration',
    archetype:'all', hazardSet:[T.DESPAIR,T.TERROR,T.RAGE,T.HOPELESS,T.SELF_HARM,T.GLITCH,T.TRAP], hazardCounts:[5,4,4,4,3,3,3],
    specialTiles:[T.ARCHETYPE,T.TELEPORT,T.INSIGHT,T.HIDDEN], enemyBehavior:'predictive', enemyCount:7, environmentEvent:'mashup',
    narrative:'all dreamscapes converge… integrate', completionText:'SA · MCA · MNF · SC — the sovereignty is yours',
  },
  // ── New dreamscapes ─────────────────────────────────────────────────────
  {
    id:'forest_sanctuary', name:'FOREST SANCTUARY', subtitle:'ornithology · nature · somatic restoration',
    matrixDefault:'B', bgColor:'#010a04', bgAccent:'#003316', emotion:'wonder',
    archetype:null,
    hazardSet:[], hazardCounts:[],
    specialTiles:[T.BODY_SCAN,T.BREATH_SYNC,T.GROUNDING,T.ENERGY_NODE], enemyBehavior:'wander', enemyCount:0, environmentEvent:'bird_migration',
    narrative:'the forest holds still… observe', completionText:'you returned from the forest renewed…',
  },
  {
    id:'mycelium_depths', name:'MYCELIUM DEPTHS', subtitle:'mycology · underground network · deep wisdom',
    matrixDefault:'B', bgColor:'#020502', bgAccent:'#001800', emotion:'wonder',
    archetype:'child',
    hazardSet:[T.DESPAIR,T.HOPELESS], hazardCounts:[3,3],
    specialTiles:[T.ENERGY_NODE,T.BREATH_SYNC,T.INSIGHT], enemyBehavior:'wander', enemyCount:2, environmentEvent:'mycelium_growth',
    narrative:'the network breathes beneath you…', completionText:'you mapped the mycelium… the network sings',
  },
  {
    id:'ancient_structure', name:'ANCIENT STRUCTURE', subtitle:'architecture · sacred geometry · enduring forms',
    matrixDefault:'B', bgColor:'#050408', bgAccent:'#100820', emotion:'awe',
    archetype:'protector',
    hazardSet:[T.GLITCH,T.HIDDEN,T.TRAP], hazardCounts:[4,6,3],
    specialTiles:[T.COVER,T.MEMORY,T.ARCHETYPE,T.GROUNDING], enemyBehavior:'patrol', enemyCount:3, environmentEvent:'structure_reveal',
    narrative:'the stones remember…', completionText:'the structure stands complete… you built it',
  },
  // ── 5 new dreamscapes (targets 14–18) ─────────────────────────────────
  {
    id:'solar_temple', name:'SOLAR TEMPLE', subtitle:'alchemy · fire · solar initiation',
    matrixDefault:'B', bgColor:'#080400', bgAccent:'#1a0800', emotion:'awe',
    archetype:'dragon',
    hazardSet:[T.RAGE,T.TERROR,T.GLITCH], hazardCounts:[5,4,3],
    specialTiles:[T.ENERGY_NODE,T.ARCHETYPE,T.INSIGHT], enemyBehavior:'orbit', enemyCount:3, environmentEvent:'solar_pulse',
    narrative:'the temple blazes with ancient fire…', completionText:'you endured the solar initiation… transformed',
  },
  {
    id:'deep_ocean', name:'DEEP OCEAN', subtitle:'emotion · depth · the unconscious',
    matrixDefault:'B', bgColor:'#000a18', bgAccent:'#001028', emotion:'vulnerability',
    archetype:'orb',
    hazardSet:[T.HOPELESS,T.DESPAIR,T.PAIN], hazardCounts:[5,4,4],
    specialTiles:[T.BREATH_SYNC,T.TELEPORT,T.MEMORY,T.ARCHETYPE], enemyBehavior:'wander', enemyCount:3, environmentEvent:'ocean_surge',
    narrative:'the depths receive you… breathe', completionText:'you surfaced from the deep… clarity follows',
  },
  {
    id:'crystal_cave', name:'CRYSTAL CAVE', subtitle:'reflection · clarity · hidden structure',
    matrixDefault:'B', bgColor:'#020508', bgAccent:'#050820', emotion:'wonder',
    archetype:'child',
    hazardSet:[T.GLITCH,T.HIDDEN,T.SELF_HARM], hazardCounts:[4,6,3],
    specialTiles:[T.INSIGHT,T.MEMORY,T.BODY_SCAN,T.ARCHETYPE], enemyBehavior:'scatter', enemyCount:2, environmentEvent:'crystal_resonance',
    narrative:'the crystals resonate with your frequency…', completionText:'you saw your own reflection… truth found',
  },
  {
    id:'cloud_city', name:'CLOUD CITY', subtitle:'elevation · air · the higher mind',
    matrixDefault:'B', bgColor:'#04060a', bgAccent:'#0a1020', emotion:'anticipation',
    archetype:'child',
    hazardSet:[T.TERROR,T.DESPAIR,T.GLITCH], hazardCounts:[4,4,3],
    specialTiles:[T.BODY_SCAN,T.TELEPORT,T.INSIGHT,T.ARCHETYPE], enemyBehavior:'orbit', enemyCount:3, environmentEvent:'wind_drift',
    narrative:'above the clouds, perspective shifts…', completionText:'you rose above the storm… the view is clear',
  },
  {
    id:'void_nexus', name:'VOID NEXUS', subtitle:'dissolution · ether · pure consciousness',
    matrixDefault:'A', bgColor:'#02020a', bgAccent:'#050518', emotion:'integration',
    archetype:'all',
    hazardSet:[T.DESPAIR,T.TERROR,T.RAGE,T.HOPELESS,T.SELF_HARM], hazardCounts:[4,4,3,3,3],
    specialTiles:[T.INSIGHT,T.ENERGY_NODE,T.ARCHETYPE,T.TELEPORT], enemyBehavior:'predictive', enemyCount:5, environmentEvent:'void_expansion',
    narrative:'the nexus converges all timelines… be still', completionText:'you held the void without fear… integration complete',
  },
];

// ═══════════════════════════════════════════════════════════
//  UPGRADE SHOP
// ═══════════════════════════════════════════════════════════
export const UPGRADE_SHOP = [
  { id:'maxhp',  name:'+MAX HP',         cost:3, desc:'max HP +25' },
  { id:'speed',  name:'+MOVE SPEED',     cost:2, desc:'faster movement' },
  { id:'magnet', name:'PEACE MAGNET',    cost:4, desc:'attract nearby ◈' },
  { id:'freeze', name:'ENEMY FREEZE',    cost:5, desc:'Q: freeze all enemies' },
  { id:'aura',   name:'GLOW AURA',       cost:2, desc:'cosmetic pulse aura' },
  { id:'energy', name:'+ENERGY MAX',     cost:3, desc:'energy bar +30' },
  { id:'rewind', name:'TEMPORAL REWIND', cost:6, desc:'J: undo last 3 moves' },
  { id:'pulse',  name:'GLITCH PULSE',    cost:5, desc:'charged clear (R)' },
];

// ═══════════════════════════════════════════════════════════
//  VISION WORDS  (ambient background text)
// ═══════════════════════════════════════════════════════════
export const VISION_WORDS = [
  'memory…','choice…','echo…','void…','self…','signal…',
  'fragment…','persist…','clarity…','dissolve…','boundary…','witness…',
  'anchor…','pattern…','emergence…','dragon…','guide…','orb…','fear…','hope…',
];

// ═══════════════════════════════════════════════════════════
//  MENU LABELS
// ═══════════════════════════════════════════════════════════
export const MAIN_MENU  = ['▶  START JOURNEY', 'SELECT DREAMSCAPE', 'HOW TO PLAY', 'OPTIONS', 'HIGH SCORES', 'UPGRADES'];
export const PAUSE_MENU = ['RESUME', 'OPTIONS', 'UPGRADES', 'QUIT TO TITLE'];
export const OPT_GRID   = ['small', 'medium', 'large'];
export const OPT_DIFF   = ['easy', 'normal', 'hard'];
