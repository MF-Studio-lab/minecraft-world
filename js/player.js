// player.js - Player System
import { CONFIG } from './config.js';
import { collideH, collideV, applyGravity } from './physics.js';

export let player = {
  x: 0, y: 0,
  vx: 0, vy: 0,
  w: CONFIG.PLAYER_W || 20,
  h: CONFIG.PLAYER_H || 40,
  hp: CONFIG.MAX_HP,
  hunger: CONFIG.MAX_HUNGER
};

export function updatePlayer() {
  // TODO: Integrate input, movement, mining
  applyGravity(player);
  
  player.x += collideH(player, player.vx);
  player.y += collideV(player, player.vy);
  
  // Ground check / reset velocity
  if (player.vy > 0 && collideV(player, 1) === 0) {
    player.vy = 0;
  }
}

export function initPlayer(surf) {
  const startX = Math.floor(CONFIG.WW / 2);
  player.x = startX * CONFIG.TS + CONFIG.TS / 2 - player.w / 2;
  player.y = (surf[startX] - 4) * CONFIG.TS;
  console.log('👤 Player initialized at', player.x, player.y);
}