// physics.js - Collision and Physics Module
import { CONFIG } from './config.js';
import { getTile } from './worldgen.js';

export function isSolid(x, y) {
  const tile = getTile(Math.floor(x), Math.floor(y));
  return tile !== CONFIG.AIR;
}

export function collideH(entity, dx) {
  // Horizontal collision check (simplified)
  const x = entity.x + dx;
  if (isSolid(x / CONFIG.TS, entity.y / CONFIG.TS) || 
      isSolid(x / CONFIG.TS, (entity.y + entity.h - 1) / CONFIG.TS)) {
    return 0;
  }
  return dx;
}

export function collideV(entity, dy) {
  // Vertical collision (gravity, jumping)
  const y = entity.y + dy;
  if (isSolid(entity.x / CONFIG.TS, y / CONFIG.TS) || 
      isSolid((entity.x + entity.w - 1) / CONFIG.TS, y / CONFIG.TS)) {
    return 0;
  }
  return dy;
}

export function applyGravity(entity) {
  entity.vy = Math.min(entity.vy + CONFIG.GRAV, 8); // terminal velocity
}