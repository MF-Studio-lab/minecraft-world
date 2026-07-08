// ============================================================
// Game Constants - Block IDs, Physics, Colors, Recipes
// ============================================================

import type { BlockColors, Recipe } from '@/types/game';

// ─── Physics Constants ──────────────────────────────────────
export const TS = 32; // tile size (pixels)
export const WW = 300; // world width (tiles)
export const WH = 100; // world height (tiles)
export const GRAV = 0.45; // gravity
export const JUMP = -10; // jump velocity
export const SPEED = 4.2; // player move speed

// ─── Block IDs ──────────────────────────────────────────────
export const AIR = 0;
export const GRASS = 1;
export const DIRT = 2;
export const STONE = 3;
export const WOOD = 4;
export const LEAVES = 5;
export const SAND = 6;
export const WATER = 7;
export const BEDROCK = 8;
export const COAL = 9;
export const IRON = 10;
export const GOLD = 11;
export const DIAMOND = 12;
export const PLANK = 13;
export const BRICK = 14;
export const GLASS = 15;
export const TORCH = 16;
export const PORK = 17;
export const BEEF = 18;
export const CHICKEN = 19;
export const FISH = 20;
export const ROTTEN = 21;
export const BONE = 22;
export const ARROW = 23;
export const WOOD_SWORD = 24;
export const STONE_SWORD = 25;
export const IRON_SWORD = 26;
export const GOLD_SWORD = 27;
export const DIAMOND_SWORD = 28;
export const WOOD_PICK = 29;
export const STONE_PICK = 30;
export const IRON_PICK = 31;
export const GOLD_PICK = 32;
export const DIAMOND_PICK = 33;
export const BOW = 34;
export const COOKED_PORK = 35;
export const COOKED_BEEF = 36;
export const COOKED_CHICKEN = 37;
export const COOKED_FISH = 38;
export const SEED = 39;
export const SAPLING = 40;

// ─── Block Names ────────────────────────────────────────────
export const NAMES: Record<number, string> = {
  [AIR]: '空氣',
  [GRASS]: '草地',
  [DIRT]: '泥土',
  [STONE]: '石頭',
  [WOOD]: '原木',
  [LEAVES]: '葉子',
  [SAND]: '沙子',
  [WATER]: '水',
  [BEDROCK]: '基岩',
  [COAL]: '煤礦石',
  [IRON]: '鐵礦石',
  [GOLD]: '金礦石',
  [DIAMOND]: '鑽石礦',
  [PLANK]: '木板',
  [BRICK]: '磚塊',
  [GLASS]: '玻璃',
  [TORCH]: '火把',
  [PORK]: '生豬肉',
  [BEEF]: '生牛肉',
  [CHICKEN]: '生雞肉',
  [FISH]: '生魚',
  [ROTTEN]: '腐肉',
  [BONE]: '骨頭',
  [ARROW]: '箭',
  [WOOD_SWORD]: '木劍',
  [STONE_SWORD]: '石劍',
  [IRON_SWORD]: '鐵劍',
  [GOLD_SWORD]: '金劍',
  [DIAMOND_SWORD]: '鑽石劍',
  [WOOD_PICK]: '木鎬',
  [STONE_PICK]: '石鎬',
  [IRON_PICK]: '鐵鎬',
  [GOLD_PICK]: '金鎬',
  [DIAMOND_PICK]: '鑽石鎬',
  [BOW]: '弓',
  [COOKED_PORK]: '烤豬肉',
  [COOKED_BEEF]: '烤牛肉',
  [COOKED_CHICKEN]: '烤雞肉',
  [COOKED_FISH]: '烤魚',
  [SEED]: '種子',
  [SAPLING]: '樹苗',
};

