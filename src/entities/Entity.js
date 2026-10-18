// Base Entity Class
export class Entity {
  constructor(x, y, w = 16, h = 16) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.speed = 100;
    this.hp = 100;
    this.maxHp = 100;
    this.isDead = false;

    this.invulnerableTimer = 0;
    this.knockbackVx = 0;
    this.knockbackVy = 0;

    this.facing = 'down'; // 'left', 'right', 'up', 'down'
    this.animFrame = 0;
    this.animTimer = 0;
  }

  takeDamage(amount, sourceX, sourceY, particles, audio, isCrit = false) {
    if (this.invulnerableTimer > 0 || this.isDead) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTimer = 0.2; // 200ms i-frame

    // Apply Knockback
    if (sourceX !== undefined && sourceY !== undefined) {
      const angle = Math.atan2(this.y - sourceY, this.x - sourceX);
      this.knockbackVx = Math.cos(angle) * 150;
      this.knockbackVy = Math.sin(angle) * 150;
    }

    if (particles) {
      particles.emitBlood(this.x, this.y, isCrit ? 12 : 6);
      particles.addDamageText(this.x, this.y, amount, isCrit ? 'crit' : 'normal');
    }

    if (audio) {
      audio.playSfx(isCrit ? 'crit' : 'hit');
    }

    if (this.hp <= 0) {
      this.isDead = true;
    }

    return true;
  }

  update(dt, dungeon) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Apply Knockback decay
    this.x += this.knockbackVx * dt;
    this.y += this.knockbackVy * dt;
    this.knockbackVx *= 0.85;
    this.knockbackVy *= 0.85;

    // Movement & Collision
    const newX = this.x + this.vx * dt;
    const newY = this.y + this.vy * dt;

    if (dungeon) {
      if (!dungeon.isWorldSolid(newX, this.y, this.w / 2.5)) {
        this.x = newX;
      }
      if (!dungeon.isWorldSolid(this.x, newY, this.h / 2.5)) {
        this.y = newY;
      }
    } else {
      this.x = newX;
      this.y = newY;
    }

    // Facing direction
    if (Math.abs(this.vx) > Math.abs(this.vy)) {
      this.facing = this.vx > 0 ? 'right' : 'left';
    } else if (Math.abs(this.vy) > 0) {
      this.facing = this.vy > 0 ? 'down' : 'up';
    }
  }

  getCenter() {
    return { x: this.x, y: this.y };
  }

  // Distance to another entity or point
  distTo(other) {
    const dx = this.x - (other.x || 0);
    const dy = this.y - (other.y || 0);
    return Math.sqrt(dx * dx + dy * dy);
  }
}
