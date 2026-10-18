// Main Game Controller & 60+ FPS Loop Engine
import './style.css';
import { Lang } from './systems/Lang.js';
import { audio } from './engine/Audio.js';
import { sprites } from './engine/Sprites.js';
import { input } from './engine/Input.js';
import { Camera } from './engine/Camera.js';
import { RenderEngine } from './engine/Renderer.js';
import { particles } from './engine/Particles.js';
import { Dungeon } from './world/Dungeon.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Boss } from './entities/Boss.js';
import { NPC, InteractiveProp } from './entities/NPC.js';
import { QuestManager } from './systems/Quests.js';
import { HUD } from './ui/HUD.js';
import { ModalManager } from './ui/Modals.js';
import { CutsceneManager } from './ui/Cutscene.js';
import { SaveManager } from './systems/SaveManager.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.uiContainer = document.getElementById('ui-layer');

    this.renderer = new RenderEngine(this.canvas);
    this.camera = new Camera(window.innerWidth, window.innerHeight);
    this.audio = audio;
    this.particles = particles;
    this.input = input;

    this.dungeon = null;
    this.player = null;
    this.quests = null;

    this.hud = new HUD();
    this.modals = new ModalManager(this);
    this.cutscenes = new CutsceneManager(this);

    this.gameState = 'TITLE'; // 'TITLE', 'PROLOGUE', 'PLAYING', 'GAMEOVER', 'VICTORY'
    this.lastTime = performance.now();
    this.autoSaveTimer = 0;

    this.init();
  }

  init() {
    Lang.init();
    sprites.init();
    this.hud.init(this.uiContainer);

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // User interaction audio unlock
    const unlockAudio = () => {
      this.audio.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Show Title & Class Select
    this.cutscenes.renderTitleScreen((selectedClass) => {
      this.startNewGame(selectedClass);
    });

    // Start Master Render Loop
    requestAnimationFrame((t) => this.loop(t));
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.resize(w, h);
    this.camera.resize(w, h);
  }

  startNewGame(heroClass = 'knight') {
    this.player = new Player(100, 100, heroClass);
    this.quests = new QuestManager();

    // Check existing save
    const saved = SaveManager.load();
    if (saved && saved.player) {
      this.player.heroClass = saved.player.heroClass || heroClass;
      this.player.level = saved.player.level || 1;
      this.player.exp = saved.player.exp || 0;
      this.player.nextExp = saved.player.nextExp || 100;
      this.player.gold = saved.player.gold || 100;
      this.player.statPoints = saved.player.statPoints || 0;
      this.player.stats = saved.player.stats || this.player.stats;
      this.player.dungeonDepth = saved.player.dungeonDepth || 1;
      if (saved.inventory) {
        this.player.inventory.items = saved.inventory.items || [];
        this.player.inventory.equipment = saved.inventory.equipment || this.player.inventory.equipment;
        this.player.inventory.timeShards = saved.inventory.timeShards || 5;
      }
      this.player.recalculateStats();
    }

    this.loadDungeonDepth(this.player.dungeonDepth);
    this.gameState = 'PLAYING';
    this.attachHudButtonListeners();
  }

  loadDungeonDepth(depth) {
    this.dungeon = new Dungeon(depth);
    this.player.dungeonDepth = depth;
    this.particles.reset();

    // Set map camera bounds
    this.camera.setBounds(0, 0, this.dungeon.mapData.width * 16, this.dungeon.mapData.height * 16);

    // Place Player at start spawn
    this.player.x = this.dungeon.mapData.spawns.player.x;
    this.player.y = this.dungeon.mapData.spawns.player.y;

    // Spawn NPC
    this.dungeon.npcs = [
      new NPC(this.dungeon.mapData.spawns.npc.x, this.dungeon.mapData.spawns.npc.y, 'sage')
    ];

    // Spawn Boss
    const bossSpawn = this.dungeon.mapData.spawns.boss;
    if (bossSpawn) {
      this.dungeon.boss = new Boss(bossSpawn.x, bossSpawn.y, bossSpawn.id, depth);
    }

    // Spawn Enemies
    this.dungeon.enemies = this.dungeon.mapData.spawns.enemies.map(
      s => new Enemy(s.x, s.y, s.type, depth)
    );

    // Spawn Chests
    this.dungeon.chests = this.dungeon.mapData.spawns.chests.map(
      c => new InteractiveProp(`chest_${c.type}`, c.x, c.y)
    );

    // Spawn Shrines
    this.dungeon.shrines = this.dungeon.mapData.spawns.shrines.map(
      s => new InteractiveProp(`shrine_${s.type}`, s.x, s.y)
    );

    // Spawn Props & Portal
    this.dungeon.props = this.dungeon.mapData.props.map(
      p => new InteractiveProp(p.type, p.x, p.y)
    );
    if (this.dungeon.mapData.spawns.portal) {
      this.dungeon.props.push(new InteractiveProp('portal', this.dungeon.mapData.spawns.portal.x, this.dungeon.mapData.spawns.portal.y));
    }

    // Weather & Music
    this.renderer.setWeather(this.dungeon.biome.weather);
    this.audio.playMusic(this.dungeon.biome.music);
  }

  attachHudButtonListeners() {
    const invBtn = document.getElementById('btn-open-inv');
    const statsBtn = document.getElementById('btn-open-stats');
    const questBtn = document.getElementById('btn-open-quests');
    const craftBtn = document.getElementById('btn-open-craft');
    const setBtn = document.getElementById('btn-open-settings');

    if (invBtn) invBtn.onclick = () => this.toggleModal('inventory');
    if (statsBtn) statsBtn.onclick = () => this.toggleModal('stats');
    if (questBtn) questBtn.onclick = () => this.toggleModal('quests');
    if (craftBtn) craftBtn.onclick = () => this.toggleModal('craft');
    if (setBtn) setBtn.onclick = () => this.toggleModal('settings');
  }

  toggleModal(name) {
    if (this.modals.activeModal === name) {
      this.modals.close();
    } else {
      this.modals.open(name);
    }
  }

  // --- Main Update Loop ---
  update(dt) {
    if (this.gameState !== 'PLAYING') return;

    // Check modal hotkeys
    if (this.input.isJustPressed('i') || this.input.isJustPressed('tab')) this.toggleModal('inventory');
    if (this.input.isJustPressed('c') || this.input.isJustPressed('k')) this.toggleModal('stats');
    if (this.input.isJustPressed('j') || this.input.isJustPressed('l')) this.toggleModal('quests');
    if (this.input.isJustPressed('b') || this.input.isJustPressed('g')) this.toggleModal('craft');
    if (this.input.isJustPressed('escape')) this.toggleModal('settings');

    if (this.modals.isOpen()) {
      this.input.flush();
      return; // Pause game physics during modal
    }

    // Auto-save interval (every 30 seconds)
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 30) {
      this.autoSaveTimer = 0;
      SaveManager.save(this);
    }

    // Time Dilation calculation (Ultimate Skill 4 active)
    const isTimeFrozen = this.player.skills.skill4.activeTimer > 0;
    const enemyTimeScale = isTimeFrozen ? 0.12 : 1.0;

    // 1. Update Input & Camera
    this.input.update(this.camera);
    this.player.handleInput(this.input, this.camera, this.dungeon, this.dungeon.projectiles, this.particles, this.audio);
    this.player.update(dt, this.dungeon, this.particles);

    // 2. Fog of War Discovery
    this.dungeon.revealFog(this.player.x, this.player.y, 8);

    // 3. Update Camera
    this.camera.update(this.player.x, this.player.y, dt);

    // 4. Update Projectiles & Combat Collisions
    for (let i = this.dungeon.projectiles.length - 1; i >= 0; i--) {
      const proj = this.dungeon.projectiles[i];
      proj.update(dt * (proj.isPlayer ? 1.0 : enemyTimeScale), this.dungeon, this.particles);

      if (proj.isDead) {
        this.dungeon.projectiles.splice(i, 1);
        continue;
      }

      // Check Hits
      if (proj.isPlayer) {
        // Hit Enemies
        this.dungeon.enemies.forEach(e => {
          if (!e.isDead && proj.hits < proj.pierce && e.distTo(proj) < (e.w / 2 + proj.radius)) {
            proj.hits++;
            e.takeDamage(proj.damage, proj.x, proj.y, this.particles, this.audio, proj.isCrit);
            if (proj.hits >= proj.pierce) proj.isDead = true;
          }
        });

        // Hit Boss
        if (this.dungeon.boss && !this.dungeon.boss.isDead && proj.hits < proj.pierce) {
          if (this.dungeon.boss.distTo(proj) < (this.dungeon.boss.w / 2 + proj.radius)) {
            proj.hits++;
            this.dungeon.boss.takeDamage(proj.damage, proj.x, proj.y, this.particles, this.audio, proj.isCrit);
            if (proj.hits >= proj.pierce) proj.isDead = true;
          }
        }
      } else {
        // Enemy Projectile hits Player
        if (this.player.distTo(proj) < (this.player.w / 2 + proj.radius)) {
          proj.isDead = true;
          this.player.takeDamage(proj.damage, proj.x, proj.y, this.particles, this.audio);
        }
      }
    }

    // 5. Update Enemies
    for (let i = this.dungeon.enemies.length - 1; i >= 0; i--) {
      const enemy = this.dungeon.enemies[i];
      enemy.updateAI(this.player, this.dungeon, this.dungeon.projectiles, this.particles, this.audio, dt, enemyTimeScale);

      if (enemy.isDead) {
        enemy.onKilled(this.player, this.quests, this.particles, this.audio);
        this.dungeon.enemies.splice(i, 1);
      }
    }

    // 6. Update Boss
    if (this.dungeon.boss && !this.dungeon.boss.isDead) {
      this.dungeon.boss.updateAI(this.player, this.dungeon, this.dungeon.projectiles, this.particles, this.audio, dt, enemyTimeScale);
      if (this.dungeon.boss.isDead) {
        this.dungeon.boss.onDefeated(this.player, this.dungeon, this.quests, this.particles, this.audio);
        this.camera.shake(12, 0.8);
      }
    }

    // 7. Interactions (Press E / Space)
    if (this.input.isJustPressed('e') || this.input.isJustPressed(' ')) {
      this.checkInteractions();
    }

    // 8. Particles & Weather
    this.particles.update(dt);
    this.renderer.update(dt);

    // 9. HUD update
    this.hud.update(this.player, this.dungeon, this.quests);

    // 10. Check Game Over
    if (this.player.isDead) {
      this.gameState = 'GAMEOVER';
      this.cutscenes.renderGameOver(() => {
        this.player.hp = this.player.maxHp;
        this.player.isDead = false;
        this.player.x = this.dungeon.mapData.spawns.player.x;
        this.player.y = this.dungeon.mapData.spawns.player.y;
        this.gameState = 'PLAYING';
      });
    }

    this.input.flush();
  }

  checkInteractions() {
    // Check NPCs
    this.dungeon.npcs.forEach(npc => {
      if (this.player.distTo(npc) < npc.interactionRange) {
        const text = npc.getDialogue(this.player.dungeonDepth);
        this.modals.open('dialogue', { speaker: npc.getDisplayName(), text });
      }
    });

    // Check Chests & Shrines
    [...this.dungeon.chests, ...this.dungeon.shrines].forEach(prop => {
      if (this.player.distTo(prop) < prop.radius) {
        prop.interact(this.player, this.dungeon, this.particles, this.audio);
      }
    });

    // Check Portal to Next Depth
    if (this.dungeon.portalActive && this.dungeon.mapData.spawns.portal) {
      const portPos = this.dungeon.mapData.spawns.portal;
      const dist = Math.hypot(this.player.x - portPos.x, this.player.y - portPos.y);
      if (dist < 36) {
        this.gameState = 'VICTORY';
        this.cutscenes.renderRealmTransition(this.player.dungeonDepth, () => {
          this.loadDungeonDepth(this.player.dungeonDepth + 1);
          this.gameState = 'PLAYING';
        });
      }
    }
  }

  // --- Main Render Loop ---
  render() {
    const ctx = this.renderer.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState === 'TITLE' || this.gameState === 'PROLOGUE') return;

    ctx.save();
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // 1. Render Dungeon Tiles
    if (this.dungeon) {
      this.dungeon.render(ctx, this.camera);
    }

    // 2. Render Props (Chests, Shrines, Campfire, Portal)
    if (this.dungeon) {
      this.dungeon.props.forEach(p => p.render(ctx, this.camera));
      this.dungeon.chests.forEach(c => c.render(ctx, this.camera));
      this.dungeon.shrines.forEach(s => s.render(ctx, this.camera));
      this.dungeon.npcs.forEach(n => n.render(ctx, this.camera));
    }

    // 3. Render Enemies & Boss
    if (this.dungeon) {
      this.dungeon.enemies.forEach(e => e.render(ctx, this.camera));
      if (this.dungeon.boss && !this.dungeon.boss.isDead) {
        this.dungeon.boss.render(ctx, this.camera);
      }
    }

    // 4. Render Player
    if (this.player) {
      this.player.render(ctx, this.camera);
    }

    // 5. Render Projectiles
    if (this.dungeon) {
      this.dungeon.projectiles.forEach(p => p.render(ctx, this.camera));
    }

    // 6. Render Particles & Floating Damage Texts
    this.particles.render(ctx, this.camera);

    ctx.restore();

    // 7. Dynamic Lighting Pass
    this.renderer.clearLights();
    if (this.player) {
      this.renderer.addLight(this.player.x, this.player.y, 75, 'rgba(255, 230, 180, 0.95)', 3);
    }
    if (this.dungeon && this.dungeon.mapData.torches) {
      this.dungeon.mapData.torches.forEach(t => {
        this.renderer.addLight(t.x, t.y, 60, this.dungeon.biome.torchColor, 4);
      });
    }
    if (this.dungeon && this.dungeon.boss && !this.dungeon.boss.isDead) {
      this.renderer.addLight(this.dungeon.boss.x, this.dungeon.boss.y, 110, 'rgba(239, 68, 68, 0.9)', 5);
    }
    this.renderer.renderLighting(this.camera, this.dungeon?.biome.ambientDarkness || 0.5);

    // 8. Weather & Post-Processing
    this.renderer.renderWeather();
    this.renderer.renderPostProcessing();
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Start Game Instance
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
