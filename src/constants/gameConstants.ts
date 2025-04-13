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

export const POWER_UP_SETTINGS = {
  invincibility: {
    duration: 5000,
    color: '#ffd700',
    probability: 0.2,
    icon: '⭐'
  },
  doubleJump: {
    duration: 8000,
    color: '#00ff87',
    probability: 0.3,
    icon: '↑'
  },
  slowMotion: {
    duration: 6000,
    color: '#4169e1',
    probability: 0.25,
    icon: '⏰'
  },
  scoreMultiplier: {
    duration: 10000,
    color: '#ff1493',
    probability: 0.25,
    icon: '×2'
  }
} as const;

export const OBSTACLE_PATTERNS = {
  single: { probability: 0.5 },
  double: { probability: 0.3 },
  zigzag: { probability: 0.2 }
} as const;

export const MOVING_OBSTACLE_SETTINGS = {
  verticalSpeed: 1,
  amplitude: 100,
  frequency: 0.005
};
