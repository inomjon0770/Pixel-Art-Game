// Save, Load, Export & Import State Manager
export class SaveManager {
  static SAVE_KEY = 'chrono_chasm_savedata_v1';

  static save(gameState) {
    try {
      const data = {
        version: 1,
        timestamp: Date.now(),
        player: {
          heroClass: gameState.player.heroClass,
          level: gameState.player.level,
          exp: gameState.player.exp,
          nextExp: gameState.player.nextExp,
          hp: gameState.player.hp,
          maxHp: gameState.player.maxHp,
          mp: gameState.player.mp,
          maxMp: gameState.player.maxMp,
          gold: gameState.player.gold,
          stats: gameState.player.stats,
          statPoints: gameState.player.statPoints,
          dungeonDepth: gameState.player.dungeonDepth,
          highestDepth: gameState.player.highestDepth || gameState.player.dungeonDepth
        },
        inventory: {
          items: gameState.player.inventory.items,
          equipment: gameState.player.inventory.equipment,
          timeShards: gameState.player.inventory.timeShards
        },
        quests: {
          activeMainQuestIndex: gameState.quests.activeMainQuestIndex,
          completedBountiesCount: gameState.quests.completedBountiesCount
        }
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Save error:", e);
      return false;
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Load error:", e);
      return null;
    }
  }

  static hasSave() {
    return !!localStorage.getItem(this.SAVE_KEY);
  }

  static exportSave() {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return null;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrono_chasm_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  static importSave(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.version && data.player) {
          localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
          callback(true, data);
        } else {
          callback(false, "Noto'g'ri fayl formati!");
        }
      } catch (err) {
        callback(false, "Faylni o'qishda xatolik yuz berdi.");
      }
    };
    reader.readAsText(file);
  }

  static reset() {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
