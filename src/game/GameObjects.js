// Procedural 3D Glossy Game Objects & Split-In-Half Slicing Physics

export class SlicedHalf {
  constructor({ x, y, vx, vy, angle, vRot, renderObj, isLeftHalf, cutAngle }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
    this.vRot = vRot;
    this.renderObj = renderObj;
    this.isLeftHalf = isLeftHalf;
    this.cutAngle = cutAngle;
    this.gravity = 680;
    this.life = 0;
    this.maxLife = 0.95; // 950ms fade
    this.alpha = 1.0;
  }

  update(dt) {
    this.life += dt;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.vRot * dt;

    const prog = this.life / this.maxLife;
    if (prog > 0.6) {
      this.alpha = Math.max(1 - (prog - 0.6) / 0.4, 0);
    }
  }

  draw(ctx) {
    if (this.alpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Apply half-plane clip aligned with the slice cut
    ctx.save();
    ctx.rotate(this.cutAngle);
    ctx.beginPath();
    const clipR = 250;
    if (this.isLeftHalf) {
      ctx.rect(-clipR, -clipR, clipR * 2, clipR);
    } else {
      ctx.rect(-clipR, 0, clipR * 2, clipR);
    }
    ctx.clip();
    ctx.rotate(-this.cutAngle);

    // Draw the original object
    this.renderObj(ctx);

    ctx.restore();
    ctx.restore();
  }
}

export class GameObject {
  constructor({ id, type, x, y, vx, vy, radius = 48, label = '', customData = null }) {
    this.id = id;
    this.type = type; // 'balloon' | 'gift' | 'heart' | 'bomb'
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.gravity = 560;
    this.rotation = (Math.random() - 0.5) * 0.3;
    this.vRot = (Math.random() - 0.5) * 1.5;
    this.label = label;
    this.customData = customData;
    this.isSliced = false;
    this.timeAlive = 0;
    this.stringWobble = Math.random() * Math.PI * 2;

    // Balloon color variant: cool metallic blue, silver, emerald, gold
    const variants = ['metallic-blue', 'silver', 'emerald', 'gold'];
    this.colorVariant = variants[Math.floor(Math.random() * variants.length)];
  }

  update(dt) {
    this.timeAlive += dt;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.vRot * dt;
    this.stringWobble += dt * 6;
  }

  // Split this object into two halves along cutting angle theta
  createSlicedHalves(sliceAngle) {
    const kickSpeed = 220;
    const perpAngle = sliceAngle + Math.PI / 2;
    const kickX = Math.cos(perpAngle) * kickSpeed;
    const kickY = Math.sin(perpAngle) * kickSpeed;

    const renderFn = (ctx) => this.drawSelf(ctx, true);

    const halfA = new SlicedHalf({
      x: this.x,
      y: this.y,
      vx: this.vx + kickX,
      vy: this.vy + kickY - 50,
      angle: this.rotation,
      vRot: -3.2,
      renderObj: renderFn,
      isLeftHalf: true,
      cutAngle: sliceAngle
    });

    const halfB = new SlicedHalf({
      x: this.x,
      y: this.y,
      vx: this.vx - kickX,
      vy: this.vy - kickY - 50,
      angle: this.rotation,
      vRot: 3.2,
      renderObj: renderFn,
      isLeftHalf: false,
      cutAngle: sliceAngle
    });

    return [halfA, halfB];
  }

  // Draw object with transform
  draw(ctx) {
    if (this.isSliced) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    this.drawSelf(ctx, false);

    ctx.restore();
  }

  // Procedural 3D Glossy Renderers
  drawSelf(ctx, isSlicePiece = false) {
    switch (this.type) {
      case 'balloon':
        this.draw3DBalloon(ctx, isSlicePiece);
        break;
      case 'gift':
        this.draw3DGift(ctx, isSlicePiece);
        break;
      case 'heart':
        this.draw3DHeart(ctx, isSlicePiece);
        break;
      case 'bomb':
        this.draw3DBomb(ctx, isSlicePiece);
        break;
    }
  }

  // 1. Metallic Rose-Gold & Pearl Balloons with delicate wavy string
  draw3DBalloon(ctx, isSlicePiece) {
    const r = this.radius;

    // String (only on original intact balloon)
    if (!isSlicePiece) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, r + 6);
      const wobble = Math.sin(this.stringWobble) * 10;
      ctx.bezierCurveTo(
        wobble, r + 24,
        -wobble, r + 45,
        wobble * 0.5, r + 65
      );
      ctx.strokeStyle = 'rgba(255, 235, 240, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // Balloon Knot
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-6, r + 6);
    ctx.lineTo(6, r + 6);
    ctx.lineTo(0, r);
    ctx.closePath();
    ctx.fillStyle = this.colorVariant === 'metallic-blue' ? '#0284c7' : (this.colorVariant === 'emerald' ? '#059669' : (this.colorVariant === 'silver' ? '#94a3b8' : '#d97706'));
    ctx.fill();
    ctx.restore();