// ─── Emoji Mappings ─────────────────────────────────────────
export const EMOJIS: Record<number, string> = {
  [GRASS]: '\uD83D\uDFE9',
  [DIRT]: '\uD83D\uDFEB',
  [STONE]: '\u2B1C',
  [WOOD]: '\uD83E\uDEB5',
  [LEAVES]: '\uD83C\uDF3F',
  [SAND]: '\uD83D\uDFE8',
  [WATER]: '\uD83D\uDCA7',
  [BEDROCK]: '\u2B1B',
  [COAL]: '\u2B1B',
  [IRON]: '\u2B1B',
  [GOLD]: '\u2B1B',
  [DIAMOND]: '\u2B1B',
  [PLANK]: '\uD83E\uDEB5',
  [BRICK]: '\uD83E\uDDF1',
  [GLASS]: '\uD83E\uDE9F',
  [TORCH]: '\uD83D\uDD25',
  [PORK]: '\uD83E\uDD69',
  [BEEF]: '\uD83E\uDD69',
  [CHICKEN]: '\uD83C\uDF57',
  [FISH]: '\uD83D\uDC1F',
  [ROTTEN]: '\uD83D\uDFEB',
  [BONE]: '\uD83E\uDDb4',
  [ARROW]: '\uD83C\uDFF9',
  [WOOD_SWORD]: '\uD83D\uDDE1\uFE0F',
  [STONE_SWORD]: '\uD83D\uDDE1\uFE0F',
  [IRON_SWORD]: '\u2694\uFE0F',
  [GOLD_SWORD]: '\u2694\uFE0F',
  [DIAMOND_SWORD]: '\uD83D\uDC8E',
  [WOOD_PICK]: '\u26CF\uFE0F',
  [STONE_PICK]: '\u26CF\uFE0F',
  [IRON_PICK]: '\u26CF\uFE0F',
  [GOLD_PICK]: '\u26CF\uFE0F',
  [DIAMOND_PICK]: '\u26CF\uFE0F',
  [BOW]: '\uD83C\uDFF9',
  [COOKED_PORK]: '\uD83C\uDF56',
  [COOKED_BEEF]: '\uD83C\uDF56',
  [COOKED_CHICKEN]: '\uD83C\uDF57',
  [COOKED_FISH]: '\uD83C\uDF63',
  [SEED]: '\uD83C\uDF31',
  [SAPLING]: '\uD83C\uDF31',
};

// ─── Block Hardness (mining difficulty) ─────────────────────
export const HARDNESS: Record<number, number> = {
  [AIR]: 0,
  [GRASS]: 4,
  [DIRT]: 3,
  [STONE]: 14,
  [WOOD]: 10,
  [LEAVES]: 2,
  [SAND]: 3,
  [WATER]: 0,
  [BEDROCK]: 99,
  [COAL]: 14,
  [IRON]: 18,
  [GOLD]: 24,
  [DIAMOND]: 32,
  [PLANK]: 4,
  [BRICK]: 16,
  [GLASS]: 6,
  [TORCH]: 1,
  [PORK]: 99,
  [BEEF]: 99,
  [CHICKEN]: 99,
  [FISH]: 99,
  [ROTTEN]: 99,
  [BONE]: 99,
  [ARROW]: 99,
  [WOOD_SWORD]: 99,
  [STONE_SWORD]: 99,
  [IRON_SWORD]: 99,
  [GOLD_SWORD]: 99,
  [DIAMOND_SWORD]: 99,
  [WOOD_PICK]: 99,
  [STONE_PICK]: 99,
  [IRON_PICK]: 99,
  [GOLD_PICK]: 99,
  [DIAMOND_PICK]: 99,
  [BOW]: 99,
  [COOKED_PORK]: 99,
  [COOKED_BEEF]: 99,
  [COOKED_CHICKEN]: 99,
  [COOKED_FISH]: 99,
  [SEED]: 0,
  [SAPLING]: 2,
};

// ─── Food Values ────────────────────────────────────────────
export const FOOD_VALUE: Record<number, number> = {
  [PORK]: 3,
  [BEEF]: 3,
  [CHICKEN]: 2,
  [FISH]: 2,
  [COOKED_PORK]: 8,
  [COOKED_BEEF]: 8,
  [COOKED_CHICKEN]: 6,
  [COOKED_FISH]: 5,
  [ROTTEN]: 4,
};

export const POISON_CHANCE: Record<number, number> = {
  [ROTTEN]: 0.3,
};

// ─── Tool Power ─────────────────────────────────────────────
export const TOOL_POWER: Record<number, number> = {
  [WOOD_SWORD]: 2,
  [STONE_SWORD]: 3,
  [IRON_SWORD]: 4,
  [GOLD_SWORD]: 3,
  [DIAMOND_SWORD]: 6,
  [WOOD_PICK]: 2,
  [STONE_PICK]: 3,
  [IRON_PICK]: 4,
  [GOLD_PICK]: 3,
  [DIAMOND_PICK]: 6,
  [BOW]: 3,
};

// ─── Block Colors [base, highlight, ore/detail] ─────────────
export const BLOCK_COLORS: Record<number, BlockColors> = {
  [GRASS]: ['#4a9b2a', '#5aba32', '#7a5230'],
  [DIRT]: ['#7a5230', '#8a6240', null],
  [STONE]: ['#787878', '#888888', null],
  [WOOD]: ['#5a3a1a', '#6b4626', '#8a6236'],
  [LEAVES]: ['#2a6a1a', '#348a22', null],
  [SAND]: ['#c8b460', '#d8c470', null],
  [WATER]: ['#1878cc', '#2090ee', null],
  [BEDROCK]: ['#2a2a2a', '#383838', null],
  [COAL]: ['#787878', '#888888', '#1a1a1a'],
  [IRON]: ['#787878', '#888888', '#d4885a'],
  [GOLD]: ['#787878', '#888888', '#FFD700'],
  [DIAMOND]: ['#787878', '#888888', '#5dddff'],
  [PLANK]: ['#b8843a', '#c89448', '#9a7030'],
  [BRICK]: ['#9a3c2c', '#b04838', '#7a2c20'],
  [GLASS]: ['#a8d8f0', '#c0e8ff', null],
  [TORCH]: ['#a05a10', '#c07a20', '#ff8c00'],
};

