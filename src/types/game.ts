// ============================================================
// Core Type Definitions for 小方塊世界 (Mini Block World)
// ============================================================

/** Block ID type - one of the predefined block constants */
export type BlockId = number;

/** Entity type identifiers */
export type EntityType =
  | 'zombie'
  | 'skeleton'
  | 'pig'
  | 'cow'
  | 'chicken'
  | 'fish';

/** Projectile type identifiers */
export type ProjectileType = 'skeleton_arrow' | 'player_arrow';

/** Entity state machine states */
export type EntityState = 'idle' | 'chase' | 'attack';

/** Recipe definition for crafting system */
export interface Recipe {
  result: BlockId;
  count: number;
  grid: BlockId[]; // 9-element array for 3x3 grid
  name: string;
}

/** Block color definition [base, highlight, ore/detail] */
export type BlockColors = [string, string, string | null];

/** Particle effect data */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  sz: number;
}

/** Sapling growth tracking */
export interface Sapling {
  x: number;
  y: number;
  t: number; // growth timer
}

/** Breaking progress for mining animation */
export interface BreakingProgress {
  x: number;
  y: number;
  p: number; // current progress
  max: number; // max hardness
}

/** Calibration data for mobile orientation */
export interface CalibrationPoint {
  x: number;
  y: number;
}

export interface CalibrationData {
  vertical: { up: CalibrationPoint | null; down: CalibrationPoint | null; right: CalibrationPoint | null };
  horizontal: { up: CalibrationPoint | null; down: CalibrationPoint | null; right: CalibrationPoint | null };
}

export interface CalibrationOffsets {
  vertical: { x: number; y: number };
  horizontal: { x: number; y: number };
}

/** Input state */
export interface InputState {
  keys: Record<string, boolean>;
  mx: number;
  my: number;
  mleft: boolean;
}

/** Player state */
export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  face: number;
  wf: number; // walk frame
  wt: number; // walk timer
  hp: number;
  maxHp: number;
  hunger: number;
  maxHunger: number;
  inv: number;
  poisonTimer: number;
  attackCD: number;
  arrowCD: number;
  oxygen: number;
  maxOxygen: number;
}

/** Camera state */
export interface CameraState {
  x: number;
  y: number;
  renderX: number;
  lastRenderX: number;
}

/** Game configuration */
export interface GameConfig {
  daySpeed: number;
}

/** Hotbar slot data */
export interface HotbarSlot {
  item: BlockId;
  count: number;
}
