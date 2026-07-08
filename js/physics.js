// physics.js - Improved Collision
import { CONFIG } from './config.js';
import { gb } from './worldgen.js';

export function applyGravity(entity) {
  entity.vy = (entity.vy || 0) + CONFIG.GRAV;
  if (entity.vy > 8) entity.vy = 8;
}

export function collideH(entity, dx) {
  let newX = entity.x + dx;
  const left = Math.floor(newX / CONFIG.TS);
  const right = Math.floor((newX + entity.w - 1) / CONFIG.TS);
  const top = Math.floor(entity.y / CONFIG.TS);
  const bottom = Math.floor((entity.y + entity.h - 1) / CONFIG.TS);
  
  for (let x = left; x <= right; x++) {
    for (let y = top; y <= bottom; y++) {
      if (gb(x, y) !== CONFIG.AIR && gb(x, y) !== CONFIG.WATER) {
        return 0;
      }
    }
  }
  return dx;
}

export function collideV(entity, dy) {
  let newY = entity.y + dy;
  const left = Math.floor(entity.x / CONFIG.TS);
  const right = Math.floor((entity.x + entity.w - 1) / CONFIG.TS);
  const top = Math.floor(newY / CONFIG.TS);
  const bottom = Math.floor((newY + entity.h - 1) / CONFIG.TS);
  
  for (let x = left; x <= right; x++) {
    for (let y = top; y <= bottom; y++) {
      if (gb(x, y) !== CONFIG.AIR && gb(x, y) !== CONFIG.WATER) {
        if (dy > 0) entity.vy = 0; // land
        return 0;
      }
    }
  }
  return dy;
}