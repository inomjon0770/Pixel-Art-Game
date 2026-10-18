// NPCs and Story Interactive Entities
import { sprites } from '../engine/Sprites.js';
import { Lang } from '../systems/Lang.js';
import { InventorySystem } from '../systems/Inventory.js';

export class NPC {
  constructor(x, y, type = 'sage') {
    this.x = x;
    this.y = y;
    this.type = type; // 'sage', 'blacksmith', 'merchant'
    this.interactionRange = 40;
  }

  getDisplayName() {
    const isUz = Lang.current === 'uz';
    if (this.type === 'sage') return isUz ? "Keksa Donishmand Eldrin" : "Sage Eldrin";
    if (this.type === 'blacksmith') return isUz ? "Temirchi Borin" : "Blacksmith Borin";
    return isUz ? "Sirli Sayyoh" : "Mystic Merchant";
  }

  getDialogue(currentChapter = 1) {
    const isUz = Lang.current === 'uz';
    if (this.type === 'sage') {
      if (currentChapter === 1) {
        return isUz ?
          "Salom, Vaqt Qo'riqchisi! O'rmon qo'riqchisi Sylvanus zulmat ta'sirida aqldan ozdi. Birinchi Vaqt bo'lagini qaytarish uchun uni mag'lub eting!" :
          "Greetings, Chrono Guardian! Sylvanus the Forest Titan has succumbed to corruption. Vanquish him to recover our first Chrono Shard!";
      } else if (currentChapter === 2) {
        return isUz ?
          "Ajoyib g'alaba! Ammo ikkinchi bo'lak Qadimiy Qabrlarda, Nekromant Malgath qo'lida. Undan ehtiyot bo'ling!" :
          "A heroic triumph! However, the next shard lies in the Crypts under Necromancer Malgath's thrall. Beware his dark sorcery!";
      } else if (currentChapter === 3) {
        return isUz ?
          "Magma tubidagi olovli daryolar har qanday metallni eritadi. Qurollaringizni kuchaytiring va Ignis bilan kurashing!" :
          "The Molten Abyss will incinerate the unprepared. Upgrade your weapons at the forge and challenge Ignis!";
      } else {
        return isUz ?
          "Siz afsonaga aylanyapsiz! Vaqt Bo'shlig'i sirlarini kashf etishda davom eting va cheksiz o'lchamlarni zabt eting!" :
          "You are becoming a legend! Continue traversing the infinite realms and restore cosmic order!";
      }
    }
    return isUz ? "Omad sizga yor bo'lsin, botir jangchi!" : "May fortune smile upon your blade, hero!";
  }

  render(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    // Draw NPC using Mage/Knight sprite as base
    const frames = sprites.get('hero_mage');
    if (frames && frames.length > 0) {
      ctx.drawImage(frames[0], screenX - 16, screenY - 16);
    }

    // Name tag above NPC
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.fillText(this.getDisplayName(), screenX, screenY - 20);

    // [E] Interact icon
    ctx.fillStyle = '#38bdf8';
    ctx.fillText("[E] Talk", screenX, screenY - 30);
  }
}

// Chests, Shrines, Campfires, Portals
export class InteractiveProp {
  constructor(type, x, y, options = {}) {
    this.type = type; // 'chest_wood', 'chest_gold', 'chest_void', 'shrine_heal', 'shrine_mana', 'shrine_speed', 'shrine_time', 'campfire', 'portal', 'pot'
    this.x = x;
    this.y = y;
    this.isOpen = false;
    this.isUsed = false;
    this.options = options;
    this.radius = 24;
  }

  interact(player, dungeon, particles, audio) {
    if (this.type.startsWith('chest_') && !this.isOpen) {
      this.isOpen = true;
      audio.playSfx('chest');
      const tier = this.type.includes('gold') ? 'legendary' : (this.type.includes('void') ? 'mythic' : 'rare');
      const item = InventorySystem.generateItem(tier, 'weapon', player.level);
      player.inventory.addItem(item);
      player.gold += 50 + player.level * 20;
      particles.emitCritStarburst(this.x, this.y);
      particles.addDamageText(this.x, this.y - 15, item.name, 'gold');
      return true;
    } else if (this.type.startsWith('shrine_') && !this.isUsed) {
      this.isUsed = true;
      audio.playSfx('levelup');
      if (this.type === 'shrine_heal') {
        player.hp = player.maxHp;
        particles.addDamageText(this.x, this.y - 15, "FULL HP RESTORED!", 'heal');
      } else if (this.type === 'shrine_mana') {
        player.mp = player.maxMp;
        particles.addDamageText(this.x, this.y - 15, "FULL MP RESTORED!", 'magic');
      } else if (this.type === 'shrine_speed') {
        player.speed += 25;
        particles.addDamageText(this.x, this.y - 15, "+25 SPEED BLESSING!", 'gold');
      } else {
        player.inventory.timeShards += 3;
        particles.addDamageText(this.x, this.y - 15, "+3 TIME SHARDS!", 'gold');
      }
      particles.emitLevelUp(this.x, this.y);
      return true;
    }
    return false;
  }

  render(ctx, camera) {
    const screenX = Math.round(this.x - camera.x);
    const screenY = Math.round(this.y - camera.y);

    if (this.type.startsWith('chest_')) {
      const tier = this.type.split('_')[1];
      const key = `chest_${tier}_${this.isOpen ? 'open' : 'closed'}`;
      const sprite = sprites.get(key) || sprites.get('chest_wood_closed');
      if (sprite) ctx.drawImage(sprite, screenX - 12, screenY - 12);
    } else if (this.type.startsWith('shrine_')) {
      const shrineType = this.type.split('_')[1];
      const sprite = sprites.get(`shrine_${shrineType}`);
      if (sprite) {
        ctx.save();
        if (this.isUsed) ctx.globalAlpha = 0.5;
        ctx.drawImage(sprite, screenX - 16, screenY - 16);
        ctx.restore();
      }
    } else if (this.type === 'campfire') {
      const frame = Math.floor(Date.now() / 200) % 2;
      const sprite = sprites.get(`campfire_${frame}`);
      if (sprite) ctx.drawImage(sprite, screenX - 12, screenY - 12);
    } else if (this.type === 'portal') {
      const frame = Math.floor(Date.now() / 200) % 2;
      const sprite = sprites.get(`portal_${frame}`);
      if (sprite) ctx.drawImage(sprite, screenX - 16, screenY - 16);
    } else if (this.type === 'pot') {
      const sprite = sprites.get('prop_pot');
      if (sprite) ctx.drawImage(sprite, screenX - 8, screenY - 8);
    }
  }
}
