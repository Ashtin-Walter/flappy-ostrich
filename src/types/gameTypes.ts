export interface GameState {
  ostrichPosition: Position;
  obstacles: Obstacle[];
  velocity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  backgroundElements: BackgroundElement[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  height: number;
  passed?: boolean;
  type?: 'standard' | 'moving' | 'breakable';
  pattern?: 'single' | 'double' | 'zigzag';
}

export interface BackgroundElement {
  id: number;
  x: number;
  y: number;
  type: 'cloud' | 'bush';
  size?: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  size: number;
  speed: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  startTime: number;
  duration: number;
}

export type PowerUpType = 'invincibility' | 'doubleJump' | 'slowMotion' | 'scoreMultiplier';
