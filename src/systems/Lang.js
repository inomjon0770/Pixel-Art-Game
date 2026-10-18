// Multi-language system: Uzbek (Primary) and English
export const Lang = {
  current: 'uz', // 'uz' or 'en'

  setLanguage(lang) {
    if (lang === 'uz' || lang === 'en') {
      this.current = lang;
      localStorage.setItem('chrono_chasm_lang', lang);
    }
  },

  init() {
    const saved = localStorage.getItem('chrono_chasm_lang');
    if (saved) this.current = saved;
  },

  t(key, ...params) {
    let str = this.strings[this.current]?.[key] || this.strings['en']?.[key] || key;
    if (params.length > 0) {
      params.forEach((param, index) => {
        str = str.replace(`{${index}}`, param);
      });
    }
    return str;
  },

  strings: {
    uz: {
      game_title: "CHRONO CHASM",
      game_subtitle: "Vaqt Bo'shlig'i: Cheksiz Afsona",
      new_game: "YANGI O'YIN",
      continue_game: "DAVOM ETTIRISH",
      settings: "SOZLAMALAR",
      lore_journal: "LORE & AFSONALAR",
      controls_guide: "BOSHQARUV VA YORDAM",
      select_hero: "QAHRAMONINGIZNI TANLANG",
      start_adventure: "SAYOHATNI BOSHLASH",
      
      // Classes
      class_knight: "Vaqt Ritsari (Knight)",
      class_knight_desc: "Kuchli zirh va qilich ustasi. Yaqin masofadan kuchli zarbalar beradi va chidamli.",
      class_mage: "Bo'shliq Sehrgari (Mage)",
      class_mage_desc: "Uzoqdan sehrli to'plar va elementar bo'ronlarni yo'llaydi. Katta maydonli zarba beradi.",
      class_rogue: "Soya Qotili (Rogue)",
      class_rogue_desc: "Tezkor chaqqon harakatlar va juft pichoqlar. Kritik zarbalar ehtimoli juda yuqori.",
      class_chronomancer: "Vaqt Hakimi (Chronomancer)",
      class_chronomancer_desc: "Vaqtni sekinlashtirish va fazoni buzish qobiliyatiga ega sirli afsungar.",

      // Stats
      level: "Daraja",
      exp: "Tajriba (EXP)",
      hp: "Hayot (HP)",
      mp: "Sehr (MP)",
      strength: "Kuch (STR)",
      vitality: "Chidamlilik (VIT)",
      intelligence: "Sehr Qobiliyati (INT)",
      agility: "Chaqqonlik (AGI)",
      luck: "Omad (LUCK)",
      attack: "Hujum Kuchi",
      defense: "Zirh Himoyasi",
      crit_chance: "Kritik Ehtimol",
      speed: "Harakat TeSearch",
      stat_points_available: "Mavjud Ochkolar",
      attribute_points: "Stat Ochkolari",

      // Controls
      ctrl_move: "WASD / Yo'nalish tugmalari - Harakat",
      ctrl_attack: "Sichqoncha Chap / J - Asosiy hujum",
      ctrl_dash: "Space / Shift - Chaqqon sakrash (Dash)",
      ctrl_skills: "1, 2, 3, 4 yoki Q, E, R, F - Maxsus qobiliyatlar",
      ctrl_interact: "E / Bo'sh joy - Muloqot / Sandiqni ochish",
      ctrl_inventory: "I / Tab - Inventar",
      ctrl_quests: "J / L - Topshiriqlar daftari",
      ctrl_stats: "C / K - Qahramon statistikasi",
      ctrl_craft: "B / G - Qurolsozlik (Forge)",
      ctrl_map: "M - Katta xarita",
      ctrl_pause: "Esc - To'xtatish (Pauza)",

      // HUD & In-Game
      depth_level: "Qatlam (Depth)",
      biome_forest: "Shivirlovchi O'rmon",
      biome_crypt: "Zulmat Qabrlari",
      biome_magma: "Olovli Magma Qa'ri",
      biome_frost: "Muzlatilgan Cho'qqi",
      biome_void: "Vaqt Bo'shlig'i (The Void)",
      biome_infinite: "Cheksiz Qatlam (Dimension ∞)",

      // Quests & Story
      quest_log: "Topshiriqlar Jurnali",
      main_quests: "Asosiy Syujet",
      bounty_quests: "Cheksiz Bountylar (Ovlar)",
      active_quest: "Faol Topshiriq",
      quest_complete: "Topshiriq Bajarildi!",
      rewards: "Mukofotlar",
      accept: "Qabul Qilish",
      claim: "Mukofotni Olish",
      talk: "[E] Muloqot",
      open_chest: "[E] Sandiqni Ochish",
      use_shrine: "[E] Ibodatxona Barakasini Olish",
      enter_portal: "[E] Keyingi Qatlamga O'tish",

      // Items & Inventory
      inventory: "Inventar & Jihozlar",
      crafting_forge: "Afsonaviy Qurolsozlik Ustaxonasi",
      equip: "Kiyish",
      unequip: "Yechish",
      use: "Ishlatish",
      drop: "Tashlab yuborish",
      upgrade: "Kuchaytirish (+{0})",
      rarity_common: "Oddiy",
      rarity_rare: "Noyob",
      rarity_epic: "Epik",
      rarity_legendary: "Afsonaviy",
      rarity_mythic: "Mifik (Cheksiz)",
      gold: "Oltin",
      shards: "Vaqt Bo'laklari",

      // Skills
      skill_1_name: "Vaqt To'lqini",
      skill_1_desc: "Kuchli tebranish to'lqini atrofingizdagi dushmanlarni orqaga suradi va qotiradi.",
      skill_2_name: "Olovli Aylanma",
      skill_2_desc: "Atrofingizda aylanuvchi olov pichoqlarini chiqaradi va yaqin dushmanlarni yondiradi.",
      skill_3_name: "Bo'shliq Qalqoni",
      skill_3_desc: "3 soniya davomida zarbani 80% kamaytiradi va olgan zarbani salomatlikka aylantiradi.",
      skill_4_name: "Vaqtni To'xtatish (ULTIMATE)",
      skill_4_desc: "Butun dunyo vaqtini 4 soniyaga sekinlashtiradi, siz esa o'ta tez harakat qilasiz!",

      // Audio & Settings
      master_vol: "Asosiy Ovoz",
      bgm_vol: "Musiqa Ovozi",
      sfx_vol: "Effektlar Ovozi",
      crt_filter: "Retro CRT Ekran Effekti",
      screen_shake: "Ekran Titrashi",
      particles_toggle: "Boyitilgan Zarrachalar (Particles)",
      save_game: "O'yinni Saqlash",
      game_saved: "O'yin Muvaffaqiyatli Saqlandi!",
      export_save: "Saqlangan Faylni Yuklab Olish (Export)",
      import_save: "Faylni Yuklash (Import)",
      reset_save: "O'yinni Qaytadan Boshlash",

      // Story Prologue Text
      prologue_title: "PROLOG: VAQTNING PARCHALANISHI",
      prologue_1: "Qadim zamonlarda, buyuk 'Chrono Kristali' butun olamning vaqt oqimini va koinot muvozanatini saqlab turar edi...",
      prologue_2: "Biroq, zulmat qa'ridan uyg'ongan Qorong'u Bo'shliq Hukmdori (Void Sovereign) uni minglab bo'laklarga parchalab tashladi.",
      prologue_3: "Hozir koinot cheksiz o'lchamlarga, xavfli qatlamlarga va vaqt riftslariga bo'linib ketdi. Dushmanlar har bir soniyada kuchayib bormoqda.",
      prologue_4: "Faqatgina Afsonaviy Vaqt Qo'riqchisi — siz barcha qatlamlarni zabt etib, relikviyalarni to'plab, cheksizlikni qayta tiklay olasiz!",
      skip_prologue: "[Space] Prologni O'tkazib Yuborish",

      // Bosses
      boss_alert: "DIQQAT! QATLAM HUKMDORI PAYDO BO'LDI!",
      boss_defeated: "HUKMDOR MAG'LUB ETILDI!",
      boss_1_name: "Sylvanus: O'rmon Qadimiy Qo'riqchisi",
      boss_2_name: "Malgath: La'natlangan Qabrlar Nekromanti",
      boss_3_name: "Ignis: Magma Qa'ri Vulqon Lordi",
      boss_4_name: "Frostfang: Muzliklar Ayoz Qirolichasi",
      boss_5_name: "Chronos: Bo'shliqning Cheksiz Hukmdori",
      boss_infinite_name: "Vaqt Anomaliyasi #{0}: Qatlam Mutanti",

      // Victory / Game Over
      game_over: "SIZ HALOK BO'LDINGIZ...",
      game_over_sub: "Vaqt sizni qayta tiklashga urinmoqda. Biroq tajriba va qoldiqlar siz bilan qoladi!",
      respawn_btn: "QAYTA TIKLANISH (RESPAWN)",
      enter_next_dimension: "KEYINGI O'LCHAMGA O'TISH (DEPTH {0})",
    },
    en: {
      game_title: "CHRONO CHASM",
      game_subtitle: "The Eternal Shards: Endless Legend",
      new_game: "NEW GAME",
      continue_game: "CONTINUE",
      settings: "SETTINGS",
      lore_journal: "LORE & BESTIARY",
      controls_guide: "CONTROLS & HELP",
      select_hero: "CHOOSE YOUR HERO",
      start_adventure: "START ADVENTURE",

      class_knight: "Chrono Knight",
      class_knight_desc: "Master of blade and heavy armor. High vitality and crushing melee strikes.",
      class_mage: "Void Sorcerer",
      class_mage_desc: "Channels arcane projectiles and elemental tempests from a distance.",
      class_rogue: "Shadow Rogue",
      class_rogue_desc: "Agile twin-blade assassin. Exceptionally high critical strike chance and speed.",
      class_chronomancer: "Chronomancer",
      class_chronomancer_desc: "Mystic temporal mage manipulating time flow, portals, and gravity rifts.",

      level: "Level",
      exp: "Experience (EXP)",
      hp: "Health (HP)",
      mp: "Mana (MP)",
      strength: "Strength (STR)",
      vitality: "Vitality (VIT)",
      intelligence: "Intelligence (INT)",
      agility: "Agility (AGI)",
      luck: "Luck (LUCK)",
      attack: "Attack Power",
      defense: "Defense Armor",
      crit_chance: "Crit Chance",
      speed: "Movement Speed",
      stat_points_available: "Available Points",
      attribute_points: "Attribute Points",

      ctrl_move: "WASD / Arrow Keys - Move",
      ctrl_attack: "Left Mouse / J - Primary Attack",
      ctrl_dash: "Space / Shift - Dodge Dash",
      ctrl_skills: "1, 2, 3, 4 or Q, E, R, F - Active Skills",
      ctrl_interact: "E / Space - Interact / Open Chests",
      ctrl_inventory: "I / Tab - Inventory",
      ctrl_quests: "J / L - Quest Log",
      ctrl_stats: "C / K - Character Stats",
      ctrl_craft: "B / G - Crafting & Forge",
      ctrl_map: "M - World Minimap",
      ctrl_pause: "Esc - Pause Menu",

      depth_level: "Depth",
      biome_forest: "The Whispering Woods",
      biome_crypt: "Crypt of the Ancients",
      biome_magma: "The Molten Abyss",
      biome_frost: "The Glacial Spire",
      biome_void: "The Void Horizon",
      biome_infinite: "Infinite Dimension ∞",

      quest_log: "Quest Log",
      main_quests: "Main Campaign",
      bounty_quests: "Endless Bounties",
      active_quest: "Active Objective",
      quest_complete: "Quest Complete!",
      rewards: "Rewards",
      accept: "Accept",
      claim: "Claim Reward",
      talk: "[E] Talk",
      open_chest: "[E] Open Chest",
      use_shrine: "[E] Receive Blessing",
      enter_portal: "[E] Enter Next Realm",

      inventory: "Inventory & Equipment",
      crafting_forge: "Enchanting & Crafting Forge",
      equip: "Equip",
      unequip: "Unequip",
      use: "Use",
      drop: "Drop",
      upgrade: "Upgrade (+{0})",
      rarity_common: "Common",
      rarity_rare: "Rare",
      rarity_epic: "Epic",
      rarity_legendary: "Legendary",
      rarity_mythic: "Mythic (Eternal)",
      gold: "Gold",
      shards: "Chrono Shards",

      skill_1_name: "Chrono Wave",
      skill_1_desc: "Unleashes a shockwave that knocks back and stuns surrounding foes.",
      skill_2_name: "Flame Vortex",
      skill_2_desc: "Summons orbiting fiery blades that continuously incinerate nearby enemies.",
      skill_3_name: "Void Barrier",
      skill_3_desc: "Reduces incoming damage by 80% for 3s and converts received hits into health.",
      skill_4_name: "Time Singularity (ULTIMATE)",
      skill_4_desc: "Freezes world time for 4s while granting you extreme movement and attack velocity!",

      master_vol: "Master Volume",
      bgm_vol: "Music Volume",
      sfx_vol: "SFX Volume",
      crt_filter: "Retro CRT Shader",
      screen_shake: "Screen Shake",
      particles_toggle: "Rich Particle Effects",
      save_game: "Save Game",
      game_saved: "Game Saved Successfully!",
      export_save: "Export Save File",
      import_save: "Import Save File",
      reset_save: "Reset All Progress",

      prologue_title: "PROLOGUE: THE SHATTERED TIMELINE",
      prologue_1: "In the primordial era, the grand Chrono Core sustained the cosmic flow of reality and life...",
      prologue_2: "Until the Void Sovereign emerged from the abyssal darkness and shattered it into infinite dimensional shards.",
      prologue_3: "Reality fragmented into endless depths, hostile rifts, and chaotic anomalies growing stronger with each second.",
      prologue_4: "Only you, the legendary Chrono Guardian, can traverse the endless realms, gather the relics, and reforge the timeline!",
      skip_prologue: "[Space] Skip Prologue",

      boss_alert: "WARNING! REALM LORD HAS AWAKENED!",
      boss_defeated: "REALM LORD DEFEATED!",
      boss_1_name: "Sylvanus: Ancient Forest Colossus",
      boss_2_name: "Malgath: Crypt Necrolord",
      boss_3_name: "Ignis: Molten Core Overlord",
      boss_4_name: "Frostfang: Sovereign of Ice",
      boss_5_name: "Chronos: The Void Architect",
      boss_infinite_name: "Temporal Anomaly #{0}: Depth Sovereign",

      game_over: "YOU DIED...",
      game_over_sub: "The time stream rewinds to protect your spirit. Your artifacts and experience endure!",
      respawn_btn: "RESPAWN AT SHRINE",
      enter_next_dimension: "ENTER NEXT REALM (DEPTH {0})",
    }
  }
};
