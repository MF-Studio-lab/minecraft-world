// render.js - Canvas Rendering Module
import { CONFIG } from './config.js';
import { BLOCKS, EMOJIS } from './blocks.js';

let canvas, ctx, cam = {x: 0, y: 0};

export function initRender() {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  console.log('🎨 Render system initialized');
}

export function resizeCanvas() {
  if (!canvas) return;
  canvas.width = CONFIG.W;
  canvas.height = CONFIG.H;
}

export function render(gameState) {
  if (!ctx) return;
  
  // Clear
  ctx.fillStyle = '#87CEEB'; // Sky
  ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
  
  // Draw world (simple viewport)
  const { world, player } = gameState;
  if (!world) return;
  
  const startX = Math.floor(cam.x / CONFIG.TS);
  const endX = startX + Math.ceil(CONFIG.W / CONFIG.TS);
  
  for (let x = startX; x < endX; x++) {
    for (let y = 0; y < CONFIG.WH; y++) {
      const blockId = world[y][x] || CONFIG.AIR;
      if (blockId === CONFIG.AIR) continue;
      
      const screenX = x * CONFIG.TS - cam.x;
      const screenY = y * CONFIG.TS - cam.y;
      
      ctx.fillStyle = '#555';
      ctx.fillRect(screenX, screenY, CONFIG.TS, CONFIG.TS);
      
      // Emoji if available
      if (EMOJIS[blockId]) {
        ctx.font = '20px sans-serif';
        ctx.fillText(EMOJIS[blockId], screenX + 6, screenY + 24);
      }
    }
  }
  
  // Draw player
  if (player) {
    ctx.fillStyle = '#ff0';
    ctx.fillRect(
      player.x - cam.x, 
      player.y - cam.y, 
      player.w, 
      player.h
    );
  }
}

export function updateCamera(player) {
  cam.x = player.x - CONFIG.W / 2;
  cam.y = player.y - CONFIG.H / 2;
}