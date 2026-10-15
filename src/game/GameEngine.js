// GameEngine: Progressive Waves, line-segment slicing physics, paparazzi triggers, and Grand Finale Boss
// Cyberpunk Data Decryption Engine (Beat Saber Style)

import { GameObject, GiantMainframeCore } from './GameObjects';
import { soundEngine } from '../audio/SoundEngine';
import { LOVE_CONFIG } from '../config/loveConfig';

export class GameEngine {
  constructor({
    vfx,
    onScoreChange,
    onLivesChange,
    onComboChange,
    onToast,
    onPolaroidSpawn,
    onBossStart,
    onFinaleComplete,
    onWaveChange,
    onPaparazziCapture,
    onTimeUpdate,
    onGlitchTrigger
  }) {
    this.vfx = vfx;
    this.onScoreChange = onScoreChange || (() => {});
    this.onLivesChange = onLivesChange || (() => {});
    this.onComboChange = onComboChange || (() => {});
    this.onToast = onToast || (() => {});
    this.onPolaroidSpawn = onPolaroidSpawn || (() => {});
    this.onBossStart = onBossStart || (() => {});
    this.onFinaleComplete = onFinaleComplete || (() => {});
    this.onWaveChange = onWaveChange || (() => {});
    this.onPaparazziCapture = onPaparazziCapture || (() => {});
    this.onTimeUpdate = onTimeUpdate || (() => {});
    this.onGlitchTrigger = onGlitchTrigger || (() => {});

    this.objects = [];
    this.slicedHalves = [];
    this.score = 0; // Decrypted data in KB
    this.lives = LOVE_CONFIG.initialLives;
    this.combo = 0;
    this.comboTimer = 0;
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.nextSpawnInterval = 1.3;

    // Progressive Rounds (1: 0-20s, 2: 20-40s, 3: 40-60s)
    this.currentWave = 1;
    this.lastWave = 0;
    this.frenzyTriggered24 = false;
    this.frenzyTriggered34 = false;
    this.isFinaleTriggered = false;

    // Paparazzi Fallback Timer
    this.paparazziTimer = 0;

    // Boss Phase (Mainframe Core)
    this.isBossPhase = false;
    this.boss = null;
    this.isGameOver = false;
    this.isReviving = false;

    // Screen dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Previous finger coordinates for line-intersection slice detection
    this.prevX = null;
    this.prevY = null;
    this.prevBladePos = null;

    // Game state: starts false until unlocked by Biometric Scanner
    this.isGameStarted = false;

    // Index rotation
    this.toastIndex = 0;
  }

  startGame() {
    this.isGameStarted = true;
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.isFinaleTriggered = false;
    this.onWaveChange(1, "ROUND 1: PEMANASAN 🎮");
    this.onTimeUpdate(LOVE_CONFIG.gameDurationSeconds);
  }

  setDimensions(w, h) {
    this.width = w;
    this.height = h;
    if (this.boss) {
      this.boss.x = w / 2;
      this.boss.y = h / 2 - 20;
    }
  }

  resetGame() {
    this.isGameStarted = true;
    this.objects = [];
    this.slicedHalves = [];
    this.score = 0;
    this.lives = LOVE_CONFIG.initialLives;
    this.combo = 0;
    this.comboTimer = 0;
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.currentWave = 1;
    this.lastWave = 0;
    this.frenzyTriggered24 = false;
    this.frenzyTriggered34 = false;
    this.isFinaleTriggered = false;
    this.paparazziTimer = 0;
    this.isBossPhase = false;
    this.boss = null;
    this.isGameOver = false;
    this.isReviving = false;
    this.prevX = null;
    this.prevY = null;
    this.prevBladePos = null;

    this.onScoreChange(this.score);
    this.onLivesChange(this.lives);
    this.onComboChange(0);
    this.onWaveChange(1, "ROUND 1: PEMANASAN 🎮");
    this.onTimeUpdate(LOVE_CONFIG.gameDurationSeconds);
  }

