// Game UI Modals: Inventory, Stats, Quests, Forge, Settings, Dialogue
import { Lang } from '../systems/Lang.js';
import { CraftingSystem } from '../systems/Crafting.js';
import { SaveManager } from '../systems/SaveManager.js';

export class ModalManager {
  constructor(game) {
    this.game = game;
    this.activeModal = null; // 'inventory', 'stats', 'quests', 'craft', 'settings', 'dialogue'
    this.container = null;
    this.selectedItemIndex = null;
    this.dialogueCallback = null;
  }

  init(container) {
    this.container = container;
  }

  open(modalName, extraData = null) {
    this.activeModal = modalName;
    this.render(extraData);
    if (this.game.audio) this.game.audio.playSfx('click');
  }

  close() {
    this.activeModal = null;
    this.selectedItemIndex = null;
    if (this.container) this.container.innerHTML = '';
  }

  isOpen() {
    return this.activeModal !== null;
  }

  render(extraData = null) {
    if (!this.container || !this.activeModal) return;

    if (this.activeModal === 'inventory') {
      this.renderInventory();
    } else if (this.activeModal === 'stats') {
      this.renderStats();
    } else if (this.activeModal === 'quests') {
      this.renderQuests();
    } else if (this.activeModal === 'craft') {
      this.renderCrafting();
    } else if (this.activeModal === 'settings') {
      this.renderSettings();
    } else if (this.activeModal === 'dialogue') {
      this.renderDialogue(extraData);
    }
  }

