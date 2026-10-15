// Procedural 3D Console Gamer / E-Sports Objects & Split-In-Half Slicing Physics
// Sleek 3D Tech Crates / Loot Boxes, Holographic Stars, Shield Nodes, & Red Danger Mines

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
    this.gravity = 650;
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
    const clipR = 300;
    if (this.isLeftHalf) {
      ctx.rect(-clipR, -clipR, clipR * 2, clipR);
    } else {
      ctx.rect(-clipR, 0, clipR * 2, clipR);
    }
    ctx.clip();
    ctx.rotate(-this.cutAngle);

    // Draw the original object
    this.renderObj(ctx);

    // Plasma severance line edge glow
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2fe';
    ctx.beginPath();
    ctx.moveTo(-clipR, 0);
    ctx.lineTo(clipR, 0);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }
}

export class GameObject {
  constructor({ id, type, x, y, vx, vy, radius = 48, label = '', customData = null }) {
    this.id = id;
    // Map types to Gamer aesthetic
    if (type === 'cube' || type === 'balloon' || type === 'loot_box') {
      this.type = 'loot_box';
    } else if (type === 'gold_cube' || type === 'gift' || type === 'holo_star') {
      this.type = 'holo_star';
    } else if (type === 'shield_node' || type === 'heart') {
      this.type = 'shield_node';
    } else if (type === 'glitch_virus' || type === 'bomb' || type === 'danger_mine') {
      this.type = 'danger_mine';
    } else {
      this.type = type;
    }

    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.gravity = 560;

    // 3D Rotation Angles
    this.rotX = Math.random() * Math.PI * 2;
    this.rotY = Math.random() * Math.PI * 2;
    this.rotZ = Math.random() * Math.PI * 2;
    this.vRotX = (Math.random() - 0.5) * 3.2;
    this.vRotY = (Math.random() - 0.5) * 3.2;
    this.vRotZ = (Math.random() - 0.5) * 2.2;

    this.label = label;
    this.customData = customData;
    this.isSliced = false;
    this.timeAlive = 0;
  }

  update(dt) {
    this.timeAlive += dt;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotX += this.vRotX * dt;
    this.rotY += this.vRotY * dt;
    this.rotZ += this.vRotZ * dt;
  }

  // Split object into two halves along cutting angle theta
  createSlicedHalves(sliceAngle) {
    const kickSpeed = 240;
    const perpAngle = sliceAngle + Math.PI / 2;
    const kickX = Math.cos(perpAngle) * kickSpeed;
    const kickY = Math.sin(perpAngle) * kickSpeed;

    const renderFn = (ctx) => this.drawSelf(ctx, true);

    const halfA = new SlicedHalf({
      x: this.x,
      y: this.y,
      vx: this.vx + kickX,
      vy: this.vy + kickY - 50,
      angle: 0,
      vRot: -3.8,
      renderObj: renderFn,
      isLeftHalf: true,
      cutAngle: sliceAngle
    });

    const halfB = new SlicedHalf({
      x: this.x,
      y: this.y,
      vx: this.vx - kickX,
      vy: this.vy - kickY - 50,
      angle: 0,
      vRot: 3.8,
      renderObj: renderFn,
      isLeftHalf: false,
      cutAngle: sliceAngle
    });

    return [halfA, halfB];
  }

  draw(ctx) {
    if (this.isSliced) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    this.drawSelf(ctx, false);

    ctx.restore();
  }

  drawSelf(ctx, isSlicePiece = false) {
    switch (this.type) {
      case 'loot_box':
        this.draw3DTechCrate(ctx);
        break;
      case 'holo_star':
        this.drawHolographicStar(ctx);
        break;
      case 'shield_node':
        this.draw3DShieldNode(ctx);
        break;
      case 'danger_mine':
        this.draw3DDangerMine(ctx);
        break;
      default:
        this.draw3DTechCrate(ctx);
        break;
    }
  }

