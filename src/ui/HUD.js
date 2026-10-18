// In-Game Retro Pixel HUD & Minimap Engine
import { Lang } from '../systems/Lang.js';

export class HUD {
  constructor() {
    this.container = null;
    this.bossBarEl = null;
  }

  init(container) {
    this.container = container;
    this.renderBaseHUD();
  }

  renderBaseHUD() {
    this.container.innerHTML = `
      <!-- Top Left: Player Status & Bars -->
      <div id="hud-top-left" class="hud-panel">
        <div class="player-avatar-box">
          <div id="hud-avatar-icon" class="avatar-icon"></div>
          <div id="hud-level-badge" class="level-badge">LV 1</div>
        </div>
        <div class="bars-container">
          <!-- HP Bar -->
          <div class="bar-wrapper hp-wrapper">
            <div id="hud-hp-bar" class="bar-fill hp-fill" style="width: 100%;"></div>
            <div id="hud-hp-text" class="bar-text">100 / 100 HP</div>
          </div>
          <!-- MP Bar -->
          <div class="bar-wrapper mp-wrapper">
            <div id="hud-mp-bar" class="bar-fill mp-fill" style="width: 100%;"></div>
            <div id="hud-mp-text" class="bar-text">60 / 60 MP</div>
          </div>
          <!-- EXP Bar -->
          <div class="bar-wrapper exp-wrapper">
            <div id="hud-exp-bar" class="bar-fill exp-fill" style="width: 0%;"></div>
            <div id="hud-exp-text" class="bar-text">0% EXP</div>
          </div>
        </div>
      </div>

      <!-- Top Center: Grand Boss Health Bar -->
      <div id="hud-boss-bar-container" class="boss-bar-container" style="display: none;">
        <div id="hud-boss-title" class="boss-title">ANCIENT BOSS</div>
        <div class="boss-bar-wrapper">
          <div id="hud-boss-fill" class="boss-bar-fill" style="width: 100%;"></div>
          <div id="hud-boss-hp-text" class="boss-hp-text">1000 / 1000</div>
        </div>
      </div>

      <!-- Top Right: Currency, Depth & Minimap -->
      <div id="hud-top-right" class="hud-panel">
        <div class="currency-row">
          <div class="currency-item gold-item">
            <span class="curr-icon">🪙</span>
            <span id="hud-gold-val">100</span>
          </div>
          <div class="currency-item shard-item">
            <span class="curr-icon">💎</span>
            <span id="hud-shard-val">5</span>
          </div>
          <div class="depth-badge">
            <span id="hud-depth-val">DEPTH 1</span>
          </div>
        </div>
        <canvas id="hud-minimap" width="120" height="120" class="minimap-canvas"></canvas>
      </div>

      <!-- Active Objective Quest Widget -->
      <div id="hud-quest-tracker" class="quest-tracker">
        <div class="quest-header">📜 <span id="hud-quest-header-title">FAOL TOPSHIRIQ</span></div>
        <div id="hud-quest-desc" class="quest-body">Donishmand bilan gaplashing...</div>
      </div>

      <!-- Bottom Center: Skill Hotbar -->
      <div id="hud-hotbar" class="hotbar-container">
        <!-- Dash -->
        <div class="skill-slot dash-slot">
          <div class="skill-key">SPACE</div>
          <div class="skill-icon">⚡</div>
          <div id="hud-dash-cd" class="skill-cd-overlay" style="height: 0%;"></div>
        </div>
        <!-- Skill 1 -->
        <div class="skill-slot">
          <div class="skill-key">1 / Q</div>
          <div class="skill-icon">🌀</div>
          <div class="skill-mp-cost">15 MP</div>
          <div id="hud-skill1-cd" class="skill-cd-overlay" style="height: 0%;"></div>
        </div>
        <!-- Skill 2 -->
        <div class="skill-slot">
          <div class="skill-key">2 / E</div>
          <div class="skill-icon">🔥</div>
          <div class="skill-mp-cost">25 MP</div>
          <div id="hud-skill2-cd" class="skill-cd-overlay" style="height: 0%;"></div>
        </div>
        <!-- Skill 3 -->
        <div class="skill-slot">
          <div class="skill-key">3 / R</div>
          <div class="skill-icon">🛡️</div>
          <div class="skill-mp-cost">20 MP</div>
          <div id="hud-skill3-cd" class="skill-cd-overlay" style="height: 0%;"></div>
        </div>
        <!-- Skill 4 (Ultimate) -->
        <div class="skill-slot ult-slot">
          <div class="skill-key">4 / F</div>
          <div class="skill-icon">⌛</div>
          <div class="skill-mp-cost">40 MP</div>
          <div id="hud-skill4-cd" class="skill-cd-overlay" style="height: 0%;"></div>
        </div>
      </div>

      <!-- Quick Action Buttons on Right -->
      <div class="hud-action-buttons">
        <button id="btn-open-inv" class="hud-btn" title="Inventar [I]">🎒 [I]</button>
        <button id="btn-open-stats" class="hud-btn" title="Qahramon [C]">⚔️ [C]</button>
        <button id="btn-open-quests" class="hud-btn" title="Topshiriqlar [J]">📜 [J]</button>
        <button id="btn-open-craft" class="hud-btn" title="Qurolsozlik [B]">🔨 [B]</button>
        <button id="btn-open-settings" class="hud-btn" title="Sozlamalar [Esc]">⚙️</button>
      </div>
    `;
  }

