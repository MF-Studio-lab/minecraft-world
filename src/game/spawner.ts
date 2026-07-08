// ============================================================
// Spawner Module - Entity Spawning with Bug Fixes
// ============================================================

import { GRASS, TS, WATER, WH, WW } from './constants';
import { getBlock, getSurfArray, wrapX } from './world';
import { Entity } from './entity';

// ─── Spawn Animals ──────────────────────────────────────────
/**
 * Spawn passive animals (pig, cow, chicken) and fish.
 * BUG FIX #1: Animals now spawn ON the grass surface, not floating above it.
 * Previously: spawnY = (surf-1)*TS - TS*0.8 (spawned in AIR, fell through)
 * Now: spawnY = surf*TS - entity.h (entity stands on grass block)
 */
export function spawnAnimals(
  playerX: number,
  reset: boolean,
  existingEntities: Entity[]
): Entity[] {
  const entities = reset ? [] : existingEntities.filter((e) =>
    e.type === 'pig' || e.type === 'cow' || e.type === 'chicken' || e.type === 'fish'
  );

  const spawnX = Math.floor(playerX / TS);
  const surf = getSurfArray();

  // Find nearby grass positions
  const nearbyPositions: Array<{ x: number; y: number }> = [];
  for (let i = -10; i <= 10; i++) {
    const x = wrapX(spawnX + i);
    if (x >= 5 && x < WW - 5) {
      const sy = surf[x];
      if (getBlock(x, sy) === GRASS) {
        // BUG FIX: Spawn ON the grass block surface, not above it
        // Entity height is TS*0.8, so place entity so its bottom touches the grass
        const spawnY = (sy + 1) * TS - TS * 0.8;
        nearbyPositions.push({ x: x * TS, y: spawnY });
      }
    }
  }

  // Spawn animals at nearby positions
  let animalCount = 0;
  for (const pos of nearbyPositions) {
    if (animalCount >= 20) break;
    if (Math.random() < 0.5) {
      const r = Math.random();
      if (r < 0.35) entities.push(new Entity(pos.x, pos.y, 'pig'));
      else if (r < 0.65) entities.push(new Entity(pos.x, pos.y, 'cow'));
      else entities.push(new Entity(pos.x, pos.y, 'chicken'));
      animalCount++;
    }
  }

  // Fallback: spawn more animals further away if nearby count is low
  if (animalCount < 10) {
    for (let i = 0; i < 30 && animalCount < 15; i++) {
      const x = wrapX(Math.floor(spawnX + (Math.random() - 0.5) * 120));
      const sy = surf[x];
      if (getBlock(x, sy) !== GRASS) continue;
      // BUG FIX: Same fix for fallback spawns
      const spawnY = (sy + 1) * TS - TS * 0.8;
      const r = Math.random();
      if (r < 0.35) entities.push(new Entity(x * TS, spawnY, 'pig'));
      else if (r < 0.65) entities.push(new Entity(x * TS, spawnY, 'cow'));
      else entities.push(new Entity(x * TS, spawnY, 'chicken'));
      animalCount++;
    }
  }

  // Spawn fish in water
  let fishCount = 0;
  const playerXTile = Math.floor(playerX / TS);
  for (let dx = -18; dx <= 18 && fishCount < 20; dx++) {
    const x = wrapX(playerXTile + dx);
    for (let y = 0; y < WH && fishCount < 20; y++) {
      if (getBlock(x, y) === WATER && Math.random() < 0.12) {
        entities.push(new Entity(x * TS + TS / 2, y * TS + TS / 2, 'fish'));
        fishCount++;
      }
    }
  }
  for (let x = 0; x < WW && fishCount < 50; x++) {
    for (let y = 0; y < WH && fishCount < 50; y++) {
      if (getBlock(x, y) === WATER && Math.random() < 0.02) {
        entities.push(new Entity(x * TS + TS / 2, y * TS + TS / 2, 'fish'));
        fishCount++;
      }
    }
  }

  return entities;
}

// ─── Spawn Monsters ─────────────────────────────────────────
export function spawnMonsters(
  playerX: number,
  isNight: boolean,
  existingEntities: Entity[]
): { entities: Entity[]; spawned: boolean } {
  if (!isNight) {
    // Remove all hostile mobs during day
    return {
      entities: existingEntities.filter((e) => e.type !== 'zombie' && e.type !== 'skeleton'),
      spawned: false,
    };
  }

  const entities = [...existingEntities];
  const spawnCount = Math.floor(Math.random() * 3) + 2;
  const playerXTile = Math.floor(playerX / TS);
  const surf = getSurfArray();
  let anySpawned = false;

  for (let i = 0; i < spawnCount; i++) {
    const side = Math.random() > 0.5 ? 1 : -1;
    let x = playerXTile + side * (10 + Math.floor(Math.random() * 8));
    x = wrapX(x);
    let spawned = false;

    // Try to find valid spawn position
    for (let offset = 0; offset < 12 && !spawned; offset++) {
      const gx = wrapX(x + side * offset);
      const dist = Math.abs(((gx - playerXTile + WW / 2) % WW + WW) % WW - WW / 2);
      if (dist < 6) continue;

      const sy = surf[gx];
      if (sy <= 2) continue;
      // BUG FIX: Same spawn height fix for monsters
      if (getBlock(gx, sy) === GRASS && getBlock(gx, sy - 1) === 0) { // AIR
        const spawnY = (sy + 1) * TS - TS * 0.8;
        if (Math.random() > 0.5) {
          entities.push(new Entity(gx * TS, spawnY, 'zombie'));
        } else {
          entities.push(new Entity(gx * TS, spawnY, 'skeleton'));
        }
        spawned = true;
        anySpawned = true;
      }
    }

    // Fallback spawn
    if (!spawned) {
      const fallbackX = wrapX(playerXTile + side * 14);
      const sy = surf[fallbackX];
      if (getBlock(fallbackX, sy) === GRASS && getBlock(fallbackX, sy - 1) === 0) {
        const spawnY = (sy + 1) * TS - TS * 0.8;
        if (Math.random() > 0.5) {
          entities.push(new Entity(fallbackX * TS, spawnY, 'zombie'));
        } else {
          entities.push(new Entity(fallbackX * TS, spawnY, 'skeleton'));
        }
        anySpawned = true;
      }
    }
  }

  return { entities, spawned: anySpawned };
}
