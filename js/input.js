// input.js - Input Handling Module
import { CONFIG } from './config.js';

let keys = {};

export function initInput() {
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  });
  
  window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });
  
  console.log('⌨️ Input system initialized');
}

export function getKeys() {
  return keys;
}

// Example usage in player update (can be extended)
export function handlePlayerInput(player) {
  const speed = CONFIG.SPEED || 3.5;
  player.vx = 0;
  
  if (keys['a'] || keys['arrowleft']) player.vx = -speed;
  if (keys['d'] || keys['arrowright']) player.vx = speed;
  if ((keys['w'] || keys['arrowup'] || keys[' ']) && player.vy === 0) {
    player.vy = CONFIG.JUMP || -9;
  }
}