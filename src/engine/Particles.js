// Dynamic Particle Emitter & Floating Damage Numbers Engine
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.damageTexts = [];
  }

  reset() {
    this.particles = [];
    this.damageTexts = [];
  }

  // --- Particle Emitters ---
  emit(x, y, count = 5, color = '#ffffff', options = {}) {
    const {
      speed = 2,
      size = 2,
      life = 0.5,
      gravity = 0,
      glow = false,
      shape = 'rect' // 'rect', 'circle', 'spark'
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.8 + 0.2) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * size + 1,
        maxLife: life,
        life: life,
        gravity,
        glow,
        shape
      });
    }
  }

  // Blood burst
  emitBlood(x, y, count = 8) {
    this.emit(x, y, count, '#dc2626', { speed: 3, size: 2.5, life: 0.4, gravity: 0.1 });
  }

  // Sparks on armor hit
  emitSparks(x, y, count = 6) {
    this.emit(x, y, count, '#facc15', { speed: 4, size: 2, life: 0.3, glow: true });
  }

  // Critical hit starburst
  emitCritStarburst(x, y) {
    this.emit(x, y, 12, '#f59e0b', { speed: 5, size: 3, life: 0.5, glow: true });
    this.emit(x, y, 8, '#ffffff', { speed: 3, size: 2, life: 0.4 });
  }

  // Dash ghost trail
  emitDashTrail(x, y, color = '#38bdf8') {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color,
      size: 14,
      maxLife: 0.25,
      life: 0.25,
      shape: 'ghost'
    });
  }

  // Level Up Pillar of Light
  emitLevelUp(x, y) {
    for (let i = 0; i < 20; i++) {
      const offset = (Math.random() - 0.5) * 24;
      this.particles.push({
        x: x + offset,
        y: y + 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 3 + 2),
        color: Math.random() > 0.5 ? '#facc15' : '#38bdf8',
        size: 3,
        maxLife: 0.8,
        life: 0.8,
        glow: true
      });
    }
  }

  // --- Floating Damage & Status Text ---
  addDamageText(x, y, text, type = 'normal') {
    // Types: 'normal', 'crit', 'magic', 'heal', 'poison', 'gold'
    let color = '#ffffff';
    let size = 10;
    let isCrit = false;

    if (type === 'crit') {
      color = '#f59e0b';
      size = 14;
      isCrit = true;
    } else if (type === 'magic') {
      color = '#38bdf8';
      size = 11;
    } else if (type === 'heal') {
      color = '#22c55e';
      size = 11;
    } else if (type === 'poison') {
      color = '#10b981';
      size = 10;
    } else if (type === 'gold') {
      color = '#eab308';
      size = 10;
    }

    this.damageTexts.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y - 8,
      text: String(text),
      color,
      size,
      isCrit,
      life: 0.7,
      maxLife: 0.7,
      vy: -1.2,
      vx: (Math.random() - 0.5) * 0.4
    });
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
    }

    // Update damage texts
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const t = this.damageTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.damageTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy;
      t.x += t.vx;
      t.vy *= 0.96;
    }
  }

  render(ctx, camera) {
    // Render particles
    this.particles.forEach(p => {
      const screenX = Math.round(p.x - camera.x);
      const screenY = Math.round(p.y - camera.y);
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.shape === 'ghost') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, p.size / 2, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        if (p.glow) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
        }
        ctx.fillStyle = p.color;
        ctx.fillRect(screenX - p.size / 2, screenY - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    });

    // Render floating texts with crisp pixel font
    this.damageTexts.forEach(t => {
      const screenX = Math.round(t.x - camera.x);
      const screenY = Math.round(t.y - camera.y);
      const alpha = Math.max(0, t.life / t.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = t.isCrit ? `bold ${t.size}px 'Press Start 2P', monospace` : `${t.size}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';

      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, screenX, screenY);

      // Fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, screenX, screenY);

      ctx.restore();
    });
  }
}

export const particles = new ParticleSystem();
