// input.js - Input Handling
import { CONFIG } from './config.js';

let keys = {};

export function initInput() {
  document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  });
  
  document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });
  
  console.log('⌨️ Input system initialized');
}

export function handlePlayerInput(player) {
  const speed = CONFIG.SPEED || 4.2;
  player.vx = 0;
  
  if (keys['a'] || keys['arrowleft']) player.vx = -speed;
  if (keys['d'] || keys['arrowright']) player.vx = speed;
  
  // Jump only when grounded (simple check)
  if ((keys['w'] || keys['arrowup'] || keys[' ']) && Math.abs(player.vy) < 1) {
    player.vy = CONFIG.JUMP || -10;
    keys[' '] = false; // prevent repeat
  }
}