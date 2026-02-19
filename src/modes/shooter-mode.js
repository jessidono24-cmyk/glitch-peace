'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE  —  shooter-mode.js
//  Fast-paced top-down shooter gameplay mode
//  Continuous movement, projectile combat, wave-based enemies
// ═══════════════════════════════════════════════════════════════════════

import { GameMode } from './game-mode.js';

/**
 * ShooterMode - Top-down shooter gameplay
 * 
 * Features:
 * - Continuous (not tile-based) movement
 * - Mouse aim and click to shoot
 * - Wave-based enemy spawning
 * - Power-ups from peace nodes
 * - Fast-paced action gameplay
 */
export class ShooterMode extends GameMode {
  constructor(sharedSystems) {
    super(sharedSystems);
    this.name = 'shooter';
    
    // Player state
    this.player = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,  // Aiming angle
      health: 100,
      maxHealth: 100,
      speed: 200,  // pixels per second
      radius: 15,
      score: 0
    };
    
    // Shooting state
    this.bullets = [];
    this.fireRate = 0.25;  // seconds between shots
    this.timeSinceLastShot = 0;
    this.bulletSpeed = 400;
    this.bulletDamage = 10;
    
    // Enemy state
    this.enemies = [];
    this.wave = 1;
    this.enemiesPerWave = 5;
    this.waveTimer = 0;
    this.waveDelay = 3;  // seconds between waves
    
    // Power-up state
    this.powerUps = [];
    this.activePowerUps = [];  // Currently active temporary power-ups
    
    // Input state
    this.mouseX = 0;
    this.mouseY = 0;
    this.isShooting = false;
    
    // World bounds
    this.worldWidth = 800;
    this.worldHeight = 600;
    
    // Camera
    this.camera = { x: 0, y: 0 };

