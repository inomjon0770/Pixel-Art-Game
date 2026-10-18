// Main Story Campaign & Infinite Procedural Bounty System
import { Lang } from './Lang.js';

export class QuestManager {
  constructor() {
    this.mainQuests = [];
    this.activeMainQuestIndex = 0;
    this.bounties = [];
    this.completedBountiesCount = 0;

    this.initMainQuests();
    this.generateBounties(1);
  }

  initMainQuests() {
    this.mainQuests = [
      {
        id: 'main_1',
        chapter: 1,
        titleUz: "1-Bob: Uyg'onish va Qadimiy O'rmon",
        titleEn: "Chapter 1: Awakening in the Whispering Woods",
        descUz: "Donishmand Eldrin bilan gaplashing va O'rmon Qo'riqchisi Sylvanusni mag'lub qilib birinchi Vaqt Bo'lagini oling.",
        descEn: "Speak with Sage Eldrin and defeat Sylvanus the Forest Titan to claim the First Chrono Shard.",
        targetDepth: 1,
        targetBoss: 'sylvanus',
        rewardGold: 200,
        rewardExp: 300,
        rewardShards: 2,
        isCompleted: false,
        dialogueNpc: 'Sage Eldrin',
        introDialogueUz: "Salom, Vaqt Qo'riqchisi! Vaqt o'zagi parchalanganidan beri olam betartiblikka yuz tutdi. O'rmon qo'riqchisi yovuzlashgan. Uni mag'lub etib birinchi bo'lakni qaytaring!",
        introDialogueEn: "Greetings, Chrono Guardian! The timeline fractured and chaos engulfed the realms. Defeat the corrupted Forest Titan to reclaim the first shard!"
      },
      {
        id: 'main_2',
        chapter: 2,
        titleUz: "2-Bob: Qadimiy Qabrlar Zulmati",
        titleEn: "Chapter 2: Crypt of the Forgotten",
        descUz: "2-Qatlamga tushing, Qabrlar ichidagi la'natlangan skeletlarni tozalang va Nekromant Malgathni yo'q qiling.",
        descEn: "Descend to Depth 2, purge the undead skeletons, and vanquish Necromancer Malgath.",
        targetDepth: 2,
        targetBoss: 'malgath',
        rewardGold: 400,
        rewardExp: 600,
        rewardShards: 4,
        isCompleted: false,
        dialogueNpc: 'Sage Eldrin',
        introDialogueUz: "Malgath qadimiy qabrlardan ruhlarni uyg'otmoqda. Zulmatni yoriting va ikkinchi bo'lakni oling!",
        introDialogueEn: "Malgath is raising an undead army from the catacombs. Illuminate the darkness and reclaim the second shard!"
      },
      {
        id: 'main_3',
        chapter: 3,
        titleUz: "3-Bob: Magma Qa'ri va Vulqon Qahri",
        titleEn: "Chapter 3: The Molten Crucible",
        descUz: "3-Qatlamdagi olovli daryolardan o'tib, Vulqon Lordi Ignisni mahv eting.",
        descEn: "Traverse the molten rivers of Depth 3 and conquer Ignis the Magma Lord.",
        targetDepth: 3,
        targetBoss: 'ignis',
        rewardGold: 700,
        rewardExp: 1000,
        rewardShards: 6,
        isCompleted: false,
        dialogueNpc: 'Sage Eldrin',
        introDialogueUz: "Ignis olov va temirni o'z ixtiyoriga bo'ysundirgan. Ehtiyot bo'ling, magma olovi har qanday zirhni eritib yuborishi mumkin!",
        introDialogueEn: "Ignis commands primeval flames. Watch your step, his magma fury melts through any armor!"
      },
      {
        id: 'main_4',
        chapter: 4,
        titleUz: "4-Bob: Muzlatilgan Cho'qqi",
        titleEn: "Chapter 4: The Glacial Spire",
        descUz: "4-Qatlamdagi ayozli bo'ronlarni yengib, Ayoz Qirolichasi Frostfangni to'xtating.",
        descEn: "Brave the icy blizzard of Depth 4 and defeat Frostfang the Ice Sovereign.",
        targetDepth: 4,
        targetBoss: 'frostfang',
        rewardGold: 1200,
        rewardExp: 1600,
        rewardShards: 8,
        isCompleted: false,
        dialogueNpc: 'Sage Eldrin',
        introDialogueUz: "Ayoz qirolichasi butun vaqtni muzlatib qo'ymoqchi. Unga qarshi olovli qurollaringizni ishga soling!",
        introDialogueEn: "Frostfang aims to freeze eternity in perpetual permafrost. Shatter her icy hold!"
      },
      {
        id: 'main_5',
        chapter: 5,
        titleUz: "5-Bob: Bo'shliq Hukmdori Chronos",
        titleEn: "Chapter 5: The Void Sovereign",
        descUz: "5-Qatlam — Bo'shliqqa kiring va butun olamni parchalagan Chronosni mag'lub eting!",
        descEn: "Enter the Void Realm and vanquish Chronos, the Architect of Chaos!",
        targetDepth: 5,
        targetBoss: 'chronos',
        rewardGold: 2500,
        rewardExp: 3500,
        rewardShards: 15,
        isCompleted: false,
        dialogueNpc: 'Sage Eldrin',
        introDialogueUz: "Bu eng oliy sinov! Chronos vaqtni orqaga qaytara oladi va teleport bo'ladi. Bor mahoratingizni ko'rsating!",
        introDialogueEn: "The ultimate trial! Chronos manipulates time itself. Unleash your full power!"
      }
    ];
  }

