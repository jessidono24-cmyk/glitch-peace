'use strict';
import { T, TILE_DEF, ARCHETYPES, CELL, GAP, PAL_A, PAL_B } from '../core/constants.js';
import { CFG, UPG } from '../core/state.js';

export function PAL(matrixActive) { return matrixActive === 'A' ? PAL_A : PAL_B; }

export function drawGame(ctx, ts, game, matrixActive, backgroundStars, visions, hallucinations, anomalyActive, anomalyData, glitchFrames, DPR, ghostPath) {
  const g = game; if (!g) return;
  const sz = g.sz;
  const gp = sz * CELL + (sz - 1) * GAP;
  const w = gp + 48, h = gp + 148;
  const P = PAL(matrixActive);
  const ds = g.ds;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = ds.bgColor; ctx.fillRect(0, 0, w, h);
  const bg2 = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.8);
  bg2.addColorStop(0, ds.bgAccent + '33'); bg2.addColorStop(1, 'transparent');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, w, h);
  if (matrixActive === 'A') { ctx.fillStyle = 'rgba(80,0,20,0.07)'; ctx.fillRect(0, 0, w, h); }

  // Scanlines
  for (let y = 0; y < h; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0, y, w, 1); }

  // Stars
  for (const s of backgroundStars) {
    const a = s.a * (0.5 + 0.5 * Math.sin(ts * 0.0008 + s.phase));
    ctx.globalAlpha = a; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Glitch
  if (glitchFrames > 0) {
    ctx.fillStyle = `rgba(${matrixActive === 'A' ? '180,0,60' : '0,180,60'},0.04)`;
    ctx.fillRect(0, Math.floor(Math.random() * h), w, 2 + Math.floor(Math.random() * 4));
  }

  // Shake
  let ox = 0, oy = 0;
  if (g.shakeFrames > 0) {
    ox = (Math.random() - 0.5) * 9 * (g.shakeFrames / 10);
    oy = (Math.random() - 0.5) * 9 * (g.shakeFrames / 10);
    g.shakeFrames--;
  }
  const sx = (w - gp) / 2 + ox, sy = 110 + oy;

  // Vision words
  for (const v of visions) {
    v.x += v.dx; v.y += v.dy; v.life--;
    if (v.life > v.maxLife * 0.85) v.alpha = Math.min(v.targetAlpha, (v.maxLife - v.life) / (v.maxLife * 0.15) * v.targetAlpha);
    else if (v.life < v.maxLife * 0.15) v.alpha = Math.max(0, (v.life / (v.maxLife * 0.15)) * v.targetAlpha);
    if (v.life <= 0) { v.life = 200 + Math.floor(Math.random() * 400); v.maxLife = 600; }
    ctx.globalAlpha = v.alpha * (matrixActive === 'A' ? 0.7 : 1);
    ctx.fillStyle = matrixActive === 'A' ? '#ff4488' : '#00aa55';
    ctx.font = '9px Courier New'; ctx.textAlign = 'center'; ctx.fillText(v.text, v.x, v.y);
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';

  // Grid
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const raw = g.grid[y][x];
      const fl  = g.tileFlicker.find(f => f.y === y && f.x === x);
      const val = (fl && fl.reveal && raw === T.HIDDEN) ? T.INSIGHT : raw;
      const td  = TILE_DEF[val] || TILE_DEF[T.VOID];
      const tp  = P[val] || P[T.VOID];
      const px  = sx + x * (CELL + GAP), py = sy + y * (CELL + GAP);

      if (anomalyActive && (y === anomalyData.row || x === anomalyData.col)) { ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 10; }
      else if (tp.glow) { ctx.shadowColor = tp.glow; ctx.shadowBlur = 12; }
      else ctx.shadowBlur = 0;

      ctx.fillStyle = tp.bg; ctx.beginPath(); ctx.roundRect(px, py, CELL, CELL, 4); ctx.fill();
      ctx.strokeStyle = tp.bd; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1, 4); ctx.stroke();
      ctx.shadowBlur = 0;

      // Special tile renders
      if (val === T.PEACE) {
        const s2 = (ts * 0.05 + y * 6 + x * 4) % (CELL * 2);
        if (s2 < CELL) {
          const gr = ctx.createLinearGradient(px, py + s2 - 5, px, py + s2 + 5);
          gr.addColorStop(0, 'rgba(0,255,140,0)'); gr.addColorStop(0.5, 'rgba(0,255,140,0.45)'); gr.addColorStop(1, 'rgba(0,255,140,0)');
          ctx.fillStyle = gr; ctx.fillRect(px, py, CELL, CELL);
        }
        ctx.shadowColor = '#00ffaa'; ctx.shadowBlur = 10; ctx.fillStyle = '#00ffaa';
        ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2, 5 + 2 * Math.sin(ts * 0.006 + x + y), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (val === T.INSIGHT) {
        ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 14;
        const angle = ts * 0.008 + x * 1.7 + y * 1.3;
        for (let i = 0; i < 4; i++) {
          const a = angle + i * Math.PI * 0.5, r = 7 + 2 * Math.sin(ts * 0.005 + i);
          ctx.fillStyle = i % 2 === 0 ? '#00eeff' : '#00aacc';
          ctx.beginPath(); ctx.arc(px + CELL / 2 + Math.cos(a) * r, py + CELL / 2 + Math.sin(a) * r, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
      if (val === T.ARCHETYPE) {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.01 + x + y);
        ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 16 * pulse;
        ctx.fillStyle = `rgba(255,220,0,${0.15 * pulse})`; ctx.fillRect(px, py, CELL, CELL);
        ctx.font = '18px Courier New'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffee44'; ctx.fillText('☆', px + CELL / 2, py + CELL / 2 + 6);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
      }
      if (val === T.TELEPORT) {
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.012 + x * 2 + y);
        ctx.shadowColor = '#00aaff'; ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = `rgba(0,170,255,${0.2 * pulse})`; ctx.fillRect(px, py, CELL, CELL);
        ctx.font = '14px Courier New'; ctx.textAlign = 'center';
        ctx.fillStyle = '#00ccff'; ctx.fillText('⇒', px + CELL / 2, py + CELL / 2 + 5);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
      }
      if (val === T.MEMORY) {
        const pulse = 0.3 + 0.3 * Math.sin(ts * 0.004 + x + y);
        ctx.globalAlpha = 0.4 + 0.2 * pulse;
        ctx.fillStyle = 'rgba(100,200,150,0.15)'; ctx.fillRect(px, py, CELL, CELL);
        ctx.globalAlpha = 1;
      }
      if (td.sym && val !== T.VOID && val !== T.WALL && val !== T.PEACE && val !== T.INSIGHT &&
          val !== T.ARCHETYPE && val !== T.TELEPORT && val !== T.HIDDEN && val !== T.MEMORY) {
        ctx.fillStyle = tp.bd; ctx.font = '12px Courier New'; ctx.textAlign = 'center';
        ctx.globalAlpha = 0.55; ctx.fillText(td.sym, px + CELL / 2, py + CELL / 2 + 5);
        ctx.globalAlpha = 1; ctx.textAlign = 'left';
      }
      if ((val === T.PEACE || val === T.INSIGHT) && UPG.magnet) {
        const md = Math.abs(y - g.player.y) + Math.abs(x - g.player.x);
        if (md <= 2) {
          ctx.strokeStyle = 'rgba(0,255,180,0.28)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(px + 2, py + 2, CELL - 4, CELL - 4, 4); ctx.stroke();
        }
      }
    }
  }
  g.tileFlicker = g.tileFlicker.filter(f => { f.t--; return f.t > 0; });

  // Consequence preview ghost path
  if (ghostPath && ghostPath.length > 0) {
    ghostPath.forEach((step, i) => {
      const gpx = sx + step.x * (CELL + GAP), gpy = sy + step.y * (CELL + GAP);
      const alpha = 0.22 - i * 0.05;
      const col = step.hpDelta > 0 ? '#00ffaa' : step.hpDelta < 0 ? '#ff3333' : '#aaaaff';
      ctx.globalAlpha = Math.max(0.05, alpha);
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(gpx + 2, gpy + 2, CELL - 4, CELL - 4, 3); ctx.stroke();
      if (step.hpDelta !== 0) {
        ctx.fillStyle = col; ctx.font = '9px Courier New'; ctx.textAlign = 'center'; ctx.globalAlpha = Math.max(0.1, alpha + 0.1);
        ctx.fillText((step.hpDelta > 0 ? '+' : '') + Math.round(step.hpDelta), gpx + CELL / 2, gpy + CELL / 2 + 4);
        ctx.textAlign = 'left';
      }
    });
    ctx.globalAlpha = 1;
  }

  // Capture zones
  for (const cz of g.captureZones) {
    ctx.strokeStyle = `rgba(255,0,68,${0.4 * (cz.timer / 300)})`; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(sx + cz.x * (CELL + GAP) + CELL / 2, sy + cz.y * (CELL + GAP) + CELL / 2, (cz.r + 0.5) * (CELL + GAP), 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Echoes
  for (const e of g.echos) {
    ctx.globalAlpha = e.life / e.maxLife * 0.55; ctx.fillStyle = e.color;
    ctx.beginPath(); ctx.arc(sx + e.x, sy + e.y, e.size * (e.life / e.maxLife), 0, Math.PI * 2); ctx.fill();
    e.life--;
  }
  g.echos = g.echos.filter(e => e.life > 0); ctx.globalAlpha = 1;

  // Trail
  if (CFG.particles) {
    for (const t of g.trail) {
      ctx.globalAlpha = (t.life / t.maxLife) * 0.48; ctx.fillStyle = t.color;
      ctx.shadowColor = t.color; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(sx + t.x, sy + t.y, 4 * (t.life / t.maxLife), 0, Math.PI * 2); ctx.fill();
      t.life--;
    }
    g.trail = g.trail.filter(t => t.life > 0); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Hallucinations
  for (const h of hallucinations) {
    if (h.life <= 0) continue;
    const px = sx + h.x * (CELL + GAP), py = sy + h.y * (CELL + GAP);
    const fade = 0.3 + 0.25 * Math.sin(Date.now() * 0.006 + h.x);
    ctx.globalAlpha = fade; ctx.fillStyle = '#220044'; ctx.shadowColor = '#8800ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.roundRect(px + 8, py + 8, CELL - 16, CELL - 16, 4); ctx.fill();
    ctx.fillStyle = 'rgba(170,0,255,0.6)'; ctx.font = '16px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('?', px + CELL / 2, py + CELL / 2 + 5);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }

  // Enemies
  for (const e of g.enemies) {
    const px = sx + e.x * (CELL + GAP), py = sy + e.y * (CELL + GAP);
    const pulse = 0.6 + 0.4 * Math.sin(ts * 0.007 + e.x * 1.3);
    const stunned = e.stunTimer > 0, isRush = e.type === 'rush';
    const eGlow = stunned ? '#8888ff' : isRush ? '#ff0066' : (matrixActive === 'A' ? '#ff0044' : '#ff4400');
    ctx.shadowColor = eGlow; ctx.shadowBlur = 14 * pulse;
    ctx.fillStyle = stunned ? '#1c1c44' : isRush ? '#4a0022' : (matrixActive === 'A' ? '#660022' : '#aa2200');
    ctx.beginPath(); ctx.roundRect(px + 5, py + 5, CELL - 10, CELL - 10, 6); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = stunned ? '#4444aa' : isRush ? '#ff0066' : (matrixActive === 'A' ? '#ff2266' : '#ff6622');
    ctx.beginPath(); ctx.moveTo(px + CELL / 2, py + 12); ctx.lineTo(px + CELL - 12, py + CELL - 12); ctx.lineTo(px + 12, py + CELL - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = stunned ? '#6666cc' : '#ffcc00';
    ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2 + 2, 4, 0, Math.PI * 2); ctx.fill();
  }

  // Boss
  if (g.boss && g.boss.hp > 0) {
    const b = g.boss;
    const px = sx + b.x * (CELL + GAP), py = sy + b.y * (CELL + GAP);
    const pulse = 0.5 + 0.5 * Math.sin(ts * 0.005);
    ctx.shadowColor = '#ff00aa'; ctx.shadowBlur = 28 * pulse;
    ctx.fillStyle = '#330022'; ctx.beginPath(); ctx.roundRect(px + 1, py + 1, CELL - 2, CELL - 2, 8); ctx.fill();
    ctx.fillStyle = '#ff00aa'; ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2, CELL * 0.3 + 4 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffccee'; ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('HP:' + b.hp, px + CELL / 2, py + CELL / 2 + 4);
    ctx.textAlign = 'left'; ctx.shadowBlur = 0;
  }

  // Player
  {
    const px = sx + g.player.x * (CELL + GAP), py = sy + g.player.y * (CELL + GAP);
    const pulse = 0.55 + 0.45 * Math.sin(ts * 0.009);
    const shld = UPG.shield && UPG.shieldTimer > 0;
    const phase_ = UPG.phaseShift && UPG.phaseTimer > 0;
    const em = UPG.emotion;
    const emTint = em === 'panic' ? '#ff0022' : em === 'hopeless' ? '#0033aa' : em === 'peace' ? '#00ffcc' : em === 'clarity' ? '#00eeff' : '#00ffaa';
    const pGlow = matrixActive === 'A' ? '#ff0088' : (shld ? '#00ffff' : phase_ ? '#00aaff' : emTint);
    ctx.shadowColor = pGlow; ctx.shadowBlur = (shld ? 36 : UPG.aura ? 30 : 22) * pulse;
    const c1 = matrixActive === 'A' ? '#aa0055' : '#005533';
    const c2 = matrixActive === 'A' ? '#cc0077' : '#00cc77';
    const c3 = matrixActive === 'A' ? 'rgba(200,0,120,0.9)' : 'rgba(0,255,170,0.9)';
    ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect(px + 4, py + 4, CELL - 8, CELL - 8, 8); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.roundRect(px + 9, py + 9, CELL - 18, CELL - 18, 5); ctx.fill();
    ctx.fillStyle = c3; ctx.beginPath(); ctx.roundRect(px + 15, py + 15, CELL - 30, CELL - 30, 3); ctx.fill();
    if (g.archetypeActive) {
      const arch = ARCHETYPES[g.archetypeType || 'orb'];
      ctx.strokeStyle = arch.glow; ctx.lineWidth = 2; ctx.shadowColor = arch.glow; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.roundRect(px + 1, py + 1, CELL - 2, CELL - 2, 8); ctx.stroke();
    }
    if (shld) { ctx.strokeStyle = 'rgba(0,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(px, py, CELL, CELL, 8); ctx.stroke(); }
    if (phase_) ctx.globalAlpha = 0.4;
    if (UPG.aura) {
      ctx.strokeStyle = `rgba(0,255,136,${0.12 + 0.08 * pulse})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2, (CELL / 2 + 7) * pulse, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.strokeStyle = pGlow; ctx.lineWidth = 2;
    const bk = 9;
    [[px, py], [px + CELL, py], [px, py + CELL], [px + CELL, py + CELL]].forEach(([bx, by], i) => {
      const ddx = i % 2 === 0 ? 1 : -1, ddy = i < 2 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(bx + ddx * 2, by); ctx.lineTo(bx + ddx * (2 + bk), by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by + ddy * 2); ctx.lineTo(bx, by + ddy * (2 + bk)); ctx.stroke();
    });
    ctx.shadowBlur = 0;
  }

  // Particles
  if (CFG.particles) {
    game.particles = game.particles.filter(p => p.life > 0);
    for (const p of game.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 7;
      ctx.beginPath(); ctx.arc(sx + p.x, sy + p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill();
      p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life--;
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Resonance wave
  if (g.resonanceWave) {
    const rw = g.resonanceWave; rw.r += 7; rw.alpha = Math.max(0, rw.alpha - (0.55 / rw.maxR) * 7);
    ctx.strokeStyle = rw.color; ctx.globalAlpha = rw.alpha; ctx.lineWidth = 2;
    ctx.shadowColor = rw.color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(sx + rw.x, sy + rw.y, rw.r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (rw.r >= rw.maxR) g.resonanceWave = null;
  }

  // Flash
  if (g.flashAlpha > 0) {
    ctx.fillStyle = g.flashColor; ctx.globalAlpha = g.flashAlpha; ctx.fillRect(sx, sy, gp, gp);
    ctx.globalAlpha = 1; g.flashAlpha = Math.max(0, g.flashAlpha - 0.04);
  }

  // Matrix A vignette
  if (matrixActive === 'A') {
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.9);
    vg.addColorStop(0, 'rgba(80,0,20,0)'); vg.addColorStop(1, 'rgba(80,0,20,0.22)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  }

  drawHUD(ctx, g, w, h, gp, sx, sy, matrixActive);
}

function drawHUD(ctx, g, w, h, gp, sx, sy, matrixActive) {
  const UPG_ref = UPG;
  const hudH = 106;
  ctx.fillStyle = '#070714'; ctx.fillRect(0, 0, w, hudH);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, hudH); ctx.lineTo(w, hudH); ctx.stroke();

  ctx.fillStyle = g.ds.bgAccent + '88'; ctx.fillRect(0, 0, w, 16);
  ctx.fillStyle = '#334455'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
  ctx.fillText(g.ds.name + '  ·  ' + g.ds.emotion, w / 2, 11); ctx.textAlign = 'left';

  // HP
  const hpBarW = 138;
  ctx.fillStyle = '#333'; ctx.font = '9px Courier New'; ctx.fillText('HP', 14, 30);
  ctx.fillStyle = '#0e0e1e'; ctx.fillRect(32, 20, hpBarW, 13);
  const hpPct = g.hp / UPG_ref.maxHp;
  const hpC = hpPct > 0.6 ? '#00ff88' : hpPct > 0.3 ? '#ffaa00' : '#ff3333';
  ctx.fillStyle = hpC; ctx.shadowColor = hpC; ctx.shadowBlur = 5; ctx.fillRect(32, 20, hpBarW * hpPct, 13);
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.strokeRect(32, 20, hpBarW, 13);
  ctx.fillStyle = '#444'; ctx.font = '8px Courier New'; ctx.fillText(g.hp + '/' + UPG_ref.maxHp, 32 + hpBarW + 4, 30);

  // Energy
  const eBarW = 138;
  ctx.fillStyle = '#222'; ctx.font = '8px Courier New'; ctx.fillText('EN', 14, 50);
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(32, 41, eBarW, 9);
  const eC = matrixActive === 'A' ? '#ff0055' : '#0088ff';
  ctx.fillStyle = eC; ctx.shadowColor = eC; ctx.shadowBlur = 4; ctx.fillRect(32, 41, eBarW * (UPG_ref.energy / UPG_ref.energyMax), 9);
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.strokeRect(32, 41, eBarW, 9);

  // PurgDepth bar (dark red depth indicator)
  {
    const pd = window._purgDepth || 0;
    ctx.fillStyle = '#1a0000'; ctx.fillRect(32, 52, eBarW, 5);
    const pdC = pd > 0.7 ? '#ff2222' : pd > 0.4 ? '#aa2200' : '#440000';
    ctx.fillStyle = pdC; ctx.fillRect(32, 52, eBarW * pd, 5);
    ctx.strokeStyle = 'rgba(200,0,0,0.2)'; ctx.strokeRect(32, 52, eBarW, 5);
    if (pd > 0.05) {
      ctx.fillStyle = pd > 0.7 ? '#ff2222' : '#660000'; ctx.font = '6px Courier New';
      ctx.fillText('PURG ' + (pd * 100).toFixed(0) + '%', 32 + eBarW + 4, 58);
    }
  }

  if (UPG_ref.glitchPulse) {
    ctx.fillStyle = '#220a22'; ctx.fillRect(32, 59, eBarW, 5);
    const pChr = UPG_ref.glitchPulseCharge / 100;
    ctx.fillStyle = pChr >= 1 ? '#ff00ff' : '#660088'; ctx.fillRect(32, 59, eBarW * pChr, 5);
    ctx.strokeStyle = 'rgba(150,0,200,0.2)'; ctx.strokeRect(32, 59, eBarW, 5);
    ctx.fillStyle = pChr >= 1 ? '#ff00ff' : '#553355'; ctx.font = '7px Courier New'; ctx.fillText('PULSE' + (pChr >= 1 ? ' READY' : ''), 32 + eBarW + 4, 65);
  }

  // ImpulseBuffer hold progress (shown when holding into hazard)
  {
    const prog = window._impulseProgress || 0;
    if (prog > 0 && prog < 1) {
      ctx.fillStyle = '#332200'; ctx.fillRect(32, 66, eBarW, 4);
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(32, 66, eBarW * prog, 4);
      ctx.strokeStyle = 'rgba(255,170,0,0.25)'; ctx.strokeRect(32, 66, eBarW, 4);
      ctx.fillStyle = '#ffaa00'; ctx.font = '6px Courier New'; ctx.fillText('HOLD…', 32 + eBarW + 4, 70);
    }
  }

  if (g.archetypeActive && g.archetypeType) {
    const arch = ARCHETYPES[g.archetypeType];
    ctx.fillStyle = arch ? arch.color : '#ffdd00'; ctx.shadowColor = arch ? arch.glow : '#ffdd00'; ctx.shadowBlur = 4;
    ctx.font = '8px Courier New'; ctx.fillText(arch ? arch.name + ' ACTIVE' : '[ARCH ACTIVE]', 14, 76); ctx.shadowBlur = 0;
  } else if (UPG_ref.shield && UPG_ref.shieldTimer > 0) {
    ctx.fillStyle = '#00ffff'; ctx.font = '8px Courier New'; ctx.fillText('SHIELD×' + UPG_ref.shieldTimer, 14, 76);
  } else if (UPG_ref.shieldCount > 0) {
    ctx.fillStyle = '#334455'; ctx.font = '8px Courier New'; ctx.fillText('streak ' + UPG_ref.shieldCount + '/3', 14, 76);
  }

  // Emotional synergy label
  const synergy = window._emotionSynergy;
  if (synergy) {
    ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 5;
    ctx.font = '7px Courier New'; ctx.fillText('⚡ ' + synergy.label.toUpperCase(), 14, 84); ctx.shadowBlur = 0;
  }

  if (UPG_ref.comboCount > 1) {
    ctx.fillStyle = '#ffcc00'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 6;
    ctx.font = '8px Courier New'; ctx.fillText('COMBO ×' + UPG_ref.resonanceMultiplier.toFixed(1), 14, 91);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00eeff'; ctx.shadowBlur = 5;
  ctx.font = '9px Courier New'; ctx.fillText('◆×' + (window._insightTokens || 0), 14, 99); ctx.shadowBlur = 0;

  // Score
  ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
  ctx.font = 'bold 19px Courier New'; ctx.textAlign = 'center';
  ctx.fillText(String(g.score).padStart(7, '0'), w / 2, 38); ctx.shadowBlur = 0;
  ctx.fillStyle = '#222838'; ctx.font = '8px Courier New'; ctx.fillText('SCORE', w / 2, 52);

  const mC = matrixActive === 'A' ? '#ff0055' : '#00aa55';
  ctx.fillStyle = mC; ctx.shadowColor = mC; ctx.shadowBlur = 7;
  ctx.font = 'bold 10px Courier New'; ctx.fillText('MTX·' + matrixActive, w / 2 - 16, 68); ctx.shadowBlur = 0;

  ctx.textAlign = 'right';
  ctx.fillStyle = '#445566'; ctx.font = '10px Courier New'; ctx.fillText('LVL ' + g.level, w - 12, 30);
  ctx.fillStyle = '#005533'; ctx.fillText('◈×' + g.peaceLeft, w - 12, 44);
  ctx.fillStyle = '#223344'; ctx.font = '8px Courier New';
  ctx.fillText((window._dreamIdx + 1 || 1) + '/10 DREAMS', w - 12, 58);
  // Temporal system info (lunar + planet)
  const tmods = window._tmods;
  if (tmods) {
    ctx.fillStyle = '#223344'; ctx.font = '7px Courier New';
    ctx.fillText(tmods.lunarName || '', w - 12, 70);
    ctx.fillText(tmods.planetName || '', w - 12, 80);
  }
  ctx.textAlign = 'left';

  if (g.msg && g.msgTimer > 0) {
    ctx.globalAlpha = Math.min(1, g.msgTimer / 18);
    ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'center';
    ctx.fillStyle = g.msgColor; ctx.shadowColor = g.msgColor; ctx.shadowBlur = 16;
    ctx.fillText(g.msg, w / 2, sy - 16);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    g.msgTimer--;
  }

  // ── Phase 6: Vocabulary word flash ───────────────────────────────────
  const vocabWord = window._vocabWord;
  if (vocabWord) {
    const vAlpha = Math.min(1, (window._vocabTimer || 150) / 30);
    ctx.globalAlpha = Math.min(1, vAlpha);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(w/2 - 120, sy - 54, 240, 36);
    ctx.strokeStyle = 'rgba(255,221,136,0.3)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 120, sy - 54, 240, 36);
    ctx.fillStyle = '#ffdd88'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 5;
    ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(vocabWord.word + '  [' + vocabWord.pos + ']', w/2, sy - 36); ctx.shadowBlur = 0;
    ctx.fillStyle = '#886644'; ctx.font = '9px Courier New';
    ctx.fillText(vocabWord.def, w/2, sy - 20);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase 6: Pattern discovery banner ────────────────────────────────
  const banner = window._patternBanner;
  if (banner) {
    const bProg = banner.timer / banner.maxTimer;
    const bAlpha = bProg > 0.85 ? (1 - bProg) / 0.15 : bProg < 0.1 ? bProg / 0.1 : 1;
    ctx.globalAlpha = Math.min(1, bAlpha);
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(w/2 - 148, h/2 - 38, 296, 72);
    ctx.strokeStyle = banner.color + '66'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 148, h/2 - 38, 296, 72);
    ctx.fillStyle = banner.color; ctx.shadowColor = banner.color; ctx.shadowBlur = 12;
    ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'center';
    ctx.fillText(banner.symbol + ' ' + banner.name.toUpperCase() + ' DISCOVERED', w/2, h/2 - 14); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ccbbaa'; ctx.font = '9px Courier New';
    ctx.fillText(banner.description, w/2, h/2 + 4);
    ctx.fillStyle = '#665544'; ctx.font = '8px Courier New';
    ctx.fillText(banner.fact, w/2, h/2 + 20);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase 8: Emergence indicator flash ───────────────────────────────
  const em = window._emergence;
  if (em && em.flash) {
    ctx.globalAlpha = Math.min(1, em.alpha);
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(w/2 - 150, h*0.72, 300, 56);
    ctx.strokeStyle = 'rgba(170,200,255,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 150, h*0.72, 300, 56);
    ctx.fillStyle = '#aaccff'; ctx.shadowColor = '#88aaff'; ctx.shadowBlur = 8;
    ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('✦ EMERGENCE · ' + em.flash.label.toUpperCase(), w/2, h*0.72 + 18); ctx.shadowBlur = 0;
    ctx.fillStyle = '#667799'; ctx.font = '8px Courier New';
    ctx.fillText(em.flash.desc, w/2, h*0.72 + 36);
    ctx.fillStyle = '#334455'; ctx.font = '7px Courier New';
    ctx.fillText('AWAKENING LEVEL: ' + em.label, w/2, h*0.72 + 50);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  // ── Phase 10: Chakra awakening flash ─────────────────────────────────
  const ck = window._chakra;
  if (ck && ck.flash) {
    ctx.globalAlpha = Math.min(1, ck.alpha);
    const fc = ck.flash;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(w/2 - 140, h*0.28, 280, 54);
    ctx.strokeStyle = fc.color + '88'; ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 140, h*0.28, 280, 54);
    ctx.fillStyle = fc.glow; ctx.shadowColor = fc.glow; ctx.shadowBlur = 10;
    ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('◉ ' + fc.name.toUpperCase() + ' CHAKRA AWAKENED', w/2, h*0.28 + 18); ctx.shadowBlur = 0;
    ctx.fillStyle = '#aa8866'; ctx.font = '9px Courier New';
    ctx.fillText(fc.sanskrit + '  ·  ' + fc.desc, w/2, h*0.28 + 34);
    ctx.fillStyle = '#665544'; ctx.font = '8px Courier New';
    ctx.fillText(fc.powerup, w/2, h*0.28 + 48);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }

  ctx.fillStyle = '#070714'; ctx.fillRect(0, h - 28, w, 28);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.beginPath(); ctx.moveTo(0, h - 28); ctx.lineTo(w, h - 28); ctx.stroke();
  ctx.fillStyle = '#1a1a2a'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
  ctx.fillText('WASD/ARROWS · SHIFT=matrix · J=arch · R=pulse · Q=freeze · C=contain · ESC=pause · H=dashboard', w / 2, h - 11);
  ctx.textAlign = 'left';

  // ── Phase 9: Empathy flash (enemy behavior label shown after freeze) ──
  const iqData = window._iqData;
  if (iqData) {
    const fe = iqData.flashEmotion;
    if (fe && iqData.empathyAlpha > 0) {
      ctx.globalAlpha = Math.min(1, iqData.empathyAlpha);
      ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(sx, sy + gp + 8, gp, 34);
      ctx.strokeStyle = fe.color + '55'; ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy + gp + 8, gp, 34);
      ctx.fillStyle = fe.color; ctx.shadowColor = fe.color; ctx.shadowBlur = 6;
      ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
      ctx.fillText(fe.label, sx + gp / 2, sy + gp + 22); ctx.shadowBlur = 0;
      ctx.fillStyle = '#665544'; ctx.font = '7px Courier New';
      ctx.fillText(fe.insight, sx + gp / 2, sy + gp + 34);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    // Phase 9: EQ emotion recognition flash (dominant emotion label)
    const eqfl = iqData.eqFlash;
    if (eqfl && iqData.eqFlashAlpha > 0) {
      ctx.globalAlpha = Math.min(0.85, iqData.eqFlashAlpha);
      const eqX = w - 145, eqY = 85;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(eqX, eqY, 136, 28);
      ctx.strokeStyle = eqfl.color + '44'; ctx.lineWidth = 1;
      ctx.strokeRect(eqX, eqY, 136, 28);
      ctx.fillStyle = eqfl.color; ctx.font = 'bold 9px Courier New';
      ctx.fillText('⟦ ' + eqfl.label.toUpperCase() + ' ⟧', eqX + 4, eqY + 12);
      ctx.fillStyle = '#554433'; ctx.font = '7px Courier New';
      ctx.fillText(eqfl.tip.slice(0, 22), eqX + 4, eqY + 24);
      ctx.globalAlpha = 1;
    }
    // Phase 9: Sequence challenge overlay (logic puzzle)
    const challenge = iqData.challenge;
    if (challenge && iqData.challengeAlpha > 0) {
      ctx.globalAlpha = Math.min(1, iqData.challengeAlpha);
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(w/2 - 160, h*0.42, 320, 80);
      ctx.strokeStyle = 'rgba(136,221,255,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(w/2 - 160, h*0.42, 320, 80);
      ctx.fillStyle = '#88ddff'; ctx.shadowColor = '#66aaff'; ctx.shadowBlur = 8;
      ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('◆ PATTERN RECOGNITION: ' + challenge.name.toUpperCase(), w/2, h*0.42 + 16); ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaccee'; ctx.font = '14px Courier New';
      ctx.fillText(challenge.seq.join('  ·  ') + '  ·  ?', w/2, h*0.42 + 38);
      ctx.fillStyle = '#44aa66'; ctx.font = 'bold 12px Courier New';
      ctx.fillText('next: ' + challenge.next, w/2, h*0.42 + 58);
      ctx.fillStyle = '#445566'; ctx.font = '7px Courier New';
      ctx.fillText(challenge.fact, w/2, h*0.42 + 74);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    // Phase M3: Tutorial hint overlay (first 3 dreamscapes)
    const hints = window._tutorialHints;
    if (hints && hints.length > 0) {
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = 'rgba(0,12,0,0.9)'; ctx.fillRect(sx, sy - 44, gp, 38);
      ctx.strokeStyle = 'rgba(0,255,136,0.22)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy - 44, gp, 38);
      ctx.fillStyle = '#00cc66'; ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('HINT', sx + gp / 2, sy - 30);
      ctx.fillStyle = '#225533'; ctx.font = '8px Courier New';
      hints.slice(0, 2).forEach((h, i) => ctx.fillText(h, sx + gp / 2, sy - 18 + i * 13));
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
  }
}
