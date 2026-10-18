// Dynamic Projectile Class for Player & Enemies
export class Projectile {
  constructor(x, y, vx, vy, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.damage = options.damage || 15;
    this.isPlayer = options.isPlayer !== undefined ? options.isPlayer : true;
    this.color = options.color || '#38bdf8';
    this.radius = options.radius || 4;
    this.life = options.life || 1.8;
    this.maxLife = this.life;
    this.pierce = options.pierce || 1;
    this.hits = 0;
    this.isCrit = !!options.isCrit;
    this.trailTimer = 0;
    this.isDead = false;
  }

  update(dt, dungeon, particles) {
    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Check collision with walls
    if (dungeon && dungeon.isWorldSolid(this.x, this.y, this.radius)) {
      this.isDead = true;
      if (particles) {
        particles.emit(this.x, this.y, 4, this.color, { speed: 2, size: 2, life: 0.25 });
      }
      return;
    }

    // Particle Trail
    this.trailTimer += dt;
    if (this.trailTimer >= 0.04 && particles) {
      this.trailTimer = 0;
      particles.emit(this.x, this.y, 1, this.color, { speed: 0.5, size: 2, life: 0.2, glow: true });
    }
  }

  render(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
