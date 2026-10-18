// Procedural Room & Corridor Dungeon Generator
export class MapGenerator {
  constructor(width = 60, height = 60) {
    this.width = width;
    this.height = height;
    this.grid = []; // 2D array of tile types (0: void, 1: floor, 2: wall, 3: deco)
    this.rooms = [];
    this.torches = [];
    this.props = [];
    this.spawns = {
      player: { x: 0, y: 0 },
      boss: null,
      portal: null,
      npc: null,
      enemies: [],
      chests: [],
      shrines: []
    };
  }

  generate(biomeConfig) {
    const roomCount = biomeConfig.roomCount || 8;
    this.grid = Array(this.height).fill(0).map(() => Array(this.width).fill(2)); // start with walls
    this.rooms = [];
    this.torches = [];
    this.props = [];
    this.spawns = {
      player: { x: 0, y: 0 },
      boss: null,
      portal: null,
      npc: null,
      enemies: [],
      chests: [],
      shrines: []
    };

    // 1. Generate Rooms
    let attempts = 0;
    while (this.rooms.length < roomCount && attempts < 100) {
      attempts++;
      const w = Math.floor(Math.random() * 6) + 8; // 8 to 14
      const h = Math.floor(Math.random() * 6) + 8;
      const x = Math.floor(Math.random() * (this.width - w - 4)) + 2;
      const y = Math.floor(Math.random() * (this.height - h - 4)) + 2;

      const newRoom = { x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2), type: 'normal' };

      // Overlap check with padding
      let overlap = false;
      for (const r of this.rooms) {
        if (
          x < r.x + r.w + 2 &&
          x + w + 2 > r.x &&
          y < r.y + r.h + 2 &&
          y + h + 2 > r.y
        ) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        this.carveRoom(newRoom);
        this.rooms.push(newRoom);
      }
    }

    // 2. Connect Rooms with 2-tile wide corridors
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const rA = this.rooms[i];
      const rB = this.rooms[i + 1];
      this.carveCorridor(rA.cx, rA.cy, rB.cx, rB.cy);
    }

    // 3. Assign Room Types & Special Encounters
    if (this.rooms.length > 0) {
      // Room 0: Start Room
      this.rooms[0].type = 'start';
      this.spawns.player = { x: this.rooms[0].cx * 16, y: this.rooms[0].cy * 16 };
      this.spawns.npc = { x: (this.rooms[0].cx + 2) * 16, y: this.rooms[0].cy * 16 };
      this.props.push({ type: 'campfire', x: this.rooms[0].cx * 16, y: (this.rooms[0].cy + 1) * 16 });

      // Furthest Room: Boss Arena
      const lastRoom = this.rooms[this.rooms.length - 1];
      lastRoom.type = 'boss';
      this.spawns.boss = { x: lastRoom.cx * 16, y: lastRoom.cy * 16, id: biomeConfig.bossId };
      this.spawns.portal = { x: lastRoom.cx * 16, y: (lastRoom.cy - 2) * 16 };

      // Middle Rooms: Shrines, Treasure Vaults, Combat Arenas
      for (let i = 1; i < this.rooms.length - 1; i++) {
        const r = this.rooms[i];
        if (i === 1) {
          r.type = 'treasure';
          this.spawns.chests.push({
            type: Math.random() > 0.5 ? 'gold' : 'wood',
            x: r.cx * 16,
            y: r.cy * 16
          });
        } else if (i === 2) {
          r.type = 'shrine';
          const shrineTypes = ['heal', 'mana', 'speed', 'time'];
          this.spawns.shrines.push({
            type: shrineTypes[Math.floor(Math.random() * shrineTypes.length)],
            x: r.cx * 16,
            y: r.cy * 16
          });
        } else {
          r.type = 'combat';
          // Spawn enemies
          const count = biomeConfig.enemyDensity || 3;
          for (let e = 0; e < count; e++) {
            const ex = r.x + 2 + Math.floor(Math.random() * (r.w - 4));
            const ey = r.y + 2 + Math.floor(Math.random() * (r.h - 4));
            const enemyType = biomeConfig.enemies[Math.floor(Math.random() * biomeConfig.enemies.length)];
            this.spawns.enemies.push({ type: enemyType, x: ex * 16, y: ey * 16 });
          }
          // Breakable Pots & Chest chance
          if (Math.random() > 0.4) {
            this.spawns.chests.push({
              type: 'wood',
              x: (r.x + 2) * 16,
              y: (r.y + 2) * 16
            });
          }
          for (let p = 0; p < 3; p++) {
            const px = r.x + 1 + Math.floor(Math.random() * (r.w - 2));
            const py = r.y + 1 + Math.floor(Math.random() * (r.h - 2));
            this.props.push({ type: 'pot', x: px * 16, y: py * 16 });
          }
        }

        // Add Torches to corners of rooms
        this.torches.push({ x: (r.x + 1) * 16, y: (r.y + 1) * 16 });
        this.torches.push({ x: (r.x + r.w - 2) * 16, y: (r.y + 1) * 16 });
      }
    }

    return {
      grid: this.grid,
      rooms: this.rooms,
      torches: this.torches,
      props: this.props,
      spawns: this.spawns,
      width: this.width,
      height: this.height
    };
  }

  carveRoom(room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          // Floor with random deco chances
          this.grid[y][x] = Math.random() < 0.08 ? 3 : 1;
        }
      }
    }
  }

  carveCorridor(x1, y1, x2, y2) {
    // Horizontal then vertical
    let curX = x1;
    let curY = y1;

    while (curX !== x2) {
      this.carveTile(curX, curY);
      this.carveTile(curX, curY + 1); // 2 tiles wide
      curX += curX < x2 ? 1 : -1;
    }

    while (curY !== y2) {
      this.carveTile(curX, curY);
      this.carveTile(curX + 1, curY);
      curY += curY < y2 ? 1 : -1;
    }
  }

  carveTile(x, y) {
    if (x > 1 && x < this.width - 2 && y > 1 && y < this.height - 2) {
      this.grid[y][x] = 1;
    }
  }
}
