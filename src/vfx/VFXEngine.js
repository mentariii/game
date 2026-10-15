// VFX & Juice Engine: Neon Plasma Blade, Digital Binary Particles, Cyber Shockwaves, and Hit Sparks

export class VFXEngine {
  constructor() {
    this.bladePoints = []; // [{x, y, time, vx, vy}]
    this.particles = [];
    this.shockwaves = [];
    this.slashFlashes = [];
    this.scorePopups = [];
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;

    // Hit-stop state
    this.hitStopFrames = 0;
    this.timeScale = 1.0;
  }

  // Add new blade point from hand tracking or mouse
  addBladePoint(x, y) {
    const now = performance.now();
    let vx = 0;
    let vy = 0;

    if (this.bladePoints.length > 0) {
      const last = this.bladePoints[this.bladePoints.length - 1];
      const dt = Math.max((now - last.time) / 1000, 0.001);
      vx = (x - last.x) / dt;
      vy = (y - last.y) / dt;
    }

    const speed = Math.hypot(vx, vy);
    this.bladePoints.push({ x, y, time: now, vx, vy, speed });

    // Emit plasma sparks and digital bits when swinging fast
    if (speed > 420) {
      const count = Math.min(Math.floor(speed / 280), 5);
      for (let i = 0; i < count; i++) {
        this.spawnPlasmaSpark(x, y, vx * 0.08, vy * 0.08);
        if (Math.random() < 0.3) {
          this.spawnBinaryBit(x, y);
        }
      }
    }
  }

  // Trigger hit-stop frame freeze (e.g. 45ms)
  triggerHitStop(durationMs = 45) {
    this.hitStopFrames = Math.max(Math.round(durationMs / 16.6), 3);
  }

  // Trigger screen shake
  triggerScreenShake(intensity = 15, durationMs = 300) {
    this.screenShakeIntensity = intensity;
    this.screenShakeTime = durationMs;
  }

