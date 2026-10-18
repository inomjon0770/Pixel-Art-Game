// Biome Definitions and Infinite Scaling Parameters
export const Biomes = {
  getBiomeForDepth(depth) {
    if (depth === 1) {
      return {
        id: 'forest',
        nameKey: 'biome_forest',
        ambientDarkness: 0.35,
        weather: 'rain',
        music: 'forest',
        tileFloor: 'tile_floor_forest',
        tileWall: 'tile_wall_forest',
        tileDeco: 'tile_deco_forest',
        enemies: ['slime', 'goblin'],
        bossId: 'sylvanus',
        bossNameKey: 'boss_1_name',
        torchColor: 'rgba(255, 200, 100, 0.85)',
        roomCount: 7,
        enemyDensity: 3
      };
    } else if (depth === 2) {
      return {
        id: 'crypt',
        nameKey: 'biome_crypt',
        ambientDarkness: 0.65,
        weather: 'none',
        music: 'crypt',
        tileFloor: 'tile_floor_crypt',
        tileWall: 'tile_wall_crypt',
        tileDeco: 'tile_deco_crypt',
        enemies: ['skeleton', 'necromancer'],
        bossId: 'malgath',
        bossNameKey: 'boss_2_name',
        torchColor: 'rgba(180, 100, 255, 0.85)',
        roomCount: 8,
        enemyDensity: 4
      };
    } else if (depth === 3) {
      return {
        id: 'magma',
        nameKey: 'biome_magma',
        ambientDarkness: 0.45,
        weather: 'magma_embers',
        music: 'magma',
        tileFloor: 'tile_floor_magma',
        tileWall: 'tile_wall_magma',
        tileDeco: 'tile_deco_magma',
        enemies: ['fire_demon', 'goblin'],
        bossId: 'ignis',
        bossNameKey: 'boss_3_name',
        torchColor: 'rgba(255, 100, 50, 0.9)',
        roomCount: 9,
        enemyDensity: 4
      };
    } else if (depth === 4) {
      return {
        id: 'frost',
        nameKey: 'biome_frost',
        ambientDarkness: 0.4,
        weather: 'snow',
        music: 'frost',
        tileFloor: 'tile_floor_frost',
        tileWall: 'tile_wall_frost',
        tileDeco: 'tile_deco_frost',
        enemies: ['frost_wisp', 'skeleton'],
        bossId: 'frostfang',
        bossNameKey: 'boss_4_name',
        torchColor: 'rgba(100, 200, 255, 0.85)',
        roomCount: 10,
        enemyDensity: 5
      };
    } else if (depth === 5) {
      return {
        id: 'void',
        nameKey: 'biome_void',
        ambientDarkness: 0.7,
        weather: 'void_motes',
        music: 'void',
        tileFloor: 'tile_floor_void',
        tileWall: 'tile_wall_void',
        tileDeco: 'tile_deco_void',
        enemies: ['void_stalker', 'necromancer', 'fire_demon'],
        bossId: 'chronos',
        bossNameKey: 'boss_5_name',
        torchColor: 'rgba(230, 100, 255, 0.95)',
        roomCount: 12,
        enemyDensity: 5
      };
    } else {
      // Endless Procedural Depths 6 ... ∞ (Random Composite Realm)
      const baseBiomes = ['forest', 'crypt', 'magma', 'frost', 'void'];
      const pick = baseBiomes[(depth - 6) % baseBiomes.length];
      const allEnemies = ['slime', 'goblin', 'skeleton', 'necromancer', 'fire_demon', 'frost_wisp', 'void_stalker'];
      
      return {
        id: pick,
        nameKey: 'biome_infinite',
        ambientDarkness: Math.min(0.8, 0.4 + (depth * 0.03)),
        weather: ['rain', 'snow', 'magma_embers', 'void_motes'][depth % 4],
        music: 'boss',
        tileFloor: `tile_floor_${pick}`,
        tileWall: `tile_wall_${pick}`,
        tileDeco: `tile_deco_${pick}`,
        enemies: allEnemies,
        bossId: ['sylvanus', 'malgath', 'ignis', 'frostfang', 'chronos'][depth % 5],
        bossNameKey: 'boss_infinite_name',
        torchColor: 'rgba(250, 200, 255, 0.9)',
        roomCount: Math.min(16, 8 + Math.floor(depth / 2)),
        enemyDensity: Math.min(8, 4 + Math.floor(depth / 3)),
        isInfiniteDepth: true,
        statMultiplier: 1 + (depth - 5) * 0.35 // 35% stronger HP/damage per depth
      };
    }
  }
};
