// ============================================================
// Game Engine - Main Loop, State Management & Interactions
// ============================================================

import {
  AIR, BEDROCK, DIAMOND_PICK, GRASS, HARDNESS, LEAVES, SAPLING, SEED,
  TS, TORCH, WATER, WOOD, WOOD_PICK, TOOL_POWER, WOOD_SWORD, DIAMOND_SWORD,
  FOOD_VALUE, POISON_CHANCE,
} from './constants';
import { genWorld, getBlock, getSurfArray, setBlock, placeTree } from './world';
import { createCamera, updateCamera } from './camera';
import { createPlayer, handleMovement, applyPhysics, checkGround, updateHunger, updatePoison, updateOxygen, tryHeal } from './player';
import { Entity, Projectile } from './entity';
import { CraftingSystem } from './crafting';
import { spawnAnimals, spawnMonsters } from './spawner';
import {
  renderSky, drawBlock, drawPlayer, drawHUD, drawParticles,
  drawDepthOverlay, drawSelectionBox, drawInstructions, isNightTime, roundRect,
} from './renderer';
import type { BreakingProgress, Particle, PlayerState, Sapling, CameraState } from '@/types/game';

// ─── Game State ─────────────────────────────────────────────
export interface GameState {
  // Canvas
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;

  // World
  worldGenerated: boolean;
  surf: Int32Array | null;

  // Player
  pl: PlayerState;
  cam: CameraState;

  // Entities
  entities: Entity[];
  projectiles: Projectile[];

  // Game data
  score: number;
  hotbar: number[];
  slot: number;
  inventory: Record<number, number>;
  particles: Particle[];
  plantedSaplings: Sapling[];
  breaking: BreakingProgress | null;
  placeCD: number;

  // Time
  dayTime: number;
  daySpeed: number;
  lastMonsterSpawn: number;
  respawnTimer: number;

  // Input
  keys: Record<string, boolean>;
  mx: number;
  my: number;
  mleft: boolean;

  // UI state
  craftingOpen: boolean;
  crafting: CraftingSystem;
  gameOver: boolean;
  deathReason: string;
  started: boolean;

  // Messages
  messages: Array<{ text: string; time: number }>;

  // Mobile
  isMobile: boolean;

  // Callbacks
  onStateChange?: (state: Partial<GameState>) => void;
}

