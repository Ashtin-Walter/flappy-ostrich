export const GRAVITY = 0.8;
export const JUMP_FORCE = -10;
export const DEFAULT_GAME_SPEED = 3;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const OSTRICH_SIZE = { width: 60, height: 60 };
export const OBSTACLE_WIDTH = 60;
export const OBSTACLE_GAP = 180;
export const MIN_HEIGHT = 50;
export const MAX_HEIGHT = GAME_HEIGHT - OBSTACLE_GAP - MIN_HEIGHT;
export const HORIZON_Y = GAME_HEIGHT * 0.7;

export const DIFFICULTY_SETTINGS = {
  easy: { speed: 2, spacing: 350 },
  medium: { speed: 3, spacing: 300 },
  hard: { speed: 4, spacing: 250 }
} as const;
