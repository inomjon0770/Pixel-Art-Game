// Procedural High-Definition Pixel Art Engine
// Generates crisp, authentic 16-bit retro sprites on offscreen canvases

export class SpriteEngine {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.createAllSprites();
    this.initialized = true;
  }

  // Create an offscreen pixel canvas with Crisp Pixelated scaling
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // Draw pixel grid from ascii / color map
  drawPixelMatrix(ctx, matrix, colorPalette, scale = 1, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < matrix.length; y++) {
      const row = matrix[y];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        if (char !== ' ' && char !== '.' && colorPalette[char]) {
          ctx.fillStyle = colorPalette[char];
          ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
        }
      }
    }
  }

  createAllSprites() {
    this.createPlayerSprites();
    this.createEnemySprites();
    this.createBossSprites();
    this.createTileSprites();
    this.createPropSprites();
    this.createItemSprites();
  }

  // --- 1. PLAYER SPRITES (4 Classes, Animated) ---
  createPlayerSprites() {
    const classes = ['knight', 'mage', 'rogue', 'chronomancer'];
    
    classes.forEach(heroClass => {
      // 4 frames: Idle 1, Walk 1, Walk 2, Attack
      const frames = [];
      for (let f = 0; f < 4; f++) {
        const { canvas, ctx } = this.createCanvas(32, 32);
        this.renderHeroFrame(ctx, heroClass, f);
        frames.push(canvas);
      }
      this.cache.set(`hero_${heroClass}`, frames);
    });
  }

  renderHeroFrame(ctx, heroClass, frame) {
    const isWalk = frame === 1 || frame === 2;
    const isAttack = frame === 3;
    const legOffset = frame === 1 ? 1 : (frame === 2 ? -1 : 0);

    let colors = {};
    if (heroClass === 'knight') {
      colors = {
        h: '#1e293b', // helmet shadow
        H: '#475569', // helmet
        F: '#ffd1a4', // face skin
        a: '#334155', // armor dark
        A: '#64748b', // armor bright
        s: '#0f172a', // sword handle
        S: '#94a3b8', // steel blade
        b: '#3b82f6', // blue cape
        e: '#60a5fa', // blue eyes
        l: '#1e293b'  // leather boots
      };
    } else if (heroClass === 'mage') {
      colors = {
        h: '#4c1d95', // hat shadow
        H: '#7c3aed', // purple hat
        F: '#ffd1a4', // face
        a: '#6d28d9', // robe
        A: '#8b5cf6', // robe bright
        s: '#78350f', // staff wood
        S: '#38bdf8', // orb magic cyan
        b: '#a855f7', // cape
        e: '#38bdf8', // glowing cyan eyes
        l: '#3b0764'  // boots
      };
    } else if (heroClass === 'rogue') {
      colors = {
        h: '#0f172a', // dark hood
        H: '#1e293b', // cloak
        F: '#fbcfe8', // face
        a: '#09090b', // stealth armor
        A: '#10b981', // emerald green trims
        s: '#052e16', // dagger hilt
        S: '#34d399', // poisoned green blade
        b: '#064e3b', // scarf
        e: '#10b981', // green glowing eye
        l: '#09090b'
      };
    } else { // chronomancer
      colors = {
        h: '#082f49', // chrono hood
        H: '#0284c7', // gold-cyan mantle
        F: '#fde047', // time spirit skin
        a: '#0369a1', // temporal robes
        A: '#38bdf8', // chrono glow
        s: '#d97706', // gold gear staff
        S: '#f59e0b', // time clock core
        b: '#0ea5e9', // floating ribbons
        e: '#fef08a', // bright gold eyes
        l: '#0c4a6e'
      };
    }

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body matrix (16x16 scaled to 2x)
    const baseMatrix = [
      "    HHHHHH    ",
      "   HhhhhhhH   ",
      "   HFe  eFH   ",
      "   HFbbbbFH   ",
      "    AAAAAA    ",
      "   bAAAAAAb   ",
      "  bbAaaaaAbb  ",
      "  bbAaaaaAbb  ",
      "   bAAAAAAb   ",
      "    AA  AA    ",
      "    ll  ll    ",
      "    ll  ll    "
    ];

    // Modify for walk / attack
    const matrix = [...baseMatrix];
    if (legOffset === 1) {
      matrix[9] =  "    AA   A    ";
      matrix[10] = "    ll   l    ";
      matrix[11] = "   ll         ";
    } else if (legOffset === -1) {
      matrix[9] =  "    A   AA    ";
      matrix[10] = "    l   ll    ";
      matrix[11] = "         ll   ";
    }

    this.drawPixelMatrix(ctx, matrix, colors, 2, 2, 4);

    // Draw weapon
    if (isAttack) {
      // Weapon swinging slash effect
      ctx.fillStyle = colors.S;
      ctx.fillRect(22, 6, 4, 16);
      ctx.fillStyle = colors.s;
      ctx.fillRect(20, 18, 8, 4);
      // Slash trail arc
      ctx.strokeStyle = colors.S;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(16, 16, 12, -Math.PI / 4, Math.PI / 3);
      ctx.stroke();
    } else {
      // Weapon at side
      ctx.fillStyle = colors.s;
      ctx.fillRect(22, 14, 2, 6);
      ctx.fillStyle = colors.S;
      ctx.fillRect(22, 6, 2, 8);
    }
  }

  // --- 2. ENEMY SPRITES ---
  createEnemySprites() {
    const enemyTypes = [
      { name: 'slime', col: { b: '#22c55e', B: '#4ade80', e: '#ffffff', E: '#0f172a' } },
      { name: 'goblin', col: { s: '#15803d', S: '#4ade80', c: '#78350f', e: '#ef4444', w: '#94a3b8' } },
      { name: 'skeleton', col: { b: '#e2e8f0', B: '#cbd5e1', e: '#ef4444', w: '#64748b', c: '#334155' } },
      { name: 'necromancer', col: { r: '#3b0764', R: '#7e22ce', s: '#c084fc', e: '#a855f7', f: '#f3e8ff' } },
      { name: 'fire_demon', col: { b: '#b91c1c', B: '#f97316', e: '#fef08a', h: '#451a03', f: '#ea580c' } },
      { name: 'frost_wisp', col: { b: '#0284c7', B: '#38bdf8', e: '#e0f2fe', c: '#bae6fd' } },
      { name: 'void_stalker', col: { b: '#1e1b4b', B: '#4338ca', e: '#ec4899', t: '#831843' } }
    ];

    enemyTypes.forEach(enemy => {
      const frames = [];
      for (let f = 0; f < 2; f++) {
        const { canvas, ctx } = this.createCanvas(32, 32);
        this.renderEnemyFrame(ctx, enemy.name, enemy.col, f);
        frames.push(canvas);
      }
      this.cache.set(`enemy_${enemy.name}`, frames);
    });
  }

  renderEnemyFrame(ctx, type, colors, frame) {
    const yOff = frame === 1 ? 1 : 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'slime') {
      const m = frame === 0 ? [
        "      BBBB      ",
        "    BBbbbbBB    ",
        "   BBbeEEebBB   ",
        "  BBbbeEEebbBB  ",
        "  BBbbbbbbbbBB  ",
        "  BBBBBBBBBBBB  "
      ] : [
        "     BBBBBB     ",
        "   BBbbbbbbBB   ",
        "  BBbbeEEebbBB  ",
        " BBBbbbeEEebbbB ",
        " BBBbbbbbbbbBBB ",
        "  BBBBBBBBBBBB  "
      ];
      this.drawPixelMatrix(ctx, m, colors, 2, 0, 14 - yOff);
    } else if (type === 'goblin') {
      const m = [
        "     SSSSSS     ",
        "    SssssssS    ",
        "    SSe  eSS    ",
        "     SssssS     ",
        "    cccccccc    ",
        "   SccccccccS   ",
        "   S cccccc S   ",
        "   w cc  cc     ",
        "     ss  ss     "
      ];
      this.drawPixelMatrix(ctx, m, colors, 2, 0, 8 - yOff);
    } else if (type === 'skeleton') {
      const m = [
        "     BBBBBB     ",
        "    BBbbbbBB    ",
        "    BBe  eBB    ",
        "     BBBBBB     ",
        "      BBBB      ",
        "   w  BBBB  w   ",
        "   w  BBBB  w   ",
        "      B  B      ",
        "      B  B      "
      ];
      this.drawPixelMatrix(ctx, m, colors, 2, 0, 8 - yOff);
    } else if (type === 'fire_demon') {
      const m = [
        "   h   BB   h   ",
        "   hh BBBb hh   ",
        "    BBeeeeBB    ",
        "    BffffffB    ",
        "   BBffffffBB   ",
        "  BBBBBBBBBBBB  ",
        "   B  ffff  B   ",
        "      ffff      "
      ];
      this.drawPixelMatrix(ctx, m, colors, 2, 0, 8 - yOff);
    } else {
      // General / Void / Necromancer
      const m = [
        "     RRRRRR     ",
        "    RRrrrrRR    ",
        "    RRe  eRR    ",
        "    RRrrrrRR    ",
        "   RRRRRRRRRR   ",
        "  RR ssssss RR  ",
        "  RR ssssss RR  ",
        "     ssssss     ",
        "     RR  RR     "
      ];
      this.drawPixelMatrix(ctx, m, colors, 2, 0, 8 - yOff);
    }
  }

  // --- 3. BOSS SPRITES (Giant 64x64) ---
  createBossSprites() {
    const bosses = [
      { id: 'sylvanus', title: 'Forest Titan', theme: 'nature' },
      { id: 'malgath', title: 'Crypt Necrolord', theme: 'undead' },
      { id: 'ignis', title: 'Magma Overlord', theme: 'fire' },
      { id: 'frostfang', title: 'Ice Queen', theme: 'ice' },
      { id: 'chronos', title: 'Void Architect', theme: 'void' }
    ];

    bosses.forEach(boss => {
      const { canvas, ctx } = this.createCanvas(64, 64);
      this.renderGiantBoss(ctx, boss.id);
      this.cache.set(`boss_${boss.id}`, canvas);
    });
  }

  renderGiantBoss(ctx, id) {
    // Grand boss shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(32, 58, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    let colors = {};
    if (id === 'sylvanus') {
      colors = {
        w: '#78350f', W: '#92400e', l: '#15803d', L: '#22c55e',
        e: '#84cc16', E: '#fef08a', r: '#451a03'
      };
      const m = [
        "        LLLLLL        ",
        "      LLLLLLLLLL      ",
        "     WWWWWWWWWWWW     ",
        "    WWWWWeEEeWWWWW    ",
        "    WWWWeEEEEeWWWW    ",
        "    WWWWWWWWWWWWWW    ",
        "   LLLLWWWWWWWWLLLL   ",
        "  LLLLWWrrrrrrWWLLLL  ",
        "  LL  WrrrrrrrrW  LL  ",
        "      WrrrrrrrrW      ",
        "      WWrr  rrWW      ",
        "      WWWW  WWWW      "
      ];
      this.drawPixelMatrix(ctx, m, colors, 3, 10, 10);
    } else if (id === 'ignis') {
      colors = {
        h: '#451a03', H: '#78350f', f: '#dc2626', F: '#f97316',
        y: '#fef08a', e: '#ffffff'
      };
      const m = [
        "    h   FFFF   h    ",
        "   hh  FFffFF  hh   ",
        "  hhhhFFfeefFFhhhh  ",
        "  hhhhFFFFFFFFhhhh  ",
        "   hh HHHHHHHH hh   ",
        "      HHffffHH      ",
        "     HHHHffHHHH     ",
        "    HH  ffff  HH    ",
        "        ffff        "
      ];
      this.drawPixelMatrix(ctx, m, colors, 3, 4, 12);
    } else if (id === 'chronos') {
      colors = {
        v: '#0f172a', V: '#3b0764', c: '#0284c7', C: '#38bdf8',
        g: '#eab308', G: '#fef08a', e: '#ffffff'
      };
      const m = [
        "       GGGGGG       ",
        "     GGCCCCCCGG     ",
        "    GCVVVVVVVVVCG   ",
        "   GCVVeeeeVeeVVVCG ",
        "   GCVVGGGGVGGVVVCG ",
        "   GCVVVVVVVVVVVCG  ",
        "    GCVVVVVVVVVCG   ",
        "     GGVVVVVVGG     ",
        "       VVVVVV       ",
        "      VV    VV      "
      ];
      this.drawPixelMatrix(ctx, m, colors, 3, 6, 10);
    } else {
      // General / Malgath / Frostfang
      colors = {
        r: '#1e1b4b', R: '#4338ca', s: '#a855f7', e: '#ec4899', E: '#ffffff'
      };
      const m = [
        "       RRRRRR       ",
        "     RRssssssRR     ",
        "    RRssEEEEssRR    ",
        "    RRssEeeEssRR    ",
        "    RRssssssssRR    ",
        "   RRRRRRRRRRRRRR   ",
        "  RR  ssssssss  RR  ",
        "      ssssssss      ",
        "      RR    RR      "
      ];
      this.drawPixelMatrix(ctx, m, colors, 3, 6, 12);
    }
  }

  // --- 4. BIOME TILES (16x16 crisp) ---
  createTileSprites() {
    const biomes = ['forest', 'crypt', 'magma', 'frost', 'void'];

    biomes.forEach(biome => {
      // Floor
      const floor = this.createCanvas(16, 16);
      this.renderTileFloor(floor.ctx, biome);
      this.cache.set(`tile_floor_${biome}`, floor.canvas);

      // Wall
      const wall = this.createCanvas(16, 16);
      this.renderTileWall(wall.ctx, biome);
      this.cache.set(`tile_wall_${biome}`, wall.canvas);

      // Floor Detail / Deco
      const deco = this.createCanvas(16, 16);
      this.renderTileDeco(deco.ctx, biome);
      this.cache.set(`tile_deco_${biome}`, deco.canvas);
    });
  }

  renderTileFloor(ctx, biome) {
    if (biome === 'forest') {
      ctx.fillStyle = '#1e3a1f';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#2d5a2f';
      ctx.fillRect(2, 2, 6, 6);
      ctx.fillRect(10, 8, 4, 4);
      ctx.fillStyle = '#162e17';
      ctx.fillRect(1, 12, 3, 2);
    } else if (biome === 'crypt') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#0f172a';
      ctx.strokeRect(0.5, 0.5, 15, 15);
      ctx.fillStyle = '#334155';
      ctx.fillRect(3, 3, 4, 2);
    } else if (biome === 'magma') {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(6, 6, 4, 4);
    } else if (biome === 'frost') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(4, 4, 4, 4);
    } else { // void
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(7, 7, 2, 2);
    }
  }

  renderTileWall(ctx, biome) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, 16, 16);

    if (biome === 'forest') {
      ctx.fillStyle = '#3f2212';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(1, 1, 14, 4); // Moss on top
    } else if (biome === 'crypt') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 2, 12, 5);
    } else if (biome === 'magma') {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, 8, 8, 2);
    } else if (biome === 'frost') {
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(1, 1, 14, 4);
    } else {
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(3, 3, 10, 2);
    }
  }

  renderTileDeco(ctx, biome) {
    if (biome === 'forest') {
      // Flower / Herb
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(7, 7, 2, 2);
    } else if (biome === 'crypt') {
      // Skull / Bone
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(6, 6, 4, 3);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, 7, 1, 1);
    } else if (biome === 'magma') {
      // Ember crystal
      ctx.fillStyle = '#f97316';
      ctx.fillRect(6, 4, 4, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(7, 6, 2, 4);
    } else {
      // Void crystal
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(6, 4, 4, 8);
    }
  }

  // --- 5. PROPS & INTERACTIVES ---
  createPropSprites() {
    // Chests (Wood, Gold, Void, Open)
    ['wood', 'gold', 'void'].forEach(type => {
      const closed = this.createCanvas(24, 24);
      const open = this.createCanvas(24, 24);
      this.renderChest(closed.ctx, type, false);
      this.renderChest(open.ctx, type, true);
      this.cache.set(`chest_${type}_closed`, closed.canvas);
      this.cache.set(`chest_${type}_open`, open.canvas);
    });

    // Shrines (Health, Mana, Speed, Time)
    ['heal', 'mana', 'speed', 'time'].forEach(type => {
      const { canvas, ctx } = this.createCanvas(32, 32);
      this.renderShrine(ctx, type);
      this.cache.set(`shrine_${type}`, canvas);
    });

    // Campfire (Animated 2 frames)
    for (let f = 0; f < 2; f++) {
      const { canvas, ctx } = this.createCanvas(24, 24);
      this.renderCampfire(ctx, f);
      this.cache.set(`campfire_${f}`, canvas);
    }

    // Portal (Animated 2 frames)
    for (let f = 0; f < 2; f++) {
      const { canvas, ctx } = this.createCanvas(32, 32);
      this.renderPortal(ctx, f);
      this.cache.set(`portal_${f}`, canvas);
    }

    // Pot / Crate
    const pot = this.createCanvas(16, 16);
    this.renderPot(pot.ctx);
    this.cache.set('prop_pot', pot.canvas);
  }

  renderChest(ctx, type, isOpen) {
    const col = type === 'wood' ? { b: '#78350f', B: '#92400e', l: '#eab308' } :
                type === 'gold' ? { b: '#ca8a04', B: '#facc15', l: '#ffffff' } :
                                  { b: '#3b0764', B: '#7e22ce', l: '#38bdf8' };

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(12, 20, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!isOpen) {
      ctx.fillStyle = col.b;
      ctx.fillRect(4, 8, 16, 12);
      ctx.fillStyle = col.B;
      ctx.fillRect(4, 8, 16, 5);
      ctx.fillStyle = col.l;
      ctx.fillRect(11, 11, 2, 4);
    } else {
      ctx.fillStyle = col.b;
      ctx.fillRect(4, 12, 16, 8);
      ctx.fillStyle = col.B;
      ctx.fillRect(4, 4, 16, 5); // Raised lid
      ctx.fillStyle = col.l;
      ctx.fillRect(10, 8, 4, 4); // Glowing inside
    }
  }

  renderShrine(ctx, type) {
    const glowCol = type === 'heal' ? '#22c55e' :
                    type === 'mana' ? '#38bdf8' :
                    type === 'speed' ? '#eab308' : '#a855f7';

    // Stone pedestal
    ctx.fillStyle = '#334155';
    ctx.fillRect(6, 16, 20, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(8, 18, 16, 8);

    // Floating Crystal
    ctx.fillStyle = glowCol;
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(22, 12);
    ctx.lineTo(16, 18);
    ctx.lineTo(10, 12);
    ctx.closePath();
    ctx.fill();

    // Crystal Core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 10, 4, 4);
  }

  renderCampfire(ctx, frame) {
    // Logs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 16, 16, 4);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(6, 18, 12, 2);

    // Fire flame
    const fH = frame === 0 ? 12 : 14;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(8, 20 - fH, 8, fH);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(9, 20 - fH + 2, 6, fH - 2);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(10, 20 - fH + 5, 4, fH - 6);
  }

  renderPortal(ctx, frame) {
    const radius = frame === 0 ? 12 : 14;
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.7, '#8b5cf6');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, radius, 0, Math.PI * 2);
    ctx.fill();

    // Swirling rings
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(16, 16, 10, 4, frame === 0 ? Math.PI / 4 : -Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderPot(ctx) {
    ctx.fillStyle = '#92400e';
    ctx.fillRect(4, 6, 8, 8);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(5, 4, 6, 3);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(6, 7, 4, 4);
  }

  // --- 6. ITEMS & ICONS ---
  createItemSprites() {
    const items = [
      'sword_common', 'sword_rare', 'sword_epic', 'sword_legendary', 'sword_mythic',
      'bow', 'staff', 'dagger',
      'armor_knight', 'armor_mage', 'armor_rogue',
      'helm_iron', 'helm_mystic',
      'ring_gold', 'amulet_time',
      'potion_hp', 'potion_mp', 'potion_speed',
      'shard_time', 'coin_gold'
    ];

    items.forEach(item => {
      const { canvas, ctx } = this.createCanvas(16, 16);
      this.renderItemIcon(ctx, item);
      this.cache.set(`item_${item}`, canvas);
    });
  }

  renderItemIcon(ctx, id) {
    if (id.startsWith('sword_')) {
      const tier = id.split('_')[1];
      const bladeCol = tier === 'common' ? '#94a3b8' :
                       tier === 'rare' ? '#38bdf8' :
                       tier === 'epic' ? '#c084fc' :
                       tier === 'legendary' ? '#facc15' : '#f43f5e';
      // Diagonal sword
      ctx.fillStyle = bladeCol;
      ctx.fillRect(4, 2, 3, 9);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(5, 2, 1, 8);
      // Guard & Hilt
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(2, 10, 7, 2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 12, 3, 3);
    } else if (id === 'staff') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(3, 4, 10, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(11, 2, 4, 4);
    } else if (id === 'dagger') {
      ctx.fillStyle = '#34d399';
      ctx.fillRect(5, 3, 3, 7);
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(4, 10, 5, 2);
    } else if (id.startsWith('potion_')) {
      const col = id === 'potion_hp' ? '#ef4444' : (id === 'potion_mp' ? '#3b82f6' : '#eab308');
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(6, 2, 4, 3);
      ctx.fillStyle = col;
      ctx.fillRect(4, 5, 8, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 7, 2, 4);
    } else if (id === 'shard_time') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(8, 1);
      ctx.lineTo(14, 8);
      ctx.lineTo(8, 15);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 6, 2, 4);
    } else if (id === 'coin_gold') {
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(7, 5, 2, 6);
    } else if (id === 'ring_gold') {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, 9, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(7, 3, 3, 3);
    } else if (id === 'amulet_time') {
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 3, 8, 6);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(6, 7, 4, 6);
    } else {
      // General Armor / Helm
      ctx.fillStyle = '#64748b';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(6, 6, 4, 4);
    }
  }

  // Get cached canvas sprite
  get(key) {
    return this.cache.get(key);
  }
}

export const sprites = new SpriteEngine();