  // Spawn Plasma Sparks (Cyan, Electric Blue, White, Gold)
  spawnPlasmaSpark(x, y, baseVx = 0, baseVy = 0) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 100 + 40;
    const colors = ['#00f2fe', '#38bdf8', '#3b82f6', '#ffffff', '#fbbf24'];
    this.particles.push({
      type: 'spark',
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed + baseVx,
      vy: Math.sin(angle) * speed + baseVy,
      size: Math.random() * 4 + 2,
      maxLife: Math.random() * 0.35 + 0.25,
      life: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 12
    });
  }

  // Spawn Radiant Plasma Spark
  spawnBinaryBit(x, y) {
    this.spawnPlasmaSpark(x, y);
  }

  // Digital Square Pixels & Shards Burst (100% Clean VFX, Zero Text)
  spawnConfettiBurst(x, y, colorTheme = 'cyan-gold') {
    const isGoldTheme = colorTheme === 'gold';
    const cyanPalette = ['#00f2fe', '#38bdf8', '#3b82f6', '#ffffff'];
    const goldPalette = ['#ffd700', '#fbbf24', '#fef08a', '#ffffff'];
    const palette = isGoldTheme ? goldPalette : [...cyanPalette, '#fbbf24'];

    // 1. Digital Square Bit Particles (30 bits)
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 480 + 160;
      const size = Math.random() * 8 + 4;
      this.particles.push({
        type: 'digital_pixel',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        gravity: 420,
        drag: 0.93,
        size,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 0,
        maxLife: Math.random() * 1.1 + 0.8,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 14
      });
    }

    // 2. High-speed radiant plasma sparks (No text)
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 320 + 80;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: Math.random() * 5 + 3,
        maxLife: Math.random() * 0.9 + 0.5,
        life: 0,
        color: isGoldTheme ? '#ffd700' : '#00f2fe',
        rotation: 0,
        vRot: 0
      });
    }
  }

  // Star / Cyber Lattice Burst (Gold Node Decryption)
  spawnStarBurst(x, y) {
    const starColors = ['#00f2fe', '#fbbf24', '#ffd700', '#ffffff', '#38bdf8'];
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 420 + 140;
      this.particles.push({
        type: 'cyber_shard',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 140,
        drag: 0.92,
        size: Math.random() * 9 + 5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        life: 0,
        maxLife: Math.random() * 0.85 + 0.5,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10
      });
    }
  }

  // Red Glitch Virus Static Burst (Replaces Smoke)
  spawnSmokeBurst(x, y) {
    // Red Jagged Glitch Fragments
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 360 + 100;
      this.particles.push({
        type: 'glitch_fragment',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        sizeW: Math.random() * 16 + 6,
        sizeH: Math.random() * 6 + 2,
        life: 0,
        maxLife: Math.random() * 0.5 + 0.35,
        color: Math.random() < 0.6 ? '#ef4444' : '#b91c1c'
      });
    }

    // Static Noise Sparks
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 50;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color: '#f87171',
        life: 0,
        maxLife: Math.random() * 0.45 + 0.25,
        rotation: 0,
        vRot: 0
      });
    }
  }

  // Expanding Cyber Shockwave Ring (Electric Cyan & Neon Gold)
  spawnShockwave(x, y, maxRadius = 130, color = 'rgba(0, 242, 254, 0.95)') {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      lineWidth: 8,
      life: 0,
      maxLife: 0.36
    });
  }

  // Intense Directional Slash Line Flash across sliced object
  spawnSlashFlash(x, y, angle, length = 160) {
    this.slashFlashes.push({
      x,
      y,
      angle,
      length,
      life: 0,
      maxLife: 0.18 // 180ms flash
    });
  }

  // Data / Score Popups: Completely disabled per user request (UI kept clean of flying text)
  spawnScorePopup(x, y, text, color = '#00f2fe', isCombo = false) {
    // Disabled: Visual effects only on slice
  }

  // Update all VFX elements
  update(rawDt) {
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      this.timeScale = 0.15;
    } else {
      this.timeScale = 1.0;
    }

    const dt = rawDt * this.timeScale;
    const now = performance.now();

    // 1. Blade points decay (older than 180ms removed)
    this.bladePoints = this.bladePoints.filter(p => now - p.time < 180);

    // 2. Screen shake decay
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= rawDt * 1000;
      if (this.screenShakeTime <= 0) {
        this.screenShakeIntensity = 0;
      }
    }

    // 3. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      const progress = sw.life / sw.maxLife;
      if (progress >= 1) {
        this.shockwaves.splice(i, 1);
      } else {
        sw.radius = 10 + (sw.maxRadius - 10) * Math.sin((progress * Math.PI) / 2);
        sw.lineWidth = Math.max(8 * (1 - progress), 0.5);
      }
    }

    // 4. Slash Flashes
    for (let i = this.slashFlashes.length - 1; i >= 0; i--) {
      const sf = this.slashFlashes[i];
      sf.life += dt;
      if (sf.life >= sf.maxLife) {
        this.slashFlashes.splice(i, 1);
      }
    }

    // 5. Score / Data popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i];
      sp.life += dt;
      const prog = sp.life / sp.maxLife;
      if (prog >= 1) {
        this.scorePopups.splice(i, 1);
      } else {
        if (sp.scale < sp.targetScale) {
          sp.scale += (sp.targetScale - sp.scale) * 18 * dt;
        }
        sp.y += sp.vy * dt;
        if (prog > 0.6) {
          sp.alpha = Math.max(1 - (prog - 0.6) / 0.4, 0);
        }
      }
    }

    // 6. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'digital_pixel') {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vRot * dt;
      } else if (p.type === 'binary') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else if (p.type === 'cyber_shard') {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
      } else if (p.type === 'glitch_fragment') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else {
        // Spark
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
      }
    }
  }

  // Get current screen shake offset
  getShakeOffset() {
    if (this.screenShakeTime <= 0 || this.screenShakeIntensity <= 0) {
      return { x: 0, y: 0 };
    }
    const decay = this.screenShakeTime / 300;
    const currentAmp = this.screenShakeIntensity * decay;
    const freq = 36;
    const angle = (performance.now() / 1000) * freq;
    return {
      x: Math.sin(angle) * currentAmp,
      y: Math.cos(angle * 1.3) * currentAmp
    };
  }

  // Render all VFX onto canvas
  draw(ctx) {
    ctx.save();

    // 1. Render Neon Plasma Blade Trail (Beat Saber Style)
    this.drawNeonPlasmaBlade(ctx);

    // 2. Render Shockwaves
    this.drawShockwaves(ctx);

    // 3. Render Directional Slash Line Flashes
    this.drawSlashFlashes(ctx);

    // 4. Render Particles
    this.drawParticles(ctx);

    // 5. Render Data Popups
    this.drawScorePopups(ctx);

    ctx.restore();
  }

  // Draw Neon Plasma Blade (Pure White Core + Thick Glowing Cyan/Electric Blue Aura)
  drawNeonPlasmaBlade(ctx) {
    const pts = this.bladePoints;
    if (pts.length < 2) return;

    const now = performance.now();

    // Layer 1: Wide Electric Blue / Cyan Outer Plasma Aura
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 32;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.95)';

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const ageNorm = (now - p1.time) / 180;
      const alpha = Math.max(1 - ageNorm, 0);
      const width = Math.max((1 - ageNorm) * 22, 3);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.9})`;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    ctx.restore();

    // Layer 2: Core Electric Cyan Shimmer
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#38bdf8';

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const ageNorm = (now - p1.time) / 180;
      const alpha = Math.max(1 - ageNorm, 0);
      const width = Math.max((1 - ageNorm) * 12, 2);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.95})`;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    ctx.restore();

    // Layer 3: Pure Radiant White Plasma Core
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const ageNorm = (now - p1.time) / 180;
      const alpha = Math.max(1 - ageNorm, 0);
      const width = Math.max((1 - ageNorm) * 6, 1.8);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
      ctx.lineWidth = width;
      ctx.stroke();
    }

    // Glowing Blade Tip Crosshair Indicator
    const tip = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#00f2fe';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.fill();

    ctx.restore();
  }

  // Draw expanding shockwaves
  drawShockwaves(ctx) {
    for (const sw of this.shockwaves) {
      const alpha = Math.max(1 - sw.life / sw.maxLife, 0);
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color.replace('0.95', (alpha * 0.95).toFixed(2));
      ctx.lineWidth = sw.lineWidth;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00f2fe';
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw bright directional slash flashes
  drawSlashFlashes(ctx) {
    for (const sf of this.slashFlashes) {
      const alpha = Math.max(1 - sf.life / sf.maxLife, 0);
      const halfLen = sf.length / 2;
      const cos = Math.cos(sf.angle);
      const sin = Math.sin(sf.angle);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sf.x - cos * halfLen, sf.y - sin * halfLen);
      ctx.lineTo(sf.x + cos * halfLen, sf.y + sin * halfLen);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = Math.max(9 * alpha, 2);
      ctx.shadowBlur = 28;
      ctx.shadowColor = '#00f2fe';
      ctx.stroke();

      // Sharp central burst
      ctx.beginPath();
      ctx.arc(sf.x, sf.y, 16 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 242, 254, ${alpha * 0.9})`;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();

      ctx.restore();
    }
  }

  // Draw all particle types (Digital Bits, Binary Code, Shards)
  drawParticles(ctx) {
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = Math.max(1 - progress, 0);

      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'digital_pixel') {
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.type === 'binary') {
        ctx.font = `bold ${p.size}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillText(p.char, 0, 0);
      } else if (p.type === 'cyber_shard') {
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        this.renderShardPath(ctx, 0, 0, p.size);
        ctx.fill();
      } else if (p.type === 'glitch_fragment') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(-p.sizeW / 2, -p.sizeH / 2, p.sizeW, p.sizeH);
      } else {
        // Spark
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }

  // Helper: Draw sharp cyber shard polygon
  renderShardPath(ctx, cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.6, cy);
    ctx.lineTo(cx, cy + size * 0.8);
    ctx.lineTo(cx - size * 0.6, cy);
    ctx.closePath();
  }

  // Draw floating data popups: completely disabled for clean UI
  drawScorePopups(ctx) {
    // Zero text popups drawn
  }
}

export default VFXEngine;
