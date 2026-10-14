// GameEngine: Progressive Waves, line-segment slicing physics, paparazzi triggers, and Grand Finale Boss

import { GameObject, GiantBirthdayBoss } from './GameObjects';
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
    onTimeUpdate
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

    this.objects = [];
    this.slicedHalves = [];
    this.score = 0;
    this.lives = LOVE_CONFIG.initialLives;
    this.combo = 0;
    this.comboTimer = 0;
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.nextSpawnInterval = 1.3;

    // Progressive Waves (1: 0-40s, 2: 40-80s, 3: 80-120s)
    this.currentWave = 1;
    this.lastWave = 0;
    this.frenzyTriggered50 = false;
    this.frenzyTriggered70 = false;

    // Paparazzi Fallback Timer
    this.paparazziTimer = 0;

    // Boss Phase
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

    // Index rotation
    this.toastIndex = 0;
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
    this.frenzyTriggered50 = false;
    this.frenzyTriggered70 = false;
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
    this.onWaveChange(1, "Wave 1: Pemanasan 🎮");
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

    // 1. Boss Phase Slicing (1.5x hitbox padding, 30 slashes required)
    if (this.isBossPhase && this.boss && !this.boss.isDefeated) {
      const bossHitDist = this.distToSegment(this.boss.x, this.boss.y, p1, p2);
      const bossPaddedRadius = this.boss.baseRadius * 1.5; // 1.5x hitbox
      if (bossHitDist <= bossPaddedRadius) {
        const defeated = this.boss.slash();
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        this.vfx.spawnShockwave(midX, midY, 140, 'rgba(0, 242, 254, 0.95)');
        this.vfx.spawnSlashFlash(midX, midY, cutAngle, 190);
        this.vfx.spawnStarBurst(midX, midY);
        this.vfx.triggerScreenShake(8, 150);

        soundEngine.playBossSlash(this.boss.slashesDone);

        // Paparazzi snapshot at exciting boss fight moments
        if (this.boss.slashesDone === 8 || this.boss.slashesDone === 18 || this.boss.slashesDone === 28) {
          this.onPaparazziCapture('boss');
        }

        if (defeated) {
          // Final 30th slash explosion!
          this.vfx.triggerHitStop(140);
          this.vfx.triggerScreenShake(26, 700);
          this.vfx.spawnConfettiBurst(this.boss.x, this.boss.y, 'gold');
          this.vfx.spawnConfettiBurst(this.boss.x, this.boss.y, 'cyan-gold');
          this.vfx.spawnStarBurst(this.boss.x, this.boss.y);
          this.vfx.spawnShockwave(this.boss.x, this.boss.y, 300, 'rgba(0, 242, 254, 0.95)');

          soundEngine.playBossExplosion();

          // Capture victory moment snapshot
          this.onPaparazziCapture('boss');

          // Transition to Scrapbook modal after fireworks
          setTimeout(() => {
            this.onFinaleComplete();
          }, 1500);
        }
        return;
      }
    }

    // 2. Regular Object Slicing with 1.5x Hitbox Padding (Line-to-Circle collision math)
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      if (obj.isSliced) continue;

      const d = this.distToSegment(obj.x, obj.y, p1, p2);
      const paddedRadius = obj.radius * 1.5; // 1.5x visual size hitbox!
      if (d <= paddedRadius) {
        this.sliceObject(obj, cutAngle, p1, p2);
      }
    }
  }

  // Slice an individual object with all juice effects
  sliceObject(obj, cutAngle, p1, p2) {
    obj.isSliced = true;

    const hitX = (obj.x + (p1.x + p2.x) / 2) / 2;
    const hitY = (obj.y + (p1.y + p2.y) / 2) / 2;

    // 1. Create true split halves flying apart
    const halves = obj.createSlicedHalves(cutAngle);
    this.slicedHalves.push(...halves);

    // 2. Shockwave ring & sharp directional slash line flash (Neon Cyan & Gold)
    this.vfx.spawnShockwave(hitX, hitY, 110, 'rgba(0, 242, 254, 0.95)');
    this.vfx.spawnSlashFlash(hitX, hitY, cutAngle, 140);

    // 3. Handle object specific reaction
    if (obj.type === 'balloon') {
      // Confetti burst (Electric Cyan & Gold)
      this.vfx.spawnConfettiBurst(hitX, hitY, 'cyan-gold');
      soundEngine.playBalloonPop();

      // Score +100
      this.addScore(100, hitX, hitY, '#00f2fe');

      this.registerComboHit();

    } else if (obj.type === 'gift') {
      // Star burst + Hit-stop
      this.vfx.spawnStarBurst(hitX, hitY);
      this.vfx.triggerHitStop(45);
      soundEngine.playGiftSlice();

      // Score +150
      this.addScore(150, hitX, hitY, '#fbbf24');

      // Sweet Indonesian Toast Message
      const msg = LOVE_CONFIG.sweetMessages[this.toastIndex % LOVE_CONFIG.sweetMessages.length];
      this.toastIndex++;
      this.onToast(msg);

      this.registerComboHit();

    } else if (obj.type === 'heart') {
      // Heart slice
      this.vfx.spawnStarBurst(hitX, hitY);
      for (let k = 0; k < 6; k++) {
        this.vfx.spawnMicroHeart(hitX, hitY);
      }
      soundEngine.playHeartSlice();

      if (this.lives < 3) {
        this.lives++;
        this.onLivesChange(this.lives);
      }
      this.addScore(200, hitX, hitY, '#38bdf8');
      this.registerComboHit();

    } else if (obj.type === 'bomb') {
      // Clean 3D Bomb hit
      this.vfx.spawnSmokeBurst(hitX, hitY);
      this.vfx.triggerScreenShake(18, 320);
      soundEngine.playBombThud();

      // Paparazzi snapshot on bomb hit! (Shocked/annoyed face)
      this.onPaparazziCapture('bomb');

      this.combo = 0;
      this.comboTimer = 0;
      this.onComboChange(0);

      this.lives--;
      this.onLivesChange(this.lives);

      // Infinite Love Revive check
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
      this.vfx.spawnScorePopup(this.width / 2, 140, `COMBO x${this.combo}! +${bonus}`, '#fbbf24', true);

      // Paparazzi snapshot on high-focus combo!
      if (this.combo === 3 || this.combo === 6) {
        this.onPaparazziCapture('combo');
      }
    }
  }

  // Add score with floating popup
  addScore(amount, x, y, color = '#00f2fe') {
    this.score += amount;
    this.onScoreChange(this.score);
    this.vfx.spawnScorePopup(x, y, `+${amount}`, color);

    // Check boss trigger: either 120s duration reached OR 5000 score reached in Wave 3 (>=90s)
    if (!this.isBossPhase && ((this.score >= LOVE_CONFIG.targetScore && this.gameTime >= 90) || this.gameTime >= LOVE_CONFIG.gameDurationSeconds)) {
      this.startBossPhase();
    }
  }

  // Infinite Love Revive: cinta kita nggak kenal game over
  triggerInfiniteLoveRevive() {
    if (this.isReviving) return;
    this.isReviving = true;

    this.onToast("Cinta kita nggak kenal Game Over ❤️");
    soundEngine.playReviveSound();
    this.vfx.spawnConfettiBurst(this.width / 2, this.height / 2, 'cyan-gold');
    this.vfx.triggerScreenShake(10, 200);

    setTimeout(() => {
      this.lives = LOVE_CONFIG.initialLives;
      this.onLivesChange(this.lives);
      this.isReviving = false;
    }, 600);
  }

  // Start Grand Finale Boss Encounter (30 Slashes required)
  startBossPhase() {
    if (this.isBossPhase) return;
    this.isBossPhase = true;
    this.objects = []; // Clear regular obstacles
    this.boss = new GiantBirthdayBoss({
      targetSlashes: 30,
      centerX: this.width / 2,
      centerY: this.height / 2 - 20
    });
    this.onBossStart();
    this.onToast("🎂 BOSS ULTAH: Sabet 30x beruntun! ✨");
    soundEngine.playGiftSlice();
  }

  // Trigger Frenzy Burst in Wave 2 (8-10 gifts & balloons simultaneously!)
  triggerFrenzyBurst() {
    if (this.isBossPhase) return;

    this.onToast("🔥 FRENZY BURST! Sabet Semuanya! 🔥");
    soundEngine.playComboSlice(4);
    this.vfx.triggerScreenShake(6, 250);

    const burstCount = Math.floor(Math.random() * 3) + 8; // 8 to 10 items
    for (let i = 0; i < burstCount; i++) {
      const type = Math.random() < 0.65 ? 'balloon' : 'gift';
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
        radius: type === 'gift' ? 44 : 46,
        label: '' // Clean, zero text on objects
      });
      this.objects.push(obj);
    }
  }

  // Main game update loop
  update(rawDt) {
    const dt = rawDt * this.vfx.timeScale;
    this.gameTime += dt;

    // Periodic Fallback Paparazzi Snapshot (every 22 seconds)
    this.paparazziTimer += dt;
    if (this.paparazziTimer >= 22) {
      this.paparazziTimer = 0;
      this.onPaparazziCapture('timer');
    }

    // Time update to HUD
    const timeLeft = Math.max(0, Math.ceil(LOVE_CONFIG.gameDurationSeconds - this.gameTime));
    this.onTimeUpdate(timeLeft);

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
      // Progressive Wave Management
      // Wave 1: 0 - 40s (Warming up)
      // Wave 2: 40 - 80s (Frenzy bursts)
      // Wave 3: 80 - 120s (High-speed spawns)
      if (this.gameTime < 40) {
        this.currentWave = 1;
        if (this.lastWave !== 1) {
          this.lastWave = 1;
          this.onWaveChange(1, "Wave 1: Pemanasan 🎮");
        }
      } else if (this.gameTime < 80) {
        this.currentWave = 2;
        if (this.lastWave !== 2) {
          this.lastWave = 2;
          this.onWaveChange(2, "Wave 2: Frenzy Rush 🔥");
          this.onToast("⚡ WAVE 2: Kecepatan Bertambah! ⚡");
        }

        // Trigger Wave 2 Frenzy Bursts at 52s and 70s
        if (this.gameTime >= 50 && !this.frenzyTriggered50) {
          this.frenzyTriggered50 = true;
          this.triggerFrenzyBurst();
        }
        if (this.gameTime >= 70 && !this.frenzyTriggered70) {
          this.frenzyTriggered70 = true;
          this.triggerFrenzyBurst();
        }
      } else {
        this.currentWave = 3;
        if (this.lastWave !== 3) {
          this.lastWave = 3;
          this.onWaveChange(3, "Wave 3: Final Rush ⚡");
          this.onToast("🔥 WAVE 3: Bersiap Menuju Boss! 🔥");
        }
      }

      // Spawning loop according to wave intensity
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.nextSpawnInterval) {
        this.spawnTimer = 0;
        if (this.currentWave === 1) {
          this.nextSpawnInterval = Math.random() * 0.4 + 1.2; // 1.2s - 1.6s
        } else if (this.currentWave === 2) {
          this.nextSpawnInterval = Math.random() * 0.3 + 0.8; // 0.8s - 1.1s
        } else {
          this.nextSpawnInterval = Math.random() * 0.25 + 0.55; // 0.55s - 0.8s
        }
        this.spawnWave();
      }

      // Check auto boss trigger after gameDurationSeconds (120s) or score >= 5000 in Wave 3
      if (!this.isBossPhase && (this.gameTime >= LOVE_CONFIG.gameDurationSeconds || (this.score >= LOVE_CONFIG.targetScore && this.gameTime >= 90))) {
        this.startBossPhase();
      }
    }

    // Update intact game objects
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      obj.update(dt);
      // Remove if dropped below screen
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

  // Spawn wave of items tailored to current wave
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
      let type = 'balloon';

      if (roll < 0.52) {
        type = 'balloon';
      } else if (roll < 0.78) {
        type = 'gift';
      } else if (roll < 0.90) {
        type = 'bomb'; // Clean 3D bomb, zero text
      } else {
        type = 'heart';
      }

      const spawnX = Math.random() * (this.width - 240) + 120;
      const spawnY = this.height + 60;
      // Parabolic upward arc with wave velocity scaling
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
        radius: type === 'gift' ? 44 : (type === 'heart' ? 42 : 46),
        label: '' // Completely clean: no text on bombs or objects
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
