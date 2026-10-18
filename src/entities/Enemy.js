// Enemy AI, Pathfinding & Combat Entity
import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { InventorySystem } from '../systems/Inventory.js';
import { sprites } from '../engine/Sprites.js';

export class Enemy extends Entity {
  constructor(x, y, type = 'slime', depth = 1) {
    super(x, y, 16, 16);
    this.type = type;
    this.depth = depth;

    this.attackRange = 24;
    this.sightRange = 180;
    this.attackCooldown = 0;
    this.attackRate = 1.2;

    this.isRanged = false;
    this.projectileColor = '#ef4444';

    this.goldReward = 10;
    this.expReward = 25;

    this.initStats();
  }

  initStats() {
    const scale = 1 + (this.depth - 1) * 0.35; // 35% growth per depth

    if (this.type === 'slime') {
      this.maxHp = Math.round(35 * scale);
      this.hp = this.maxHp;
      this.speed = 50;
      this.attack = Math.round(8 * scale);
      this.expReward = Math.round(20 * scale);
      this.goldReward = Math.round(12 * scale);
    } else if (this.type === 'goblin') {
      this.maxHp = Math.round(50 * scale);
      this.hp = this.maxHp;
      this.speed = 85;
      this.attack = Math.round(12 * scale);
      this.expReward = Math.round(30 * scale);
      this.goldReward = Math.round(18 * scale);
    } else if (this.type === 'skeleton') {
      this.maxHp = Math.round(65 * scale);
      this.hp = this.maxHp;
      this.speed = 70;
      this.attack = Math.round(15 * scale);
      this.expReward = Math.round(40 * scale);
      this.goldReward = Math.round(25 * scale);
    } else if (this.type === 'necromancer') {
      this.maxHp = Math.round(55 * scale);
      this.hp = this.maxHp;
      this.speed = 60;
      this.attack = Math.round(14 * scale);
      this.isRanged = true;
      this.sightRange = 220;
      this.projectileColor = '#c084fc';
      this.expReward = Math.round(50 * scale);
      this.goldReward = Math.round(35 * scale);
    } else if (this.type === 'fire_demon') {
      this.maxHp = Math.round(80 * scale);
      this.hp = this.maxHp;
      this.speed = 80;
      this.attack = Math.round(18 * scale);
      this.expReward = Math.round(60 * scale);
      this.goldReward = Math.round(40 * scale);
    } else if (this.type === 'frost_wisp') {
      this.maxHp = Math.round(45 * scale);
      this.hp = this.maxHp;
      this.speed = 90;
      this.attack = Math.round(12 * scale);
      this.isRanged = true;
      this.projectileColor = '#38bdf8';
      this.expReward = Math.round(45 * scale);
      this.goldReward = Math.round(30 * scale);
    } else { // void_stalker
      this.maxHp = Math.round(110 * scale);
      this.hp = this.maxHp;
      this.speed = 95;
      this.attack = Math.round(22 * scale);
      this.expReward = Math.round(80 * scale);
      this.goldReward = Math.round(60 * scale);
    }
  }

  updateAI(player, dungeon, projectiles, particles, audio, dt, timeSlow = 1.0) {
    if (this.isDead) return;

    const finalDt = dt * timeSlow;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= finalDt;
    }

    const dist = this.distTo(player);

    if (dist < this.sightRange && !player.isDead) {
      // Direct angle towards player
      const angle = Math.atan2(player.y - this.y, player.x - this.x);

      if (this.isRanged) {
        // Keep distance and shoot
        if (dist < 80) {
          // Back away
          this.vx = -Math.cos(angle) * this.speed * timeSlow;
          this.vy = -Math.sin(angle) * this.speed * timeSlow;
        } else if (dist > 160) {
          // Move closer
          this.vx = Math.cos(angle) * this.speed * timeSlow;
          this.vy = Math.sin(angle) * this.speed * timeSlow;
        } else {
          this.vx = 0;
          this.vy = 0;
        }

        // Shoot projectile
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.attackRate;
          const spd = 160;
          projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * spd, Math.sin(angle) * spd, {
            damage: this.attack,
            isPlayer: false,
            color: this.projectileColor,
            radius: 4
          }));
          if (audio) audio.playSfx('magic_cast');
        }
      } else {
        // Melee Chase
        this.vx = Math.cos(angle) * this.speed * timeSlow;
        this.vy = Math.sin(angle) * this.speed * timeSlow;

        // Melee attack player
        if (dist <= this.attackRange && this.attackCooldown <= 0) {
          this.attackCooldown = this.attackRate;
          player.takeDamage(this.attack, this.x, this.y, particles, audio);
        }
      }
    } else {
      // Idle / Patrol friction
      this.vx = 0;
      this.vy = 0;
    }

    super.update(finalDt, dungeon);

    // Animation frame timer
    this.animTimer += finalDt;
    if (this.animTimer > 0.2) {
      this.animTimer = 0;
      this.animFrame = this.animFrame === 0 ? 1 : 0;
    }
  }

  // Handle Death Drops
  onKilled(player, quests, particles, audio) {
    // 1. Give EXP & Gold
    player.gold += this.goldReward;
    player.addExp(this.expReward, particles, audio);
    quests.onMonsterKilled(this.type, player, particles, audio);

    // 2. Drop Particles
    particles.emit(this.x, this.y, 14, '#ef4444', { speed: 3, life: 0.5 });
    particles.addDamageText(this.x, this.y - 10, `+${this.goldReward}G`, 'gold');

    // 3. Loot Drop Chances
    const roll = Math.random();
    if (roll < 0.2) { // 20% Health Potion
      player.inventory.addItem(InventorySystem.generateItem('common', 'potion_hp', player.level));
      particles.addDamageText(this.x, this.y - 20, "Potion Drop!", 'heal');
    } else if (roll < 0.35) { // 15% Gear Drop
      const tierRoll = Math.random();
      let tier = 'common';
      if (tierRoll < 0.05) tier = 'legendary';
      else if (tierRoll < 0.2) tier = 'epic';
      else if (tierRoll < 0.5) tier = 'rare';

      const gearTypes = ['weapon', 'armor', 'helm', 'ring'];
      const pickType = gearTypes[Math.floor(Math.random() * gearTypes.length)];
      const item = InventorySystem.generateItem(tier, pickType, player.level);
      player.inventory.addItem(item);
      particles.addDamageText(this.x, this.y - 20, item.name, tier === 'legendary' ? 'gold' : 'magic');
    } else if (roll < 0.5) { // 15% Time Shards
      player.inventory.timeShards += 1;
      particles.addDamageText(this.x, this.y - 20, "+1 Shard", 'magic');
    }
  }

  render(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    const frames = sprites.get(`enemy_${this.type}`);
    if (frames && frames.length > 0) {
      const spriteCanvas = frames[this.animFrame] || frames[0];

      ctx.save();
      if (this.invulnerableTimer > 0) {
        ctx.filter = 'brightness(200%)';
      }

      if (this.facing === 'left') {
        ctx.translate(screenX, screenY);
        ctx.scale(-1, 1);
        ctx.drawImage(spriteCanvas, -16, -16);
      } else {
        ctx.drawImage(spriteCanvas, screenX - 16, screenY - 16);
      }
      ctx.restore();

      // Mini Health Bar above monster
      if (this.hp < this.maxHp) {
        const barW = 20;
        const barH = 3;
        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(screenX - barW / 2, screenY - 18, barW, barH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(screenX - barW / 2, screenY - 18, barW * hpPct, barH);
      }
    }
  }
}
