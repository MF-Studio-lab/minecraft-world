// ============================================================
// Renderer Module - Canvas Drawing, Sky, HUD, Blocks, Entities
// ============================================================

import {
  AIR, BLOCK_COLORS, DIAMOND_PICK, GOLD_PICK,
  IRON_PICK, STONE_PICK, TORCH, TS, WATER, WOOD_PICK, WOOD_SWORD,
  STONE_SWORD, IRON_SWORD, GOLD_SWORD, DIAMOND_SWORD, WOOD, PLANK,
  NAMES, GRASS,
} from './constants';
import { getBlock } from './world';
import { wrapRenderX } from './camera';
import type { Particle, PlayerState } from '@/types/game';

// ─── Drawing Utilities ──────────────────────────────────────
export function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

// ─── Sky & Celestial Bodies ─────────────────────────────────
export function renderSky(cx: CanvasRenderingContext2D, dayTime: number, W: number, H: number, camX: number, camY: number): void {
  cx.fillStyle = skyColor(dayTime);
  cx.fillRect(0, 0, W, H);

  // Stars at night
  if (isNightTime(dayTime)) {
    const ns = 120;
    for (let i = 0; i < ns; i++) {
      const sx = ((i * 137.5) % 300) * TS * 0.1;
      const sy = ((i * 83.3) % (100 * 0.35)) * TS * 0.1;
      const blink = Math.sin(Date.now() * 0.002 + i * 1.3) > 0.3 ? 1 : 0.4;
      cx.globalAlpha = blink * 0.85;
      cx.fillStyle = '#fff';
      cx.fillRect((sx - camX * 0.05 + W * 5) % W, (sy - camY * 0.03 + 100 * 3) % H, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
    cx.globalAlpha = 1;
  }

  // Sun / Moon
  const ang = (dayTime / 24000) * Math.PI * 2 - Math.PI / 2;
  const rad = Math.min(W, H) * 0.42;
  const sunX = W / 2 + Math.cos(ang) * rad;
  const sunY = H / 2 + Math.sin(ang) * rad * 0.45;

  if (!isNightTime(dayTime)) {
    // Sun
    cx.save();
    const grd = cx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 30);
    grd.addColorStop(0, '#fff9a0');
    grd.addColorStop(1, '#FFD700');
    cx.fillStyle = grd;
    cx.beginPath();
    cx.arc(sunX, sunY, 24, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = 'rgba(255,220,0,0.5)';
    cx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cx.beginPath();
      cx.moveTo(sunX + Math.cos(a) * 27, sunY + Math.sin(a) * 27);
      cx.lineTo(sunX + Math.cos(a) * 38, sunY + Math.sin(a) * 38);
      cx.stroke();
    }
    cx.restore();
  } else {
    // Moon
    const ma = ang + Math.PI;
    const moonX = W / 2 + Math.cos(ma) * rad;
    const moonY = H / 2 + Math.sin(ma) * rad * 0.45;
    cx.fillStyle = '#e8e8d0';
    cx.beginPath();
    cx.arc(moonX, moonY, 18, 0, Math.PI * 2);
    cx.fill();
    cx.fillStyle = 'rgba(0,0,20,0.4)';
    cx.beginPath();
    cx.arc(moonX + 5, moonY - 4, 14, 0, Math.PI * 2);
    cx.fill();
  }
}

/** Calculate sky color based on dayTime */
function skyColor(dayTime: number): string {
  function lerp(a: number, b: number, f: number): number {
    return Math.round(a + (b - a) * f);
  }
  function lc(a: number, b: number, f: number): string {
    const [ar, ag, ab] = [a >> 16, (a >> 8) & 0xff, a & 0xff];
    const [br, bg, bb] = [b >> 16, (b >> 8) & 0xff, b & 0xff];
    return `rgb(${lerp(ar, br, f)},${lerp(ag, bg, f)},${lerp(ab, bb, f)})`;
  }
  const NIGHT = 0x0a0a24;
  const DAWN = 0xff6030;
  const DAY = 0x87ceeb;
  const DUSK = 0xff5020;
  const t = dayTime;

  if (t < 4200) return lc(NIGHT, NIGHT, 0);
  if (t < 5200) return lc(NIGHT, DAWN, (t - 4200) / 1000);
  if (t < 6500) return lc(DAWN, DAY, (t - 5200) / 1300);
  if (t < 17500) return lc(DAY, DAY, 0);
  if (t < 18500) return lc(DAY, DUSK, (t - 17500) / 1000);
  if (t < 19500) return lc(DUSK, NIGHT, (t - 18500) / 1000);
  return lc(NIGHT, NIGHT, 0);
}

export function isNightTime(dayTime: number): boolean {
  return dayTime < 5000 || dayTime > 19000;
}

// ─── Block Rendering ────────────────────────────────────────
export function drawBlock(
  cx: CanvasRenderingContext2D,
  b: number,
  bx: number,
  by: number,
  sz: number,
  bp: number,
  bmax: number
): void {
  if (b === AIR) return;
  const d = BLOCK_COLORS[b];
  if (!d) return;
  const [base, light, ore] = d;

  if (b === WATER) cx.globalAlpha = 0.72;
  if (b === 15) cx.globalAlpha = 0.55; // GLASS

  cx.fillStyle = base;
  cx.fillRect(bx, by, sz, sz);

  cx.fillStyle = light;
  cx.fillRect(bx, by, sz, Math.ceil(sz * 0.22));

  if (b === GRASS) {
    cx.fillStyle = '#7a5230';
    cx.fillRect(bx, by + Math.ceil(sz * 0.22), sz, sz - Math.ceil(sz * 0.22));
  }
  if (b === WOOD) {
    cx.fillStyle = d[2] || '#8a6236';
    cx.fillRect(bx + sz * 0.3, by, sz * 0.4, sz);
  }
  if (b === PLANK) {
    cx.fillStyle = d[2] || '#9a7030';
    cx.fillRect(bx, by + sz * 0.48, sz, 2);
    cx.fillRect(bx + sz * 0.5 - 1, by, 2, sz * 0.48);
  }
  if (b === 14) { // BRICK
    cx.fillStyle = d[2] || '#7a2c20';
    cx.fillRect(bx, by + sz * 0.5, sz, 2);
    cx.fillRect(bx + sz * 0.25, by, 2, sz * 0.5);
    cx.fillRect(bx + sz * 0.75, by + sz * 0.5 + 2, 2, sz * 0.5 - 2);
  }
  if (b === TORCH) {
    cx.fillStyle = '#ff8c00';
    cx.fillRect(bx + sz * 0.4, by, sz * 0.2, sz * 0.35);
    cx.fillStyle = '#ffee00';
    cx.fillRect(bx + sz * 0.43, by + sz * 0.05, sz * 0.14, sz * 0.2);
  }
  if (ore) {
    cx.fillStyle = ore;
    const spots: [number, number][] = [[0.15, 0.2], [0.55, 0.15], [0.65, 0.55], [0.2, 0.65], [0.4, 0.4]];
    for (const [sx, sy] of spots) {
      cx.fillRect(bx + sx * sz, by + sy * sz, sz * 0.13, sz * 0.13);
    }
  }

  cx.globalAlpha = 1;
  cx.strokeStyle = 'rgba(0,0,0,0.22)';
  cx.lineWidth = 0.5;
  cx.strokeRect(bx + 0.5, by + 0.5, sz - 1, sz - 1);

  // Breaking animation overlay
  if (bp > 0 && bmax > 0) {
    const prog = bp / bmax;
    cx.fillStyle = `rgba(0,0,0,${prog * 0.65})`;
    cx.fillRect(bx, by, sz, sz);
    cx.strokeStyle = `rgba(255,255,255,${prog * 0.9})`;
    cx.lineWidth = 1;
    if (prog > 0.2) line(cx, bx + sz * 0.3, by, bx + sz * 0.1, by + sz * 0.55);
    if (prog > 0.4) line(cx, bx + sz * 0.55, by, bx + sz * 0.8, by + sz * 0.6);
    if (prog > 0.6) line(cx, bx, by + sz * 0.35, bx + sz, by + sz * 0.65);
    if (prog > 0.8) line(cx, bx + sz * 0.2, by, bx + sz * 0.4, by + sz);
  }
}

function line(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

// ─── Player Rendering ───────────────────────────────────────
/**
 * BUG FIX #2: Use wrapRenderX for player to prevent disappearing at boundaries.
 * Previously: x = pl.x - renderCamX (no wrapping, huge offset when crossing boundary)
 * Now: x = wrapRenderX(pl.x, renderCamX) - renderCamX (consistent with entities)
 */
export function drawPlayer(
  cx: CanvasRenderingContext2D,
  pl: PlayerState,
  renderCamX: number,
  camY: number,
  mleft: boolean,
  hotbar: number[],
  slot: number
): void {
  // BUG FIX: Use wrapRenderX for consistent boundary rendering
  const wrappedX = wrapRenderX(pl.x, renderCamX);
  const x = Math.round(wrappedX - renderCamX);
  const y = Math.round(pl.y - camY);
  const w = pl.w;
  const h = pl.h;
  const f = pl.face;
  const leg = pl.onGround ? Math.sin(pl.wf * Math.PI / 2) * 0.3 : 0;

  // Shadow
  cx.fillStyle = 'rgba(0,0,0,0.25)';
  cx.beginPath();
  cx.ellipse(x + w / 2, y + h + 2, w * 0.55, 4, 0, 0, Math.PI * 2);
  cx.fill();

  // Legs
  cx.fillStyle = '#2a4a7a';
  cx.save();
  cx.translate(x + w * 0.27, y + h * 0.73);
  cx.rotate(leg);
  cx.fillRect(-w * 0.17, 0, w * 0.32, h * 0.27);
  cx.restore();
  cx.save();
  cx.translate(x + w * 0.67, y + h * 0.73);
  cx.rotate(-leg);
  cx.fillRect(-w * 0.15, 0, w * 0.32, h * 0.27);
  cx.restore();

  // Body
  cx.fillStyle = '#3a72d0';
  cx.fillRect(x + w * 0.08, y + h * 0.38, w * 0.84, h * 0.37);

  // Arms
  cx.fillStyle = '#e8a070';
  if (mleft) {
    const sw = Math.sin(Date.now() * 0.022) * 0.6;
    cx.save();
    cx.translate(x + (f > 0 ? w * 0.92 : w * 0.08), y + h * 0.4);
    cx.rotate(f * (0.6 + sw));
    cx.fillRect(-w * 0.1, 0, w * 0.2, h * 0.3);
    cx.restore();
  } else {
    cx.fillRect(x + (f > 0 ? w * 0.82 : w * 0.02), y + h * 0.4, w * 0.16, h * 0.3);
  }
  cx.fillRect(x + (f > 0 ? w * 0.02 : w * 0.82), y + h * 0.4, w * 0.16, h * 0.3);

  // Head
  cx.fillStyle = '#e8a070';
  cx.fillRect(x + w * 0.12, y, w * 0.76, h * 0.37);

  // Hair
  cx.fillStyle = '#3a2008';
  cx.fillRect(x + w * 0.12, y, w * 0.76, h * 0.1);
  cx.fillRect(x + w * 0.12, y, w * 0.1, h * 0.22);
  if (f < 0) cx.fillRect(x + w * 0.78, y, w * 0.1, h * 0.22);

  // Eyes
  cx.fillStyle = '#1a1a1a';
  if (f > 0) {
    cx.fillRect(x + w * 0.52, y + h * 0.1, w * 0.16, h * 0.1);
    cx.fillRect(x + w * 0.72, y + h * 0.1, w * 0.06, h * 0.1);
  } else {
    cx.fillRect(x + w * 0.22, y + h * 0.1, w * 0.06, h * 0.1);
    cx.fillRect(x + w * 0.32, y + h * 0.1, w * 0.16, h * 0.1);
  }

  // Mouth
  cx.fillStyle = '#c0705a';
  cx.fillRect(x + w * 0.3, y + h * 0.26, w * 0.4, h * 0.05);

  // Held item
  const hb = hotbar[slot];
  if (hb && hb !== AIR) {
    const heldX = f > 0 ? x + w + 2 : x - TS - 2;
    const heldY = y + h * 0.45;

    if (hb >= WOOD_SWORD && hb <= DIAMOND_SWORD) {
      cx.fillStyle =
        hb === WOOD_SWORD ? '#8B4513' : hb === STONE_SWORD ? '#888' :
        hb === IRON_SWORD ? '#aaa' : hb === GOLD_SWORD ? '#FFD700' : '#5dddff';
      cx.fillRect(heldX, heldY, TS * 0.8, TS * 0.2);
      cx.fillRect(heldX + TS * 0.3, heldY - TS * 0.6, TS * 0.2, TS * 0.8);
    } else if (hb >= WOOD_PICK && hb <= DIAMOND_PICK) {
      cx.fillStyle =
        hb === WOOD_PICK ? '#8B4513' : hb === STONE_PICK ? '#888' :
        hb === IRON_PICK ? '#aaa' : hb === GOLD_PICK ? '#FFD700' : '#5dddff';
      cx.fillRect(heldX, heldY, TS * 0.8, TS * 0.15);
      cx.fillRect(heldX + TS * 0.1, heldY - TS * 0.5, TS * 0.6, TS * 0.3);
      cx.fillRect(heldX + TS * 0.35, heldY - TS * 0.2, TS * 0.1, TS * 0.2);
    } else if (hb === 34) { // BOW
      cx.strokeStyle = '#8B4513';
      cx.lineWidth = 2;
      cx.beginPath();
      cx.arc(heldX + TS * 0.4, heldY + TS * 0.4, TS * 0.3, -Math.PI / 2, Math.PI / 2);
      cx.stroke();
    } else {
      drawBlock(cx, hb, heldX, heldY, TS * 0.8, 0, 1);
    }

    cx.fillStyle = '#fff';
    cx.font = 'bold 10px monospace';
    cx.textAlign = 'center';
    cx.fillText(NAMES[hb] || '?', heldX + TS * 0.4, heldY - 5);
  }

  // Poison overlay
  if (pl.poisonTimer > 0 && Math.floor(Date.now() / 200) % 2 === 0) {
    cx.fillStyle = 'rgba(0,255,0,0.2)';
    cx.fillRect(x, y, w, h);
  }
}

// ─── HUD Rendering ──────────────────────────────────────────
export function drawHUD(
  cx: CanvasRenderingContext2D,
  pl: PlayerState,
  hotbar: number[],
  slot: number,
  score: number,
  dayTime: number,
  inventory: Record<number, number>,
  W: number,
  H: number,
  mx: number,
  my: number,
  getTileFn: () => { x: number; y: number },
  tileReachFn: (tx: number, ty: number) => boolean
): void {
  // Hotbar background
  const n = hotbar.length;
  const sw = n * 54 + 8;
  const hx = (W - sw) / 2;
  const hy = H - 72;

  cx.fillStyle = 'rgba(20,20,20,0.75)';
  roundRect(cx, hx - 4, hy - 4, sw + 8, 62, 8);
  cx.fill();
  cx.strokeStyle = 'rgba(255,255,255,0.15)';
  cx.lineWidth = 1;
  roundRect(cx, hx - 4, hy - 4, sw + 8, 62, 8);
  cx.stroke();

  // Hotbar slots
  for (let i = 0; i < n; i++) {
    const bx = hx + i * 54;
    const by = hy;
    const b = hotbar[i];

    cx.fillStyle = i === slot ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.3)';
    roundRect(cx, bx, by, 50, 50, 5);
    cx.fill();

    if (i === slot) {
      cx.strokeStyle = '#fff';
      cx.lineWidth = 2.5;
      roundRect(cx, bx - 1, by - 1, 52, 52, 6);
      cx.stroke();
    }

    // Draw hotbar item
    drawHotbarItem(cx, b, bx + 5, by + 5, 40);

    // Count
    const cnt = inventory[b] || 0;
    if (cnt > 0) {
      cx.fillStyle = '#fff';
      cx.font = 'bold 11px monospace';
      cx.textAlign = 'right';
      cx.fillText(String(cnt), bx + 49, by + 49);
    }
    cx.fillStyle = 'rgba(255,255,255,0.5)';
    cx.font = '10px monospace';
    cx.textAlign = 'left';
    cx.fillText(String(i + 1), bx + 3, by + 12);
  }

  // Selected item name
  const sname = NAMES[hotbar[slot]] || '';
  cx.fillStyle = 'rgba(20,20,20,0.7)';
  cx.font = '13px monospace';
  const tw = cx.measureText('選擇：' + sname).width + 18;
  roundRect(cx, (W - tw) / 2, hy - 32, tw, 22, 5);
  cx.fill();
  cx.fillStyle = '#fff';
  cx.textAlign = 'center';
  cx.fillText('選擇：' + sname, W / 2, hy - 15);

  // HP bar
  cx.fillStyle = 'rgba(20,20,20,0.7)';
  roundRect(cx, 10, 10, 170, 26, 5);
  cx.fill();
  const hpW = 150 * (pl.hp / pl.maxHp);
  cx.fillStyle = '#e74c3c';
  cx.fillRect(15, 15, hpW, 16);
  cx.fillStyle = '#fff';
  cx.font = 'bold 13px monospace';
  cx.textAlign = 'left';
  cx.fillText(`\u2764 ${pl.hp}/${pl.maxHp}`, 18, 27);

  // Hunger bar
  cx.fillStyle = 'rgba(20,20,20,0.7)';
  roundRect(cx, 10, 42, 170, 26, 5);
  cx.fill();
  const hgW = 150 * (pl.hunger / pl.maxHunger);
  cx.fillStyle = '#e67e22';
  cx.fillRect(15, 47, hgW, 16);
  cx.fillStyle = '#fff';
  cx.fillText(`\uD83C\uDF56 ${Math.floor(pl.hunger)}/${pl.maxHunger}`, 18, 59);

  // Oxygen bar
  cx.fillStyle = 'rgba(20,20,20,0.7)';
  roundRect(cx, 10, 74, 170, 26, 5);
  cx.fill();
  const oxW = 150 * (pl.oxygen / pl.maxOxygen);
  cx.fillStyle = '#4fc3f7';
  cx.fillRect(15, 79, oxW, 16);
  cx.fillStyle = '#fff';
  cx.fillText(`\uD83D\uDCA8 ${Math.floor(pl.oxygen)}/${pl.maxOxygen}`, 18, 91);

  // Poison indicator
  if (pl.poisonTimer > 0) {
    cx.fillStyle = 'rgba(0,100,0,0.7)';
    roundRect(cx, 10, 106, 120, 22, 5);
    cx.fill();
    cx.fillStyle = '#0f0';
    cx.fillText(`\u2620 中毒 ${Math.ceil(pl.poisonTimer / 60)}s`, 18, 121);
  }

  // Time of day
  const timeStr = isNightTime(dayTime) ? '\uD83C\uDF19 夜晚' : '\u2600\uFE0F 白天';
  cx.fillStyle = 'rgba(20,20,20,0.7)';
  roundRect(cx, W - 110, 10, 100, 26, 5);
  cx.fill();
  cx.fillStyle = '#fff';
  cx.font = '13px monospace';
  cx.textAlign = 'center';
  cx.fillText(timeStr, W - 60, 27);

  // Score
  cx.fillStyle = 'rgba(20,20,20,0.7)';
  roundRect(cx, W - 110, 42, 100, 26, 5);
  cx.fill();
  cx.fillStyle = '#ffd700';
  cx.fillText(`\u2B50 ${score}`, W - 60, 59);

  // Block tooltip
  const tt = getTileFn();
  const tb = getBlock(tt.x, tt.y);
  if (tb !== AIR && tileReachFn(tt.x, tt.y)) {
    const nm = NAMES[tb] || '?';
    cx.font = '13px monospace';
    const tml = cx.measureText(nm).width + 20;
    cx.fillStyle = 'rgba(20,20,20,0.85)';
    roundRect(cx, mx - tml / 2, my - 34, tml, 22, 5);
    cx.fill();
    cx.fillStyle = '#ffd700';
    cx.textAlign = 'center';
    cx.fillText(nm, mx, my - 18);
  }
}

function drawHotbarItem(cx: CanvasRenderingContext2D, item: number, x: number, y: number, sz: number): void {
  if (item >= WOOD_SWORD && item <= DIAMOND_SWORD) {
    cx.fillStyle =
      item === WOOD_SWORD ? '#8B4513' : item === STONE_SWORD ? '#888' :
      item === IRON_SWORD ? '#aaa' : item === GOLD_SWORD ? '#FFD700' : '#5dddff';
    cx.fillRect(x + 10, y + 35, 30, 8);
    cx.fillRect(x + 22, y + 10, 6, 28);
  } else if (item >= WOOD_PICK && item <= DIAMOND_PICK) {
    cx.fillStyle =
      item === WOOD_PICK ? '#8B4513' : item === STONE_PICK ? '#888' :
      item === IRON_PICK ? '#aaa' : item === GOLD_PICK ? '#FFD700' : '#5dddff';
    cx.fillRect(x + 10, y + 35, 30, 6);
    cx.fillRect(x + 12, y + 12, 26, 10);
    cx.fillRect(x + 22, y + 20, 6, 16);
  } else if (item === 34) { // BOW
    cx.strokeStyle = '#8B4513';
    cx.lineWidth = 2;
    cx.beginPath();
    cx.arc(x + 25, y + 25, 12, -Math.PI / 2, Math.PI / 2);
    cx.stroke();
  } else if (item !== AIR) {
    drawBlock(cx, item, x, y, sz, 0, 1);
  }
}

// ─── Particle Rendering ─────────────────────────────────────
export function drawParticles(
  cx: CanvasRenderingContext2D,
  particles: Particle[],
  renderCamX: number,
  camY: number
): void {
  for (const p of particles) {
    const rx = wrapRenderX(p.x, renderCamX);
    cx.globalAlpha = p.life / 45;
    cx.fillStyle = p.color;
    cx.fillRect(rx - renderCamX - p.sz / 2, p.y - camY - p.sz / 2, p.sz, p.sz);
  }
  cx.globalAlpha = 1;
}

// ─── Depth Darkness Overlay ─────────────────────────────────
export function drawDepthOverlay(
  cx: CanvasRenderingContext2D,
  playerY: number,
  playerH: number,
  surf: Int32Array,
  playerX: number,
  W: number,
  H: number
): void {
  const plTileY = Math.floor((playerY + playerH / 2) / TS);
  const plSurf = surf[Math.max(0, Math.min(surf.length - 1, Math.floor(playerX / TS)))];
  const depth = plTileY - plSurf;
  const darkVal = Math.max(0, Math.min(0.72, depth * 0.018));
  if (darkVal > 0) {
    cx.fillStyle = `rgba(0,0,10,${darkVal})`;
    cx.fillRect(0, 0, W, H);
  }
}

// ─── Selection Box ──────────────────────────────────────────
export function drawSelectionBox(
  cx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  renderCamX: number,
  camY: number,
  reachable: boolean
): void {
  const selX = Math.floor(tx * TS - renderCamX);
  const selY = Math.floor(ty * TS - camY);
  cx.lineWidth = 2;
  cx.strokeStyle = reachable ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)';
  cx.strokeRect(selX + 1, selY + 1, TS - 2, TS - 2);
}

// ─── Instructions Overlay ───────────────────────────────────
export function drawInstructions(cx: CanvasRenderingContext2D, dayTime: number, _W: number, _H: number): void {
  if (dayTime < 800 && dayTime > 100) {
    cx.fillStyle = 'rgba(20,20,20,0.7)';
    roundRect(cx, 10, 140, 320, 110, 6);
    cx.fill();
    cx.fillStyle = '#eee';
    cx.font = '12px monospace';
    cx.textAlign = 'left';
    const hints = ['WASD / 方向鍵: 移動', '空格: 跳躍', '左鍵按住: 挖方塊/攻擊', '右鍵: 放方塊', 'E: 合成表, F: 吃東西'];
    hints.forEach((h, i) => cx.fillText(h, 18, 158 + i * 18));
  }
}