  // Endless Bounty Generator
  generateBounties(currentDepth = 1) {
    this.bounties = [];
    const isUz = Lang.current === 'uz';

    const monsters = ['slime', 'goblin', 'skeleton', 'necromancer', 'fire_demon', 'frost_wisp', 'void_stalker'];
    const monsterNamesUz = {
      slime: 'Yashil Shilliqurt',
      goblin: "O'rmon Goblini",
      skeleton: 'Zulmat Skeleti',
      necromancer: 'Nekromant',
      fire_demon: 'Olov Iblisi',
      frost_wisp: 'Ayoz Ruhi',
      void_stalker: "Bo'shliq Yirtqichi"
    };

    for (let i = 0; i < 3; i++) {
      const mob = monsters[Math.floor(Math.random() * monsters.length)];
      const targetCount = 5 + Math.floor(Math.random() * 8);
      const gold = 100 * currentDepth + Math.floor(Math.random() * 80);
      const exp = 150 * currentDepth + Math.floor(Math.random() * 100);

      this.bounties.push({
        id: `bounty_${Date.now()}_${i}`,
        mobType: mob,
        targetCount,
        currentCount: 0,
        gold,
        exp,
        shards: Math.floor(currentDepth / 2) + 1,
        title: isUz ? `${monsterNamesUz[mob]}larni ovlash` : `Hunt ${mob.replace('_', ' ').toUpperCase()}`,
        desc: isUz ?
          `${targetCount} ta ${monsterNamesUz[mob]}ni yo'q qiling` :
          `Eliminate ${targetCount} ${mob.replace('_', ' ')}s`,
        isCompleted: false,
        claimed: false
      });
    }
  }

  // Update monster kill count
  onMonsterKilled(mobType, player, particles, audio) {
    this.bounties.forEach(bounty => {
      if (!bounty.isCompleted && (bounty.mobType === mobType || bounty.mobType === 'any')) {
        bounty.currentCount++;
        if (bounty.currentCount >= bounty.targetCount) {
          bounty.isCompleted = true;
          audio.playSfx('levelup');
          particles.addDamageText(player.x, player.y - 20, Lang.t('quest_complete'), 'gold');
        }
      }
    });
  }

  // Check boss defeat
  onBossDefeated(bossId, player, particles, audio) {
    const currentQuest = this.mainQuests[this.activeMainQuestIndex];
    if (currentQuest && !currentQuest.isCompleted && (currentQuest.targetBoss === bossId || currentQuest.chapter > 5)) {
      currentQuest.isCompleted = true;
      player.gold += currentQuest.rewardGold;
      player.inventory.timeShards += currentQuest.rewardShards;
      player.addExp(currentQuest.rewardExp, particles, audio);
      audio.playSfx('levelup');

      if (this.activeMainQuestIndex < this.mainQuests.length - 1) {
        this.activeMainQuestIndex++;
      } else {
        // Infinite Endless Quests unlocked!
        this.addInfiniteMainQuest(player.dungeonDepth + 1);
      }
    }
  }

  addInfiniteMainQuest(depth) {
    const isUz = Lang.current === 'uz';
    this.mainQuests.push({
      id: `main_inf_${depth}`,
      chapter: depth,
      titleUz: `Cheksiz O'lcham ${depth}-Qatlam`,
      titleEn: `Infinite Depth Realm ${depth}`,
      descUz: `${depth}-Qatlamdagi Vaqt Anomaliyasini mag'lub eting va Mifik relikviyalarni qo'lga kiriting!`,
      descEn: `Conquer Temporal Anomaly in Depth ${depth} for Mythic rewards!`,
      targetDepth: depth,
      targetBoss: 'any',
      rewardGold: 1000 * depth,
      rewardExp: 1500 * depth,
      rewardShards: 5 + depth,
      isCompleted: false
    });
    this.activeMainQuestIndex = this.mainQuests.length - 1;
  }

  claimBounty(index, player, particles, audio) {
    const b = this.bounties[index];
    if (b && b.isCompleted && !b.claimed) {
      b.claimed = true;
      player.gold += b.gold;
      player.inventory.timeShards += b.shards;
      player.addExp(b.exp, particles, audio);
      audio.playSfx('coin');
      this.completedBountiesCount++;
      return true;
    }
    return false;
  }
}