    // 3D Balloon Body (Multi-stop radial gradient: Blue, Silver, Emerald, Gold)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.88, r * 1.05, 0, 0, Math.PI * 2);

    const grad = ctx.createRadialGradient(
      -r * 0.35, -r * 0.4, r * 0.1,
      0, 0, r * 1.1
    );

    let shadowCol = 'rgba(0, 242, 254, 0.45)';
    if (this.colorVariant === 'metallic-blue') {
      grad.addColorStop(0, '#f0f9ff'); // specular highlight
      grad.addColorStop(0.2, '#38bdf8'); // neon cyan / sky
      grad.addColorStop(0.65, '#0284c7'); // metallic royal blue
      grad.addColorStop(0.9, '#0369a1'); // deep shadow
      grad.addColorStop(1, '#082f49'); // ambient dark rim
      shadowCol = 'rgba(0, 242, 254, 0.5)';
    } else if (this.colorVariant === 'emerald') {
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(0.2, '#34d399');
      grad.addColorStop(0.65, '#059669');
      grad.addColorStop(0.9, '#047857');
      grad.addColorStop(1, '#064e3b');
      shadowCol = 'rgba(16, 185, 129, 0.5)';
    } else if (this.colorVariant === 'silver') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#f1f5f9');
      grad.addColorStop(0.65, '#cbd5e1');
      grad.addColorStop(0.9, '#64748b');
      grad.addColorStop(1, '#1e293b');
      shadowCol = 'rgba(203, 213, 225, 0.45)';
    } else {
      // Gold
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#fef08a');
      grad.addColorStop(0.65, '#fbbf24');
      grad.addColorStop(0.9, '#d97706');
      grad.addColorStop(1, '#451a03');
      shadowCol = 'rgba(251, 191, 36, 0.5)';
    }

    ctx.fillStyle = grad;
    ctx.shadowBlur = 18;
    ctx.shadowColor = shadowCol;
    ctx.fill();

    // Glossy Specular Highlight Oval (top left)
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.32, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();

    // Secondary subtle rim reflection
    ctx.beginPath();
    ctx.ellipse(r * 0.35, r * 0.4, r * 0.25, r * 0.12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();

    ctx.restore();
  }

  // 2. 3D Satin Gift Box with glossy gold ribbon (Midnight Blue & Gold)
  draw3DGift(ctx) {
    const size = this.radius * 1.6;
    const half = size / 2;

    ctx.save();

    // Box Body (Midnight Royal Blue with radial gradient)
    const boxGrad = ctx.createRadialGradient(-half * 0.3, -half * 0.3, 10, 0, 0, size * 0.85);
    boxGrad.addColorStop(0, '#bae6fd');
    boxGrad.addColorStop(0.35, '#3b82f6');
    boxGrad.addColorStop(0.75, '#1d4ed8');
    boxGrad.addColorStop(1, '#0f172a');

    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, 12);
    ctx.fillStyle = boxGrad;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.5)';
    ctx.fill();

    // Metallic Gold Vertical Ribbon
    const ribbonW = size * 0.22;
    const goldGradH = ctx.createLinearGradient(-ribbonW / 2, 0, ribbonW / 2, 0);
    goldGradH.addColorStop(0, '#b8860b');
    goldGradH.addColorStop(0.3, '#ffd700');
    goldGradH.addColorStop(0.5, '#fff9c4');
    goldGradH.addColorStop(0.7, '#ffd700');
    goldGradH.addColorStop(1, '#b8860b');

    ctx.beginPath();
    ctx.roundRect(-ribbonW / 2, -half, ribbonW, size, 2);
    ctx.fillStyle = goldGradH;
    ctx.fill();

    // Metallic Gold Horizontal Ribbon
    const goldGradV = ctx.createLinearGradient(0, -ribbonW / 2, 0, ribbonW / 2);
    goldGradV.addColorStop(0, '#b8860b');
    goldGradV.addColorStop(0.3, '#ffd700');
    goldGradV.addColorStop(0.5, '#fff9c4');
    goldGradV.addColorStop(0.7, '#ffd700');
    goldGradV.addColorStop(1, '#b8860b');

    ctx.beginPath();
    ctx.roundRect(-half, -ribbonW / 2, size, ribbonW, 2);
    ctx.fillStyle = goldGradV;
    ctx.fill();

    // 3D Ribbon Bow Loops on top
    const bowR = ribbonW * 0.9;
    // Left loop
    ctx.beginPath();
    ctx.ellipse(-bowR * 0.8, -half, bowR, bowR * 0.6, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.stroke();

    // Right loop
    ctx.beginPath();
    ctx.ellipse(bowR * 0.8, -half, bowR, bowR * 0.6, Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.stroke();

    // Central Bow Knot
    ctx.beginPath();
    ctx.arc(0, -half, bowR * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#fff9c4';
    ctx.fill();

    ctx.restore();
  }

  // 3. 3D Crystal / Glossy Cyan & Sapphire Heart with pulsing inner glow
  draw3DHeart(ctx) {
    const s = this.radius * 0.088;
    const pulse = 1 + Math.sin(this.timeAlive * 5) * 0.06;

    ctx.save();
    ctx.scale(pulse, pulse);

    // Heart Path
    ctx.beginPath();
    ctx.moveTo(0, -10 * s);
    ctx.bezierCurveTo(15 * s, -30 * s, 40 * s, -8 * s, 0, 32 * s);
    ctx.bezierCurveTo(-40 * s, -8 * s, -15 * s, -30 * s, 0, -10 * s);
    ctx.closePath();

    // Multi-stop 3D Cyan & Sapphire Radial Gradient
    const heartGrad = ctx.createRadialGradient(-10 * s, -12 * s, 4, 0, 0, 36 * s);
    heartGrad.addColorStop(0, '#ffffff');
    heartGrad.addColorStop(0.2, '#67e8f9');
    heartGrad.addColorStop(0.55, '#00f2fe');
    heartGrad.addColorStop(0.85, '#0284c7');
    heartGrad.addColorStop(1, '#082f49');

    ctx.fillStyle = heartGrad;
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.85)';
    ctx.fill();

    // Glossy Curving Specular Highlights
    ctx.beginPath();
    ctx.ellipse(-14 * s, -14 * s, 10 * s, 5 * s, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(14 * s, -14 * s, 7 * s, 3.5 * s, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    ctx.restore();
  }

  // 4. 3D Matte Dark Storm Cloud / Bomb with spark fuse and playful label tag
  draw3DBomb(ctx) {
    const r = this.radius * 0.95;

    ctx.save();

    // Fuse Cord & Sparkling Flame
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.quadraticCurveTo(14, -r * 1.35, 22, -r * 1.55);
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Animated Spark Flame at tip
    const sparkX = 22;
    const sparkY = -r * 1.55;
    const sparkFlicker = Math.random() * 4 + 6;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkFlicker, 0, Math.PI * 2);
    ctx.fillStyle = '#ffbe0b';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fb5607';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkFlicker * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // 3D Dark Matte Charcoal Sphere with lighting
    const bombGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 6, 0, 0, r * 1.15);
    bombGrad.addColorStop(0, '#6c757d');
    bombGrad.addColorStop(0.3, '#343a40');
    bombGrad.addColorStop(0.8, '#212529');
    bombGrad.addColorStop(1, '#0d1117');

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = bombGrad;
    ctx.shadowBlur = 16;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();

    // Top Collar
    ctx.beginPath();
    ctx.roundRect(-r * 0.28, -r * 0.98, r * 0.56, r * 0.22, 3);
    ctx.fillStyle = '#495057';
    ctx.fill();

    // Specular matte crescent
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.35, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    ctx.restore();
  }
}