  // 1. Sleek 3D Tech Crate / Loot Box (Metallic Blue & Silver with Neon Cyan Trim)
  draw3DTechCrate(ctx) {
    const s = this.radius * 0.72; // half-size of cube

    // 8 vertices in local 3D space: [-s, s]
    const rawVertices = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s,  s], [s, -s,  s], [s, s,  s], [-s, s,  s]
    ];

    // Apply 3D Rotation
    const cx = Math.cos(this.rotX), sx = Math.sin(this.rotX);
    const cy = Math.cos(this.rotY), sy = Math.sin(this.rotY);
    const cz = Math.cos(this.rotZ), sz = Math.sin(this.rotZ);

    const projected = rawVertices.map(([x, y, z]) => {
      let x1 = x * cy + z * sy;
      let y1 = y;
      let z1 = -x * sy + z * cy;

      let x2 = x1;
      let y2 = y1 * cx - z1 * sx;
      let z2 = y1 * sx + z1 * cx;

      let x3 = x2 * cz - y2 * sz;
      let y3 = x2 * sz + y2 * cz;
      let z3 = z2;

      const fov = 380;
      const scale = fov / (fov + z3);
      return { x: x3 * scale, y: y3 * scale, z: z3 };
    });

    const faces = [
      { v: [0, 1, 2, 3], color: '#1e3a8a', edge: '#00f2fe' }, // back
      { v: [4, 5, 6, 7], color: '#2563eb', edge: '#38bdf8' }, // front
      { v: [0, 1, 5, 4], color: '#3b82f6', edge: '#60a5fa' }, // top
      { v: [2, 3, 7, 6], color: '#1d4ed8', edge: '#00f2fe' }, // bottom
      { v: [0, 3, 7, 4], color: '#1e40af', edge: '#00f2fe' }, // left
      { v: [1, 2, 6, 5], color: '#2563eb', edge: '#38bdf8' }  // right
    ];

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f2fe';

    // Draw faces with metallic gradient & cyber trims
    faces.forEach((face) => {
      const p0 = projected[face.v[0]];
      const p1 = projected[face.v[1]];
      const p2 = projected[face.v[2]];
      const p3 = projected[face.v[3]];

      const cross = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
      const isVisible = cross > 0;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      if (isVisible) {
        ctx.fillStyle = face.color;
        ctx.fill();
        ctx.strokeStyle = face.edge;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Inner metallic bevel
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        const midX = (p0.x + p1.x + p2.x + p3.x) / 4;
        const midY = (p0.y + p1.y + p2.y + p3.y) / 4;
        ctx.moveTo((p0.x + midX) / 2, (p0.y + midY) / 2);
        ctx.lineTo((p1.x + midX) / 2, (p1.y + midY) / 2);
        ctx.lineTo((p2.x + midX) / 2, (p2.y + midY) / 2);
        ctx.lineTo((p3.x + midX) / 2, (p3.y + midY) / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(10, 20, 45, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
    });

    // 12 Glowing Edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    edges.forEach(([i, j]) => {
      ctx.moveTo(projected[i].x, projected[i].y);
      ctx.lineTo(projected[j].x, projected[j].y);
    });
    ctx.stroke();

    // 8 Silver Corner Bolt Rivets
    projected.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // Central Glowing Loot Core (Blue Diamond)
    const pulse = 1 + Math.sin(this.timeAlive * 8) * 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.32 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2fe';
    ctx.fill();

    // Loot Crate Icon
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('💎', 0, 1);

    ctx.restore();
  }

  // 2. Holographic Golden Star (Bonus / High-Value Energy Node)
  drawHolographicStar(ctx) {
    const r = this.radius * 0.9;
    const pulse = 1 + Math.sin(this.timeAlive * 6) * 0.1;

    ctx.save();
    ctx.scale(pulse, pulse);
    ctx.rotate(this.timeAlive * 1.5);

    // Glowing Golden Aura
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#fbbf24';

    // Outer Shimmer Orbital Ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5-Pointed 3D Golden Star
    const points = 5;
    const outerR = r * 1.05;
    const innerR = r * 0.48;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const dist = i % 2 === 0 ? outerR : innerR;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();

    const starGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, outerR);
    starGrad.addColorStop(0, '#ffffff');
    starGrad.addColorStop(0.3, '#fef08a');
    starGrad.addColorStop(0.65, '#fbbf24');
    starGrad.addColorStop(1, '#b45309');

    ctx.fillStyle = starGrad;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Inner Facet Shading
    for (let i = 0; i < points; i++) {
      const angle = (i * 2 * Math.PI) / points - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Central Radiant Flare
    ctx.beginPath();
    ctx.arc(0, 0, innerR * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  // 3. Procedural 3D Shield Node (Restores 1 Shield)
  draw3DShieldNode(ctx) {
    const r = this.radius * 0.85;
    const pulse = 1 + Math.sin(this.timeAlive * 6) * 0.08;

    ctx.save();
    ctx.scale(pulse, pulse);

    // Glowing Neon Cyan & Emerald Ring Glow
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#10b981';

    // Outer Gyroscope Orbital Ring 1
    ctx.save();
    ctx.rotate(this.timeAlive * 2.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r * 0.45, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Outer Gyroscope Orbital Ring 2 (Perpendicular)
    ctx.save();
    ctx.rotate(-this.timeAlive * 2.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.45, r * 1.15, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Central Hexagonal Energy Shield Core
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = Math.cos(angle) * (r * 0.72);
      const hy = Math.sin(angle) * (r * 0.72);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();

    const shieldGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 0.8);
    shieldGrad.addColorStop(0, '#ffffff');
    shieldGrad.addColorStop(0.3, '#6ee7b7');
    shieldGrad.addColorStop(0.7, '#059669');
    shieldGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = shieldGrad;
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glowing Plus / Shield Emblem
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    const pw = r * 0.16;
    const pl = r * 0.52;
    ctx.fillRect(-pw / 2, -pl / 2, pw, pl);
    ctx.fillRect(-pl / 2, -pw / 2, pl, pw);

    ctx.restore();
  }

  // 4. Glowing Red Danger Mine (Sleek Dark Matte Sphere with Spikes, ZERO TEXT)
  draw3DDangerMine(ctx) {
    const r = this.radius * 0.85;
    const pulse = 1 + Math.sin(this.timeAlive * 8) * 0.08;

    ctx.save();
    ctx.scale(pulse, pulse);

    // Menacing Red Danger Glow
    ctx.shadowBlur = 26;
    ctx.shadowColor = '#ef4444';

    // 8 Protruding Metallic Spikes
    const spikeCount = 8;
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i * Math.PI * 2) / spikeCount + this.timeAlive * 1.5;
      const spikeR = r * 1.35;
      const sx = Math.cos(angle) * spikeR;
      const sy = Math.sin(angle) * spikeR;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Sharp glowing red spike tip
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }

    // Central Dark Matte Sphere
    const mineGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 5, 0, 0, r);
    mineGrad.addColorStop(0, '#7f1d1d');
    mineGrad.addColorStop(0.35, '#3b0707');
    mineGrad.addColorStop(0.85, '#180404');
    mineGrad.addColorStop(1, '#050101');

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
    ctx.fillStyle = mineGrad;
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Pulsing Hazard Beacons (3 Pulsing Red Core Lights)
    const blink = (Math.sin(this.timeAlive * 12) + 1) / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + blink * 0.6})`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ef4444';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

// 5. The Boss: Giant Golden Loot Core / Vault (20 Slashes required)
export class GiantMainframeCore {
  constructor({ targetSlashes = 20, centerX = 400, centerY = 350 }) {
    this.targetSlashes = targetSlashes;
    this.slashesDone = 0;
    this.x = centerX;
    this.y = centerY;
    this.baseRadius = 140;
    this.wobble = 0;
    this.wobbleDecay = 0.92;
    this.isDefeated = false;
    this.scale = 0.1;
    this.targetScale = 1.0;
    this.time = 0;

    // Sparks array on hit
    this.arcs = [];
  }

  slash() {
    if (this.isDefeated) return false;
    this.slashesDone++;
    this.wobble = 28;

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.arcs.push({
        angle,
        length: Math.random() * 80 + 90,
        life: 0,
        maxLife: 0.28
      });
    }

    if (this.slashesDone >= this.targetSlashes) {
      this.isDefeated = true;
      return true;
    }
    return false;
  }

  update(dt) {
    this.time += dt;
    this.wobble *= this.wobbleDecay;
    if (this.scale < this.targetScale) {
      this.scale += (this.targetScale - this.scale) * 10 * dt;
    }

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      this.arcs[i].life += dt;
      if (this.arcs[i].life >= this.arcs[i].maxLife) {
        this.arcs.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const wobbleAngle = Math.sin(this.time * 30) * (this.wobble * 0.02);
    ctx.rotate(wobbleAngle);
    ctx.scale(this.scale, this.scale);

    const prog = this.slashesDone / this.targetSlashes;

    // 1. Radiant Golden & Cyan Aura Glow
    const auraPulse = Math.sin(this.time * 5) * 20 + 50;
    const auraGrad = ctx.createRadialGradient(0, 0, 40, 0, 0, this.baseRadius + auraPulse);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    auraGrad.addColorStop(0.45, 'rgba(0, 242, 254, 0.3)');
    auraGrad.addColorStop(0.85, 'rgba(59, 130, 246, 0.15)');
    auraGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius + auraPulse, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    // 2. Outer Rotating Hexagonal Energy Barrier
    ctx.save();
    ctx.rotate(-this.time * 0.4);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = Math.cos(angle) * (this.baseRadius * 1.15);
      const hy = Math.sin(angle) * (this.baseRadius * 1.15);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 10]);
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#fbbf24';
    ctx.stroke();
    ctx.restore();

    // 3. Rotating Tech Rings
    ctx.save();
    ctx.rotate(this.time * 0.8 + prog * 4);
    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius * 0.95, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 4;
    ctx.setLineDash([24, 14, 8, 14]);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f2fe';
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.rotate(-this.time * 1.1 - prog * 6);
    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 5;
    ctx.setLineDash([32, 18]);
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#fbbf24';
    ctx.stroke();
    ctx.restore();

    // 4. Central Golden Vault Core
    const coreGrad = ctx.createRadialGradient(-35, -35, 10, 0, 0, this.baseRadius * 0.55);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.2, '#fef08a');
    coreGrad.addColorStop(0.55, '#fbbf24');
    coreGrad.addColorStop(0.85, '#d97706');
    coreGrad.addColorStop(1, '#451a03');

    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius * 0.52, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Central Emblem
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#000';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#050811';
    ctx.fillText('🏆', 0, 0);
    ctx.restore();

    // 5. Electric Arcs on hit
    this.arcs.forEach((arc) => {
      const alpha = Math.max(1 - arc.life / arc.maxLife, 0);
      ctx.save();
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f2fe';
      ctx.beginPath();
      let cx = 0;
      let cy = 0;
      ctx.moveTo(cx, cy);
      const segments = 5;
      const segLen = arc.length / segments;
      for (let s = 1; s <= segments; s++) {
        const segDist = s * segLen;
        const jitterAngle = arc.angle + (Math.random() - 0.5) * 0.6;
        const nx = Math.cos(jitterAngle) * segDist;
        const ny = Math.sin(jitterAngle) * segDist;
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();
      ctx.restore();
    });

    // 6. Boss Health / Breach Progress Bar
    ctx.save();
    ctx.translate(0, this.baseRadius + 50);

    const barW = 280;
    const barH = 14;

    ctx.beginPath();
    ctx.roundRect(-barW / 2, -barH / 2, barW, barH, 7);
    ctx.fillStyle = 'rgba(11, 15, 25, 0.9)';
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 1.6;
    ctx.fill();
    ctx.stroke();

    if (prog > 0) {
      ctx.beginPath();
      ctx.roundRect(-barW / 2, -barH / 2, barW * prog, barH, 7);
      const progGrad = ctx.createLinearGradient(-barW / 2, 0, barW / 2, 0);
      progGrad.addColorStop(0, '#00f2fe');
      progGrad.addColorStop(0.5, '#3b82f6');
      progGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = progGrad;
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();
    }

    ctx.font = '800 13px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.fillText(`BOSS HP: ${this.slashesDone} / ${this.targetSlashes} SLASHES (${Math.round(prog * 100)}%)`, 0, -22);

    ctx.restore();
    ctx.restore();
  }
}

export const GiantBirthdayBoss = GiantMainframeCore;
export default GameObject;