  // --- 1. INVENTORY MODAL ---
  renderInventory() {
    const p = this.game.player;
    const inv = p.inventory;

    let slotsHtml = '';
    for (let i = 0; i < inv.maxSlots; i++) {
      const item = inv.items[i];
      const isSel = this.selectedItemIndex === i;
      if (item) {
        const upTxt = item.upgradeLevel > 0 ? `+${item.upgradeLevel}` : '';
        const qtyTxt = item.quantity > 1 ? `x${item.quantity}` : '';
        slotsHtml += `
          <div class="inv-slot filled ${isSel ? 'selected' : ''}" data-index="${i}" style="border-color: ${item.rarityColor}">
            <div class="item-name-chip" style="color: ${item.rarityColor}">${item.name}</div>
            <div class="item-badge">${upTxt} ${qtyTxt}</div>
          </div>
        `;
      } else {
        slotsHtml += `<div class="inv-slot empty" data-index="${i}"></div>`;
      }
    }

    // Selected Item Detail Box
    const selItem = this.selectedItemIndex !== null ? inv.items[this.selectedItemIndex] : null;
    let detailHtml = `<div class="no-item-selected">Elementni tanlang</div>`;
    if (selItem) {
      const statsList = Object.entries(selItem.stats || {})
        .map(([k, v]) => `<div>+${v} ${k.toUpperCase()}</div>`).join('');
      const isPotion = selItem.type === 'potion';
      const isEquipable = ['weapon', 'armor', 'helm', 'ring', 'amulet'].includes(selItem.type);

      detailHtml = `
        <div class="item-detail-card" style="border-color: ${selItem.rarityColor}">
          <h3 style="color: ${selItem.rarityColor}">${selItem.name} ${selItem.upgradeLevel > 0 ? `+${selItem.upgradeLevel}` : ''}</h3>
          <div class="item-rarity" style="color: ${selItem.rarityColor}">${selItem.rarity.toUpperCase()} ${selItem.type.toUpperCase()}</div>
          <div class="item-stats-box">${statsList}</div>
          ${selItem.healHp ? `<div class="heal-stat">+${selItem.healHp} HP Tiklaydi</div>` : ''}
          ${selItem.healMp ? `<div class="heal-stat">+${selItem.healMp} MP Tiklaydi</div>` : ''}
          <div class="item-actions">
            ${isEquipable ? `<button id="btn-equip-item" class="modal-action-btn primary">${Lang.t('equip')}</button>` : ''}
            ${isPotion ? `<button id="btn-use-item" class="modal-action-btn primary">${Lang.t('use')}</button>` : ''}
            <button id="btn-drop-item" class="modal-action-btn danger">${Lang.t('drop')}</button>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-window inv-window">
          <div class="modal-header">
            <h2>🎒 ${Lang.t('inventory')}</h2>
            <button class="modal-close-btn" id="modal-close">✖</button>
          </div>
          <div class="inv-body">
            <div class="inv-left-section">
              <div class="inv-grid">${slotsHtml}</div>
              <div class="currency-bar">
                <span>🪙 ${p.gold} ${Lang.t('gold')}</span>
                <span>💎 ${inv.timeShards} ${Lang.t('shards')}</span>
              </div>
            </div>
            <div class="inv-right-section">
              <h3>JIHOZLAR</h3>
              <div class="equipment-paperdoll">
                <div class="equip-slot" data-slot="weapon">⚔️ ${inv.equipment.weapon?.name || 'Qurol'}</div>
                <div class="equip-slot" data-slot="armor">🛡️ ${inv.equipment.armor?.name || 'Zirh'}</div>
                <div class="equip-slot" data-slot="helm">👑 ${inv.equipment.helm?.name || 'Dubulg\'a'}</div>
                <div class="equip-slot" data-slot="ring">💍 ${inv.equipment.ring?.name || 'Uzuk'}</div>
                <div class="equip-slot" data-slot="amulet">📿 ${inv.equipment.amulet?.name || 'Tumor'}</div>
              </div>
              <div class="item-preview-container">${detailHtml}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachInvEvents();
  }

  attachInvEvents() {
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Slot click
    document.querySelectorAll('.inv-slot.filled').forEach(el => {
      el.onclick = () => {
        this.selectedItemIndex = parseInt(el.getAttribute('data-index'), 10);
        this.renderInventory();
      };
    });

    // Equip button
    const equipBtn = document.getElementById('btn-equip-item');
    if (equipBtn) {
      equipBtn.onclick = () => {
        if (this.selectedItemIndex !== null) {
          this.game.player.inventory.equipItem(this.selectedItemIndex, this.game.player);
          this.selectedItemIndex = null;
          this.game.audio.playSfx('click');
          this.renderInventory();
        }
      };
    }

    // Use potion
    const useBtn = document.getElementById('btn-use-item');
    if (useBtn) {
      useBtn.onclick = () => {
        if (this.selectedItemIndex !== null) {
          this.game.player.inventory.usePotion(this.selectedItemIndex, this.game.player);
          this.game.audio.playSfx('potion');
          this.renderInventory();
        }
      };
    }

    // Drop item
    const dropBtn = document.getElementById('btn-drop-item');
    if (dropBtn) {
      dropBtn.onclick = () => {
        if (this.selectedItemIndex !== null) {
          this.game.player.inventory.removeItem(this.selectedItemIndex);
          this.selectedItemIndex = null;
          this.game.audio.playSfx('click');
          this.renderInventory();
        }
      };
    }

    // Unequip slot click
    document.querySelectorAll('.equip-slot').forEach(el => {
      el.onclick = () => {
        const slot = el.getAttribute('data-slot');
        this.game.player.inventory.unequipItem(slot, this.game.player);
        this.game.audio.playSfx('click');
        this.renderInventory();
      };
    });
  }

  // --- 2. STATS MODAL ---
  renderStats() {
    const p = this.game.player;
    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-window stats-window">
          <div class="modal-header">
            <h2>⚔️ ${Lang.t('attribute_points')} (LV ${p.level})</h2>
            <button class="modal-close-btn" id="modal-close">✖</button>
          </div>
          <div class="stats-body">
            <div class="stat-points-banner">
              ${Lang.t('stat_points_available')}: <span class="highlight-pts">${p.statPoints}</span>
            </div>
            <div class="stats-table">
              <div class="stat-row">
                <span class="stat-label">💪 ${Lang.t('strength')}:</span>
                <span class="stat-val">${p.stats.strength}</span>
                ${p.statPoints > 0 ? `<button class="btn-stat-up" data-stat="strength">+</button>` : ''}
              </div>
              <div class="stat-row">
                <span class="stat-label">❤️ ${Lang.t('vitality')}:</span>
                <span class="stat-val">${p.stats.vitality}</span>
                ${p.statPoints > 0 ? `<button class="btn-stat-up" data-stat="vitality">+</button>` : ''}
              </div>
              <div class="stat-row">
                <span class="stat-label">🔮 ${Lang.t('intelligence')}:</span>
                <span class="stat-val">${p.stats.intelligence}</span>
                ${p.statPoints > 0 ? `<button class="btn-stat-up" data-stat="intelligence">+</button>` : ''}
              </div>
              <div class="stat-row">
                <span class="stat-label">⚡ ${Lang.t('agility')}:</span>
                <span class="stat-val">${p.stats.agility}</span>
                ${p.statPoints > 0 ? `<button class="btn-stat-up" data-stat="agility">+</button>` : ''}
              </div>
              <div class="stat-row">
                <span class="stat-label">🍀 ${Lang.t('luck')}:</span>
                <span class="stat-val">${p.stats.luck}</span>
                ${p.statPoints > 0 ? `<button class="btn-stat-up" data-stat="luck">+</button>` : ''}
              </div>
            </div>

            <div class="derived-stats-section">
              <h3>JANGIY HUSUSIYATLAR</h3>
              <div class="derived-grid">
                <div>🗡️ ${Lang.t('attack')}: <b>${p.attack}</b></div>
                <div>🛡️ ${Lang.t('defense')}: <b>${Math.round(p.defense)}</b></div>
                <div>💥 ${Lang.t('crit_chance')}: <b>${Math.round(p.critChance)}%</b></div>
                <div>🏃 ${Lang.t('speed')}: <b>${Math.round(p.speed)}</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = () => this.close();

    document.querySelectorAll('.btn-stat-up').forEach(btn => {
      btn.onclick = () => {
        const stat = btn.getAttribute('data-stat');
        p.upgradeStat(stat);
        this.game.audio.playSfx('levelup');
        this.renderStats();
      };
    });
  }

  // --- 3. QUESTS MODAL ---
  renderQuests() {
    const q = this.game.quests;
    const isUz = Lang.current === 'uz';

    const mainList = q.mainQuests.map((quest, idx) => {
      const isCur = idx === q.activeMainQuestIndex;
      const title = isUz ? quest.titleUz : quest.titleEn;
      const desc = isUz ? quest.descUz : quest.descEn;
      return `
        <div class="quest-card ${quest.isCompleted ? 'completed' : (isCur ? 'active' : 'locked')}">
          <div class="quest-card-header">
            <span class="quest-num">Bob ${quest.chapter}</span>
            <span class="quest-title">${title}</span>
            <span class="quest-status">${quest.isCompleted ? '✅ BAJARILDI' : (isCur ? '⏳ FAOL' : '🔒')}</span>
          </div>
          <p class="quest-desc">${desc}</p>
          <div class="quest-rewards">Mukofot: 🪙 ${quest.rewardGold}G | 💎 ${quest.rewardShards} Shards</div>
        </div>
      `;
    }).join('');

    const bountyList = q.bounties.map((bounty, idx) => {
      const pct = Math.min(100, Math.round((bounty.currentCount / bounty.targetCount) * 100));
      return `
        <div class="bounty-card ${bounty.isCompleted ? 'ready' : ''}">
          <div class="bounty-header">
            <h4>${bounty.title}</h4>
            <span>${bounty.currentCount} / ${bounty.targetCount} (${pct}%)</span>
          </div>
          <div class="bounty-progress"><div class="bounty-fill" style="width: ${pct}%;"></div></div>
          <div class="bounty-footer">
            <span>🪙 ${bounty.gold} | 💎 ${bounty.shards}</span>
            ${bounty.isCompleted && !bounty.claimed ? `<button class="btn-claim-bounty" data-idx="${idx}">${Lang.t('claim')}</button>` : (bounty.claimed ? '<span>Olingan ✅</span>' : '')}
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-window quests-window">
          <div class="modal-header">
            <h2>📜 ${Lang.t('quest_log')}</h2>
            <button class="modal-close-btn" id="modal-close">✖</button>
          </div>
          <div class="quests-body">
            <div class="quest-section">
              <h3>${Lang.t('main_quests')}</h3>
              <div class="quests-scroll-area">${mainList}</div>
            </div>
            <div class="quest-section">
              <h3>${Lang.t('bounty_quests')}</h3>
              <div class="bounties-grid">${bountyList}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = () => this.close();

    document.querySelectorAll('.btn-claim-bounty').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        q.claimBounty(idx, this.game.player, this.game.particles, this.game.audio);
        this.renderQuests();
      };
    });
  }

  // --- 4. CRAFTING & FORGE MODAL ---
  renderCrafting() {
    const p = this.game.player;
    const equipItems = Object.entries(p.inventory.equipment).filter(([k, v]) => v !== null);

    const upgradeList = equipItems.map(([slot, item]) => {
      const cost = CraftingSystem.getUpgradeCost(item);
      const canUp = CraftingSystem.canUpgrade(item, p);
      return `
        <div class="forge-item-row">
          <div class="forge-item-info">
            <span style="color: ${item.rarityColor}">${item.name} (+${item.upgradeLevel || 0})</span>
            <span class="forge-cost">Narxi: 🪙 ${cost.gold}G, 💎 ${cost.shards} Shard</span>
          </div>
          <button class="btn-upgrade-item ${canUp ? 'available' : 'disabled'}" data-slot="${slot}" ${!canUp ? 'disabled' : ''}>
            ${Lang.t('upgrade', (item.upgradeLevel || 0) + 1)}
          </button>
        </div>
      `;
    }).join('');

    const recipes = CraftingSystem.getCraftingRecipes().map(recipe => {
      const canCraft = p.inventory.timeShards >= recipe.reqShards && p.gold >= recipe.reqGold;
      return `
        <div class="recipe-card">
          <h4>${recipe.name}</h4>
          <p class="recipe-desc">${recipe.desc}</p>
          <div class="recipe-reqs">Kerak: 💎 ${recipe.reqShards} Shards | 🪙 ${recipe.reqGold}G</div>
          <button class="btn-craft-recipe ${canCraft ? 'available' : 'disabled'}" data-id="${recipe.id}" ${!canCraft ? 'disabled' : ''}>
            Yaratish (Craft)
          </button>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-window forge-window">
          <div class="modal-header">
            <h2>🔨 ${Lang.t('crafting_forge')}</h2>
            <button class="modal-close-btn" id="modal-close">✖</button>
          </div>
          <div class="forge-body">
            <div class="forge-section">
              <h3>JIHOZLARNI KUCHAYTIRISH (+10 gacha)</h3>
              <div class="forge-list">${upgradeList || '<p>Kiyilgan jihozlar yo\'q</p>'}</div>
            </div>
            <div class="forge-section">
              <h3>AFSONAVIY RELIKVIYALAR RESEPTLARI</h3>
              <div class="recipes-grid">${recipes}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = () => this.close();

    document.querySelectorAll('.btn-upgrade-item').forEach(btn => {
      btn.onclick = () => {
        const slot = btn.getAttribute('data-slot');
        const item = p.inventory.equipment[slot];
        if (item) {
          CraftingSystem.upgradeItem(item, p, this.game.audio, this.game.particles);
          this.renderCrafting();
        }
      };
    });

    document.querySelectorAll('.btn-craft-recipe').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        CraftingSystem.craftRecipe(id, p, this.game.audio, this.game.particles);
        this.renderCrafting();
      };
    });
  }

  // --- 5. SETTINGS MODAL ---
  renderSettings() {
    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-window settings-window">
          <div class="modal-header">
            <h2>⚙️ ${Lang.t('settings')}</h2>
            <button class="modal-close-btn" id="modal-close">✖</button>
          </div>
          <div class="settings-body">
            <!-- Volumes -->
            <div class="setting-row">
              <label>${Lang.t('master_vol')}</label>
              <input type="range" id="slider-master-vol" min="0" max="1" step="0.05" value="${this.game.audio.masterVolume}">
            </div>
            <div class="setting-row">
              <label>${Lang.t('bgm_vol')}</label>
              <input type="range" id="slider-bgm-vol" min="0" max="1" step="0.05" value="${this.game.audio.bgmVolume}">
            </div>
            <div class="setting-row">
              <label>${Lang.t('sfx_vol')}</label>
              <input type="range" id="slider-sfx-vol" min="0" max="1" step="0.05" value="${this.game.audio.sfxVolume}">
            </div>

            <!-- Visual Toggles -->
            <div class="setting-row">
              <label>${Lang.t('crt_filter')}</label>
              <input type="checkbox" id="chk-crt-filter" ${this.game.renderer.enableCRT ? 'checked' : ''}>
            </div>

            <!-- Language Switcher -->
            <div class="setting-row">
              <label>Til / Language</label>
              <select id="select-lang">
                <option value="uz" ${Lang.current === 'uz' ? 'selected' : ''}>🇺🇿 O'zbekcha</option>
                <option value="en" ${Lang.current === 'en' ? 'selected' : ''}>🇬🇧 English</option>
              </select>
            </div>

            <!-- Save / Export -->
            <div class="save-actions-grid">
              <button id="btn-save-game" class="modal-action-btn primary">💾 ${Lang.t('save_game')}</button>
              <button id="btn-export-save" class="modal-action-btn">📤 ${Lang.t('export_save')}</button>
              <button id="btn-reset-save" class="modal-action-btn danger">🗑️ ${Lang.t('reset_save')}</button>
            </div>
            <div id="save-status-msg" class="save-msg"></div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Volume sliders
    document.getElementById('slider-master-vol').oninput = (e) => {
      this.game.audio.setMasterVolume(parseFloat(e.target.value));
    };
    document.getElementById('slider-bgm-vol').oninput = (e) => {
      this.game.audio.setBgmVolume(parseFloat(e.target.value));
    };
    document.getElementById('slider-sfx-vol').oninput = (e) => {
      this.game.audio.setSfxVolume(parseFloat(e.target.value));
    };

    // CRT
    document.getElementById('chk-crt-filter').onchange = (e) => {
      this.game.renderer.enableCRT = e.target.checked;
    };

    // Lang
    document.getElementById('select-lang').onchange = (e) => {
      Lang.setLanguage(e.target.value);
      this.renderSettings();
    };

    // Save buttons
    document.getElementById('btn-save-game').onclick = () => {
      SaveManager.save(this.game);
      const msg = document.getElementById('save-status-msg');
      if (msg) msg.innerText = Lang.t('game_saved');
      this.game.audio.playSfx('coin');
    };

    document.getElementById('btn-export-save').onclick = () => {
      SaveManager.exportSave();
    };

    document.getElementById('btn-reset-save').onclick = () => {
      if (confirm("Haqiqatan ham barcha o'yin natijalarini o'chirmoqchimisiz?")) {
        SaveManager.reset();
        window.location.reload();
      }
    };
  }

  // --- 6. DIALOGUE MODAL ---
  renderDialogue(data) {
    const { speaker = "Sage Eldrin", text = "", onComplete } = data || {};
    this.dialogueCallback = onComplete;

    this.container.innerHTML = `
      <div class="dialogue-box-container">
        <div class="dialogue-box">
          <div class="dialogue-speaker-banner">${speaker}</div>
          <div id="dialogue-text-body" class="dialogue-text-content"></div>
          <div class="dialogue-footer">
            <button id="btn-dialogue-continue" class="dialogue-next-btn">[Space / E] Davom etish ▶</button>
          </div>
        </div>
      </div>
    `;

    // Typewriter effect
    const textEl = document.getElementById('dialogue-text-body');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < text.length) {
        textEl.innerText += text[idx];
        if (idx % 3 === 0) this.game.audio.playSfx('dialogue_beep');
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    const finish = () => {
      clearInterval(interval);
      this.close();
      if (this.dialogueCallback) this.dialogueCallback();
    };

    const contBtn = document.getElementById('btn-dialogue-continue');
    if (contBtn) contBtn.onclick = finish;
  }
}
