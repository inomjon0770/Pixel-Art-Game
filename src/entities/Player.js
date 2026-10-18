// Player Character Class with RPG Progression, Skills & Combat
import { Entity } from './Entity.js';
import { InventorySystem } from '../systems/Inventory.js';
import { Projectile } from './Projectile.js';
import { sprites } from '../engine/Sprites.js';

export class Player extends Entity {
  constructor(x = 100, y = 100, heroClass = 'knight') {
    super(x, y, 16, 16);

    this.heroClass = heroClass; // 'knight', 'mage', 'rogue', 'chronomancer'
    this.level = 1;
    this.exp = 0;
    this.nextExp = 100;

    // Base Attributes
    this.stats = {
      strength: 10,
      vitality: 10,
      intelligence: 10,
      agility: 10,
      luck: 5
    };
    this.statPoints = 0;

    // Derived Combat Stats
    this.attack = 15;
    this.defense = 5;
    this.critChance = 10;
    this.speed = 120;
    this.maxHp = 120;
    this.hp = 120;
    this.maxMp = 60;
    this.mp = 60;
    this.lifesteal = 0;

    // Progression & Inventory
    this.inventory = new InventorySystem();
    this.gold = 100;
    this.dungeonDepth = 1;
    this.highestDepth = 1;

    // Combat & Cooldowns
    this.attackCooldown = 0;
    this.attackRate = 0.3; // seconds between attacks
    this.isAttacking = false;
    this.attackAnimTimer = 0;

    // Dash / Dodge
    this.dashCooldown = 0;
    this.dashMaxCooldown = 1.2;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.2;
    this.dashVx = 0;
    this.dashVy = 0;

    // Active Skills Cooldowns & Durations
    this.skills = {
      skill1: { cd: 0, maxCd: 4, name: 'Chrono Wave', mp: 15 },
      skill2: { cd: 0, maxCd: 8, name: 'Flame Vortex', mp: 25, activeTimer: 0 },
      skill3: { cd: 0, maxCd: 12, name: 'Void Barrier', mp: 20, activeTimer: 0 },
      skill4: { cd: 0, maxCd: 20, name: 'Time Singularity', mp: 40, activeTimer: 0 }
    };

    this.initClassDefaults();
    this.recalculateStats();
  }

  initClassDefaults() {
    if (this.heroClass === 'knight') {
      this.stats.strength = 14;
      this.stats.vitality = 14;
      this.inventory.addItem(InventorySystem.generateItem('common', 'weapon', 1));
      this.inventory.equipItem(0, this);
    } else if (this.heroClass === 'mage') {
      this.stats.intelligence = 16;
      this.stats.vitality = 8;
      this.inventory.addItem(InventorySystem.generateItem('common', 'weapon', 1));
      this.inventory.equipItem(0, this);
    } else if (this.heroClass === 'rogue') {
      this.stats.agility = 16;
      this.stats.strength = 10;
      this.stats.luck = 12;
      this.inventory.addItem(InventorySystem.generateItem('common', 'weapon', 1));
      this.inventory.equipItem(0, this);
    } else if (this.heroClass === 'chronomancer') {
      this.stats.intelligence = 14;
      this.stats.agility = 12;
      this.stats.luck = 10;
      this.inventory.addItem(InventorySystem.generateItem('common', 'weapon', 1));
      this.inventory.equipItem(0, this);
    }

    // Starter potions
    this.inventory.addItem(InventorySystem.generateItem('common', 'potion_hp', 1));
    this.inventory.addItem(InventorySystem.generateItem('common', 'potion_hp', 1));
    this.inventory.addItem(InventorySystem.generateItem('common', 'potion_mp', 1));
  }

  recalculateStats() {
    const equipBonus = this.inventory.getEquipmentBonus();

    this.maxHp = 80 + this.stats.vitality * 12 + equipBonus.maxHp;
    this.maxMp = 40 + this.stats.intelligence * 8 + equipBonus.maxMp;
    this.attack = 5 + this.stats.strength * 2.5 + Math.floor(this.stats.intelligence * 1.5) + equipBonus.attack;
    this.defense = this.stats.vitality * 1.2 + equipBonus.defense;
    this.critChance = 5 + this.stats.luck * 1.5 + this.stats.agility * 0.8 + equipBonus.critChance;
    this.speed = 100 + this.stats.agility * 2.5 + equipBonus.speed;
    this.lifesteal = equipBonus.lifesteal || 0;

    // Clamp current HP/MP
    this.hp = Math.min(this.hp, this.maxHp);
    this.mp = Math.min(this.mp, this.maxMp);
  }