// 5. Giant 3D Golden Birthday Gift & Tiered Cake Boss
export class GiantBirthdayBoss {
  constructor({ targetSlashes = 30, centerX = 400, centerY = 350 }) {
    this.targetSlashes = targetSlashes;
    this.slashesDone = 0;
    this.x = centerX;
    this.y = centerY;
    this.baseRadius = 135;
    this.wobble = 0;
    this.wobbleDecay = 0.92;
    this.isDefeated = false;
    this.scale = 0.1;
    this.targetScale = 1.0;
    this.time = 0;
  }

  slash() {
    if (this.isDefeated) return false;
    this.slashesDone++;
    this.wobble = 26; // Punch wobble
    if (this.slashesDone >= this.targetSlashes) {
      this.isDefeated = true;
      return true; // Complete!
    }
    return false;
  }

  update(dt) {
    this.time += dt;
    this.wobble *= this.wobbleDecay;
    if (this.scale < this.targetScale) {
      this.scale += (this.targetScale - this.scale) * 10 * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const wobbleAngle = Math.sin(this.time * 28) * (this.wobble * 0.02);
    ctx.rotate(wobbleAngle);
    ctx.scale(this.scale, this.scale);

    // Golden Aura Glow
    // Golden & Cyan Aura Glow
    const auraPulse = Math.sin(this.time * 4) * 15 + 40;
    const auraGrad = ctx.createRadialGradient(0, 0, 50, 0, 0, this.baseRadius + auraPulse);
    auraGrad.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
    auraGrad.addColorStop(0.85, 'rgba(251, 191, 36, 0.2)');
    auraGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius + auraPulse, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    // Tier 1: Bottom Golden Cake Layer
    ctx.save();
    const t1W = 210;
    const t1H = 75;
    ctx.beginPath();
    ctx.roundRect(-t1W / 2, 20, t1W, t1H, 16);
    const c1Grad = ctx.createLinearGradient(-t1W / 2, 0, t1W / 2, 0);
    c1Grad.addColorStop(0, '#d4af37');
    c1Grad.addColorStop(0.3, '#fff2a8');
    c1Grad.addColorStop(0.5, '#ffffff');
    c1Grad.addColorStop(0.7, '#ffd700');
    c1Grad.addColorStop(1, '#aa8c2c');
    ctx.fillStyle = c1Grad;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffd700';
    ctx.fill();

    // Frosting dripping (Platinum White)
    ctx.beginPath();
    ctx.roundRect(-t1W / 2 - 4, 16, t1W + 8, 18, 9);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.4)';
    ctx.fill();
    ctx.restore();

    // Tier 2: Middle Electric Cyan & Royal Sapphire Layer
    ctx.save();
    const t2W = 150;
    const t2H = 65;
    ctx.beginPath();
    ctx.roundRect(-t2W / 2, -45, t2W, t2H, 14);
    const c2Grad = ctx.createLinearGradient(-t2W / 2, 0, t2W / 2, 0);
    c2Grad.addColorStop(0, '#0284c7');
    c2Grad.addColorStop(0.35, '#00f2fe');
    c2Grad.addColorStop(0.65, '#e0f2fe');
    c2Grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = c2Grad;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f2fe';
    ctx.fill();

    // Cream Frosting dripping
    ctx.beginPath();
    ctx.roundRect(-t2W / 2 - 3, -48, t2W + 6, 16, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Tier 3: Top Golden Gift Box & 3D Candles
    ctx.save();
    const t3W = 95;
    const t3H = 50;
    ctx.beginPath();
    ctx.roundRect(-t3W / 2, -95, t3W, t3H, 10);
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffd700';
    ctx.fill();

    // Ribbon (Neon Cyan)
    ctx.fillStyle = '#00f2fe';
    ctx.fillRect(-8, -95, 16, t3H);

    // Three Glowing Candles on Top
    [-24, 0, 24].forEach((cx, idx) => {
      // Candle stick
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(cx - 3, -118, 6, 23);

      // Flame
      const flameFlicker = Math.sin(this.time * 12 + idx) * 3;
      ctx.beginPath();
      ctx.ellipse(cx, -125 + flameFlicker * 0.3, 5 + flameFlicker * 0.2, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffbe0b';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, -124, 2, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
    ctx.restore();

    // Slash Progress Ring & Counter
    ctx.save();
    ctx.translate(0, 115);
    const prog = this.slashesDone / this.targetSlashes;

    // Progress Bar background
    const barW = 220;
    const barH = 14;
    ctx.beginPath();
    ctx.roundRect(-barW / 2, -barH / 2, barW, barH, 7);
    ctx.fillStyle = 'rgba(10, 15, 30, 0.8)';
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    // Filled progress
    if (prog > 0) {
      ctx.beginPath();
      ctx.roundRect(-barW / 2, -barH / 2, barW * prog, barH, 7);
      const progGrad = ctx.createLinearGradient(-barW / 2, 0, barW / 2, 0);
      progGrad.addColorStop(0, '#00f2fe');
      progGrad.addColorStop(0.5, '#3b82f6');
      progGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = progGrad;
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();
    }

    // Counter Text
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#000';
    ctx.fillText(`✨ ${this.slashesDone} / ${this.targetSlashes} SABET ✨`, 0, -22);

    ctx.restore();
    ctx.restore();
  }
}