  // Handle blade point from tracker using Line-Intersection between (prevX, prevY) and (currX, currY)
  handleBladeMove(currX, currY) {
    this.vfx.addBladePoint(currX, currY);

    if (this.prevX !== null && this.prevY !== null) {
      const p1 = { x: this.prevX, y: this.prevY };
      const p2 = { x: currX, y: currY };
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      // Sound dynamic whoosh
      soundEngine.updateWhoosh(dist);

      // Fast swipes or frame drops: test continuous line segment against all objects
      if (dist >= 1.5) {
        this.checkSlices(p1, p2);
      }
    }

    this.prevX = currX;
    this.prevY = currY;
    this.prevBladePos = { x: currX, y: currY };
  }

  // Check line segment p1 -> p2 against all objects using Line-to-Circle Collision with 1.5x hitbox padding
  checkSlices(p1, p2) {
    const cutAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    // 1. Boss Phase Slicing (Giant Mainframe Core - 30 slashes required)
    if (this.isBossPhase && this.boss && !this.boss.isDefeated) {
      const bossHitDist = this.distToSegment(this.boss.x, this.boss.y, p1, p2);
      const bossPaddedRadius = this.boss.baseRadius * 1.5; // 1.5x hitbox
      if (bossHitDist <= bossPaddedRadius) {
        const defeated = this.boss.slash();
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        this.vfx.spawnShockwave(midX, midY, 150, 'rgba(0, 242, 254, 0.95)');
        this.vfx.spawnSlashFlash(midX, midY, cutAngle, 210);
        this.vfx.spawnStarBurst(midX, midY);
        this.vfx.triggerScreenShake(8, 160);

        soundEngine.playVaultSlash(this.boss.slashesDone);

        // Paparazzi snapshot at exciting boss fight moments
        if (this.boss.slashesDone === 5 || this.boss.slashesDone === 12 || this.boss.slashesDone === 18) {
          this.onPaparazziCapture('boss');
        }

        if (defeated) {
          // Final 20th slash breach!
          this.isFinaleTriggered = true;
          this.vfx.triggerHitStop(150);
          this.vfx.triggerScreenShake(26, 750);
          this.vfx.spawnConfettiBurst(this.boss.x, this.boss.y, 'gold');
          this.vfx.spawnConfettiBurst(this.boss.x, this.boss.y, 'cyan-gold');
          this.vfx.spawnStarBurst(this.boss.x, this.boss.y);
          this.vfx.spawnShockwave(this.boss.x, this.boss.y, 320, 'rgba(0, 242, 254, 0.98)');

          soundEngine.playVaultBreached();

          // Capture victory moment snapshot
          this.onPaparazziCapture('boss');

          // Transition to victory modal after fireworks
          setTimeout(() => {
            this.onFinaleComplete();
          }, 1200);
        }
        return;
      }
    }

    // 2. Regular Object Slicing with 1.5x Hitbox Padding (Line-to-Circle collision math)
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      if (obj.isSliced) continue;

      const d = this.distToSegment(obj.x, obj.y, p1, p2);
      const paddedRadius = obj.radius * 1.5; // 1.5x visual size hitbox
      if (d <= paddedRadius) {
        this.sliceObject(obj, cutAngle, p1, p2);
      }
    }
  }

  // Slice an individual object with all cyber juice effects
  sliceObject(obj, cutAngle, p1, p2) {
    obj.isSliced = true;

    const hitX = (obj.x + (p1.x + p2.x) / 2) / 2;
    const hitY = (obj.y + (p1.y + p2.y) / 2) / 2;

    // 1. Create true split halves flying apart
    const halves = obj.createSlicedHalves(cutAngle);
    this.slicedHalves.push(...halves);

    // 2. Shockwave ring & sharp directional slash line flash (Neon Cyan & Gold)
    this.vfx.spawnShockwave(hitX, hitY, 115, 'rgba(0, 242, 254, 0.95)');
    this.vfx.spawnSlashFlash(hitX, hitY, cutAngle, 150);

    // 3. Handle object specific reaction (Pure visual sparks & audio, zero text popups)
    if (obj.type === 'loot_box' || obj.type === 'cube' || obj.type === 'balloon') {
      // Tech Crate / Loot Box: Neon particles + Cyber slash sound
      this.vfx.spawnConfettiBurst(hitX, hitY, 'cyan-gold');
      soundEngine.playCyberSlash();

      // +100 Points
      this.addScore(100);
      this.registerComboHit();

    } else if (obj.type === 'holo_star' || obj.type === 'gold_cube' || obj.type === 'gift') {
      // Holographic Star: Star burst + Hit-stop
      this.vfx.spawnStarBurst(hitX, hitY);
      this.vfx.triggerHitStop(45);
      soundEngine.playDataDecrypt();

      // +150 Points
      this.addScore(150);
      this.registerComboHit();

    } else if (obj.type === 'shield_node' || obj.type === 'heart') {
      // Shield Node: Restore 1 Shield
      this.vfx.spawnStarBurst(hitX, hitY);
      soundEngine.playShieldRecharge();

      if (this.lives < 3) {
        this.lives++;
        this.onLivesChange(this.lives);
      }
      this.addScore(200);
      this.registerComboHit();

    } else if (obj.type === 'danger_mine' || obj.type === 'glitch_virus' || obj.type === 'bomb') {
      // Red Danger Mine: Screen shake & blast
      this.vfx.spawnSmokeBurst(hitX, hitY);
      this.vfx.triggerScreenShake(22, 380);
      soundEngine.playGlitchCorruption();

      if (this.onGlitchTrigger) {
        this.onGlitchTrigger();
      }

      // Paparazzi snapshot on mine hit!
      this.onPaparazziCapture('bomb');

      this.combo = 0;
      this.comboTimer = 0;
      this.onComboChange(0);

      this.lives--;
      this.onLivesChange(this.lives);

      // Emergency Revive check
      if (this.lives <= 0) {
        this.triggerInfiniteLoveRevive();
      }
    }
  }

  // Combo system: increments pitch along pentatonic scale
  registerComboHit() {
    this.combo++;
    this.comboTimer = 1.35; // 1.35s window to continue combo
    this.onComboChange(this.combo);

    if (this.combo >= 2) {
      soundEngine.playComboSlice(this.combo);
    }

    if (this.combo >= 3) {
      this.vfx.triggerHitStop(45);
      const bonus = this.combo * 50;
      this.score += bonus;
      this.onScoreChange(this.score);

      // Paparazzi snapshot on high-focus combo!
      if (this.combo === 3 || this.combo === 6) {
        this.onPaparazziCapture('combo');
      }
    }
  }

  // Add score silently to HUD odometer (Zero text pop-ups on screen)
  addScore(amount) {
    this.score += amount;
    this.onScoreChange(this.score);

    // Check boss trigger: either 40s duration reached OR targetScore reached at >=32s
    if (!this.isBossPhase && ((this.score >= LOVE_CONFIG.targetScore && this.gameTime >= 32) || this.gameTime >= 40)) {
      this.startBossPhase();
    }
  }

  // Emergency Revive: cinta kita nggak kenal game over
  triggerInfiniteLoveRevive() {
    if (this.isReviving) return;
    this.isReviving = true;

    this.onToast("Cinta kita nggak kenal Game Over ❤️ Revive Aktif!");
    soundEngine.playReviveSound();
    this.vfx.spawnConfettiBurst(this.width / 2, this.height / 2, 'cyan-gold');
    this.vfx.triggerScreenShake(12, 240);

    setTimeout(() => {
      this.lives = LOVE_CONFIG.initialLives;
      this.onLivesChange(this.lives);
      this.isReviving = false;
    }, 600);
  }

  // Start Grand Finale Boss Encounter: Giant Golden Loot Core / Vault (20 Slashes required)
  startBossPhase() {
    if (this.isBossPhase) return;
    this.isBossPhase = true;
    this.objects = []; // Clear regular obstacles
    this.boss = new GiantMainframeCore({
      targetSlashes: 20,
      centerX: this.width / 2,
      centerY: this.height / 2 - 20
    });
    this.onBossStart();
    this.onWaveChange(3, "FINAL ROUND: BOSS FIGHT ⚡");
    this.onToast("💥 BOSS FIGHT: Sabet 20x Beruntun Untuk Menang! 💥");
    soundEngine.playVaultSlash(1);
  }

  // Trigger Frenzy Burst in Wave 2 (8-10 items launched simultaneously!)
  triggerFrenzyBurst() {
    if (this.isBossPhase) return;

    this.onToast("🔥 FRENZY RUSH: Sabet Semua Loot Box! 🔥");
    soundEngine.playComboSlice(4);
    this.vfx.triggerScreenShake(6, 250);

    const burstCount = Math.floor(Math.random() * 3) + 8; // 8 to 10 items
    for (let i = 0; i < burstCount; i++) {
      const type = Math.random() < 0.7 ? 'loot_box' : 'holo_star';
      const spawnX = (this.width / (burstCount + 1)) * (i + 1) + (Math.random() - 0.5) * 40;
      const spawnY = this.height + 60;
      const targetMidX = this.width / 2 + (Math.random() - 0.5) * 200;
      const vx = (targetMidX - spawnX) * (Math.random() * 0.4 + 0.4);
      const vy = -(Math.random() * 160 + 720);

      const obj = new GameObject({
        id: Math.random().toString(36).substring(2, 9),
        type,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        radius: type === 'gold_cube' ? 44 : 46,
        label: ''
      });
      this.objects.push(obj);
    }
  }

  // Main game update loop
  update(rawDt) {
    if (!this.isGameStarted) return;
    const dt = rawDt * this.vfx.timeScale;
    this.gameTime += dt;

    // Periodic Fallback Paparazzi Snapshot (every 18 seconds for 60s game)
    this.paparazziTimer += dt;
    if (this.paparazziTimer >= 18) {
      this.paparazziTimer = 0;
      this.onPaparazziCapture('timer');
    }

    // Time update to HUD
    const timeLeft = Math.max(0, Math.ceil(LOVE_CONFIG.gameDurationSeconds - this.gameTime));
    this.onTimeUpdate(timeLeft);

    // Exact 60-Second Completion: Trigger Finale Modal precisely when 60s is reached
    if (this.gameTime >= LOVE_CONFIG.gameDurationSeconds) {
      if (!this.isFinaleTriggered) {
        this.isFinaleTriggered = true;
        this.vfx.triggerHitStop(120);
        this.vfx.triggerScreenShake(20, 600);
        this.vfx.spawnConfettiBurst(this.width / 2, this.height / 2, 'gold');
        soundEngine.playVaultBreached();
        this.onPaparazziCapture('boss');
        setTimeout(() => {
          this.onFinaleComplete();
        }, 800);
      }
      return;
    }

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.onComboChange(0);
      }
    }

    // Boss Phase update
    if (this.isBossPhase && this.boss) {
      this.boss.update(dt);
    } else {
      // Progressive Round Management (1-Minute Session: 0-20s Round 1, 20-40s Round 2 Frenzy, 40-60s Boss)
      if (this.gameTime < 20) {
        this.currentWave = 1;
        if (this.lastWave !== 1) {
          this.lastWave = 1;
          this.onWaveChange(1, "ROUND 1: PEMANASAN 🎮");
        }
      } else if (this.gameTime < 40) {
        this.currentWave = 2;
        if (this.lastWave !== 2) {
          this.lastWave = 2;
          this.onWaveChange(2, "ROUND 2: FRENZY RUSH 🔥");
          this.onToast("🔥 ROUND 2: Frenzy Rush Dimulai! 🔥");
        }

        // Trigger Wave 2 Frenzy Bursts at 24s and 34s
        if (this.gameTime >= 24 && !this.frenzyTriggered24) {
          this.frenzyTriggered24 = true;
          this.triggerFrenzyBurst();
        }
        if (this.gameTime >= 34 && !this.frenzyTriggered34) {
          this.frenzyTriggered34 = true;
          this.triggerFrenzyBurst();
        }
      } else {
        // 40s - 60s: Boss Mode
        if (!this.isBossPhase) {
          this.startBossPhase();
        }
      }

      // Spawning loop according to wave intensity
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.nextSpawnInterval) {
        this.spawnTimer = 0;
        if (this.currentWave === 1) {
          this.nextSpawnInterval = Math.random() * 0.3 + 1.0;
        } else {
          this.nextSpawnInterval = Math.random() * 0.25 + 0.65;
        }
        this.spawnWave();
      }
    }

    // Update intact game objects
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      obj.update(dt);
      if (obj.y > this.height + 150) {
        this.objects.splice(i, 1);
      }
    }

    // Update split halves
    for (let i = this.slicedHalves.length - 1; i >= 0; i--) {
      const half = this.slicedHalves[i];
      half.update(dt);
      if (half.life >= half.maxLife || half.y > this.height + 200) {
        this.slicedHalves.splice(i, 1);
      }
    }
  }

  // Spawn wave of items tailored to current round
  spawnWave() {
    if (this.isBossPhase) return;

    let count = 1;
    if (this.currentWave === 1) {
      count = Math.random() < 0.35 ? 2 : 1;
    } else if (this.currentWave === 2) {
      count = Math.random() < 0.55 ? 2 : (Math.random() < 0.2 ? 3 : 1);
    } else {
      // Wave 3: High density
      count = Math.random() < 0.45 ? 3 : (Math.random() < 0.25 ? 4 : 2);
    }

    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let type = 'loot_box';

      if (roll < 0.52) {
        type = 'loot_box'; // Tech Crate / Loot Box
      } else if (roll < 0.78) {
        type = 'holo_star'; // Holographic Star
      } else if (roll < 0.90) {
        type = 'danger_mine'; // Red Danger Mine
      } else {
        type = 'shield_node'; // Shield Node
      }

      const spawnX = Math.random() * (this.width - 240) + 120;
      const spawnY = this.height + 60;
      const speedMult = this.currentWave === 3 ? 1.15 : (this.currentWave === 2 ? 1.05 : 0.95);
      const targetMidX = this.width / 2 + (Math.random() - 0.5) * 320;
      const vx = (targetMidX - spawnX) * (Math.random() * 0.6 + 0.6) * speedMult;
      const vy = -(Math.random() * 160 + 680) * speedMult;

      const obj = new GameObject({
        id: Math.random().toString(36).substring(2, 9),
        type,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        radius: type === 'holo_star' ? 44 : (type === 'shield_node' ? 42 : 46),
        label: ''
      });

      this.objects.push(obj);
    }
  }

  // Draw all game elements
  draw(ctx) {
    // 1. Draw split halves first
    for (const half of this.slicedHalves) {
      half.draw(ctx);
    }

    // 2. Draw intact objects
    for (const obj of this.objects) {
      obj.draw(ctx);
    }

    // 3. Draw Boss if active
    if (this.isBossPhase && this.boss) {
      this.boss.draw(ctx);
    }
  }

  // Helper: Distance from point (cx, cy) to line segment p1 -> p2
  distToSegment(cx, cy, p1, p2) {
    const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
    if (l2 === 0) return Math.hypot(cx - p1.x, cy - p1.y);

    let t = ((cx - p1.x) * (p2.x - p1.x) + (cy - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = p1.x + t * (p2.x - p1.x);
    const projY = p1.y + t * (p2.y - p1.y);
    return Math.hypot(cx - projX, cy - projY);
  }
}

export default GameEngine;
