// render.js - Enhanced Rendering
import { CONFIG } from './config.js';
import { EMOJIS, getBlockInfo } from './blocks.js';

let canvas, ctx, cam = {x: 0, y: 0};

export function initRender() {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  console.log('🎨 Render system initialized');
}

function resizeCanvas() {
  if (canvas) {
    canvas.width = Math.min(window.innerWidth, 1024);
    canvas.height = Math.min(window.innerHeight, 640);
  }
}

export function updateCamera(player) {
  cam.x = player.x - canvas.width / 2 + player.w / 2;
  cam.y = player.y - canvas.height / 2 + player.h / 2;
}

export function render(gameState) {
  if (!ctx || !gameState.world) return;
  
  const { player } = gameState;
  ctx.fillStyle = '#87CEEB'; // Sky
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const ts = CONFIG.TS;
  const startX = Math.max(0, Math.floor(cam.x / ts));
  const endX = Math.min(CONFIG.WW, Math.ceil((cam.x + canvas.width) / ts));
  
  for (let x = startX; x < endX; x++) {
    for (let y = 0; y < CONFIG.WH; y++) {
      const blockId = gameState.world[y][x] || CONFIG.AIR;
      if (blockId === CONFIG.AIR) continue;
      
      const screenX = Math.floor(x * ts - cam.x);
      const screenY = Math.floor(y * ts - cam.y);
      
      const info = getBlockInfo(blockId);
      
      // Background color
      ctx.fillStyle = '#555';
      ctx.fillRect(screenX, screenY, ts, ts);
      
      // Emoji render
      if (info.emoji) {
        ctx.font = `${ts * 0.8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(info.emoji, screenX + ts/2, screenY + ts * 0.85);
      }
    }
  }
  
  // Player (yellow rect + simple emoji)
  if (player) {
    ctx.fillStyle = '#ff0';
    ctx.fillRect(player.x - cam.x, player.y - cam.y, player.w, player.h);
    ctx.font = '30px sans-serif';
    ctx.fillText('🧍', player.x - cam.x + player.w/2, player.y - cam.y + player.h);
  }
  
  // Simple HUD
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText(`HP: ${player?.hp || 20}`, 20, 30);
}