// Main entry point
import { CONFIG } from './config.js';
import { genWorld, gb, sb } from './worldgen.js';
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
  updatePlayer();
  updateCamera(gameState.player);
  render(gameState);
  requestAnimationFrame(gameLoop);
}