  addExp(amount, particles, audio) {
    this.exp += amount;
    while (this.exp >= this.nextExp) {
      this.exp -= this.nextExp;
      this.level++;
      this.nextExp = Math.round(this.nextExp * 1.4);
      this.statPoints += 4;

      this.hp = this.maxHp;
      this.mp = this.maxMp;

      if (particles) {
        particles.emitLevelUp(this.x, this.y);
        particles.addDamageText(this.x, this.y - 25, `LEVEL UP! (${this.level})`, 'gold');
      }
      if (audio) {
        audio.playSfx('levelup');
      }
    }
  }

  upgradeStat(statKey) {
    if (this.statPoints > 0 && this.stats[statKey] !== undefined) {
      this.stats[statKey]++;
      this.statPoints--;
      this.recalculateStats();
      return true;
    }
    return false;
  }

  // --- Controls & Update ---
  handleInput(input, camera, dungeon, projectiles, particles, audio) {
    if (this.isDead) return;

    // 1. Movement
    if (!this.isDashing) {
      const move = input.getMovementVector();
      this.vx = move.dx * this.speed;
      this.vy = move.dy * this.speed;
    }

    // 2. Dash / Dodge Roll (Space / Shift)
    if ((input.isJustPressed(' ') || input.isJustPressed('shift')) && this.dashCooldown <= 0) {
      this.performDash(input, audio, particles);
    }

    // 3. Primary Attack (Left Click or J)
    if ((input.mouse.leftDown || input.isDown('j')) && this.attackCooldown <= 0) {
      this.performPrimaryAttack(input, camera, projectiles, particles, audio);
    }

    // 4. Skills (1, 2, 3, 4 or Q, E, R, F)
    if (input.isJustPressed('1') || input.isJustPressed('q')) {
      this.castSkill1(dungeon, particles, audio);
    }
    if (input.isJustPressed('2') || input.isJustPressed('e')) {
      this.castSkill2(particles, audio);
    }
    if (input.isJustPressed('3') || input.isJustPressed('r')) {
      this.castSkill3(particles, audio);
    }
    if (input.isJustPressed('4') || input.isJustPressed('f')) {
      this.castSkill4(particles, audio);
    }
  }

  performDash(input, audio, particles) {
    const move = input.getMovementVector();
    let dx = move.dx;
    let dy = move.dy;

    if (dx === 0 && dy === 0) {
      // Dash towards mouse cursor
      const angle = Math.atan2(input.mouse.worldY - this.y, input.mouse.worldX - this.x);
      dx = Math.cos(angle);
      dy = Math.sin(angle);
    }

    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashCooldown = this.dashMaxCooldown;
    this.dashVx = dx * this.speed * 2.8;
    this.dashVy = dy * this.speed * 2.8;
    this.invulnerableTimer = this.dashDuration + 0.1; // Invulnerability frames

    audio.playSfx('dash');
    particles.emitDashTrail(this.x, this.y, '#38bdf8');
  }

  performPrimaryAttack(input, camera, projectiles, particles, audio) {
    this.attackCooldown = this.attackRate;
    this.isAttacking = true;
    this.attackAnimTimer = 0.2;

    const angle = Math.atan2(input.mouse.worldY - this.y, input.mouse.worldX - this.x);
    const isCrit = Math.random() * 100 < this.critChance;
    const finalDamage = Math.round(this.attack * (isCrit ? 1.8 : 1.0));

    if (this.heroClass === 'mage' || this.heroClass === 'chronomancer') {
      // Ranged projectile
      const speed = 260;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = this.heroClass === 'mage' ? '#38bdf8' : '#eab308';
      projectiles.push(new Projectile(this.x, this.y, vx, vy, {
        damage: finalDamage,
        isPlayer: true,
        color,
        isCrit,
        radius: 5
      }));
      audio.playSfx('magic_cast');
    } else {
      // Melee Swing (Knight / Rogue)
      audio.playSfx('slash');
      particles.emit(
        this.x + Math.cos(angle) * 16,
        this.y + Math.sin(angle) * 16,
        4,
        isCrit ? '#f59e0b' : '#94a3b8',
        { speed: 2, life: 0.2 }
      );
    }
  }

  // Skill 1: Chrono Wave (Shockwave AOE)
  castSkill1(dungeon, particles, audio) {
    const s = this.skills.skill1;
    if (s.cd > 0 || this.mp < s.mp) return;

    this.mp -= s.mp;
    s.cd = s.maxCd;

    audio.playSfx('time_stop');
    particles.emit(this.x, this.y, 25, '#38bdf8', { speed: 6, size: 3, life: 0.4, glow: true });

    // Damage & Push surrounding enemies
    if (dungeon && dungeon.enemies) {
      dungeon.enemies.forEach(e => {
        if (!e.isDead && this.distTo(e) < 90) {
          e.takeDamage(Math.round(this.attack * 1.5), this.x, this.y, particles, audio, true);
        }
      });
    }
  }