// ─── Recipes ────────────────────────────────────────────────
export const RECIPES: Recipe[] = [
  { result: WOOD_SWORD, count: 1, grid: [PLANK, PLANK, 0, 0, WOOD, 0, 0, 0, 0], name: '木劍' },
  { result: STONE_SWORD, count: 1, grid: [STONE, STONE, 0, 0, WOOD, 0, 0, 0, 0], name: '石劍' },
  { result: IRON_SWORD, count: 1, grid: [IRON, IRON, 0, 0, WOOD, 0, 0, 0, 0], name: '鐵劍' },
  { result: GOLD_SWORD, count: 1, grid: [GOLD, GOLD, 0, 0, WOOD, 0, 0, 0, 0], name: '金劍' },
  { result: DIAMOND_SWORD, count: 1, grid: [DIAMOND, DIAMOND, 0, 0, WOOD, 0, 0, 0, 0], name: '鑽石劍' },
  { result: WOOD_PICK, count: 1, grid: [PLANK, PLANK, PLANK, 0, WOOD, 0, 0, WOOD, 0], name: '木鎬' },
  { result: STONE_PICK, count: 1, grid: [STONE, STONE, STONE, 0, WOOD, 0, 0, WOOD, 0], name: '石鎬' },
  { result: IRON_PICK, count: 1, grid: [IRON, IRON, IRON, 0, WOOD, 0, 0, WOOD, 0], name: '鐵鎬' },
  { result: GOLD_PICK, count: 1, grid: [GOLD, GOLD, GOLD, 0, WOOD, 0, 0, WOOD, 0], name: '金鎬' },
  { result: DIAMOND_PICK, count: 1, grid: [DIAMOND, DIAMOND, DIAMOND, 0, WOOD, 0, 0, WOOD, 0], name: '鑽石鎬' },
  { result: BOW, count: 1, grid: [WOOD, 0, WOOD, WOOD, 0, WOOD, 0, WOOD, 0], name: '弓' },
  { result: PLANK, count: 4, grid: [0, 0, 0, 0, WOOD, 0, 0, 0, 0], name: '木板' },
  { result: COOKED_PORK, count: 1, grid: [0, 0, 0, 0, PORK, 0, 0, 0, 0], name: '烤豬肉' },
  { result: COOKED_BEEF, count: 1, grid: [0, 0, 0, 0, BEEF, 0, 0, 0, 0], name: '烤牛肉' },
  { result: COOKED_CHICKEN, count: 1, grid: [0, 0, 0, 0, CHICKEN, 0, 0, 0, 0], name: '烤雞肉' },
  { result: COOKED_FISH, count: 1, grid: [0, 0, 0, 0, FISH, 0, 0, 0, 0], name: '烤魚' },
  { result: ARROW, count: 4, grid: [0, 0, 0, 0, WOOD, 0, 0, 0, 0], name: '箭' },
];

// ─── Utility Functions ──────────────────────────────────────
/** Check if a block is solid (collidable) */
export function isSolid(b: number): boolean {
  return b !== AIR && b !== WATER && b !== TORCH;
}

/** Check if a block is a placeable block (not a tool/weapon/food) */
export function isPlaceableBlock(item: number): boolean {
  return item <= TORCH;
}

/** Check if an item is a tool or weapon */
export function isTool(item: number): boolean {
  return (item >= WOOD_SWORD && item <= DIAMOND_PICK) || item === BOW;
}

/** Check if an item is food */
export function isFood(item: number): boolean {
  return item >= PORK && item <= ROTTEN;
}

/** Get display name for entity type */
export function getEntityName(type: string): string {
  const names: Record<string, string> = {
    zombie: '殭屍',
    skeleton: '骷髏',
    pig: '豬',
    cow: '牛',
    chicken: '雞',
    fish: '魚',
  };
  return names[type] || type;
}

/** Entity drop items mapping */
export function getEntityLoot(type: string): Array<{ item: number; count: number; chance?: number }> {
  switch (type) {
    case 'zombie':
      return [{ item: ROTTEN, count: 1 }];
    case 'skeleton':
      return [
        { item: BONE, count: 2, chance: 0.5 },
        { item: ARROW, count: 2, chance: 0.5 },
      ];
    case 'pig':
      return [{ item: PORK, count: 2, chance: 0.7 }];
    case 'cow':
      return [{ item: BEEF, count: 2, chance: 0.7 }];
    case 'chicken':
      return [{ item: CHICKEN, count: 1 }];
    case 'fish':
      return [{ item: FISH, count: 1 }];
    default:
      return [];
  }
}
