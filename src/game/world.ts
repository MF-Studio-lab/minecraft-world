// ============================================================
// World Module - World Data Storage, Block Operations & Generation
// ============================================================

import { AIR, BEDROCK, COAL, DIAMOND, DIRT, GOLD, GRASS, IRON, LEAVES, SAND, WATER, WH, WOOD, WW } from './constants';
import { on } from './noise';

// ─── World Data ─────────────────────────────────────────────
/** The world data stored as a flat Uint8Array */
let world: Uint8Array;
/** Surface height at each x coordinate */
let surf: Int32Array;
/** Rivers data: array of path points */
let rivers: Array<Array<{ x: number; y: number }>> = [];

/** Initialize world array */
export function initWorld(): void {
  world = new Uint8Array(WW * WH);
  surf = new Int32Array(WW);
}

/** Get block at world coordinates (with horizontal wrap) */
export function getBlock(x: number, y: number): number {
  if (y < 0 || y >= WH) return BEDROCK;
  // Wrap horizontally so map is cyclic
  x = ((x % WW) + WW) % WW;
  return world[y * WW + x];
}

/** Set block at world coordinates (with horizontal wrap) */
export function setBlock(x: number, y: number, v: number): void {
  if (y < 0 || y >= WH) return;
  x = ((x % WW) + WW) % WW;
  world[y * WW + x] = v;
}

/** Get surface height at x */
export function getSurf(x: number): number {
  x = ((x % WW) + WW) % WW;
  return surf[x];
}

/** Get the surface array (read-only reference) */
export function getSurfArray(): Int32Array {
  return surf;
}

/** Get rivers */
export function getRivers(): Array<Array<{ x: number; y: number }>> {
  return rivers;
}

/** Get the raw world data */
export function getWorldData(): Uint8Array {
  return world;
}

// ─── World Generation ───────────────────────────────────────
export function genWorld(): void {
  initWorld();
  rivers = [];

  // Generate surface heights using noise
  for (let x = 0; x < WW; x++) {
    surf[x] = Math.floor(WH * 0.45 + on(x / 60, 0) * 18 + on(x / 20, 17) * 6 - 10);
    surf[x] = Math.max(20, Math.min(WH - 20, surf[x]));
  }

  // Generate river paths
  for (let r = 0; r < 3; r++) {
    const river: Array<{ x: number; y: number }> = [];
    let rx = Math.floor(Math.random() * (WW - 40)) + 20;
    let ry = surf[rx];
    for (let step = 0; step < 80; step++) {
      river.push({ x: rx, y: ry });
      rx += Math.floor(Math.random() * 3) - 1;
      if (rx < 5 || rx >= WW - 5) break;
      ry = surf[rx];
    }
    rivers.push(river);
  }

  // Generate terrain columns
  for (let x = 0; x < WW; x++) {
    const sh = surf[x];
    for (let y = 0; y < WH; y++) {
      if (y >= WH - 1) {
        setBlock(x, y, BEDROCK);
        continue;
      }
      if (y < sh) continue; // Above surface = air

      // Check if in river
      let inRiver = false;
      for (const river of rivers) {
        for (const pt of river) {
          const dx = x - pt.x;
          const dy = y - pt.y;
          if (Math.abs(dx) <= 2 && Math.abs(dy) <= 1 && y > sh) {
            inRiver = true;
            break;
          }
        }
        if (inRiver) break;
      }

      if (inRiver) {
        setBlock(x, y, WATER);
        continue;
      }

      if (y === sh) {
        // Surface layer
        const bio = on(x / 70, 55);
        setBlock(x, y, bio > 0.65 ? SAND : GRASS);
      } else if (y < sh + 5) {
        // Subsurface
        const bio = on(x / 70, 55);
        setBlock(x, y, bio > 0.65 ? SAND : DIRT);
      } else {
        // Deep underground
        const cv = on(x / 12, 77) * on(x / 8, 33) + on(y / 10, 99) * on(y / 7, 44);
        if (cv > 0.52 && y > sh + 8) continue; // Caves (air)

        const dep = y - sh;
        const r = Math.sin(x * 3.1 + y * 7.3) * 43758.5453;
        const rf = r - Math.floor(r);
        if (dep > 52 && rf < 0.012) setBlock(x, y, DIAMOND);
        else if (dep > 32 && rf < 0.025) setBlock(x, y, GOLD);
        else if (dep > 16 && rf < 0.045) setBlock(x, y, IRON);
        else if (rf < 0.07) setBlock(x, y, COAL);
        else setBlock(x, y, 3); // STONE
      }
    }
  }

  // Water flow simulation
  for (let flow = 0; flow < 20; flow++) {
    for (let x = 0; x < WW; x++) {
      for (let y = WH - 2; y >= 0; y--) {
        if (getBlock(x, y) === WATER) {
          if (y + 1 < WH && getBlock(x, y + 1) === AIR) setBlock(x, y + 1, WATER);
          if (x + 1 < WW && getBlock(x + 1, y) === AIR) setBlock(x + 1, y, WATER);
          if (x - 1 >= 0 && getBlock(x - 1, y) === AIR) setBlock(x - 1, y, WATER);
        }
      }
    }
  }

  // Trees
  for (let x = 5; x < WW - 5; x++) {
    if (Math.random() < 0.055 && getBlock(x, surf[x]) === GRASS) {
      placeTree(x, surf[x]);
    }
  }
}

/** Place a tree at the given position */
export function placeTree(x: number, base: number): void {
  const h = 4 + Math.floor(Math.random() * 3);
  // Trunk
  for (let i = 1; i <= h; i++) {
    setBlock(x, base - i, WOOD);
  }
  // Leaves
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 0; dy++) {
      if (Math.abs(dx) + Math.abs(dy) <= 3) {
        const lx = x + dx;
        const ly = base - h + 1 + dy;
        if (getBlock(lx, ly) === AIR) setBlock(lx, ly, LEAVES);
      }
    }
  }
  // Top leaf
  setBlock(x, base - h - 1, LEAVES);
}

/** Horizontal wrap distance (shortest path) */
export function wrapDistance(a: number, b: number): number {
  let d = ((a - b) % WW + WW) % WW;
  if (d > WW / 2) d -= WW;
  return d;
}

/** Wrap X coordinate to valid world range */
export function wrapX(x: number): number {
  return ((x % WW) + WW) % WW;
}
