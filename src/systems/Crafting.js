// Blacksmith Enchanting Forge & Item Crafting System
import { InventorySystem } from './Inventory.js';
import { Lang } from './Lang.js';

export class CraftingSystem {
  static getUpgradeCost(item) {
    const currentLvl = item.upgradeLevel || 0;
    const baseGold = 80 * (currentLvl + 1);
    const shards = Math.max(1, Math.floor((currentLvl + 1) / 2));
    return { gold: baseGold, shards };
  }

  static canUpgrade(item, player) {
    if (!item || item.type === 'potion' || item.type === 'material') return false;
    if ((item.upgradeLevel || 0) >= 10) return false;
    const cost = this.getUpgradeCost(item);
    return player.gold >= cost.gold && player.inventory.timeShards >= cost.shards;
  }

  static upgradeItem(item, player, audio, particles) {
    if (!this.canUpgrade(item, player)) return false;

    const cost = this.getUpgradeCost(item);
    player.gold -= cost.gold;
    player.inventory.timeShards -= cost.shards;

    item.upgradeLevel = (item.upgradeLevel || 0) + 1;
    player.recalculateStats();

    audio.playSfx('crit');
    particles.emitSparks(player.x, player.y, 15);
    particles.addDamageText(player.x, player.y - 20, `+${item.upgradeLevel} Forge!`, 'gold');

    return true;
  }

  static getCraftingRecipes() {
    const isUz = Lang.current === 'uz';
    return [
      {
        id: 'craft_chrono_blade',
        name: isUz ? "Chrono Buyuk Qilichi (Mythic)" : "Chrono Greatsword (Mythic)",
        type: 'weapon',
        rarity: 'mythic',
        reqShards: 10,
        reqGold: 1000,
        desc: isUz ? "+85 Hujum Kuchi, +25% Kritik Zarba, Vaqtni yondiruvchi pichoq." : "+85 Attack, +25% Crit Chance, Temporal flame blade."
      },
      {
        id: 'craft_void_armor',
        name: isUz ? "Bo'shliq Zirhi (Legendary)" : "Void Sovereign Plate (Legendary)",
        type: 'armor',
        rarity: 'legendary',
        reqShards: 8,
        reqGold: 800,
        desc: isUz ? "+50 Himoya, +180 Maks HP, barcha zarbani kamaytiradi." : "+50 Defense, +180 Max HP, high damage reduction."
      },
      {
        id: 'craft_eternal_ring',
        name: isUz ? "Abadiyat Uzugi (Legendary)" : "Ring of Eternity (Legendary)",
        type: 'ring',
        rarity: 'legendary',
        reqShards: 6,
        reqGold: 600,
        desc: isUz ? "+20% Harakat Tezligi, +15% Kritik Ehtimol." : "+20% Movement Speed, +15% Crit Chance."
      }
    ];
  }

  static craftRecipe(recipeId, player, audio, particles) {
    const recipe = this.getCraftingRecipes().find(r => r.id === recipeId);
    if (!recipe) return false;

    if (player.inventory.timeShards < recipe.reqShards || player.gold < recipe.reqGold) {
      return false;
    }

    if (player.inventory.items.length >= player.inventory.maxSlots) {
      return false;
    }

    player.inventory.timeShards -= recipe.reqShards;
    player.gold -= recipe.reqGold;

    const newItem = InventorySystem.generateItem(recipe.rarity, recipe.type, player.level);
    newItem.name = recipe.name;
    player.inventory.addItem(newItem);

    audio.playSfx('levelup');
    particles.emitLevelUp(player.x, player.y);
    particles.addDamageText(player.x, player.y - 20, "Crafted!", 'gold');

    return true;
  }
}
