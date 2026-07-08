// Main entry point for Minecraft World 2.4 Refactored
import { CONFIG } from './config.js';
import { genWorld } from './worldgen.js';
import { BLOCKS } from './blocks.js';
import { initPlayer, player } from './player.js';

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
  
  // Player initialization
  initPlayer(gameState.surf);
  gameState.player = player; // from player.js
  
  console.log('🌍 World generated successfully');
  console.log('📦 Blocks system ready with', Object.keys(BLOCKS).length, 'block types');
  console.log('👤 Player ready');
  
  // Start game loop
  gameLoop();
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