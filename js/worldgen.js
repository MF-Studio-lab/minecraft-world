// worldgen.js - World Generation Module
import { CONFIG } from './config.js';
import { BLOCKS } from './blocks.js';

export let world = [];
export let surf = []; // Surface height map

export function genWorld() {
  console.log('🌍 Generating world...');
  const { WW, WH } = CONFIG;
  
  // Initialize world grid
  world = Array(WH).fill().map(() => Array(WW).fill(CONFIG.AIR));
  
  // Simple terrain generation (to be enhanced with original logic)
  for (let x = 0; x < WW; x++) {
    const height = Math.floor(WH * 0.6) + Math.floor(Math.sin(x / 10) * 5);
    surf[x] = height;
    
    for (let y = 0; y < WH; y++) {
      if (y > height) {
        world[y][x] = CONFIG.DIRT;
      } else if (y === height) {
        world[y][x] = CONFIG.GRASS;
      } else if (y > height - 4) {
        world[y][x] = CONFIG.DIRT;
      } else {
        world[y][x] = CONFIG.STONE;
      }
    }
  }
  
  console.log('✅ World generated');
  return { world, surf };
}

export function getTile(x, y) {
  if (x < 0 || x >= CONFIG.WW || y < 0 || y >= CONFIG.WH) return CONFIG.AIR;
  return world[y][x];
}

export function setBlock(x, y, blockId) {
  if (x >= 0 && x < CONFIG.WW && y >= 0 && y < CONFIG.WH) {
    world[y][x] = blockId;
  }
}