/** Initialize game state */
export function createGameState(canvas: HTMLCanvasElement): GameState {
  const ctx = canvas.getContext('2d')!;
  const W = Math.min(window.innerWidth, 1024);
  const H = Math.min(window.innerHeight, 640);
  canvas.width = W;
  canvas.height = H;

  return {
    canvas,
    ctx,
    W,
    H,
    worldGenerated: false,
    surf: null,
    pl: createPlayer(0, 0),
    cam: createCamera(),
    entities: [],
    projectiles: [],
    score: 0,
    hotbar: [GRASS, 2, 3, WOOD, 13, 6, 15, 16], // GRASS, DIRT, STONE, WOOD, PLANK, SAND, GLASS, TORCH
    slot: 0,
    inventory: {},
    particles: [],
    plantedSaplings: [],
    breaking: null,
    placeCD: 0,
    dayTime: 6200,
    daySpeed: 0.8,
    lastMonsterSpawn: 0,
    respawnTimer: 1200 + Math.floor(Math.random() * 600),
    keys: {},
    mx: 0,
    my: 0,
    mleft: false,
    craftingOpen: false,
    crafting: new CraftingSystem(),
    gameOver: false,
    deathReason: '',
    started: false,
    messages: [],
    isMobile: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

/** Resize canvas */
export function resizeCanvas(state: GameState): void {
  state.W = Math.min(window.innerWidth, 1024);
  state.H = Math.min(window.innerHeight, 640);
  state.canvas.width = state.W;
  state.canvas.height = state.H;
}

/** Start the game */
export function startGame(state: GameState, daySpeed?: number): void {
  if (state.started) return;
  state.started = true;
  state.daySpeed = daySpeed ?? 0.8;

  genWorld();
  state.surf = getSurfArray();

  const sx = Math.floor(300 / 2); // WW/2
  state.pl = createPlayer(
    sx * TS + TS / 2 - (TS * 0.75) / 2,
    (state.surf[sx] - 4) * TS
  );

  state.cam = createCamera();
  state.cam.x = state.pl.x + state.pl.w / 2 - state.W / 2;
  state.cam.y = state.pl.y + state.pl.h / 2 - state.H / 2;

  state.entities = [];
  state.projectiles = [];
  state.particles = [];
  state.plantedSaplings = [];
  state.score = 0;
  state.inventory = {};
  state.dayTime = 6200;
  state.lastMonsterSpawn = 0;
  state.gameOver = false;
  state.craftingOpen = false;
  state.breaking = null;

  // Spawn initial animals
  const newEntities = spawnAnimals(state.pl.x, true, []);
  state.entities = newEntities;

  state.worldGenerated = true;
}

// Helper to get surf
function getSurf(): Int32Array {
  return getSurfArray();
}

/** Show message */
export function showMsg(state: GameState, text: string): void {
  state.messages.push({ text, time: Date.now() });
  // Keep only last 5 messages
  if (state.messages.length > 5) state.messages.shift();
}

/** Spawn particles */
export function spawnParticles(state: GameState, tx: number, ty: number, block: number): void {
  const colors: Record<number, string> = {
    [GRASS]: '#4a9b2a',
    [2]: '#7a5230', // DIRT
    [3]: '#787878', // STONE
    [WOOD]: '#5a3a1a',
    [LEAVES]: '#2a6a1a', // LEAVES
    [6]: '#c8b460', // SAND
    [WATER]: '#1878cc',
    [BEDROCK]: '#2a2a2a',
    [9]: '#1a1a1a', // COAL
    [10]: '#d4885a', // IRON
    [11]: '#FFD700', // GOLD
    [12]: '#5dddff', // DIAMOND
    [13]: '#b8843a', // PLANK
    [14]: '#9a3c2c', // BRICK
    [15]: '#a8d8f0', // GLASS
    [TORCH]: '#ff8c00',
  };
  const col = colors[block] || '#888';
  for (let i = 0; i < 10; i++) {
    state.particles.push({
      x: tx * TS + TS / 2,
      y: ty * TS + TS / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -5 - 1,
      life: 25 + Math.random() * 20,
      color: col,
      sz: 3 + Math.random() * 4,
    });
  }
}

/** Get tile under mouse */
export function getMouseTile(state: GameState): { x: number; y: number } {
  const camX = state.cam.renderX;
  return {
    x: Math.floor((state.mx + camX) / TS),
    y: Math.floor((state.my + state.cam.y) / TS),
  };
}

/** Check if tile is within reach */
export function tileReach(state: GameState, tx: number, ty: number): boolean {
  let dx = tx * TS + TS / 2 - (state.pl.x + state.pl.w / 2);
  const worldPx = 300 * TS; // WW * TS
  while (dx > worldPx / 2) dx -= worldPx;
  while (dx < -worldPx / 2) dx += worldPx;
  const dy = ty * TS + TS / 2 - (state.pl.y + state.pl.h / 2);
  return Math.hypot(dx, dy) < 5.5 * TS;
}

/** Handle player death */
export function die(state: GameState, reason: string): void {
  state.gameOver = true;
  state.deathReason = reason;
  if (state.onStateChange) {
    state.onStateChange({ gameOver: true, deathReason: reason });
  }
}

/** Respawn player */
export function respawn(state: GameState): void {
  state.pl.hp = state.pl.maxHp;
  state.pl.hunger = state.pl.maxHunger;
  state.pl.poisonTimer = 0;
  const sx = Math.floor(300 / 2); // WW/2
  state.pl.x = sx * TS + TS / 2 - state.pl.w / 2;
  state.pl.y = (getSurf()[sx] - 4) * TS;
  state.pl.vx = 0;
  state.pl.vy = 0;
  state.score = Math.floor(state.score * 0.5);

  state.entities = state.entities.filter((e) => e.type !== 'zombie' && e.type !== 'skeleton');
  state.projectiles = [];
  state.gameOver = false;

  if (state.onStateChange) {
    state.onStateChange({ gameOver: false });
  }
}

/** Handle eating food */
export function eatFood(state: GameState): void {
  const foods = [35, 36, 37, 38, 17, 18, 19, 20, 21]; // COOKED_* + raw + ROTTEN
  for (const food of foods) {
    if ((state.inventory[food] || 0) > 0) {
      state.inventory[food]--;
      if (state.inventory[food] <= 0) delete state.inventory[food];

      const val = FOOD_VALUE[food] || 2;
      state.pl.hunger = Math.min(state.pl.maxHunger, state.pl.hunger + val);

      if (POISON_CHANCE[food] && Math.random() < POISON_CHANCE[food]) {
        state.pl.poisonTimer = 600;
        showMsg(state, '\u2620 你吃了腐肉，中毒了!');
      } else {
        showMsg(state, `\uD83C\uDF56 吃了 ${getItemName(food)}，飢餓度 +${val}`);
      }

      tryHeal(state.pl);

      // Eat particles
      for (let i = 0; i < 5; i++) {
        state.particles.push({
          x: state.pl.x + state.pl.w / 2,
          y: state.pl.y,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * -2 - 1,
          life: 30,
          color: '#e67e22',
          sz: 4,
        });
      }
      return;
    }
  }
  showMsg(state, '\u274C 沒有食物可以吃!');
}

/** Place a block */
export function placeBlock(state: GameState): void {
  if (state.placeCD > 0) return;
  const t = getMouseTile(state);
  if (!tileReach(state, t.x, t.y) || getBlock(t.x, t.y) !== AIR) return;

  const px0 = Math.floor(state.pl.x / TS);
  const px1 = Math.floor((state.pl.x + state.pl.w - 1) / TS);
  const py0 = Math.floor(state.pl.y / TS);
  const py1 = Math.floor((state.pl.y + state.pl.h - 1) / TS);
  if (t.x >= px0 && t.x <= px1 && t.y >= py0 && t.y <= py1) return; // Don't place on player

  const item = state.hotbar[state.slot];

  // Planting seeds
  if (item === SEED) {
    if (getBlock(t.x, t.y) === AIR && getBlock(t.x, t.y + 1) === 2) { // DIRT
      if ((state.inventory[item] || 0) > 0) {
        state.inventory[item]--;
        if (state.inventory[item] <= 0) delete state.inventory[item];
        setBlock(t.x, t.y, SAPLING);
        state.plantedSaplings.push({ x: t.x, y: t.y, t: 0 });
        showMsg(state, '種下了 樹苗');
      } else {
        showMsg(state, '\u274C 沒有種子!');
      }
    } else {
      showMsg(state, '\u274C 只能種在土上');
    }
    return;
  }

  if (!isPlaceableBlock(item)) {
    showMsg(state, `\u274C ${getItemName(item)} 不能放置!`);
    return;
  }

  if ((state.inventory[item] || 0) > 0 || item === GRASS) {
    if (item !== GRASS) {
      state.inventory[item]--;
      if (state.inventory[item] <= 0) delete state.inventory[item];
    }
    setBlock(t.x, t.y, item);
    state.placeCD = 12;
    showMsg(state, `放置了 ${getItemName(item)}`);
  } else {
    showMsg(state, `\u274C ${getItemName(item)} 數量不足!`);
  }
}

/** Check if a block is placeable */
function isPlaceableBlock(item: number): boolean {
  return item <= 16; // TORCH = 16, anything higher is tool/food
}

/** Get item name */
function getItemName(item: number): string {
  const names: Record<number, string> = {
    [GRASS]: '草地', [2]: '泥土', [3]: '石頭', [WOOD]: '原木',
    [13]: '木板', [6]: '沙子', [15]: '玻璃', [16]: '火把',
    [SEED]: '種子', [SAPLING]: '樹苗',
  };
  return names[item] || '未知';
}

// ─── Main Update ────────────────────────────────────────────
export function update(state: GameState): void {
  if (!state.started || state.gameOver || state.craftingOpen) return;

  // Advance time
  state.dayTime = (state.dayTime + state.daySpeed) % 24000;

  // Hunger
  if (updateHunger(state.pl)) {
    die(state, '餓死了');
    return;
  }

  // Poison
  if (updatePoison(state.pl)) {
    die(state, '中毒而死');
    return;
  }

  // Oxygen
  if (updateOxygen(state.pl)) {
    die(state, '溺水而亡');
    return;
  }

  // Monster spawning
  const night = isNightTime(state.dayTime);
  const sinceLastMonster = state.lastMonsterSpawn === 0
    ? Infinity
    : (state.dayTime - state.lastMonsterSpawn + 24000) % 24000;

  if (night && (state.lastMonsterSpawn === 0 || sinceLastMonster > 2000)) {
    const result = spawnMonsters(state.pl.x, night, state.entities);
    state.entities = result.entities;
    if (result.spawned) {
      state.lastMonsterSpawn = state.dayTime;
    }
  }
  if (!night) {
    state.entities = state.entities.filter((e) => e.type !== 'zombie' && e.type !== 'skeleton');
    state.lastMonsterSpawn = 0;
  }

  // Player movement
  checkGround(state.pl);
  handleMovement(state.pl, state.keys);
  applyPhysics(state.pl, state.surf || getSurf());

  // Attack / mining
  handleAttack(state);

  if (state.pl.attackCD > 0) state.pl.attackCD--;
  if (state.pl.arrowCD > 0) state.pl.arrowCD--;
  if (state.placeCD > 0) state.placeCD--;

  // Respawn timer
  state.respawnTimer--;
  if (state.respawnTimer <= 0) {
    const newEntities = spawnAnimals(state.pl.x, false, state.entities);
    state.entities = newEntities;
    state.respawnTimer = 1200 + Math.floor(Math.random() * 600);
  }

  // Sapling growth
  for (let i = state.plantedSaplings.length - 1; i >= 0; i--) {
    const s = state.plantedSaplings[i];
    s.t++;
    if (s.t > 720) {
      const below = getBlock(s.x, s.y + 1);
      if (below === 2 || below === GRASS) { // DIRT or GRASS
        placeTree(s.x, s.y + 1);
        setBlock(s.x, s.y, AIR);
        showMsg(state, '\uD83C\uDF33 樹苗長成大樹！');
      }
      state.plantedSaplings.splice(i, 1);
    }
  }

  // Entity updates
  for (const e of state.entities) {
    e.update(
      state.pl.x,
      state.pl.y,
      night,
      (dmg, reason) => {
        state.pl.hp -= dmg;
        state.pl.hunger = Math.max(0, state.pl.hunger - 2);
        state.pl.vx = (state.pl.x - e.x) > 0 ? 5 : -5;
        state.pl.vy = -3;
        showMsg(state, `殭屍咬了你! -${dmg}HP`);
        if (state.pl.hp <= 0) die(state, reason);
      },
      (x, y, vx, vy, type, dmg) => {
        state.projectiles.push(new Projectile(x, y, vx, vy, type, dmg));
      }
    );
  }
  state.entities = state.entities.filter((e) => !e.dead);

  // Projectile updates
  for (const p of state.projectiles) {
    p.update();
    // Check player hit
    if (p.type === 'skeleton_arrow' && !p.dead) {
      if (
        Math.abs(p.x - (state.pl.x + state.pl.w / 2)) < TS &&
        Math.abs(p.y - (state.pl.y + state.pl.h / 2)) < TS
      ) {
        state.pl.hp -= p.dmg;
        state.pl.hunger = Math.max(0, state.pl.hunger - 0.5);
        p.dead = true;
        showMsg(state, `\uD83C\uDFF9 被箭射中了! -${p.dmg}HP`);
        if (state.pl.hp <= 0) die(state, '被骷髏的箭射死了');
      }
    }
    // Check mob hit by player arrow
    if (p.type === 'player_arrow' && !p.dead) {
      for (const e of state.entities) {
        if (!e.dead && (e.type === 'zombie' || e.type === 'skeleton')) {
          if (Math.abs(p.x - (e.x + e.w / 2)) < e.w && Math.abs(p.y - (e.y + e.h / 2)) < e.h) {
            e.takeDamage(p.dmg);
            p.dead = true;
            state.score += 5;
            showMsg(state, `\uD83C\uDFF9 擊中了 ${e.type}! -${p.dmg}HP`);
            break;
          }
        }
      }
    }
  }
  state.projectiles = state.projectiles.filter((p) => !p.dead);

  // Particles
  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life--;
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  // Camera
  updateCamera(state.cam, state.pl.x + state.pl.w / 2, state.pl.y + state.pl.h / 2, state.W, state.H);

  // Clean old messages
  const now = Date.now();
  state.messages = state.messages.filter((m) => now - m.time < 3000);
}

/** Handle attack/mining */
function handleAttack(state: GameState): void {
  if (!state.mleft || state.pl.attackCD > 0) return;

  const t = getMouseTile(state);
  let hitEntity = false;

  // Check entity hit
  for (const e of state.entities) {
    if (!e.dead && e.type !== 'fish') {
      const ex = Math.floor(e.x / TS);
      const ey = Math.floor(e.y / TS);
      if (t.x === ex && t.y === ey && tileReach(state, t.x, t.y)) {
        let dmg = 2;
        const held = state.hotbar[state.slot];
        if (TOOL_POWER[held]) dmg = TOOL_POWER[held];
        if (held >= WOOD_SWORD && held <= DIAMOND_SWORD) dmg += 2;
        e.takeDamage(dmg);
        state.pl.attackCD = 15;
        hitEntity = true;
        state.score += 2;
        e.vx = (e.x - state.pl.x) > 0 ? 3 : -3;
        e.vy = -4;
        showMsg(state, `擊中了 ${e.type === 'zombie' ? '殭屍' : e.type === 'skeleton' ? '骷髏' : e.type}! -${dmg}HP`);
        spawnParticles(state, t.x, t.y, e.type === 'zombie' ? 21 : e.type === 'skeleton' ? 22 : WOOD);

        // Drop loot on kill
        if (e.dead) {
          const loot = e.getLoot();
          for (const drop of loot) {
            state.inventory[drop.item] = (state.inventory[drop.item] || 0) + drop.count;
          }
          state.score += 10;
        }
        break;
      }
    }
  }

  // Check fish catch
  if (!hitEntity) {
    const b = getBlock(t.x, t.y);
    if (b === WATER && tileReach(state, t.x, t.y)) {
      for (const e of state.entities) {
        if (!e.dead && e.type === 'fish') {
          const ex = Math.floor(e.x / TS);
          const ey = Math.floor(e.y / TS);
          if (Math.abs(t.x - ex) <= 3 && Math.abs(t.y - ey) <= 3) {
            e.takeDamage(5);
            state.pl.attackCD = 15;
            hitEntity = true;
            state.score += 2;
            showMsg(state, '\uD83D\uDC1F 抓到了一條魚!');
            break;
          }
        }
      }
    }
  }

  // Block breaking
  if (!hitEntity) {
    const b = getBlock(t.x, t.y);
    if (tileReach(state, t.x, t.y) && b !== AIR && b !== BEDROCK) {
      if (!state.breaking || state.breaking.x !== t.x || state.breaking.y !== t.y) {
        let maxHard = HARDNESS[b] || 10;
        const held = state.hotbar[state.slot];
        if (held >= WOOD_PICK && held <= DIAMOND_PICK && (b === 3 || b === 9 || b === 10 || b === 11 || b === 12)) {
          maxHard = Math.max(1, maxHard - TOOL_POWER[held] * 2);
        }
        state.breaking = { x: t.x, y: t.y, p: 0, max: maxHard };
      }
      state.breaking.p++;
      if (state.breaking.p >= state.breaking.max) {
        // Drop items
        if (b === WOOD) {
          state.inventory[WOOD] = (state.inventory[WOOD] || 0) + 1;
        } else if (b === LEAVES) {
          if (Math.random() < 0.12) state.inventory[SEED] = (state.inventory[SEED] || 0) + 1;
          if (Math.random() < 0.08) state.inventory[WOOD] = (state.inventory[WOOD] || 0) + 1;
        } else if (b >= GRASS && b <= 15) { // GRASS to GLASS
          state.inventory[b] = (state.inventory[b] || 0) + 1;
        } else if (b >= 9 && b <= 12) { // Ores
          state.inventory[b] = (state.inventory[b] || 0) + 1;
        }

        spawnParticles(state, t.x, t.y, b);
        setBlock(t.x, t.y, AIR);
        state.breaking = null;
        state.score += 1;
      }
    } else {
      state.breaking = null;
    }
  } else if (!state.mleft) {
    state.breaking = null;
  }
}

// ─── Main Render ────────────────────────────────────────────
export function render(state: GameState): void {
  const { ctx, W, H } = state;

  if (!state.started) {
    // Loading screen
    ctx.fillStyle = '#1a6b2a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('\u26CF\uFE0F 正在準備世界...', W / 2, H / 2);
    return;
  }

  // Sky
  renderSky(ctx, state.dayTime, W, H, state.cam.x, state.cam.y);

  // Depth darkness
  const surf = state.surf || getSurf();
  drawDepthOverlay(ctx, state.pl.y, state.pl.h, surf, state.pl.x, W, H);

  // World tiles
  const cam = state.cam;
  const sx0 = Math.floor(cam.renderX / TS) - 2;
  const sx1 = Math.ceil((cam.renderX + W) / TS) + 2;
  const sy0 = Math.floor(cam.y / TS) - 1;
  const sy1 = Math.ceil((cam.y + H) / TS) + 1;

  for (let ty = sy0; ty <= sy1; ty++) {
    for (let tx = sx0; tx <= sx1; tx++) {
      const b = getBlock(tx, ty);
      if (b === AIR) continue;
      const bx = Math.round(tx * TS - cam.renderX);
      const by = Math.round(ty * TS - cam.y);
      let bp = 0, bmax = 1;
      if (state.breaking && state.breaking.x === tx && state.breaking.y === ty) {
        bp = state.breaking.p;
        bmax = state.breaking.max;
      }
      drawBlock(ctx, b, bx, by, TS, bp, bmax);
    }
  }

  // Particles
  drawParticles(ctx, state.particles, cam.renderX, cam.y);

  // Entities
  for (const e of state.entities) {
    e.draw(ctx, cam.renderX, cam.y, W, H);
  }

  // Projectiles
  for (const p of state.projectiles) {
    p.draw(ctx, cam.renderX, cam.y, W);
  }

  // Player
  drawPlayer(ctx, state.pl, cam.renderX, cam.y, state.mleft, state.hotbar, state.slot);

  // Selection box
  const t = getMouseTile(state);
  drawSelectionBox(ctx, t.x, t.y, cam.renderX, cam.y, tileReach(state, t.x, t.y));

  // HUD
  drawHUD(
    ctx, state.pl, state.hotbar, state.slot, state.score, state.dayTime,
    state.inventory, W, H, state.mx, state.my,
    () => getMouseTile(state),
    (tx, ty) => tileReach(state, tx, ty)
  );

  // Messages
  drawMessages(state);

  // Instructions
  drawInstructions(ctx, state.dayTime, W, H);
}

/** Draw on-screen messages */
function drawMessages(state: GameState): void {
  const { ctx, W } = state;
  const startY = 80;
  ctx.textAlign = 'center';
  ctx.font = '14px monospace';

  state.messages.forEach((msg, i) => {
    const age = (Date.now() - msg.time) / 3000;
    const alpha = 1 - age;
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.7})`;
    const tw = ctx.measureText(msg.text).width + 20;
    roundRect(ctx, W / 2 - tw / 2, startY + i * 28, tw, 24, 4);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillText(msg.text, W / 2, startY + i * 28 + 17);
  });
}

// ─── Game Loop ──────────────────────────────────────────────
export function gameLoop(state: GameState): void {
  update(state);
  render(state);
  requestAnimationFrame(() => gameLoop(state));
}
