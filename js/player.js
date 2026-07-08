// player.js - Player System
import { CONFIG } from './config.js';
import { applyGravity, collideH, collideV } from './physics.js';
import { handlePlayerInput } from './input.js';

export let player = {
  x: 0, y: 0, vx: 0, vy: 0,
  w: CONFIG.PLAYER_W, h: CONFIG.PLAYER_H,
  hp: CONFIG.MAX_HP, hunger: CONFIG.MAX_HUNGER
};

export function initPlayer(surf) {
  const startX = Math.floor(CONFIG.WW / 2);
  player.x = startX * CONFIG.TS + CONFIG.TS / 2 - player.w / 2;
  player.y = (surf[startX] - 4) * CONFIG.TS;
  player.vx = player.vy = 0;
  console.log('👤 Player initialized at', player.x, player.y);
}

export function updatePlayer() {
  handlePlayerInput(player);
  
  applyGravity(player);
  
  // Apply movement with collision
  player.x += collideH(player, player.vx);
  player.y += collideV(player, player.vy);
  
  // Grounded check
  if (player.vy > 0) {
    const testY = player.y + player.h;
    if (/* simple ground detect */) {
      player.vy = 0;
    }
  }
  
  // Keep in bounds
  if (player.x < 0) player.x = 0;
  if (player.x > CONFIG.WW * CONFIG.TS) player.x = CONFIG.WW * CONFIG.TS;
}