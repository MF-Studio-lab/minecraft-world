// blocks.js - Block system
import { CONFIG, NAMES, EMOJIS, HARDNESS, isSolid } from './config.js';

export { CONFIG, NAMES, EMOJIS, HARDNESS, isSolid };

export function getHardness(blockId) {
  return HARDNESS[blockId] || 1;
}