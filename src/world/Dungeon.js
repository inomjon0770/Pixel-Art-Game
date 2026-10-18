// Dungeon Runtime Manager & Collision Grid
import { MapGenerator } from './MapGenerator.js';
import { Biomes } from './Biomes.js';
import { sprites } from '../engine/Sprites.js';

export class Dungeon {
  constructor(depth = 1) {
    this.depth = depth;
    this.biome = Biomes.getBiomeForDepth(depth);
    this.generator = new MapGenerator(50, 50);
    this.mapData = null;

    this.enemies = [];
    this.boss = null;
    this.npcs = [];
    this.chests = [];
    this.shrines = [];
    this.loot = [];
    this.projectiles = [];
    this.props = [];

    this.explored = []; // Fog of War 2D array (true/false)
    this.portalActive = false;

    this.init();
  }

  init() {
    this.biome = Biomes.getBiomeForDepth(this.depth);
    this.mapData = this.generator.generate(this.biome);

    this.explored = Array(this.mapData.height).fill(false).map(() => Array(this.mapData.width).fill(false));
    this.portalActive = false;
  }

  // Check if tile at (gridX, gridY) blocks movement
  isSolid(gx, gy) {
    if (gx < 0 || gx >= this.mapData.width || gy < 0 || gy >= this.mapData.height) {
      return true;
    }
    const tile = this.mapData.grid[gy][gx];
    return tile === 2 || tile === 0; // Wall or Void
  }

  // Check world coordinate collision (circle or box)
  isWorldSolid(x, y, radius = 6) {
    const minGx = Math.floor((x - radius) / 16);
    const maxGx = Math.floor((x + radius) / 16);
    const minGy = Math.floor((y - radius) / 16);
    const maxGy = Math.floor((y + radius) / 16);

    for (let gy = minGy; gy <= maxGy; gy++) {
      for (let gx = minGx; gx <= maxGx; gx++) {
        if (this.isSolid(gx, gy)) {
          return true;
        }
      }
    }
    return false;
  }

  // Reveal fog of war around player
  revealFog(worldX, worldY, radius = 7) {
    const centerGx = Math.floor(worldX / 16);
    const centerGy = Math.floor(worldY / 16);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const gx = centerGx + dx;
        const gy = centerGy + dy;
        if (gx >= 0 && gx < this.mapData.width && gy >= 0 && gy < this.mapData.height) {
          if (dx * dx + dy * dy <= radius * radius) {
            this.explored[gy][gx] = true;
          }
        }
      }
    }
  }

  // Render dungeon tiles with viewport culling
  render(ctx, camera) {
    const startGx = Math.max(0, Math.floor(camera.x / 16));
    const endGx = Math.min(this.mapData.width, Math.ceil((camera.x + camera.width / camera.zoom) / 16) + 1);
    const startGy = Math.max(0, Math.floor(camera.y / 16));
    const endGy = Math.min(this.mapData.height, Math.ceil((camera.y + camera.height / camera.zoom) / 16) + 1);

    for (let gy = startGy; gy < endGy; gy++) {
      for (let gx = startGx; gx < endGx; gx++) {
        if (!this.explored[gy][gx]) continue;

        const tileType = this.mapData.grid[gy][gx];
        const screenX = Math.round(gx * 16 - camera.x);
        const screenY = Math.round(gy * 16 - camera.y);

        let sprite = null;
        if (tileType === 1) {
          sprite = sprites.get(this.biome.tileFloor);
        } else if (tileType === 2) {
          sprite = sprites.get(this.biome.tileWall);
        } else if (tileType === 3) {
          sprite = sprites.get(this.biome.tileDeco);
        }

        if (sprite) {
          ctx.drawImage(sprite, screenX, screenY);
        }
      }
    }
  }
}