    // Internal timing
    this._lastDt = 0.016; // default to 60 FPS delta
  }

  /**
   * Initialize shooter mode
   */
  init(config = {}) {
    super.init(config);
    
    // Reset player to center
    this.player.x = this.worldWidth / 2;
    this.player.y = this.worldHeight / 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.health = this.player.maxHealth;
    this.player.score = 0;
    
    // Clear arrays
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.activePowerUps = [];
    
    // Start first wave
    this.wave = 1;
    this.waveTimer = 0;
    this.spawnWave();
    
    // Reset timers
    this.timeSinceLastShot = 0;
    
    console.log('[ShooterMode] Initialized');
  }

  /**
   * Update shooter logic
   */
  update(dt, keys, matrixActive, ts) {
    const dtSec = dt / 1000;  // Convert to seconds
    this._lastDt = dtSec;
    
    // Update player movement
    this.updatePlayerMovement(dtSec, keys);
    
    // Update shooting
    this.updateShooting(dtSec);
    
    // Update bullets
    this.updateBullets(dtSec);
    
    // Update enemies
    this.updateEnemies(dtSec);
    
    // Update power-ups
    this.updatePowerUps(dtSec);
    
    // Check collisions
    this.checkCollisions();
    
    // Update wave spawning
    this.updateWaveSpawning(dtSec);
    
    // Update camera to follow player
    this.updateCamera();
    
    // Check for death
    if (this.player.health <= 0) {
      return { phase: 'dead', data: { score: this.player.score, mode: 'shooter' } };
    }
    
    // Update emotional field: fear builds with many enemies, joy when clearing
    const FEAR_RATE = 0.1;  // per second when enemies > 3
    const JOY_RATE  = 0.05; // per second when enemies <= 3
    if (this.enemies.length > 3) this.emotionalField.addEmotion('fear', FEAR_RATE * dtSec);
    else this.emotionalField.addEmotion('joy', JOY_RATE * dtSec);
    this.emotionalField.decay(dtSec);
    
    return null;
  }

  /**
   * Update player movement based on WASD input
   */
  updatePlayerMovement(dt, keys) {
    // Reset velocity
    let dx = 0;
    let dy = 0;
    
    // WASD movement
    if (keys.has('w') || keys.has('W') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('s') || keys.has('S') || keys.has('ArrowDown')) dy += 1;
    if (keys.has('a') || keys.has('A') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('d') || keys.has('D') || keys.has('ArrowRight')) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }
    
    // Apply speed
    this.player.vx = dx * this.player.speed;
    this.player.vy = dy * this.player.speed;
    
    // Update position
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    
    // Keep player in bounds
    this.player.x = Math.max(this.player.radius, Math.min(this.worldWidth - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.worldHeight - this.player.radius, this.player.y));
  }

  /**
   * Update shooting mechanics
   */
  updateShooting(dt) {
    this.timeSinceLastShot += dt;
    
    if (this.isShooting && this.timeSinceLastShot >= this.fireRate) {
      this.shoot();
      this.timeSinceLastShot = 0;
    }
  }

  /**
   * Fire a bullet
   */
  shoot() {
    const angle = this.player.angle;
    const bullet = {
      x: this.player.x,
      y: this.player.y,
      vx: Math.cos(angle) * this.bulletSpeed,
      vy: Math.sin(angle) * this.bulletSpeed,
      damage: this.bulletDamage,
      radius: 3,
      age: 0,
      maxAge: 2  // seconds
    };
    
    this.bullets.push(bullet);
    
    // Play shoot sound
    if (this.sfxManager) {
      this.sfxManager.playMenuSelect();  // Temporary sound
    }
  }

  /**
   * Update all bullets
   */
  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Move bullet
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.age += dt;
      
      // Remove if out of bounds or too old
      if (bullet.age > bullet.maxAge ||
          bullet.x < 0 || bullet.x > this.worldWidth ||
          bullet.y < 0 || bullet.y > this.worldHeight) {
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Update all enemies
   */
  updateEnemies(dt) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Simple AI: move toward player
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        enemy.x += (dx / dist) * enemy.speed * dt;
        enemy.y += (dy / dist) * enemy.speed * dt;
      }
      
      // Remove if dead
      if (enemy.health <= 0) {
        this.enemies.splice(i, 1);
        this.player.score += 10;
        
        // Maybe spawn power-up
        if (Math.random() < 0.2) {
          this.spawnPowerUp(enemy.x, enemy.y);
        }
      }
    }
  }

  /**
   * Update power-ups
   */
  updatePowerUps(dt) {
    // Age power-ups on ground
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.age += dt;
      
      // Remove if too old
      if (pu.age > 10) {
        this.powerUps.splice(i, 1);
      }
    }
    
    // Update active power-up timers
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const pu = this.activePowerUps[i];
      pu.timeLeft -= dt;
      
      if (pu.timeLeft <= 0) {
        this.deactivatePowerUp(pu);
        this.activePowerUps.splice(i, 1);
      }
    }
  }

  /**
   * Check all collisions
   */
  checkCollisions() {
    // Bullet-enemy collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < bullet.radius + enemy.radius) {
          // Hit!
          enemy.health -= bullet.damage;
          this.bullets.splice(i, 1);
          
          if (this.sfxManager) {
            this.sfxManager.playEnemyHit();
          }
          break;
        }
      }
    }
    
    // Player-enemy collisions
    const CONTACT_DAMAGE_COOLDOWN = 0.5; // seconds between contact hits per enemy
    for (const enemy of this.enemies) {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.player.radius + enemy.radius) {
        // Damage player (rate-limited by cooldown)
        if (!enemy._contactCooldown || enemy._contactCooldown <= 0) {
          this.player.health -= enemy.damage;
          enemy._contactCooldown = CONTACT_DAMAGE_COOLDOWN;
        }
        
        // Push player away
        if (dist > 0) {
          this.player.x += (dx / dist) * 3;
          this.player.y += (dy / dist) * 3;
        }
      }
      if (enemy._contactCooldown > 0) enemy._contactCooldown -= this._lastDt;
    }
    
    // Player-powerup collisions
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      const dx = this.player.x - pu.x;
      const dy = this.player.y - pu.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.player.radius + pu.radius) {
        this.collectPowerUp(pu);
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Spawn a new wave of enemies
   */
  spawnWave() {
    const count = this.enemiesPerWave + Math.floor(this.wave / 2);
    
    for (let i = 0; i < count; i++) {
      // Spawn at random edge
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      
      switch (edge) {
        case 0: // Top
          x = Math.random() * this.worldWidth;
          y = -20;
          break;
        case 1: // Right
          x = this.worldWidth + 20;
          y = Math.random() * this.worldHeight;
          break;
        case 2: // Bottom
          x = Math.random() * this.worldWidth;
          y = this.worldHeight + 20;
          break;
        case 3: // Left
          x = -20;
          y = Math.random() * this.worldHeight;
          break;
      }
      
      this.enemies.push({
        x, y,
        health: 30 + this.wave * 5,
        maxHealth: 30 + this.wave * 5,
        speed: 50 + this.wave * 2,
        radius: 12,
        damage: 10
      });
    }
    
    console.log(`[ShooterMode] Wave ${this.wave} spawned: ${count} enemies`);
  }

  /**
   * Update wave spawning
   */
  updateWaveSpawning(dt) {
    // If no enemies left, start timer for next wave
    if (this.enemies.length === 0) {
      this.waveTimer += dt;
      
      if (this.waveTimer >= this.waveDelay) {
        this.wave++;
        this.waveTimer = 0;
        this.spawnWave();
      }
    } else {
      this.waveTimer = 0;
    }
  }

  /**
   * Spawn a power-up at position
   */
  spawnPowerUp(x, y) {
    const types = ['health', 'speed', 'rapidfire', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.powerUps.push({
      x, y,
      type,
      radius: 10,
      age: 0
    });
  }

  /**
   * Collect a power-up
   */
  collectPowerUp(pu) {
    if (this.sfxManager) {
      this.sfxManager.playPeaceCollect();
    }
    
    switch (pu.type) {
      case 'health':
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
        break;
        
      case 'speed':
        this.activePowerUps.push({ type: 'speed', timeLeft: 5 });
        this.player.speed = 300;
        break;
        
      case 'rapidfire':
        this.activePowerUps.push({ type: 'rapidfire', timeLeft: 5 });
        this.fireRate = 0.1;
        break;
        
      case 'shield':
        this.activePowerUps.push({ type: 'shield', timeLeft: 8 });
        // Shield would need more implementation
        break;
    }
  }

  /**
   * Deactivate a power-up when it expires
   */
  deactivatePowerUp(pu) {
    switch (pu.type) {
      case 'speed':
        this.player.speed = 200;
        break;
        
      case 'rapidfire':
        this.fireRate = 0.25;
        break;
    }
  }

  /**
   * Update camera to follow player
   */
  updateCamera() {
    // Use fixed viewport size matching the grid canvas (CW/CH approximate)
    this.camera.x = this.player.x - 300;
    this.camera.y = this.player.y - 250;
  }

  /**
   * Render shooter mode
   */
  render(ctx, ts, renderData) {
    const w = renderData?.w || ctx.canvas.width;
    const h = renderData?.h || ctx.canvas.height;
    
    // Clear background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);
    
    // Save context and apply camera
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    
    // Draw world bounds
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);
    
    // Draw power-ups
    for (const pu of this.powerUps) {
      this.drawPowerUp(ctx, pu);
    }
    
    // Draw bullets
    ctx.fillStyle = '#00ffff';
    for (const bullet of this.bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw enemies
    for (const enemy of this.enemies) {
      this.drawEnemy(ctx, enemy);
    }
    
    // Draw player
    this.drawPlayer(ctx);
    
    // Restore context
    ctx.restore();
    
    // Draw HUD (not affected by camera)
    this.drawHUD(ctx, w, h);
  }

  /**
   * Draw player
   */
  drawPlayer(ctx) {
    const p = this.player;
    
    // Body
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Aim direction
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(
      p.x + Math.cos(p.angle) * (p.radius + 5),
      p.y + Math.sin(p.angle) * (p.radius + 5)
    );
    ctx.stroke();
  }

  /**
   * Draw enemy
   */
  drawEnemy(ctx, enemy) {
    // Body
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    const barWidth = enemy.radius * 2;
    const barHeight = 3;
    const healthPercent = enemy.health / enemy.maxHealth;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth, barHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth * healthPercent, barHeight);
  }

  /**
   * Draw power-up
   */
  drawPowerUp(ctx, pu) {
    const colors = {
      health: '#00ff00',
      speed: '#ffff00',
      rapidfire: '#ff8800',
      shield: '#0088ff'
    };
    
    ctx.fillStyle = colors[pu.type] || '#ffffff';
    ctx.beginPath();
    ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Pulse effect
    const pulse = Math.sin(pu.age * 5) * 3;
    ctx.strokeStyle = colors[pu.type] || '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pu.x, pu.y, pu.radius + pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Draw HUD
   */
  drawHUD(ctx, w, h) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    
    // Health
    const healthPercent = Math.max(0, this.player.health / this.player.maxHealth);
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillText(`HP: ${Math.ceil(this.player.health)}`, 10, 20);
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Score: ${this.player.score}`, 10, 40);
    
    // Wave
    ctx.fillText(`Wave: ${this.wave}`, 10, 60);
    
    // Enemies remaining
    ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 80);
    
    // Active power-ups
    let pyOffset = 100;
    for (const pu of this.activePowerUps) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`${pu.type.toUpperCase()}: ${Math.ceil(pu.timeLeft)}s`, 10, pyOffset);
      pyOffset += 20;
    }
  }

  /**
   * Handle input
   */
  handleInput(key, action, event) {
    // Mouse movement for aiming
    if (event && event.type === 'mousemove') {
      const rect = event.target.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left + this.camera.x;
      this.mouseY = event.clientY - rect.top + this.camera.y;
      
      // Update player angle
      const dx = this.mouseX - this.player.x;
      const dy = this.mouseY - this.player.y;
      this.player.angle = Math.atan2(dy, dx);
      return true;
    }
    
    // Mouse click for shooting
    if (action === 'mousedown') {
      this.isShooting = true;
      return true;
    }
    
    if (action === 'mouseup') {
      this.isShooting = false;
      return true;
    }
    
    return false;
  }

  /**
   * Cleanup
   */
  cleanup() {
    super.cleanup();
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.activePowerUps = [];
    console.log('[ShooterMode] Cleaned up');
  }

  /**
   * Get state for saving
   */
  getState() {
    return {
      name: this.name,
      player: { ...this.player },
      wave: this.wave,
      score: this.player.score
    };
  }

  /**
   * Restore from saved state
   */
  restoreState(state) {
    if (state.player) {
      this.player = { ...this.player, ...state.player };
    }
    if (state.wave) {
      this.wave = state.wave;
    }
  }
}
