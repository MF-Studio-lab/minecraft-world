// Minecraft World Config - Centralized constants
export const CONFIG = {
  // World dimensions
  WW: 128, // World Width in tiles
  WH: 64,  // World Height in tiles
  TS: 32,  // Tile Size in pixels

  // Canvas
  W: 800,
  H: 500,

  // Block IDs (extracted from original)
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  COAL_ORE: 6,
  IRON_ORE: 7,
  GOLD_ORE: 8,
  DIAMOND_ORE: 9,
  TORCH: 10,
  // Add remaining IDs as we extract more code

  // Physics
  GRAV: 0.45,
  JUMP: -9,
  SPEED: 3.5,

  // Player
  PLAYER_W: 20,
  PLAYER_H: 40,

  // Game
  MAX_HP: 20,
  MAX_HUNGER: 20,
  DAY_SPEED_DEFAULT: 0.8,

  // Other constants (magic numbers centralized here)
  // ... more to be added
};

export const BLOCKS = {}; // To be populated
export const NAMES = {};
export const EMOJIS = {};
// etc.