// ============================================================
// Player Module - Player State, Physics & Collision
// ============================================================

import { GRAV, JUMP, SPEED, TS, WH, WW } from './constants';
import { getBlock } from './world';
import { isSolid } from './constants';
import type { PlayerState } from '@/types/game';

/** Create a new player at spawn position */
export function createPlayer(spawnX: number, spawnY: number): PlayerState {
  return {
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    w: TS * 0.75,
    h: TS * 1.85,
    onGround: false,
    face: 1,
    wf: 0,
    wt: 0,
    hp: 20,
    maxHp: 20,
    hunger: 20,
    maxHunger: 20,
    inv: 0,
    poisonTimer: 0,
    attackCD: 0,
    arrowCD: 0,
    oxygen: 100,
    maxOxygen: 100,
  };
}

/** Apply vertical collision */
export function collideV(pl: PlayerState): void {
  const x0 = Math.floor(pl.x / TS);
  const x1 = Math.floor((pl.x + pl.w - 1) / TS);
  if (pl.vy > 0) {
    const y1 = Math.floor((pl.y + pl.h) / TS);
    if (isSolid(getBlock(x0, y1)) || isSolid(getBlock(x1, y1))) {
      pl.y = y1 * TS - pl.h;
      pl.vy = 0;
      pl.onGround = true;
    }
  } else if (pl.vy < 0) {
    const y0 = Math.floor(pl.y / TS);
    if (isSolid(getBlock(x0, y0)) || isSolid(getBlock(x1, y0))) {
      pl.y = (y0 + 1) * TS;
      pl.vy = 0;
    }
  }
}

/** Apply horizontal collision */
export function collideH(pl: PlayerState): void {
  const y0 = Math.floor((pl.y + 2) / TS);
  const y1 = Math.floor((pl.y + pl.h - 2) / TS);
  if (pl.vx > 0) {
    const x1 = Math.floor((pl.x + pl.w) / TS);
    if (isSolid(getBlock(x1, y0)) || isSolid(getBlock(x1, y1))) {
      pl.x = x1 * TS - pl.w;
      pl.vx = 0;
    }
  } else if (pl.vx < 0) {
    const x0 = Math.floor(pl.x / TS);
    if (isSolid(getBlock(x0, y0)) || isSolid(getBlock(x0, y1))) {
      pl.x = (x0 + 1) * TS;
      pl.vx = 0;
    }
  }
}

/** Handle player movement from input */
export function handleMovement(pl: PlayerState, keys: Record<string, boolean>): boolean {
  let mv = false;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    pl.vx = -SPEED;
    pl.face = -1;
    mv = true;
  } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    pl.vx = SPEED;
    pl.face = 1;
    mv = true;
  } else {
    pl.vx *= 0.65;
    if (Math.abs(pl.vx) < 0.2) pl.vx = 0;
  }

  // Walk animation
  if (mv && pl.onGround) {
    pl.wt++;
    if (pl.wt > 7) {
      pl.wf = (pl.wf + 1) % 4;
      pl.wt = 0;
    }
  } else if (!mv) {
    pl.wf = 0;
    pl.wt = 0;
  }

  // Jump
  if ((keys[' '] || keys['w'] || keys['W'] || keys['ArrowUp']) && pl.onGround) {
    pl.vy = JUMP;
  }

  return mv;
}

/** Apply physics (gravity, wrap) */
export function applyPhysics(pl: PlayerState, surf: Int32Array): void {
  // Gravity
  pl.vy += GRAV;
  if (pl.vy > 18) pl.vy = 18;

  // Move
  pl.x += pl.vx;
  collideH(pl);
  pl.y += pl.vy;
  collideV(pl);

  // Horizontal wrap-around for cyclic map
  if (pl.x < 0) pl.x += WW * TS;
  else if (pl.x > WW * TS - pl.w) pl.x -= WW * TS;

  // Fall into void - respawn at surface
  if (pl.y > WH * TS) {
    const sx = Math.floor(pl.x / TS);
    const wrappedSx = ((sx % 300) + 300) % 300;
    pl.y = (surf[wrappedSx] - 4) * TS;
    pl.vy = 0;
  }
}

/** Check ground state */
export function checkGround(pl: PlayerState): void {
  pl.onGround = false;
  const cx0 = Math.floor(pl.x / TS);
  const cx1 = Math.floor((pl.x + pl.w - 1) / TS);
  const cyb = Math.floor((pl.y + pl.h) / TS);
  if (isSolid(getBlock(cx0, cyb)) || isSolid(getBlock(cx1, cyb))) {
    pl.onGround = true;
  }
}

/** Apply hunger drain */
export function updateHunger(pl: PlayerState): boolean {
  if (pl.hunger > 0 && Math.random() < 0.001) {
    pl.hunger -= 0.1;
  }
  if (pl.hunger <= 0) {
    pl.hunger = 0;
    if (Math.random() < 0.02) {
      pl.hp -= 1;
      if (pl.hp <= 0) return true; // died
    }
  }
  return false;
}

/** Apply poison damage */
export function updatePoison(pl: PlayerState): boolean {
  if (pl.poisonTimer > 0) {
    pl.poisonTimer--;
    if (pl.poisonTimer % 40 === 0) {
      pl.hp -= 1;
      if (pl.hp <= 0) return true; // died
    }
  }
  return false;
}

/** Update oxygen (underwater) */
export function updateOxygen(pl: PlayerState): boolean {
  const pcx = Math.floor((pl.x + pl.w / 2) / TS);
  const pcy = Math.floor((pl.y + pl.h / 2) / TS);
  const inWater = getBlock(pcx, pcy) === 7; // WATER
  if (inWater) {
    pl.oxygen = Math.max(0, pl.oxygen - 0.28);
    if (pl.oxygen <= 0 && Math.random() < 0.02) {
      pl.hp -= 1;
      if (pl.hp <= 0) return true; // drowned
    }
  } else {
    pl.oxygen = Math.min(pl.maxOxygen, pl.oxygen + 0.6);
  }
  return false;
}

/** Heal player when hunger is full */
export function tryHeal(pl: PlayerState): void {
  if (pl.hunger >= pl.maxHunger && pl.hp < pl.maxHp) {
    pl.hp = Math.min(pl.maxHp, pl.hp + 1);
  }
}
