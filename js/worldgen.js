// worldgen.js - World Generation Module
import { CONFIG } from './config.js';
import { BLOCKS, getBlockInfo } from './blocks.js';

export let world = [];
export let surf = []; // Surface height map

export function genWorld() {
  console.log('🌍 Generating world...');
  const { WW, WH } = CONFIG;
  
  // Initialize world grid (use 2D for simplicity, original uses 1D Uint8Array)
  world = Array.from({length: WH}, () => Array(WW).fill(CONFIG.AIR));
  
  // Enhanced terrain with original noise ideas
  for (let x = 0; x < WW; x++) {
    const height = Math.floor(WH * 0.65) + Math.floor(Math.sin(x / 8) * 8 + Math.random()*3);
    surf[x] = height;
    
    for (let y = 0; y < WH; y++) {
      if (y > height + 3) {
        world[y][x] = CONFIG.STONE;
      } else if (y > height) {
        world[y][x] = CONFIG.DIRT;
      } else if (y === height) {
        world[y][x] = CONFIG.GRASS;
      } else if (y > height - 5) {
        world[y][x] = CONFIG.DIRT;
      } else {
        world[y][x] = CONFIG.STONE;
      }
      // TODO: rivers, trees, ores
    }
  }
  
  console.log('✅ World generated with', WW, 'x', WH);
  return { world, surf };
}

export function gb(x, y) { // get block
  if (y < 0 || y >= CONFIG.WH) return CONFIG.BED;
  x = ((x % CONFIG.WW) + CONFIG.WW) % CONFIG.WW;
  return world[y][x];
}

export function sb(x, y, v) { // set block
  if (y < 0 || y >= CONFIG.WH) return;
  x = ((x % CONFIG.WW) + CONFIG.WW) % CONFIG.WW;
  world[y][x] = v;
}

export function getTile(tx, ty) {
  return {x: tx, y: ty, id: gb(tx, ty)};
}