  // Skill 2: Flame Vortex (Orbiting blades)
  castSkill2(particles, audio) {
    const s = this.skills.skill2;
    if (s.cd > 0 || this.mp < s.mp) return;

    this.mp -= s.mp;
    s.cd = s.maxCd;
    s.activeTimer = 5.0; // active for 5 seconds

    audio.playSfx('magic_cast');
    particles.emit(this.x, this.y, 16, '#f97316', { speed: 4, life: 0.5, glow: true });
  }

  // Skill 3: Void Barrier (Shield)
  castSkill3(particles, audio) {
    const s = this.skills.skill3;
    if (s.cd > 0 || this.mp < s.mp) return;

    this.mp -= s.mp;
    s.cd = s.maxCd;
    s.activeTimer = 4.0; // 4 seconds barrier

    audio.playSfx('magic_cast');
    particles.emit(this.x, this.y, 20, '#a855f7', { speed: 3, life: 0.6, glow: true });
  }

  // Skill 4: Time Singularity (Ultimate Time Freeze)
  castSkill4(particles, audio) {
    const s = this.skills.skill4;
    if (s.cd > 0 || this.mp < s.mp) return;

    this.mp -= s.mp;
    s.cd = s.maxCd;
    s.activeTimer = 4.0; // 4 seconds time stop

    audio.playSfx('time_stop');
    particles.emit(this.x, this.y, 40, '#facc15', { speed: 8, size: 4, life: 0.8, glow: true });
  }

  takeDamage(amount, sourceX, sourceY, particles, audio) {
    // Check Void Barrier
    if (this.skills.skill3.activeTimer > 0) {
      amount = Math.round(amount * 0.2); // 80% reduction
      this.hp = Math.min(this.maxHp, this.hp + Math.round(amount * 0.5)); // heal 50%
      particles.addDamageText(this.x, this.y - 15, "BLOCKED!", 'magic');
    } else {
      // Normal armor damage mitigation
      const reduction = this.defense / (this.defense + 50);
      amount = Math.max(1, Math.round(amount * (1 - reduction)));
    }

    return super.takeDamage(amount, sourceX, sourceY, particles, audio);
  }

  update(dt, dungeon, particles) {
    // Natural Mana and HP regeneration
    this.mp = Math.min(this.maxMp, this.mp + (2 + this.stats.intelligence * 0.3) * dt);
    this.hp = Math.min(this.maxHp, this.hp + (0.5 + this.stats.vitality * 0.1) * dt);

    // Update Cooldowns
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
      if (this.attackAnimTimer <= 0) this.isAttacking = false;
    }

    // Active Skills timers
    Object.values(this.skills).forEach(s => {
      if (s.cd > 0) s.cd -= dt;
      if (s.activeTimer > 0) s.activeTimer -= dt;
    });

    // Dash physics
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.dashVx;
      this.vy = this.dashVy;
      if (particles && Math.random() > 0.4) {
        particles.emitDashTrail(this.x, this.y, '#38bdf8');
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    // Flame vortex skill tick
    if (this.skills.skill2.activeTimer > 0 && dungeon && dungeon.enemies) {
      if (Math.random() < 0.3 && particles) {
        particles.emit(this.x + (Math.random() - 0.5) * 30, this.y + (Math.random() - 0.5) * 30, 2, '#f97316', { glow: true });
      }
      dungeon.enemies.forEach(e => {
        if (!e.isDead && this.distTo(e) < 50) {
          e.takeDamage(Math.round(this.attack * 0.4), this.x, this.y, particles, null);
        }
      });
    }

    super.update(dt, dungeon);

    // Animation frames
    this.animTimer += dt;
    if (this.animTimer > 0.15) {
      this.animTimer = 0;
      if (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0) {
        this.animFrame = this.animFrame === 1 ? 2 : 1;
      } else {
        this.animFrame = 0; // Idle
      }
    }
  }

  render(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    const frames = sprites.get(`hero_${this.heroClass}`);
    if (frames && frames.length > 0) {
      const frameIdx = this.isAttacking ? 3 : this.animFrame;
      const spriteCanvas = frames[frameIdx] || frames[0];

      ctx.save();
      // Flicker when invulnerable
      if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      // Flip horizontal if facing left
      if (this.facing === 'left') {
        ctx.translate(screenX, screenY);
        ctx.scale(-1, 1);
        ctx.drawImage(spriteCanvas, -16, -16);
      } else {
        ctx.drawImage(spriteCanvas, screenX - 16, screenY - 16);
      }

      // Render Void Barrier / Skill 3 aura
      if (this.skills.skill3.activeTimer > 0) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Render Flame Vortex / Skill 2 orbiters
      if (this.skills.skill2.activeTimer > 0) {
        const time = Date.now() / 200;
        for (let i = 0; i < 3; i++) {
          const orbitAngle = time + (i * Math.PI * 2 / 3);
          const ox = screenX + Math.cos(orbitAngle) * 24;
          const oy = screenY + Math.sin(orbitAngle) * 24;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(ox, oy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }
}
