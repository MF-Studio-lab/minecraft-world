// Main entry point
import { CONFIG } from './config.js';
import { genWorld } from './worldgen.js';
import { BLOCKS } from './blocks.js';
import { initPlayer, player, updatePlayer } from './player.js';
import { initRender, render, updateCamera } from './render.js';
import { initInput, handlePlayerInput } from './input.js';

let gameRunning = false;
let gameState = {};

export function initGame() {
  if (gameRunning) return;
  gameRunning = true;

  console.log('🚀 Initializing full game...');
  
  const worldData = genWorld();
  gameState.world = worldData.world;
  gameState.surf = worldData.surf;
  
  initPlayer(gameState.surf);
  gameState.player = player;
  
  initRender();
  initInput();
  
  console.log('✅ All modules loaded, BLOCKS count:', Object.keys(BLOCKS).length);
  
  gameLoop();
}

function gameLoop() {
  // Ensure input is processed
  if (gameState.player) {
    handlePlayerInput(gameState.player);  // Direct call for responsiveness
    updatePlayer();
    updateCamera(gameState.player);
  }
  render(gameState);
  requestAnimationFrame(gameLoop);
}