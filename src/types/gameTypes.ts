export interface GameState {
  ostrichPosition: Position;
  obstacles: Obstacle[];
  velocity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  backgroundElements: BackgroundElement[];
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
}

export interface BackgroundElement {
  id: number;
  x: number;
  y: number;
  type: 'cloud' | 'bush';
  size?: number;
}
