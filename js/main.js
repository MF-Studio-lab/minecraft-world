// Main entry point
import { CONFIG } from './config.js';
import { genWorld } from './worldgen.js';
import { BLOCKS } from './blocks.js';
import { initPlayer, player, updatePlayer } from './player.js';
import { initRender, render, updateCamera } from './render.js';
import { initInput } from './input.js';

let gameRunning = false;
let gameState = {};

export async function initGame() {
  if (gameRunning) return;
  gameRunning = true;

  console.log('🚀 Initializing full game...');
  
  // World
  const worldData = genWorld();
  gameState.world = worldData.world;
  gameState.surf = worldData.surf;
  
  // Player
  initPlayer(gameState.surf);
  gameState.player = player;
  
  // Render
  initRender();
  
  // Input
  initInput();
  
  console.log('✅ All modules loaded, BLOCKS count:', Object.keys(BLOCKS).length);
  
  // Game loop
  gameLoop();
}

function gameLoop() {
  // Basic update/render
  if (gameState.player) {
    updatePlayer();
    updateCamera(gameState.player);
  }
  render(gameState);
  requestAnimationFrame(gameLoop);
}

// Auto-init fallback
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('📦 Modules ready');
  });
}