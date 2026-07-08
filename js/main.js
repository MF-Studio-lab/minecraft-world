// Main entry point for Minecraft World 2.4 Refactored
import { CONFIG } from './config.js';
import { genWorld } from './worldgen.js';
import { BLOCKS } from './blocks.js';

let gameState = {
  canvas: null,
  ctx: null,
  world: null,
  player: null,
  // ... other state
};

export function initGame() {
  console.log('🚀 Minecraft World Refactored initialized');
  
  // World generation
  const worldData = genWorld();
  gameState.world = worldData.world;
  gameState.surf = worldData.surf;
  
  console.log('🌍 World generated successfully');
  console.log('📦 Blocks system ready with', Object.keys(BLOCKS).length, 'block types');
  
  // TODO: player init, rendering, input, etc. (next modules)
}

export function gameLoop() {
  // update();
  // render();
  requestAnimationFrame(gameLoop);
}

// Auto start when imported
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initGame();
  });
}