// VFX & Juice Engine: Blade trail, shockwaves, particles, slice flashes, and screen shake

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

    // Emit stardust sparkles and micro hearts if moving fast
    if (speed > 450) {
      const count = Math.min(Math.floor(speed / 300), 4);
      for (let i = 0; i < count; i++) {
        this.spawnStardust(x, y, vx * 0.1, vy * 0.1);
        if (Math.random() < 0.25) {
          this.spawnMicroHeart(x, y);
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

  // Spawn stardust sparkle (Neon Cyan & Gold)
  spawnStardust(x, y, baseVx = 0, baseVy = 0) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 80 + 30;
    const colors = ['#00f2fe', '#38bdf8', '#3b82f6', '#fbbf24', '#ffffff'];
    this.particles.push({
      type: 'sparkle',
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed + baseVx,
      vy: Math.sin(angle) * speed + baseVy,
      size: Math.random() * 4 + 2,
      maxLife: Math.random() * 0.4 + 0.3,
      life: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  // Spawn micro floating spark diamond
  spawnMicroHeart(x, y) {
    this.particles.push({
      type: 'sparkle',
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      vx: (Math.random() - 0.5) * 60,
      vy: -Math.random() * 80 - 40,
      size: Math.random() * 8 + 5,
      maxLife: Math.random() * 0.6 + 0.5,
      life: 0,
      color: Math.random() < 0.5 ? '#00f2fe' : '#fbbf24',
      rotation: (Math.random() - 0.5) * 0.6,
      vRot: (Math.random() - 0.5) * 2
    });
  }

  // Burst 25+ fluttering metallic gold, cyan, and electric blue confetti rectangles (Balloons)
  spawnConfettiBurst(x, y, colorTheme = 'cyan-gold') {
    const goldPalette = ['#ffd700', '#fbbf24', '#f59e0b', '#fef08a'];
    const cyanBluePalette = ['#00f2fe', '#38bdf8', '#3b82f6', '#2563eb', '#ffffff'];
    const palette = colorTheme === 'gold' ? goldPalette : [...cyanBluePalette, ...goldPalette];

    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 450 + 150;
      this.particles.push({
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120, // Initial upward burst
        gravity: 380,
        drag: 0.94,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 0,
        maxLife: Math.random() * 1.4 + 1.2,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 12,
        vRotY: (Math.random() - 0.5) * 12
      });
    }
  }

  // Burst 30+ glowing cyan & gold star particles (Gift Boxes)
  spawnStarBurst(x, y) {
    const starColors = ['#00f2fe', '#38bdf8', '#fbbf24', '#ffffff', '#60a5fa', '#ffd700'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 400 + 120;
      this.particles.push({
        type: 'star',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 120,
        drag: 0.92,
        size: Math.random() * 8 + 5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        life: 0,
        maxLife: Math.random() * 0.9 + 0.6,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8
      });
    }
  }

  // Burst puffy dark smoke and sparks (Bomb hit)
  spawnSmokeBurst(x, y) {
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 40;
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: -20, // Drifts slightly upward
        drag: 0.91,
        radius: Math.random() * 18 + 12,
        maxRadius: Math.random() * 45 + 30,
        life: 0,
        maxLife: Math.random() * 0.7 + 0.5,
        color: Math.random() < 0.6 ? '#2b2d42' : '#4a4e69'
      });
    }

    // Fiery spark embers
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 320 + 80;
      this.particles.push({
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: '#ff5400',
        life: 0,
        maxLife: Math.random() * 0.5 + 0.3,
        rotation: 0,
        vRot: 0
      });
    }
  }

  // Golden shockwave ring on slice impact
  spawnShockwave(x, y, maxRadius = 110, color = 'rgba(255, 215, 0, 0.85)') {
    this.shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius,
      color,
      lineWidth: 7,
      life: 0,
      maxLife: 0.38
    });
  }

  // Bright directional slash line flash across sliced object
  spawnSlashFlash(x, y, angle, length = 140) {
    this.slashFlashes.push({
      x,
      y,
      angle,
      length,
      life: 0,
      maxLife: 0.16 // 160ms flash
    });
  }

  // Score popup (+100, +150, COMBO x3!)
  spawnScorePopup(x, y, text, color = '#ffd700', isCombo = false) {
    this.scorePopups.push({
      x,
      y: y - 10,
      text,
      color,
      isCombo,
      scale: 0.2,
      targetScale: isCombo ? 1.4 : 1.1,
      alpha: 1.0,
      life: 0,
      maxLife: isCombo ? 1.2 : 0.85,
      vy: -55
    });
  }

  // Update all VFX elements
  update(rawDt) {
    // Handle hit-stop frame freeze
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
        // Ease-out expansion
        sw.radius = 12 + (sw.maxRadius - 12) * Math.sin((progress * Math.PI) / 2);
        sw.lineWidth = Math.max(7 * (1 - progress), 0.5);
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

    // 5. Score popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i];
      sp.life += dt;
      const prog = sp.life / sp.maxLife;
      if (prog >= 1) {
        this.scorePopups.splice(i, 1);
      } else {
        // Spring scale up
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

      const pNorm = p.life / p.maxLife;

      if (p.type === 'confetti') {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotX += p.vRotX * dt;
        p.rotY += p.vRotY * dt;
      } else if (p.type === 'star') {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
      } else if (p.type === 'smoke') {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.radius = 15 + (p.maxRadius - 15) * Math.sin(pNorm * Math.PI * 0.5);
      } else if (p.type === 'heart') {
        p.x += (p.vx + Math.sin(p.life * 8) * 40) * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
      } else {
        // Sparkle
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
    const freq = 35;
    const angle = (performance.now() / 1000) * freq;
    return {
      x: Math.sin(angle) * currentAmp,
      y: Math.cos(angle * 1.3) * currentAmp
    };
  }

  // Render all VFX onto canvas
  draw(ctx) {
    ctx.save();

    // 1. Render Stardust Blade Trail (Tapered glowing spline curve)
    this.drawBladeTrail(ctx);

    // 2. Render Shockwaves
    this.drawShockwaves(ctx);

    // 3. Render Directional Slash Line Flashes
    this.drawSlashFlashes(ctx);

    // 4. Render Particles
    this.drawParticles(ctx);

    // 5. Render Score Popups
    this.drawScorePopups(ctx);

    ctx.restore();
  }

  // Draw Stardust Blade Trail with glowing white core and neon cyan bloom
  drawBladeTrail(ctx) {
    const pts = this.bladePoints;
    if (pts.length < 2) return;

    const now = performance.now();

    // Draw outer electric cyan bloom
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.95)';

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const ageNorm = (now - p1.time) / 180;
      const alpha = Math.max(1 - ageNorm, 0);
      const width = Math.max((1 - ageNorm) * 16, 2);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.85})`;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    ctx.restore();

    // Draw inner bright white core with electric blue edge
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const ageNorm = (now - p1.time) / 180;
      const alpha = Math.max(1 - ageNorm, 0);
      const width = Math.max((1 - ageNorm) * 6, 1.5);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = width;
      ctx.stroke();
    }

    // Glowing blade tip indicator (Neon Cyan & Gold Core)
    const tip = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f2fe';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    ctx.restore();
  }

  // Draw expanding shockwaves (Neon Cyan & Gold)
  drawShockwaves(ctx) {
    for (const sw of this.shockwaves) {
      const alpha = Math.max(1 - sw.life / sw.maxLife, 0);
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color.replace('0.95', (alpha * 0.95).toFixed(2)).replace('0.9', (alpha * 0.9).toFixed(2));
      ctx.lineWidth = sw.lineWidth;
      ctx.shadowBlur = 16;
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
      ctx.lineWidth = Math.max(8 * alpha, 2);
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#00f2fe';
      ctx.stroke();

      // Sharp central burst
      ctx.beginPath();
      ctx.arc(sf.x, sf.y, 14 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 242, 254, ${alpha * 0.85})`;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();

      ctx.restore();
    }
  }

  // Draw all particle types
  drawParticles(ctx) {
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = Math.max(1 - progress, 0);

      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'confetti') {
        ctx.rotate(p.rotX);
        const scaleY = Math.cos(p.rotY);
        ctx.scale(1, scaleY);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.type === 'star') {
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        this.renderStarShape(ctx, 0, 0, 5, p.size, p.size * 0.45);
        ctx.fill();
      } else if (p.type === 'smoke') {
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff3366';
        this.renderHeartShape(ctx, 0, 0, p.size);
        ctx.fill();
      } else {
        // Sparkle
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

  // Helper: draw 5-point star path
  renderStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  // Helper: draw small heart path
  renderHeartShape(ctx, x, y, size) {
    const s = size / 20;
    ctx.beginPath();
    ctx.moveTo(x, y - 4 * s);
    ctx.bezierCurveTo(x + 6 * s, y - 14 * s, x + 16 * s, y - 4 * s, x, y + 14 * s);
    ctx.bezierCurveTo(x - 16 * s, y - 4 * s, x - 6 * s, y - 14 * s, x, y - 4 * s);
    ctx.closePath();
  }

  // Draw floating score popups
  drawScorePopups(ctx) {
    for (const sp of this.scorePopups) {
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.scale(sp.scale, sp.scale);
      ctx.globalAlpha = sp.alpha;

      ctx.font = sp.isCombo 
        ? '800 28px "Plus Jakarta Sans", sans-serif'
        : '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(sp.text, 0, 0);

      // Fill + glow
      ctx.fillStyle = sp.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = sp.color;
      ctx.fillText(sp.text, 0, 0);

      ctx.restore();
    }
  }
}

export default VFXEngine;
