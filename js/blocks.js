// blocks.js - Block system
import { CONFIG, NAMES, EMOJIS, HARDNESS, isSolid } from './config.js';

export { CONFIG, NAMES, EMOJIS, HARDNESS, isSolid };

export const BLOCKS = {};
// Populate basic blocks
Object.keys(CONFIG).forEach(key => {
  if (typeof CONFIG[key] === 'number' && key !== 'WW' && key !== 'WH' && key !== 'TS' && key !== 'W' && key !== 'H') {
    BLOCKS[CONFIG[key]] = {
      name: NAMES[CONFIG[key]] || key,
      emoji: EMOJIS[CONFIG[key]] || '❓',
      solid: isSolid(CONFIG[key]),
      hardness: HARDNESS[CONFIG[key]] || 1
    };
  }
});

export function getHardness(blockId) {
  return HARDNESS[blockId] || 1;
}

export function getBlockInfo(id) {
  return BLOCKS[id] || {name: 'Unknown', emoji: '?'};
}