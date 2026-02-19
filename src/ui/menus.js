'use strict';
import { DREAMSCAPES, ARCHETYPES, UPGRADE_SHOP, MAIN_MENU, PAUSE_MENU, OPT_GRID, OPT_DIFF } from '../core/constants.js';
import { CFG, PLAYER_PROFILE } from '../core/state.js';
import { LANGUAGES, LANGUAGE_PATHS, LANG_LIST } from '../systems/learning/language-system.js';
import { DIFFICULTY_TIERS } from '../systems/difficulty/adaptive-difficulty.js';

function stars(ctx, backgroundStars, ts) {
  for (const s of backgroundStars) {
    ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase));
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawTitle(ctx, w, h, backgroundStars, ts, menuIdx, gameMode) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, y, w, 1); }
  stars(ctx, backgroundStars, ts);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0a0a20'; ctx.font = '8px Courier New'; ctx.fillText('A BEING NAVIGATES THE DREAMSCAPES', w / 2, h / 2 - 140);
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 32;
  ctx.font = 'bold 36px Courier New'; ctx.fillText('GLITCH·PEACE', w / 2, h / 2 - 100); ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a1a0a'; ctx.font = '9px Courier New'; ctx.fillText('v4  ·  dreamscape consciousness simulation', w / 2, h / 2 - 78);
  // Mode indicator
  const modeLabel = (gameMode === 'shooter') ? '[ SHOOTER MODE ]' : '[ GRID MODE ]';
  const modeColor = (gameMode === 'shooter') ? '#ff6622' : '#00ff88';
  ctx.fillStyle = modeColor; ctx.shadowColor = modeColor; ctx.shadowBlur = 8;
  ctx.font = '10px Courier New'; ctx.fillText(modeLabel + '  ·  M to switch', w / 2, h / 2 - 60); ctx.shadowBlur = 0;
  const menuTop = h / 2 - 42;
  MAIN_MENU.forEach((opt, i) => {
    const sel = i === menuIdx, y = menuTop + i * 36;
    if (sel) {
      ctx.fillStyle = 'rgba(0,255,136,0.07)'; ctx.fillRect(w / 2 - 130, y - 19, 260, 28);
      ctx.strokeStyle = 'rgba(0,255,136,0.28)'; ctx.strokeRect(w / 2 - 130, y - 19, 260, 28);
    }
    ctx.fillStyle = sel ? '#00ff88' : '#2a3a2a'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 8 : 0;
    ctx.font = sel ? 'bold 14px Courier New' : '12px Courier New'; ctx.fillText(opt, w / 2, y); ctx.shadowBlur = 0;
  });
  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.fillText('↑↓ navigate  ·  ENTER select  ·  M toggle mode', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawDreamSelect(ctx, w, h, dreamIdx) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold 20px Courier New'; ctx.fillText('SELECT DREAMSCAPE', w / 2, 50); ctx.shadowBlur = 0;
  ctx.fillStyle = '#223322'; ctx.font = '9px Courier New'; ctx.fillText('journey begins from your chosen entry point', w / 2, 68);
  const visible = Math.min(DREAMSCAPES.length, 6);
  const startI = Math.max(0, Math.min(dreamIdx - Math.floor(visible / 2), DREAMSCAPES.length - visible));
  for (let i = 0; i < visible; i++) {
    const di = startI + i, ds = DREAMSCAPES[di], sel = di === dreamIdx, y = 95 + i * 55;
    if (sel) {
      ctx.fillStyle = 'rgba(0,255,136,0.06)'; ctx.fillRect(w / 2 - 160, y - 18, 320, 46);
      ctx.strokeStyle = 'rgba(0,255,136,0.25)'; ctx.strokeRect(w / 2 - 160, y - 18, 320, 46);
    }
    ctx.fillStyle = sel ? '#00ff88' : '#2a3a2a'; ctx.font = sel ? 'bold 12px Courier New' : '11px Courier New';
    ctx.fillText((di + 1) + '.  ' + ds.name, w / 2, y);
    ctx.fillStyle = sel ? '#334455' : '#1a2a1a'; ctx.font = '9px Courier New';
    ctx.fillText(ds.subtitle + '  ·  ' + ds.emotion, w / 2, y + 16);
    if (sel && ds.archetype && ARCHETYPES[ds.archetype]) {
      const arch = ARCHETYPES[ds.archetype];
      ctx.fillStyle = '#665522'; ctx.fillText('archetype: ' + arch.name + ' — ' + arch.powerDesc, w / 2, y + 30);
    }
  }
  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.fillText('↑↓ select  ·  ENTER start here  ·  ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawOptions(ctx, w, h, optIdx) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16;
  ctx.font = 'bold 20px Courier New'; ctx.fillText('OPTIONS', w / 2, 50); ctx.shadowBlur = 0;
  const langMeta = LANGUAGES[PLAYER_PROFILE.nativeLang] || {};
  const tgtMeta  = LANGUAGES[PLAYER_PROFILE.targetLang]  || {};
  const rows = [
    { label:'GRID SIZE',  opts:OPT_GRID, cur:CFG.gridSize },
    { label:'DIFFICULTY', opts:OPT_DIFF, cur:CFG.difficulty },
    { label:'PARTICLES',  opts:['on','off'], cur:CFG.particles ? 'on' : 'off' },
    { label:'LANGUAGES',  opts:['OPEN →'], cur:'OPEN →', hint: (langMeta.emoji||'') + ' → ' + (tgtMeta.emoji||'') + ' ' + (tgtMeta.name||'') },
    { label:'',           opts:['← BACK'], cur:'← BACK' },
  ];
  rows.forEach((row, i) => {
    const sel = i === optIdx, baseY = 95 + i * 60;
    if (row.label) {
      ctx.fillStyle = '#334455'; ctx.font = '9px Courier New'; ctx.fillText(row.label, w / 2, baseY);
      if (row.hint) { ctx.fillStyle = '#445566'; ctx.font = '8px Courier New'; ctx.fillText(row.hint, w / 2, baseY + 12); }
    }
    const rowOpts = row.opts;
    rowOpts.forEach((opt, j) => {
      const active = opt === row.cur;
      const oy_off = row.hint ? 34 : 24;
      const ox = w / 2 + (j - (rowOpts.length - 1) / 2) * 110, oy = baseY + oy_off;
      ctx.fillStyle = (sel && active) ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.02)'; ctx.fillRect(ox - 44, oy - 16, 88, 24);
      ctx.strokeStyle = (sel && active) ? 'rgba(0,255,136,0.5)' : active ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.04)'; ctx.strokeRect(ox - 44, oy - 16, 88, 24);
      ctx.fillStyle = active ? '#00ff88' : '#334455'; ctx.shadowColor = active ? '#00ff88' : 'transparent'; ctx.shadowBlur = active ? 5 : 0;
      ctx.font = active ? 'bold 11px Courier New' : '10px Courier New'; ctx.fillText(opt.toUpperCase(), ox, oy); ctx.shadowBlur = 0;
    });
    if (sel) { ctx.fillStyle = '#00ff88'; ctx.font = '12px Courier New'; ctx.fillText('▶', w / 2 - 154, baseY + (row.hint ? 34 : 24)); }
  });
  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.fillText('↑↓ row  ·  ←→ value  ·  ENTER/ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawHighScores(ctx, w, h, highScores) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16;
  ctx.font = 'bold 20px Courier New'; ctx.fillText('HIGH SCORES', w / 2, 50); ctx.shadowBlur = 0;
  if (!highScores.length) { ctx.fillStyle = '#223322'; ctx.font = '12px Courier New'; ctx.fillText('no scores yet…', w / 2, h / 2); }
  else {
    highScores.slice(0, 8).forEach((s, i) => {
      const y = 95 + i * 38, med = i === 0 ? '◈' : i === 1 ? '◇' : '·';
      ctx.fillStyle = i === 0 ? '#ffdd00' : i === 1 ? '#aaaaaa' : i === 2 ? '#cc8833' : '#334455';
      ctx.font = i < 3 ? 'bold 12px Courier New' : '11px Courier New';
      ctx.fillText(`${med}  ${String(s.score).padStart(7,'0')}   LVL${String(s.level).padStart(2,'0')}   ${s.dreamscape}   ${s.date}`, w / 2, y);
    });
  }
  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.fillText('ENTER / ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawUpgradeShop(ctx, w, h, shopIdx, insightTokens, checkOwned) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 16;
  ctx.font = 'bold 20px Courier New'; ctx.fillText('UPGRADES', w / 2, 50); ctx.shadowBlur = 0;
  ctx.fillStyle = '#334455'; ctx.font = '10px Courier New'; ctx.fillText('◆ insight tokens: ' + insightTokens, w / 2, 68);
  UPGRADE_SHOP.forEach((up, i) => {
    const sel = i === shopIdx, owned = checkOwned(up.id), canBuy = insightTokens >= up.cost && !owned;
    const y = 92 + i * 48;
    if (sel) {
      ctx.fillStyle = 'rgba(0,238,255,0.06)'; ctx.fillRect(w / 2 - 155, y - 14, 310, 40);
      ctx.strokeStyle = 'rgba(0,238,255,0.22)'; ctx.strokeRect(w / 2 - 155, y - 14, 310, 40);
    }
    ctx.fillStyle = owned ? '#00ff88' : canBuy ? '#00ccdd' : '#334455';
    ctx.shadowColor = owned ? '#00ff88' : sel ? '#00ccdd' : 'transparent'; ctx.shadowBlur = (sel && !owned) ? 5 : 0;
    ctx.font = 'bold 11px Courier New'; ctx.fillText(up.name, w / 2 - 55, y); ctx.shadowBlur = 0;
    ctx.fillStyle = '#334'; ctx.font = '9px Courier New'; ctx.fillText(up.desc, w / 2 - 55, y + 14);
    ctx.fillStyle = owned ? '#005533' : canBuy ? '#006677' : '#221122';
    ctx.font = '10px Courier New'; ctx.fillText(owned ? 'OWNED' : '◆×' + up.cost, w / 2 + 88, y + 4);
  });
  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.fillText('↑↓ select  ·  ENTER buy  ·  ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawPause(ctx, w, h, game, pauseIdx) {
  ctx.fillStyle = 'rgba(0,0,0,0.87)'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 14;
  ctx.font = 'bold 24px Courier New'; ctx.fillText('PAUSED', w / 2, h / 2 - 82); ctx.shadowBlur = 0;
  if (game) {
    ctx.fillStyle = '#223322'; ctx.font = '9px Courier New'; ctx.fillText(game.ds.name + '  ·  LEVEL ' + game.level, w / 2, h / 2 - 60);
    ctx.fillStyle = '#334455'; ctx.fillText(game.ds.narrative, w / 2, h / 2 - 46);
  }

  // Phase 7: Session wellness display
  const wellness = window._sessionWellness;
  const duration = window._sessionDuration || '00:00';
  const learnStats = window._learnStats || { words: 0, patterns: 0 };
  if (wellness) {
    ctx.fillStyle = wellness.color; ctx.shadowColor = wellness.color; ctx.shadowBlur = 4;
    ctx.font = '9px Courier New';
    ctx.fillText('SESSION · ' + duration + ' · ' + wellness.label, w / 2, h / 2 - 30);
    ctx.shadowBlur = 0;
  }
  // Phase 6: Learning stats
  ctx.fillStyle = '#335533'; ctx.font = '8px Courier New';
  ctx.fillText('WORDS: ' + learnStats.words + '  ·  PATTERNS: ' + learnStats.patterns, w / 2, h / 2 - 18);

  // Phase 8: Emergence level
  const em = window._emergence;
  if (em) {
    ctx.fillStyle = '#445566'; ctx.font = '8px Courier New';
    ctx.fillText('EMERGENCE · ' + em.label, w / 2, h / 2 - 6);
  }

  // Phase 9: Strategic coaching tip + EQ insight
  const iqData = window._iqData;
  if (iqData) {
    ctx.fillStyle = '#223340'; ctx.font = '7px Courier New';
    ctx.fillText('IQ ' + iqData.iqScore + '  EQ ' + iqData.eqScore + '  STRATEGY ' + iqData.strategicScore + '  EMPATHY ' + iqData.empathyScore, w / 2, h / 2 + 6);
    ctx.fillStyle = '#334455'; ctx.font = 'italic 7px Courier New';
    const tipText = iqData.strategicTip
      ? (iqData.strategicTip.length > 54 ? iqData.strategicTip.slice(0, 54) + '…' : iqData.strategicTip)
      : '';
    ctx.fillText(tipText, w / 2, h / 2 + 18);
  }

  // Phase 7: Breathing panel (if active)
  const breath = window._breathState;
  if (breath && breath.isActive) {
    const cx = w / 2, cy = h / 2 + 90;
    const maxR = 28, minR = 8;
    const r = minR + (maxR - minR) * breath.radius;
    // Outer glow ring
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = breath.color; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // Main circle
    ctx.fillStyle = breath.color; ctx.shadowColor = breath.color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#000'; ctx.font = 'bold 9px Courier New';
    ctx.fillText(breath.label, cx, cy + 4);
    // Phrase below
    ctx.fillStyle = '#667788'; ctx.font = '7px Courier New';
    ctx.fillText(breath.phrase || '', cx, cy + 50);
    ctx.fillStyle = '#223344'; ctx.font = '7px Courier New';
    ctx.fillText('CYCLES: ' + (breath.cycles || 0) + '  ·  B=stop breathing', cx, h / 2 + 150);
  } else {
    ctx.fillStyle = '#223344'; ctx.font = '7px Courier New';
    ctx.fillText('B = start breathing exercise (Box / 4-7-8 / Coherent)', w / 2, h - 34);
  }

  PAUSE_MENU.forEach((txt, i) => {
    const sel = i === pauseIdx, y = h / 2 + 30 + i * 32;
    if (sel) {
      ctx.fillStyle = 'rgba(0,255,136,0.07)'; ctx.fillRect(w / 2 - 110, y - 16, 220, 24);
      ctx.strokeStyle = 'rgba(0,255,136,0.26)'; ctx.strokeRect(w / 2 - 110, y - 16, 220, 24);
    }
    ctx.fillStyle = sel ? '#00ff88' : '#334433'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 6 : 0;
    ctx.font = sel ? 'bold 12px Courier New' : '11px Courier New'; ctx.fillText(txt, w / 2, y); ctx.shadowBlur = 0;
  });
  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.fillText('↑↓ navigate  ·  ENTER select  ·  ESC resume', w / 2, h - 20);
  ctx.textAlign = 'left';
}

export function drawInterlude(ctx, w, h, interludeState, ts) {
  const totalTimer = interludeState.totalTimer || 280;
  const prog = 1 - (interludeState.timer / totalTimer);
  const alpha = prog < 0.08 ? prog / 0.08 : prog > 0.92 ? (1 - prog) / 0.08 : 1;
  const ds = interludeState.ds || DREAMSCAPES[0];
  ctx.fillStyle = ds.bgColor || '#02020a'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {
    const lx = (ts * 0.02 + i * w / 7) % w;
    ctx.strokeStyle = `rgba(0,255,136,${0.02 * alpha})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx - 100, h); ctx.stroke();
  }
  ctx.globalAlpha = alpha; ctx.textAlign = 'center';

  // ── Completion text ───────────────────────────────────────────────────
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 20;
  ctx.font = 'bold 14px Courier New'; ctx.fillText(interludeState.text, w / 2, h / 2 - 68); ctx.shadowBlur = 0;

  // ── Phase 8: Reflection prompt ────────────────────────────────────────
  if (interludeState.reflectionPrompt) {
    const rp = interludeState.reflectionPrompt;
    // Fade the prompt in after 1s (prog > 0.3)
    const rpAlpha = Math.min(1, Math.max(0, (prog - 0.25) / 0.1));
    ctx.globalAlpha = alpha * rpAlpha;
    ctx.fillStyle = '#aaffcc'; ctx.shadowColor = '#00cc88'; ctx.shadowBlur = 8;
    ctx.font = 'italic 13px Courier New';
    ctx.fillText('\u201c' + rp.prompt + '\u201d', w / 2, h / 2 - 32); ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha;
  }

  // ── Affirmation ───────────────────────────────────────────────────────
  if (interludeState.affirmation) {
    const affAlpha = Math.min(1, Math.max(0, (prog - 0.4) / 0.1));
    ctx.globalAlpha = alpha * affAlpha;
    ctx.fillStyle = '#446644'; ctx.font = '9px Courier New';
    ctx.fillText(interludeState.affirmation, w / 2, h / 2 - 10);
    ctx.globalAlpha = alpha;
  }

  // ── Next dreamscape info ──────────────────────────────────────────────
  ctx.fillStyle = '#223322'; ctx.font = '11px Courier New'; ctx.fillText('ENTERING: ' + ds.name, w / 2, h / 2 + 12);
  ctx.fillStyle = '#334455'; ctx.font = '10px Courier New'; ctx.fillText(ds.narrative, w / 2, h / 2 + 30);

  // ── Phase 6: Vocabulary word ──────────────────────────────────────────
  if (interludeState.vocabWord) {
    const vw = interludeState.vocabWord;
    const vwAlpha = Math.min(1, Math.max(0, (prog - 0.5) / 0.12));
    ctx.globalAlpha = alpha * vwAlpha;
    ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 6;
    ctx.font = 'bold 12px Courier New';
    ctx.fillText(vw.word + '  [' + vw.pos + ']', w / 2, h / 2 + 56); ctx.shadowBlur = 0;
    ctx.fillStyle = '#554422'; ctx.font = '9px Courier New';
    ctx.fillText(vw.def, w / 2, h / 2 + 72);
    ctx.globalAlpha = alpha;
  }

  if (ds.archetype && ARCHETYPES[ds.archetype]) {
    const arch = ARCHETYPES[ds.archetype];
    ctx.fillStyle = arch.glow; ctx.shadowColor = arch.glow; ctx.shadowBlur = 10;
    ctx.font = '10px Courier New'; ctx.fillText('archetype: ' + arch.name, w / 2, h / 2 + 92); ctx.shadowBlur = 0;
  }

  // ── Phase 9: Empathy reflection ───────────────────────────────────────
  if (interludeState.empathyReflection) {
    const erAlpha = Math.min(1, Math.max(0, (prog - 0.65) / 0.12));
    ctx.globalAlpha = alpha * erAlpha;
    ctx.fillStyle = '#887755'; ctx.font = 'italic 9px Courier New';
    ctx.fillText(interludeState.empathyReflection, w / 2, h / 2 + 110);
    ctx.globalAlpha = alpha;
  }

  // ── Phase M3: Campaign milestone ──────────────────────────────────────
  if (interludeState.milestone) {
    const msAlpha = Math.min(1, Math.max(0, (prog - 0.75) / 0.12));
    ctx.globalAlpha = alpha * msAlpha;
    ctx.fillStyle = '#ffdd44'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 8;
    ctx.font = 'bold 10px Courier New';
    ctx.fillText('✦  ' + interludeState.milestone, w / 2, h / 2 + 128); ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha;
  }

  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

export function drawDead(ctx, w, h, game, highScores, dreamHistory, insightTokens, sessionRep) {
  ctx.fillStyle = 'rgba(8,0,0,0.97)'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  const ds = game?.ds;
  ctx.fillStyle = '#330000'; ctx.font = '9px Courier New'; ctx.fillText('THE BEING DISSOLVES IN ' + (ds?.name || 'THE VOID'), w / 2, h / 2 - 138);
  ctx.fillStyle = '#ff2222'; ctx.shadowColor = '#ff2222'; ctx.shadowBlur = 30;
  ctx.font = 'bold 40px Courier New'; ctx.fillText('ERASED', w / 2, h / 2 - 90); ctx.shadowBlur = 0;
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
  ctx.font = 'bold 26px Courier New'; ctx.fillText(String(game.score).padStart(7, '0'), w / 2, h / 2 - 28); ctx.shadowBlur = 0;
  ctx.fillStyle = '#333'; ctx.font = '10px Courier New'; ctx.fillText('FINAL SCORE  ·  LEVEL ' + game.level, w / 2, h / 2 - 6);
  ctx.fillStyle = '#223322'; ctx.font = '9px Courier New';
  ctx.fillText('dreams completed: ' + (dreamHistory.length) + '/' + DREAMSCAPES.length, w / 2, h / 2 + 14);
  ctx.fillText('REP ' + (sessionRep >= 0 ? '+' : '') + sessionRep + '  ·  ◆×' + insightTokens, w / 2, h / 2 + 32);
  if (highScores.length > 0) {
    const rank = highScores.findIndex(s => s.score === game.score);
    if (rank >= 0) { ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 11px Courier New'; ctx.fillText('RANK #' + (rank + 1) + ' ALL TIME', w / 2, h / 2 + 54); }
  }
  const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.004);
  ctx.fillStyle = `rgba(255,34,34,${0.07 * pulse})`; ctx.fillRect(w / 2 - 110, h / 2 + 70, 220, 34);
  ctx.strokeStyle = `rgba(255,34,34,${0.45 * pulse})`; ctx.strokeRect(w / 2 - 110, h / 2 + 70, 220, 34);
  ctx.fillStyle = '#ff2222'; ctx.font = '12px Courier New'; ctx.fillText('↺  ENTER TO TRY AGAIN', w / 2, h / 2 + 92);
  ctx.fillStyle = '#221122'; ctx.font = '9px Courier New'; ctx.fillText('ESC → TITLE', w / 2, h / 2 + 120);
  ctx.textAlign = 'left';
}

// ─── Onboarding screen ────────────────────────────────────────────────
// Shown once on first launch. Asks age group, native language, and
// preferred learning language. Choices are persisted in PLAYER_PROFILE.
//
// onboardCursor layout:
//   0 = age group selection
//   1 = native language selection
//   2 = target language selection
//   3 = confirm / start
//
const AGE_OPTS = [
  { key: 'child5',  label: '🌱  5 – 7',    tier: 'tiny',     desc: 'Safe & playful — very gentle pace' },
  { key: 'child8',  label: '🌿  8 – 11',   tier: 'gentle',   desc: 'Friendly challenge, encouraging words' },
  { key: 'teen12',  label: '⚡  12 – 15',  tier: 'explorer', desc: 'Moderate challenge, rich vocabulary' },
  { key: 'teen16',  label: '🔷  16 – 19',  tier: 'standard', desc: 'Full experience, all dreamscapes' },
  { key: 'adult',   label: '🔥  20 +',     tier: 'standard', desc: 'Full experience (change in Options)' },
];

// LANG_LIST is imported from language-system.js — no local duplicate

export function drawOnboarding(ctx, w, h, ob) {
  ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
  ctx.font = 'bold 20px Courier New'; ctx.fillText('WELCOME TO GLITCH·PEACE', w / 2, 44); ctx.shadowBlur = 0;
  ctx.fillStyle = '#223322'; ctx.font = '9px Courier New';
  ctx.fillText('let\'s set up your personal experience  ·  all settings changeable later', w / 2, 62);

  // Step indicator
  const steps = ['age', 'language', 'learning', 'confirm'];
  steps.forEach((s, i) => {
    const active = i === ob.step;
    const done   = i < ob.step;
    const x = w / 2 - 90 + i * 60;
    ctx.fillStyle   = done ? '#00aa44' : active ? '#00ff88' : '#223322';
    ctx.shadowColor = active ? '#00ff88' : 'transparent'; ctx.shadowBlur = active ? 6 : 0;
    ctx.font = '8px Courier New'; ctx.fillText((done ? '✓' : String(i + 1)) + ' ' + s.toUpperCase(), x, 82);
    ctx.shadowBlur = 0;
  });

  const cy = 110;

  if (ob.step === 0) {
    // ── Step 0: Age group ──────────────────────────────────────────────
    ctx.fillStyle = '#334455'; ctx.font = '11px Courier New'; ctx.fillText('How old are you?', w / 2, cy);
    ctx.fillStyle = '#223322'; ctx.font = '8px Courier New'; ctx.fillText('(difficulty adjusts automatically — you can always change it later)', w / 2, cy + 16);
    AGE_OPTS.forEach((opt, i) => {
      const sel = i === ob.ageIdx;
      const y = cy + 44 + i * 44;
      if (sel) {
        ctx.fillStyle = 'rgba(0,255,136,0.07)'; ctx.fillRect(w / 2 - 150, y - 16, 300, 36);
        ctx.strokeStyle = 'rgba(0,255,136,0.3)'; ctx.strokeRect(w / 2 - 150, y - 16, 300, 36);
      }
      ctx.fillStyle = sel ? '#00ff88' : '#334455'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 5 : 0;
      ctx.font = sel ? 'bold 13px Courier New' : '12px Courier New'; ctx.fillText(opt.label, w / 2, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = sel ? '#446655' : '#1a2a1a'; ctx.font = '8px Courier New'; ctx.fillText(opt.desc, w / 2, y + 14);
    });

  } else if (ob.step === 1) {
    // ── Step 1: Native language ────────────────────────────────────────
    ctx.fillStyle = '#334455'; ctx.font = '11px Courier New'; ctx.fillText('What is your native language?', w / 2, cy);
    ctx.fillStyle = '#223322'; ctx.font = '8px Courier New'; ctx.fillText('Game will teach vocabulary with your language as the anchor', w / 2, cy + 16);
    const perRow = 4, colW = 140, rowH = 48;
    const startX = w / 2 - (perRow / 2) * colW + colW / 2;
    LANG_LIST.forEach((code, i) => {
      const lang = LANGUAGES[code];
      if (!lang) return;
      const col = i % perRow, row = Math.floor(i / perRow);
      const lx = startX + col * colW, ly = cy + 42 + row * rowH;
      const sel = i === ob.nativeIdx;
      if (sel) {
        ctx.fillStyle = 'rgba(0,255,136,0.08)'; ctx.fillRect(lx - 58, ly - 14, 116, 34);
        ctx.strokeStyle = 'rgba(0,255,136,0.35)'; ctx.strokeRect(lx - 58, ly - 14, 116, 34);
      }
      ctx.fillStyle = sel ? '#00ff88' : '#334455'; ctx.shadowColor = sel ? '#00ff88' : 'transparent'; ctx.shadowBlur = sel ? 4 : 0;
      ctx.font = sel ? 'bold 10px Courier New' : '9px Courier New';
      ctx.fillText(lang.emoji + '  ' + lang.name, lx, ly); ctx.shadowBlur = 0;
      ctx.fillStyle = sel ? '#335544' : '#1a2020'; ctx.font = '7px Courier New';
      ctx.fillText(lang.nativeName, lx, ly + 12);
    });

  } else if (ob.step === 2) {
    // ── Step 2: Target learning language ──────────────────────────────
    const nativeCode = LANG_LIST[ob.nativeIdx] || 'en';
    const path = LANGUAGE_PATHS[nativeCode] || LANGUAGE_PATHS.en;
    ctx.fillStyle = '#334455'; ctx.font = '11px Courier New'; ctx.fillText('Which language would you like to start learning?', w / 2, cy);
    ctx.fillStyle = '#223322'; ctx.font = '8px Courier New'; ctx.fillText('Ordered by ease for ' + (LANGUAGES[nativeCode]?.name || 'English') + ' speakers  ·  more unlock as you play', w / 2, cy + 16);

    const perRow = 2, colW = 210, rowH = 52;
    const startX = w / 2 - colW / 2;
    path.slice(0, 8).forEach((code, i) => {
      const lang = LANGUAGES[code];
      if (!lang) return;
      const col = i % perRow, row = Math.floor(i / perRow);
      const lx = startX + col * colW, ly = cy + 44 + row * rowH;
      const sel = i === ob.targetIdx;
      if (sel) {
        ctx.fillStyle = 'rgba(100,200,255,0.07)'; ctx.fillRect(lx - 90, ly - 14, 180, 42);
        ctx.strokeStyle = 'rgba(100,200,255,0.3)'; ctx.strokeRect(lx - 90, ly - 14, 180, 42);
      }
      ctx.fillStyle = sel ? '#aaddff' : '#334455'; ctx.shadowColor = sel ? '#aaddff' : 'transparent'; ctx.shadowBlur = sel ? 4 : 0;
      ctx.font = sel ? 'bold 10px Courier New' : '9px Courier New';
      ctx.fillText(lang.emoji + '  ' + lang.name + '  ' + lang.nativeName, lx, ly); ctx.shadowBlur = 0;
      ctx.fillStyle = sel ? '#224455' : '#111a20'; ctx.font = '7px Courier New';
      const dist = Math.round(lang.distance * 100);
      const fsi  = lang.fsiHours ? lang.fsiHours + 'h' : '—';
      ctx.fillText('distance ' + dist + '%  ·  ~' + fsi + ' to fluency', lx, ly + 13);
      ctx.fillStyle = '#1a2520'; ctx.font = '6px Courier New';
      ctx.fillText(lang.description.slice(0, 48) + (lang.description.length > 48 ? '…' : ''), lx, ly + 25);
    });

  } else if (ob.step === 3) {
    // ── Step 3: Confirm ────────────────────────────────────────────────
    const nCode = LANG_LIST[ob.nativeIdx] || 'en';
    const tCode = (LANGUAGE_PATHS[nCode] || LANGUAGE_PATHS.en)[ob.targetIdx] || 'no';
    const age   = AGE_OPTS[ob.ageIdx] || AGE_OPTS[4];
    const tier  = DIFFICULTY_TIERS[age.tier] || DIFFICULTY_TIERS.standard;
    ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 14;
    ctx.font = 'bold 16px Courier New'; ctx.fillText('YOUR PROFILE', w / 2, cy + 10); ctx.shadowBlur = 0;

    const rows = [
      ['AGE GROUP',        age.label],
      ['DIFFICULTY TIER',  tier.label],
      ['NATIVE LANGUAGE',  LANGUAGES[nCode]?.emoji + ' ' + LANGUAGES[nCode]?.name],
      ['LEARNING',         LANGUAGES[tCode]?.emoji + ' ' + LANGUAGES[tCode]?.name],
      ['',                 ''],
      ['FIRST LANGUAGE',   LANGUAGES[nCode]?.description?.slice(0, 52) + '…'],
      ['LEARNING PATH',    LANGUAGES[tCode]?.description?.slice(0, 52) + '…'],
    ];
    rows.forEach(([label, val], i) => {
      if (!label && !val) return;
      const y = cy + 44 + i * 28;
      ctx.fillStyle = '#334455'; ctx.font = '8px Courier New'; ctx.textAlign = 'right';
      ctx.fillText(label, w / 2 - 10, y);
      ctx.fillStyle = '#00ff88'; ctx.font = '9px Courier New'; ctx.textAlign = 'left';
      ctx.fillText(val, w / 2 + 10, y);
    });
    ctx.textAlign = 'center';
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
    ctx.fillStyle = `rgba(0,255,136,${0.08 * pulse})`; ctx.fillRect(w / 2 - 120, h / 2 + 78, 240, 34);
    ctx.strokeStyle = `rgba(0,255,136,${0.5 * pulse})`; ctx.strokeRect(w / 2 - 120, h / 2 + 78, 240, 34);
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold 13px Courier New';
    ctx.fillText('ENTER  ·  BEGIN JOURNEY', w / 2, h / 2 + 100);
  }

  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
  if (ob.step < 3) ctx.fillText('↑↓ select  ·  ENTER next  ·  BACKSPACE back', w / 2, h - 20);
  else             ctx.fillText('ENTER confirm  ·  BACKSPACE back', w / 2, h - 20);
  ctx.textAlign = 'left';
}

// ─── Language options overlay (accessible from Options screen) ────────
export function drawLanguageOptions(ctx, w, h, langOb) {
  ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaddff'; ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 14;
  ctx.font = 'bold 18px Courier New'; ctx.fillText('LANGUAGE SETTINGS', w / 2, 50); ctx.shadowBlur = 0;

  const sections = [
    { label: 'NATIVE LANGUAGE', idx: langOb.nativeIdx, list: LANG_LIST, col: '#00ff88' },
    { label: 'LEARNING TARGET', idx: langOb.targetIdx, list: (LANGUAGE_PATHS[LANG_LIST[langOb.nativeIdx]] || LANGUAGE_PATHS.en), col: '#aaddff' },
    { label: 'DISPLAY MODE',    idx: langOb.modeIdx,   list: ['native','bilingual','target'], col: '#ffdd88' },
  ];

  sections.forEach((sec, si) => {
    const baseY = 80 + si * 110;
    const sel = langOb.row === si;
    ctx.fillStyle = sec.col; ctx.font = (sel ? 'bold ' : '') + '9px Courier New';
    ctx.fillText((sel ? '▶ ' : '  ') + sec.label, w / 2, baseY);
    const opts = sec.list.slice(0, 8);
    opts.forEach((code, i) => {
      const lang = LANGUAGES[code];
      const label = lang ? lang.emoji + ' ' + lang.name : code.toUpperCase();
      const active = i === sec.idx;
      const ox = w / 2 + (i - (opts.length - 1) / 2) * 78;
      ctx.fillStyle = (sel && active) ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(ox - 34, baseY + 14, 68, 22);
      ctx.strokeStyle = active ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.06)';
      ctx.strokeRect(ox - 34, baseY + 14, 68, 22);
      ctx.fillStyle = active ? sec.col : '#334455';
      ctx.font = active ? 'bold 9px Courier New' : '8px Courier New';
      ctx.fillText(label, ox, baseY + 29);
    });
  });

  ctx.fillStyle = '#131328'; ctx.font = '8px Courier New';
  ctx.fillText('↑↓ row  ·  ←→ value  ·  ENTER/ESC back', w / 2, h - 20);
  ctx.textAlign = 'left';
}