  update(player, dungeon, quests) {
    if (!player) return;

    // HP Bar
    const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    const hpBar = document.getElementById('hud-hp-bar');
    const hpText = document.getElementById('hud-hp-text');
    if (hpBar) hpBar.style.width = `${hpPct}%`;
    if (hpText) hpText.innerText = `${Math.round(player.hp)} / ${Math.round(player.maxHp)} HP`;

    // MP Bar
    const mpPct = Math.max(0, Math.min(100, (player.mp / player.maxMp) * 100));
    const mpBar = document.getElementById('hud-mp-bar');
    const mpText = document.getElementById('hud-mp-text');
    if (mpBar) mpBar.style.width = `${mpPct}%`;
    if (mpText) mpText.innerText = `${Math.round(player.mp)} / ${Math.round(player.maxMp)} MP`;

    // EXP Bar
    const expPct = Math.max(0, Math.min(100, (player.exp / player.nextExp) * 100));
    const expBar = document.getElementById('hud-exp-bar');
    const expText = document.getElementById('hud-exp-text');
    if (expBar) expBar.style.width = `${expPct}%`;
    if (expText) expText.innerText = `LV ${player.level} (${Math.round(expPct)}%)`;

    // Level Badge
    const lvlBadge = document.getElementById('hud-level-badge');
    if (lvlBadge) lvlBadge.innerText = `LV ${player.level}`;

    // Gold & Shards
    const goldVal = document.getElementById('hud-gold-val');
    const shardVal = document.getElementById('hud-shard-val');
    if (goldVal) goldVal.innerText = player.gold;
    if (shardVal) shardVal.innerText = player.inventory.timeShards;

    // Depth
    const depthVal = document.getElementById('hud-depth-val');
    if (depthVal) {
      depthVal.innerText = `${Lang.t('depth_level')} ${player.dungeonDepth}`;
    }

    // Dash Cooldown
    const dashOverlay = document.getElementById('hud-dash-cd');
    if (dashOverlay) {
      const cdPct = Math.max(0, (player.dashCooldown / player.dashMaxCooldown) * 100);
      dashOverlay.style.height = `${cdPct}%`;
    }

    // Skills Cooldowns
    const s1Overlay = document.getElementById('hud-skill1-cd');
    const s2Overlay = document.getElementById('hud-skill2-cd');
    const s3Overlay = document.getElementById('hud-skill3-cd');
    const s4Overlay = document.getElementById('hud-skill4-cd');

    if (s1Overlay) s1Overlay.style.height = `${Math.max(0, (player.skills.skill1.cd / player.skills.skill1.maxCd) * 100)}%`;
    if (s2Overlay) s2Overlay.style.height = `${Math.max(0, (player.skills.skill2.cd / player.skills.skill2.maxCd) * 100)}%`;
    if (s3Overlay) s3Overlay.style.height = `${Math.max(0, (player.skills.skill3.cd / player.skills.skill3.maxCd) * 100)}%`;
    if (s4Overlay) s4Overlay.style.height = `${Math.max(0, (player.skills.skill4.cd / player.skills.skill4.maxCd) * 100)}%`;

    // Quest Tracker
    const qHeader = document.getElementById('hud-quest-header-title');
    const qDesc = document.getElementById('hud-quest-desc');
    if (qHeader) qHeader.innerText = Lang.t('active_quest');
    if (qDesc && quests) {
      const activeQ = quests.mainQuests[quests.activeMainQuestIndex];
      if (activeQ) {
        qDesc.innerText = Lang.current === 'uz' ? activeQ.descUz : activeQ.descEn;
      }
    }

    // Boss Bar
    const bossContainer = document.getElementById('hud-boss-bar-container');
    if (dungeon && dungeon.boss && !dungeon.boss.isDead && dungeon.boss.distTo(player) < 350) {
      if (bossContainer) {
        bossContainer.style.display = 'block';
        const bossTitle = document.getElementById('hud-boss-title');
        const bossFill = document.getElementById('hud-boss-fill');
        const bossHpText = document.getElementById('hud-boss-hp-text');

        if (bossTitle) bossTitle.innerText = dungeon.boss.getDisplayName();
        const bossHpPct = Math.max(0, (dungeon.boss.hp / dungeon.boss.maxHp) * 100);
        if (bossFill) bossFill.style.width = `${bossHpPct}%`;
        if (bossHpText) bossHpText.innerText = `${Math.round(dungeon.boss.hp)} / ${Math.round(dungeon.boss.maxHp)}`;
      }
    } else {
      if (bossContainer) bossContainer.style.display = 'none';
    }

    // Update Minimap
    this.renderMinimap(player, dungeon);
  }

  renderMinimap(player, dungeon) {
    const canvas = document.getElementById('hud-minimap');
    if (!canvas || !dungeon) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const map = dungeon.mapData;
    const scale = canvas.width / map.width;

    // Draw explored tiles
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!dungeon.explored[y][x]) {
          ctx.fillStyle = '#05070f';
          ctx.fillRect(x * scale, y * scale, scale, scale);
          continue;
        }

        const tile = map.grid[y][x];
        if (tile === 1 || tile === 3) {
          ctx.fillStyle = '#1e293b'; // Walkable
        } else {
          ctx.fillStyle = '#0f172a'; // Wall
        }
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Draw Boss marker if explored
    if (dungeon.boss && !dungeon.boss.isDead) {
      const bx = Math.floor(dungeon.boss.x / 16);
      const by = Math.floor(dungeon.boss.y / 16);
      if (dungeon.explored[by]?.[bx]) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx * scale, by * scale, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Player Radar Dot
    const px = Math.floor(player.x / 16);
    const py = Math.floor(player.y / 16);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px * scale, py * scale, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
