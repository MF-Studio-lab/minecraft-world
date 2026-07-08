// blocks.js - Block system for Minecraft World
import { CONFIG } from './config.js';

export const BLOCKS = {
  [CONFIG.AIR]: { name: 'Air', emoji: ' ', solid: false, hardness: 0 },
  [CONFIG.GRASS]: { name: 'Grass', emoji: '🌿', solid: true, hardness: 1 },
  [CONFIG.DIRT]: { name: 'Dirt', emoji: '🟫', solid: true, hardness: 2 },
  [CONFIG.STONE]: { name: 'Stone', emoji: '🪨', solid: true, hardness: 4 },
  // Add more blocks from original: WOOD, COAL_ORE, IRON_ORE, etc.
};

export const NAMES = {};
export const EMOJIS = {};

export function isSolid(blockId) {
  return BLOCKS[blockId]?.solid || false;
}

export function getHardness(blockId) {
  return BLOCKS[blockId]?.hardness || 1;
}

// Initialize names and emojis
Object.keys(BLOCKS).forEach(id => {
  NAMES[id] = BLOCKS[id].name;
  EMOJIS[id] = BLOCKS[id].emoji;
});