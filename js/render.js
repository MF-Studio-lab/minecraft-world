// render.js - Enhanced Visual Rendering
import { CONFIG } from './config.js';
import { EMOJIS, getBlockInfo } from './blocks.js';
import { gb } from './worldgen.js';

let canvas, ctx, cam = {x: 0, y: 0};

// Color table from original
export const BC = {
  [CONFIG.GRASS]: ['#4a9b2a','#5aba32','#7a5230'],
  [CONFIG.DIRT]: ['#7a5230','#8a6240',null],
  [CONFIG.STONE]: ['#787878','#888888',null],
  [CONFIG.WOOD]: ['#5a3a1a','#6b4626','#8a6236'],
  // Add more as needed
};

export function initRender() {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  console.log('🎨 Enhanced render system initialized');
}

function resizeCanvas() {
  if (canvas) {
    canvas.width = Math.min(window.innerWidth * 0.9, 1024);
    canvas.height = Math.min(window.innerHeight * 0.8, 640);
  }
}

export function updateCamera(player) {
  cam.x = player.x - canvas.width / 2;
  cam.y = player.y - canvas.height / 2 + 50; // slight offset
}

function drawBlock(b, bx, by, sz) {
  if (b === CONFIG.AIR) return;
  const d = BC[b] || ['#666', '#888', null];
  const [base, light] = d;

  ctx.fillStyle = base;
  ctx.fillRect(bx, by, sz, sz);

  if (light) {
    ctx.fillStyle = light;
    ctx.fillRect(bx, by, sz, Math.ceil(sz * 0.25));
  }

  // Emoji overlay
  const info = getBlockInfo(b);
  if (info.emoji) {
    ctx.font = `${sz * 0.75}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(info.emoji, bx + sz/2, by + sz * 0.8);
  }

  // Simple border
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 0.5, sz - 1, sz - 1);
}

export function render(gameState) {
  if (!ctx || !gameState.world) return;

  const { player } = gameState;
  ctx.fillStyle = '#87CEEB'; // Sky (can be dynamic later)
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ts = CONFIG.TS;
  const startX = Math.floor(cam.x / ts) - 1;
  const endX = Math.ceil((cam.x + canvas.width) / ts) + 1;

  for (let x = Math.max(0, startX); x < Math.min(CONFIG.WW, endX); x++) {
    for (let y = 0; y < CONFIG.WH; y++) {
      const blockId = gameState.world[y]?.[x] || CONFIG.AIR;
      if (blockId === CONFIG.AIR) continue;

      const screenX = Math.floor(x * ts - cam.x);
      const screenY = Math.floor(y * ts - cam.y);

      drawBlock(blockId, screenX, screenY, ts);
    }
  }

  // Player
  if (player) {
    const px = player.x - cam.x;
    const py = player.y - cam.y;
    ctx.fillStyle = '#3a72d0';
    ctx.fillRect(px, py + player.h * 0.4, player.w, player.h * 0.6); // body
    ctx.fillStyle = '#e8a070';
    ctx.fillRect(px + player.w * 0.2, py, player.w * 0.6, player.h * 0.4); // head
    ctx.fillStyle = '#ff0';
    ctx.fillText('🧍', px + player.w/2 - 10, py + player.h - 5);
  }

  // Basic HUD
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`HP: ${Math.floor(player?.hp || 20)}`, 20, 30);
  ctx.fillText(`X:${Math.floor(player?.x / CONFIG.TS)} Y:${Math.floor(player?.y / CONFIG.TS)}`, 20, 55);
}