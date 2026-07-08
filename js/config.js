// Minecraft World Config - Centralized constants
export const CONFIG = {
  // World dimensions
  WW: 300,
  WH: 100,
  TS: 32,

  // Canvas
  W: 800,
  H: 500,

  // Block IDs
  AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, WOOD: 4, LEAVES: 5, SAND: 6, WATER: 7,
  BED: 8, COAL: 9, IRON: 10, GOLD: 11, DIAM: 12, PLANK: 13, BRICK: 14, GLASS: 15, TORCH: 16,
  PORK: 17, BEEF: 18, CHICKEN: 19, FISH: 20, ROTTEN: 21, BONE: 22, ARROW: 23,
  WOOD_SWORD: 24, STONE_SWORD: 25, IRON_SWORD: 26, GOLD_SWORD: 27, DIAM_SWORD: 28,
  WOOD_PICK: 29, STONE_PICK: 30, IRON_PICK: 31, GOLD_PICK: 32, DIAM_PICK: 33,
  BOW: 34, COOKED_PORK: 35, COOKED_BEEF: 36, COOKED_CHICKEN: 37, COOKED_FISH: 38,
  SEED: 39, SAPLING: 40,

  // Physics
  GRAV: 0.45,
  JUMP: -10,
  SPEED: 4.2,

  // Player
  PLAYER_W: 20,
  PLAYER_H: 40,

  // Game
  MAX_HP: 20,
  MAX_HUNGER: 20,
  DAY_SPEED_DEFAULT: 0.8,
};

export const HARDNESS = [0,4,3,14,10,2,3,0,99,14,18,24,32,4,16,6,1,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,0,2];

export const NAMES = [
  '空氣','草地','泥土','石頭','原木','葉子','沙子','水','基岩',
  '煤礦石','鐵礦石','金礦石','鑽石礦','木板','磚塊','玻璃','火把',
  '生豬肉','生牛肉','生雞肉','生魚','腐肉','骨頭','箭',
  '木劍','石劍','鐵劍','金劍','鑽石劍',
  '木鎬','石鎬','鐵鎬','金鎬','鑽石鎬',
  '弓','烤豬肉','烤牛肉','烤雞肉','烤魚'
];

export const EMOJIS = {
  [CONFIG.GRASS]:'🟩',[CONFIG.DIRT]:'🟫',[CONFIG.STONE]:'⬜',[CONFIG.WOOD]:'🪵',[CONFIG.LEAVES]:'🌿',
  [CONFIG.SAND]:'🟨',[CONFIG.WATER]:'💧',[CONFIG.BED]:'⬛',[CONFIG.COAL]:'⬛',[CONFIG.IRON]:'⬛',
  [CONFIG.GOLD]:'⬛',[CONFIG.DIAM]:'⬛',[CONFIG.PLANK]:'🪵',[CONFIG.BRICK]:'🧱',[CONFIG.GLASS]:'🪟',
  [CONFIG.TORCH]:'🔥',[CONFIG.PORK]:'🥩',[CONFIG.BEEF]:'🥩',[CONFIG.CHICKEN]:'🍗',[CONFIG.FISH]:'🐟',
  [CONFIG.ROTTEN]:'🟫',[CONFIG.BONE]:'🦴',[CONFIG.ARROW]:'🏹',
  [CONFIG.WOOD_SWORD]:'🗡️',[CONFIG.STONE_SWORD]:'🗡️',[CONFIG.IRON_SWORD]:'⚔️',[CONFIG.GOLD_SWORD]:'⚔️',[CONFIG.DIAM_SWORD]:'💎',
  [CONFIG.WOOD_PICK]:'⛏️',[CONFIG.STONE_PICK]:'⛏️',[CONFIG.IRON_PICK]:'⛏️',[CONFIG.GOLD_PICK]:'⛏️',[CONFIG.DIAM_PICK]:'⛏️',
  [CONFIG.BOW]:'🏹',[CONFIG.COOKED_PORK]:'🍖',[CONFIG.COOKED_BEEF]:'🍖',[CONFIG.COOKED_CHICKEN]:'🍗',[CONFIG.COOKED_FISH]:'🍣'
};

EMOJIS[CONFIG.SEED] = '🌱';
EMOJIS[CONFIG.SAPLING] = '🌱';

export const FOOD_VALUE = {
  [CONFIG.PORK]:3,[CONFIG.BEEF]:3,[CONFIG.CHICKEN]:2,[CONFIG.FISH]:2,[CONFIG.COOKED_PORK]:8,[CONFIG.COOKED_BEEF]:8,[CONFIG.COOKED_CHICKEN]:6,[CONFIG.COOKED_FISH]:5,[CONFIG.ROTTEN]:4
};

export const POISON_CHANCE = { [CONFIG.ROTTEN]: 0.3 };

export const TOOL_POWER = {
  [CONFIG.WOOD_SWORD]:2,[CONFIG.STONE_SWORD]:3,[CONFIG.IRON_SWORD]:4,[CONFIG.GOLD_SWORD]:3,[CONFIG.DIAM_SWORD]:6,
  [CONFIG.WOOD_PICK]:2,[CONFIG.STONE_PICK]:3,[CONFIG.IRON_PICK]:4,[CONFIG.GOLD_PICK]:3,[CONFIG.DIAM_PICK]:6,
  [CONFIG.BOW]:3
};

export const RECIPES = [
  { result: CONFIG.WOOD_SWORD, count: 1, grid: [CONFIG.PLANK,CONFIG.PLANK,0, 0,CONFIG.WOOD,0, 0,0,0], name: '木劍' },
  { result: CONFIG.PLANK, count: 4, grid: [0,0,0, 0,CONFIG.WOOD,0, 0,0,0], name: '木板' },
  // Add full list later
];

export function isSolid(b) { return b !== CONFIG.AIR && b !== CONFIG.WATER && b !== CONFIG.TORCH; }