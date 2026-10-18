// Grand Multi-Phase Boss Entity Class
import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { InventorySystem } from '../systems/Inventory.js';
import { sprites } from '../engine/Sprites.js';
import { Lang } from '../systems/Lang.js';

export class Boss extends Entity {
  constructor(x, y, bossId = 'sylvanus', depth = 1) {
    super(x, y, 48, 48);
    this.bossId = bossId;
    this.depth = depth;

    this.phase = 1;
    this.isEnraged = false;
    this.attackPatternTimer = 0;
    this.specialCooldown = 3.0;

    this.chargeTimer = 0;
    this.isCharging = false;
    this.chargeVx = 0;
    this.chargeVy = 0;

    this.initStats();
  }

  initStats() {
    const scale = 1 + (this.depth - 1) * 0.45;

    this.maxHp = Math.round(400 * scale);
    this.hp = this.maxHp;
    this.speed = 60;
    this.attack = Math.round(25 * scale);
    this.goldReward = Math.round(400 * scale);
    this.expReward = Math.round(600 * scale);
  }

  getDisplayName() {
    const key = `boss_${this.depth}_name`;
    return Lang.t(key) || Lang.t('boss_1_name');
  }

  updateAI(player, dungeon, projectiles, particles, audio, dt, timeSlow = 1.0) {
    if (this.isDead) return;

    const finalDt = dt * timeSlow;
    this.attackPatternTimer += finalDt;
    this.specialCooldown -= finalDt;

    // Phase 2 Enrage check at 50% HP
    if (this.hp <= this.maxHp * 0.5 && !this.isEnraged) {
      this.isEnraged = true;
      this.phase = 2;
      this.speed *= 1.4;
      if (audio) audio.playSfx('boss_roar');
      if (particles) {
        particles.emitCritStarburst(this.x, this.y);
        particles.addDamageText(this.x, this.y - 30, "ENRAGED!", 'crit');
      }
    }

    const dist = this.distTo(player);
    const angle = Math.atan2(player.y - this.y, player.x - this.x);

    // Charge Attack handling
    if (this.isCharging) {
      this.chargeTimer -= finalDt;
      this.vx = this.chargeVx;
      this.vy = this.chargeVy;

      if (dist < 36 && player) {
        player.takeDamage(this.attack * 1.5, this.x, this.y, particles, audio);
      }

      if (this.chargeTimer <= 0) {
        this.isCharging = false;
      }
    } else {
      // Normal pursuit
      this.vx = Math.cos(angle) * this.speed * timeSlow;
      this.vy = Math.sin(angle) * this.speed * timeSlow;

      if (dist < 36 && player) {
        player.takeDamage(this.attack, this.x, this.y, particles, audio);
      }
    }

    // Boss Attack Patterns
    if (this.specialCooldown <= 0) {
      this.specialCooldown = this.isEnraged ? 2.2 : 3.5;
      this.executeSpecialAttack(player, projectiles, particles, audio);
    }

    super.update(finalDt, dungeon);
  }

  executeSpecialAttack(player, projectiles, particles, audio) {
    const pattern = Math.random();

    if (pattern < 0.4) {
      // Pattern 1: Radial 8-way / 16-way Bullet Burst
      const count = this.isEnraged ? 14 : 8;
      const step = (Math.PI * 2) / count;
      const spd = 140;

      for (let i = 0; i < count; i++) {
        const a = i * step + (Math.random() * 0.2);
        projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * spd, Math.sin(a) * spd, {
          damage: this.attack * 0.8,
          isPlayer: false,
          color: this.isEnraged ? '#f43f5e' : '#a855f7',
          radius: 5
        }));
      }
      if (audio) audio.playSfx('magic_cast');
    } else if (pattern < 0.75) {
      // Pattern 2: Heavy Charge towards player
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.isCharging = true;
      this.chargeTimer = 0.6;
      this.chargeVx = Math.cos(angle) * this.speed * 2.8;
      this.chargeVy = Math.sin(angle) * this.speed * 2.8;

      if (particles) {
        particles.emit(this.x, this.y, 16, '#f97316', { speed: 4, life: 0.4 });
      }
    } else {
      // Pattern 3: Targeted Tri-Shot
      const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
      const spreads = [-0.3, 0, 0.3];
      spreads.forEach(offset => {
        const a = baseAngle + offset;
        projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 180, Math.sin(a) * 180, {
          damage: this.attack,
          isPlayer: false,
          color: '#fbbf24',
          radius: 6
        }));
      });
      if (audio) audio.playSfx('magic_cast');
    }
  }

  onDefeated(player, dungeon, quests, particles, audio) {
    // 1. Activate Dungeon Portal Gate to next Depth
    dungeon.portalActive = true;

    // 2. Distribute Epic Rewards
    player.gold += this.goldReward;
    player.inventory.timeShards += 3 + this.depth;
    player.addExp(this.expReward, particles, audio);

    // 3. Guaranteed Legendary / Mythic Drop
    const isMythic = this.depth >= 5 || Math.random() < 0.25;
    const tier = isMythic ? 'mythic' : 'legendary';
    const gearTypes = ['weapon', 'armor', 'helm', 'ring', 'amulet'];
    const dropItem = InventorySystem.generateItem(tier, gearTypes[Math.floor(Math.random() * gearTypes.length)], player.level);
    player.inventory.addItem(dropItem);

    // 4. Update Quest Story Progress
    quests.onBossDefeated(this.bossId, player, particles, audio);

    if (particles) {
      particles.emitCritStarburst(this.x, this.y);
      particles.emitLevelUp(this.x, this.y);
      particles.addDamageText(this.x, this.y - 20, "BOSS DEFEATED!", 'gold');
    }
  }

  render(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    const sprite = sprites.get(`boss_${this.bossId}`) || sprites.get('boss_sylvanus');
    if (sprite) {
      ctx.save();
      if (this.invulnerableTimer > 0) {
        ctx.filter = 'brightness(200%)';
      }

      if (this.isEnraged) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
      }

      ctx.drawImage(sprite, screenX - 32, screenY - 32);
      ctx.restore();
    }
  }
}
