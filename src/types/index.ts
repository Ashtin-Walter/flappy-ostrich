// filepath: flappy-ostrich/src/types/index.ts

export interface GameState {
  score: number;
  isGameOver: boolean;
  isPlaying: boolean;
}

export interface OstrichProps {
  position: { x: number; y: number };
  size: number;
}

export interface ObstacleProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
}