// Comprehensive RPG Item, Equipment & Inventory System
import { Lang } from './Lang.js';

export class InventorySystem {
  constructor() {
    this.maxSlots = 24;
    this.items = []; // Array of Item objects
    this.equipment = {
      weapon: null,
      shield: null,
      armor: null,
      helm: null,
      ring: null,
      amulet: null
    };
    this.gold = 150;
    this.timeShards = 5;
  }

  // Generate Procedural RPG Loot
  static generateItem(tier = 'common', type = 'weapon', level = 1) {
    const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    const rarity = rarities.includes(tier) ? tier : 'common';

    const rarityMultiplier = {
      common: 1.0,
      rare: 1.4,
      epic: 1.9,
      legendary: 2.6,
      mythic: 3.8
    }[rarity];

    const rarityColors = {
      common: '#94a3b8',
      rare: '#38bdf8',
      epic: '#c084fc',
      legendary: '#facc15',
      mythic: '#f43f5e'
    };

    let item = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type, // 'weapon', 'armor', 'helm', 'ring', 'amulet', 'potion', 'material'
      rarity,
      rarityColor: rarityColors[rarity],
      level,
      upgradeLevel: 0,
      stats: {},
      spriteKey: '',
      name: ''
    };

    const isUz = Lang.current === 'uz';

    if (type === 'weapon') {
      const weaponTypes = ['sword', 'staff', 'dagger', 'bow'];
      const subType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
      const baseAtk = Math.round((8 + level * 4) * rarityMultiplier);
      item.stats.attack = baseAtk;
      item.spriteKey = subType === 'sword' ? `sword_${rarity}` : subType;

      if (rarity === 'legendary' || rarity === 'mythic') {
        item.stats.critChance = 10 + Math.floor(Math.random() * 15);
        item.stats.lifesteal = 5 + Math.floor(Math.random() * 8);
      } else if (rarity === 'epic') {
        item.stats.critChance = 8 + Math.floor(Math.random() * 8);
      }

      const prefixes = isUz ?
        ['Qadimiy', 'Olovli', 'Yashin Tezligidagi', 'Bo\'shliq', 'Afsonaviy'] :
        ['Ancient', 'Flaming', 'Lightning', 'Void', 'Mythic'];
      const names = isUz ?
        ['Qilich', 'Sehrli Hassa', 'Xanjar', 'Kamon'] :
        ['Sword', 'Staff', 'Dagger', 'Bow'];

      item.name = `${prefixes[rarities.indexOf(rarity)]} ${names[weaponTypes.indexOf(subType)]}`;
    } else if (type === 'armor') {
      const baseDef = Math.round((5 + level * 3) * rarityMultiplier);
      const baseHp = Math.round((20 + level * 15) * rarityMultiplier);
      item.stats.defense = baseDef;
      item.stats.maxHp = baseHp;
      item.spriteKey = 'armor_knight';
      item.name = isUz ? `${rarity.toUpperCase()} Zirh` : `${rarity.toUpperCase()} Armor`;
    } else if (type === 'helm') {
      item.stats.defense = Math.round((3 + level * 2) * rarityMultiplier);
      item.stats.maxMp = Math.round((15 + level * 10) * rarityMultiplier);
      item.spriteKey = 'helm_iron';
      item.name = isUz ? `${rarity.toUpperCase()} Dubulg'a` : `${rarity.toUpperCase()} Helmet`;
    } else if (type === 'ring') {
      item.stats.critChance = 5 + Math.floor(Math.random() * 10);
      item.stats.speed = 10 + Math.floor(Math.random() * 15);
      item.spriteKey = 'ring_gold';
      item.name = isUz ? 'Vaqt Halqasi' : 'Chrono Ring';
    } else if (type === 'amulet') {
      item.stats.maxHp = 30 * level;
      item.stats.maxMp = 20 * level;
      item.spriteKey = 'amulet_time';
      item.name = isUz ? 'Abadiyat Tumori' : 'Eternal Amulet';
    } else if (type === 'potion_hp') {
      item.type = 'potion';
      item.healHp = 50 + level * 20;
      item.spriteKey = 'item_potion_hp';
      item.name = isUz ? 'Hayot Eliksiri (HP)' : 'Health Elixir';
      item.quantity = 1;
    } else if (type === 'potion_mp') {
      item.type = 'potion';
      item.healMp = 40 + level * 15;
      item.spriteKey = 'item_potion_mp';
      item.name = isUz ? 'Sehr Eliksiri (MP)' : 'Mana Elixir';
      item.quantity = 1;
    }

    return item;
  }

  addItem(item) {
    // Stackable potions / materials
    if (item.type === 'potion' || item.type === 'material') {
      const existing = this.items.find(i => i.name === item.name && i.type === item.type);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        return true;
      }
    }

    if (this.items.length < this.maxSlots) {
      this.items.push(item);
      return true;
    }
    return false; // Inventory full
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }

  equipItem(index, player) {
    const item = this.items[index];
    if (!item) return;

    let slot = null;
    if (item.type === 'weapon') slot = 'weapon';
    else if (item.type === 'armor') slot = 'armor';
    else if (item.type === 'helm') slot = 'helm';
    else if (item.type === 'ring') slot = 'ring';
    else if (item.type === 'amulet') slot = 'amulet';

    if (slot) {
      this.items.splice(index, 1);
      if (this.equipment[slot]) {
        this.items.push(this.equipment[slot]);
      }
      this.equipment[slot] = item;
      player.recalculateStats();
    }
  }

  unequipItem(slot, player) {
    if (this.equipment[slot] && this.items.length < this.maxSlots) {
      this.items.push(this.equipment[slot]);
      this.equipment[slot] = null;
      player.recalculateStats();
    }
  }

  usePotion(index, player) {
    const item = this.items[index];
    if (item && item.type === 'potion') {
      if (item.healHp) {
        player.hp = Math.min(player.maxHp, player.hp + item.healHp);
      }
      if (item.healMp) {
        player.mp = Math.min(player.maxMp, player.mp + item.healMp);
      }
      item.quantity = (item.quantity || 1) - 1;
      if (item.quantity <= 0) {
        this.items.splice(index, 1);
      }
      return true;
    }
    return false;
  }

  // Get total stats contributed by all equipped gear
  getEquipmentBonus() {
    let bonus = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      maxMp: 0,
      critChance: 0,
      speed: 0,
      lifesteal: 0
    };

    Object.values(this.equipment).forEach(item => {
      if (item && item.stats) {
        const upMult = 1 + (item.upgradeLevel || 0) * 0.15; // +15% per upgrade level
        if (item.stats.attack) bonus.attack += Math.round(item.stats.attack * upMult);
        if (item.stats.defense) bonus.defense += Math.round(item.stats.defense * upMult);
        if (item.stats.maxHp) bonus.maxHp += Math.round(item.stats.maxHp * upMult);
        if (item.stats.maxMp) bonus.maxMp += Math.round(item.stats.maxMp * upMult);
        if (item.stats.critChance) bonus.critChance += item.stats.critChance;
        if (item.stats.speed) bonus.speed += item.stats.speed;
        if (item.stats.lifesteal) bonus.lifesteal += item.stats.lifesteal;
      }
    });

    return bonus;
  }
}
